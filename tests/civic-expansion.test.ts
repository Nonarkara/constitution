import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import {
  amendmentThresholds,
  assessAmendmentVotes,
  needsReferendum,
  parseReflection,
} from "../lib/amendment.ts";
import {
  feeds,
  parseFeed,
  headlineTrends,
  harvestNews,
  mergeNewsSnapshots,
  parseNewsSnapshot,
  type NewsSnapshot,
} from "../lib/news.ts";
import worker, {
  storeSnapshot,
  readSnapshot,
  type DB,
  type Statement,
} from "../worker/index.ts";
const now = new Date("2026-10-12T12:00:00Z");
const xml = (items: string) =>
  `<?xml version="1.0"?><rss><channel>${items}</channel></rss>`;
const item = (
  title: string,
  url = "https://www.matichon.co.th/politics/news_1",
  date = "Mon, 12 Oct 2026 10:00:00 GMT",
) =>
  `<item><title><![CDATA[${title}]]></title><link>${url}</link><pubDate>${date}</pubDate><description>ARTICLE BODY MUST NOT BE STORED</description></item>`;
function database() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(
    readFileSync(
      new URL("../migrations/0001_headlines.sql", import.meta.url),
      "utf8",
    ),
  );
  const statement = (sql: string, values: unknown[] = []): Statement => ({
    bind(...args) {
      return statement(sql, args);
    },
    async run() {
      return sqlite.prepare(sql).run(...(values as (string | number | null)[]));
    },
    async all<T>() {
      return {
        results: sqlite
          .prepare(sql)
          .all(...(values as (string | number | null)[])) as T[],
      };
    },
  });
  const db: DB = {
    prepare: statement,
    async batch(rows) {
      sqlite.exec("BEGIN");
      try {
        for (const row of rows) await row.run();
        sqlite.exec("COMMIT");
      } catch (e) {
        sqlite.exec("ROLLBACK");
        throw e;
      }
    },
  };
  return { db, sqlite };
}

