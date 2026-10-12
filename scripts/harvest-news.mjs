import { writeFile, readFile } from "node:fs/promises";
import {
  harvestNews,
  mergeNewsSnapshots,
  parseNewsSnapshot,
} from "../lib/news.ts";
const incoming = await harvestNews();
let previous = null;
try {
  previous = parseNewsSnapshot(
    JSON.parse(await readFile("data/news.json", "utf8")),
  );
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const snapshot = mergeNewsSnapshots(previous, incoming);
if (!snapshot.sources.some((s) => s.status === "ok"))
  throw Error("No publisher feed succeeded; keep the previous snapshot.");
await writeFile("data/news.json", JSON.stringify(snapshot, null, 2) + "\n");
const q = (value) =>
  value === null ? "NULL" : "'" + String(value).replaceAll("'", "''") + "'";
const rows = snapshot.headlines.map(
  (h) =>
    `INSERT INTO headlines(url,title,source,source_id,published_at,retrieved_at,topics) VALUES(${[h.url, h.title, h.source, h.sourceId, h.publishedAt, h.retrievedAt, JSON.stringify(h.topics)].map(q).join(",")}) ON CONFLICT(url) DO UPDATE SET title=excluded.title,source=excluded.source,source_id=excluded.source_id,published_at=excluded.published_at,retrieved_at=excluded.retrieved_at,topics=excluded.topics;`,
);
for (const s of snapshot.sources)
  rows.push(
    `INSERT INTO feed_health(id,name,url,checked_at,last_success,status,count) VALUES(${[s.id, s.name, s.url, s.checkedAt, s.lastSuccess, s.status, s.count].map(q).join(",")}) ON CONFLICT(id) DO UPDATE SET checked_at=excluded.checked_at,last_success=COALESCE(excluded.last_success,feed_health.last_success),status=excluded.status,count=excluded.count;`,
  );
await writeFile(".openai/news-seed.sql", rows.join("\n") + "\n");
console.log(
  JSON.stringify({
    generatedAt: snapshot.generatedAt,
    headlines: snapshot.headlines.length,
    sources: snapshot.sources,
  }),
);