test("amendment vote boundaries include vacancies and nested approving groups", () => {
  assert.deepEqual(amendmentThresholds(500, 200, 100), {
    proposalMPs: 100,
    proposalJoint: 140,
    first: 350,
    final: 351,
    senate: 67,
    eligible: 20,
  });
  const threshold = amendmentThresholds(497, 193, 23);
  assert.equal(threshold.first, 345);
  assert.equal(threshold.final, 346);
  assert.equal(threshold.senate, 65);
  assert.equal(threshold.eligible, 5);
  const base = {
    house: 500,
    senate: 200,
    eligibleMPs: 100,
    totalYes: 350,
    senateYes: 67,
    eligibleYes: 20,
  };
  assert.equal(assessAmendmentVotes(base).first, true);
  assert.equal(assessAmendmentVotes(base).final, false);
  assert.equal(assessAmendmentVotes({ ...base, totalYes: 351 }).final, true);
  assert.equal(
    assessAmendmentVotes({ ...base, totalYes: 400, senateYes: 66 }).final,
    false,
  );
  assert.equal(
    assessAmendmentVotes({ ...base, totalYes: 351, eligibleYes: 19 }).final,
    false,
  );
  assert.equal(assessAmendmentVotes({ ...base, totalYes: 10 }).valid, false);
  assert.equal(
    assessAmendmentVotes({ ...base, totalYes: 650, senateYes: 50 }).valid,
    false,
  );
  assert.equal(
    assessAmendmentVotes({
      ...base,
      totalYes: 500,
      senateYes: 67,
      eligibleYes: 0,
    }).valid,
    false,
  );
  assert.throws(() => amendmentThresholds(500.5, 200, 100));
});
test("every section256(8) category requires a referendum while generic other amendments do not", () => {
  for (const category of [
    "chapter1",
    "chapter2",
    "chapter15",
    "officeEligibility",
    "courtPowers",
    "preventCourtDuties",
  ] as const)
    assert.equal(needsReferendum([category]), true);
  assert.equal(needsReferendum(["other"]), false);
});
test("personal reflection accepts any political stance, limits fields and preserves a canonical shape", () => {
  const note = {
    version: 1,
    savedAt: now.toISOString(),
    choice: "no",
    proposal: "Keep it",
    benefit: "",
    cost: "",
    evidence: "",
    extra: "discard",
  };
  assert.equal(parseReflection(note)?.choice, "no");
  assert.equal("extra" in parseReflection(note)!, false);
  assert.equal(parseReflection({ ...note, cost: "x".repeat(3001) }), null);
  assert.equal(parseReflection({ ...note, choice: "mandatory-yes" }), null);
});
test("RSS harvest stores headlines only, decodes titles, rejects hostile URLs and deduplicates links", () => {
  const text = xml(
    item("กฎหมาย &#8216;ใหม่&#8217;") +
      item(
        "รัฐธรรมนูญ",
        "https://www.matichon.co.th/politics/news_1?utm_source=rss",
      ) +
      item("ศาล", "javascript:alert(1)") +
      item("ศาล", "https://matichon.co.th.evil.test/") +
      item("ข่าวกีฬา", "https://www.matichon.co.th/sport") +
      item(
        "กฎหมายอนาคต",
        "https://www.matichon.co.th/future",
        "Mon, 19 Oct 2026 10:00:00 GMT",
      ),
  );
  const rows = parseFeed(text, feeds[0], now);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].title, "รัฐธรรมนูญ");
  assert.equal("description" in rows[0], false);
  assert.equal(
    parseFeed(xml(item("กฎหมาย &#8216;ใหม่&#8217;")), feeds[0], now)[0].title,
    "กฎหมาย ‘ใหม่’",
  );
  assert.throws(() =>
    parseFeed('<!DOCTYPE rss [<!ENTITY bomb "x">]><rss/>', feeds[0], now),
  );
});
test("trends count distinct dated headlines in the actual seven-day window", () => {
  const base = parseFeed(xml(item("รัฐธรรมนูญ")), feeds[0], now)[0];
  const rows = [
    base,
    { ...base, url: base.url + "2" },
    { ...base, title: "รัฐธรรมนูญเก่า", publishedAt: "2026-09-30T00:00:00Z" },
    { ...base, title: "รัฐธรรมนูญไม่ระบุวัน", publishedAt: null },
    { ...base, title: "รัฐธรรมนูญอนาคต", publishedAt: "2026-10-13T00:00:00Z" },
  ];
  assert.equal(headlineTrends(rows, now)[0].count, 1);
});
test("one source failure does not erase other news or prior successful harvest timestamps", async () => {
  const fake: typeof fetch = async (input) => {
    if (String(input).includes("theactive")) throw Error("offline");
    return new Response(xml(item("รัฐธรรมนูญ")));
  };
  const snapshot = await harvestNews(fake, now);
  assert.equal(snapshot.headlines.length, 1);
  assert.equal(snapshot.sources[1].status, "error");
  assert.ok(parseNewsSnapshot(snapshot));
  const { db, sqlite } = database();
  const success = {
    ...snapshot,
    sources: snapshot.sources.map((s) => ({
      ...s,
      status: "ok" as const,
      lastSuccess: now.toISOString(),
    })),
  };
  await storeSnapshot(db, success);
  await storeSnapshot(db, {
    ...snapshot,
    generatedAt: "2026-10-13T00:00:00Z",
    sources: snapshot.sources.map((s) => ({
      ...s,
      checkedAt: "2026-10-13T00:00:00Z",
      status: "error" as const,
      lastSuccess: null,
      count: 0,
    })),
  });
  const persisted = await readSnapshot(db);
  assert.equal(persisted.headlines.length, 1);
  assert.equal(persisted.sources[0].lastSuccess, now.toISOString());
  assert.equal(persisted.sources[0].status, "error");
  const env = {
    NEWS: db,
    ASSETS: {
      async fetch() {
        return new Response("static asset");
      },
    },
  };
  const result = await worker.fetch(new Request("https://test/api/news"), env);
  assert.equal(result.status, 200);
  assert.ok(parseNewsSnapshot(await result.json()));
  assert.equal(
    (
      await worker.fetch(
        new Request("https://test/api/news", { method: "POST" }),
        env,
      )
    ).status,
    405,
  );
  assert.equal(
    await (await worker.fetch(new Request("https://test/learn/"), env)).text(),
    "static asset",
  );
  sqlite.close();
});

test("large multi-source harvest stays within the 200-headline snapshot contract", async () => {
  const fake: typeof fetch = async (input) => {
    const feed = feeds.find((f) => f.url === String(input))!;
    return new Response(
      xml(
        Array.from({ length: 100 }, (_, i) =>
          item(
            `รัฐธรรมนูญ ${feed.id} ${i}`,
            `https://${feed.host}/story/${feed.id}/${i}`,
          ),
        ).join(""),
      ),
    );
  };
  const snapshot = await harvestNews(fake, now);
  assert.equal(snapshot.headlines.length, 200);
  assert.ok(parseNewsSnapshot(snapshot));
  assert.ok(snapshot.sources.every((s) => s.count === 100));
});

test("partial offline snapshot refresh preserves source history and last success", async () => {
  const healthy = await harvestNews(async (input) => {
    const f = feeds.find((f) => f.url === String(input))!;
    return new Response(
      xml(item("รัฐธรรมนูญ " + f.id, `https://${f.host}/${f.id}`)),
    );
  }, now);
  const failed = {
    ...healthy,
    generatedAt: "2026-10-13T00:00:00Z",
    headlines: healthy.headlines.filter((h) => h.sourceId !== "theactive"),
    sources: healthy.sources.map((s) =>
      s.id === "theactive"
        ? { ...s, status: "error" as const, lastSuccess: null, count: 0 }
        : s,
    ),
  };
  const merged = mergeNewsSnapshots(healthy, failed);
  assert.equal(
    merged.headlines.some((h) => h.sourceId === "theactive"),
    true,
  );
  assert.equal(
    merged.sources.find((s) => s.id === "theactive")?.lastSuccess,
    now.toISOString(),
  );
  assert.ok(parseNewsSnapshot(merged));
});

test("database failure returns a real 503 rather than a fabricated empty feed", async () => {
  const failing: DB = {
    prepare() {
      throw new Error("Database unavailable");
    },
    async batch() {},
  };
  const result = await worker.fetch(new Request("https://test/api/news"), {
    NEWS: failing,
    ASSETS: {
      async fetch() {
        return new Response("asset");
      },
    },
  });
  assert.equal(result.status, 503);
  assert.deepEqual(await result.json(), { error: "Headlines unavailable" });
});

test("200 headline writes fit the actual D1 free invocation and binding limits", async () => {
  const { db, sqlite } = database();
  let queries = 0;
  const limited: DB = {
    batch: (rows) => db.batch(rows),
    prepare(sql) {
      queries++;
      assert.ok(queries <= 50);
      const statement = db.prepare(sql);
      return {
        ...statement,
        bind(...values) {
          assert.ok(values.length <= 100);
          return statement.bind(...values);
        },
      };
    },
  };
  const row = parseFeed(xml(item("รัฐธรรมนูญ")), feeds[0], now)[0];
  const headlines = Array.from({ length: 200 }, (_, i) => ({
    ...row,
    url: row.url + "/" + i,
  }));
  await storeSnapshot(limited, {
    generatedAt: now.toISOString(),
    headlines,
    sources: [],
  });
  assert.equal(
    sqlite.prepare("SELECT COUNT(*) AS count FROM headlines").get()?.count,
    200,
  );
  assert.equal(queries, 16);
  sqlite.close();
});
