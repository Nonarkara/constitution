import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeDrill, DRILL_COUNT } from "../lib/drills.ts";
import { papers, makePaper } from "../lib/papers.ts";
import { polls, parsePolls } from "../lib/polls.ts";
import {
  persistImport,
  ImportStorageError,
  RECOVERY_KEY,
} from "../lib/import-storage.ts";
import { defaultProgress } from "../lib/learning.ts";
import { prioritizedReview, attemptedCount } from "../lib/review-queue.ts";
import type { Question } from "../lib/learning";
const bank = JSON.parse(
  readFileSync(new URL("../data/questions.json", import.meta.url), "utf8"),
) as Question[];
test("4230 unique drills have trilingual distinct choices and independently correct minimums", () => {
  const seen = new Set<string>(),
    prompts = new Set<string>();
  for (let i = 0; i < DRILL_COUNT; i++) {
    const q = makeDrill(i),
      f = Math.floor(i / 423),
      s = i % 423,
      H = 72 + s,
      S = 40 + (s % 161),
      E = 10 + (s % 70);
    assert.ok(!seen.has(q.id));
    seen.add(q.id);
    assert.ok(!prompts.has(q.prompt.th));
    prompts.add(q.prompt.th);
    assert.ok(q.answer >= 0 && q.answer < 4);
    for (const l of ["th", "en", "zh"] as const) {
      assert.ok(q.prompt[l] && q.explanation[l]);
      assert.equal(new Set(q.choices.map((c) => c[l])).size, 4);
    }
    if (f < 6) {
      const n = Number(q.choices[q.answer].en.split(" ")[0]);
      const D = [H + S, H + S, S, E, H, H + S][f],
        div = [2, 2, 3, 5, 5, 5][f];
      if (f === 1) {
        assert.ok(n * div > D && (n - 1) * div <= D);
      } else assert.ok(n * div >= D && (n - 1) * div < D);
    }
    if (f === 8) {
      const need = s % 2 === 0 ? 50000 : 10000,
        have =
          s % 2 === 0 ? 10000 + ((s * 89) % 39000) : 3000 + ((s * 17) % 6900);
      assert.equal(Number(q.choices[q.answer].en.split(" ")[0]), need - have);
    }
    if (f === 9)
      assert.equal(
        Number(q.choices[q.answer].en.split(" ")[0]),
        Math.max(0, 20 + (s % 16) + 1 + Math.floor(s / 16) - 35),
      );
  }
  assert.equal(seen.size + bank.length, 4700);
});
test("30 reproducible papers have unique questions and preserve shuffled answer meaning", () => {
  assert.equal(papers.length, 30);
  const orders = new Set<string>();
  const positions = [0, 0, 0, 0];
  for (const p of papers) {
    const paper = makePaper(bank, p);
    assert.equal(paper.length, p.count);
    assert.equal(new Set(paper.map((q) => q.id)).size, p.count);
    assert.deepEqual(makePaper(bank, p), paper);
    orders.add(paper.map((q) => q.id).join(","));
    for (const q of paper) {
      const old = bank.find((b) => b.id === q.id)!;
      assert.deepEqual(q.choices[q.answer], old.choices[old.answer]);
      positions[q.answer]++;
    }
  }
  assert.equal(orders.size, 30);
  assert.ok(positions.every((n) => n > 200));
});
test("failed import does not report success and preserves original values/recovery", () => {
  const data = new Map([
    ["constitution-progress", "old progress"],
    ["constitution-marks", "old marks"],
  ]);
  let writes = 0;
  const storage = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      writes++;
      if (writes === 3) throw new DOMException("full", "QuotaExceededError");
      data.set(k, v);
    },
    removeItem: (k: string) => {
      data.delete(k);
    },
  };
  assert.throws(
    () =>
      persistImport(storage, {
        progress: defaultProgress(),
        marks: { marks: [], bookmarks: [] },
        annotations: {},
        reflection: null,
        read: {},
      }),
    ImportStorageError,
  );
  assert.equal(data.get("constitution-progress"), "old progress");
  assert.equal(data.get("constitution-marks"), "old marks");
  assert.ok(data.has(RECOVERY_KEY));
});
test("quota failure while preparing recovery aborts before any mutation", () => {
  let mutated = false;
  assert.throws(
    () =>
      persistImport(
        {
          getItem: () => null,
          setItem: () => {
            throw Error("quota");
          },
          removeItem: () => {
            mutated = true;
          },
        },
        {
          progress: defaultProgress(),
          marks: null,
          annotations: null,
          reflection: undefined,
          read: undefined,
        },
      ),
    ImportStorageError,
  );
  assert.equal(mutated, false);
});
test("targeted review advances past correctly answered early cards", () => {
  const p = defaultProgress();
  p.questions.a = { correct: true, level: 1, due: 9999 };
  p.questions.b = { correct: false, level: 0, due: 9999 };
  p.questions.d = { correct: true, level: 1, due: 1 };
  assert.deepEqual(
    prioritizedReview(
      [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }],
      p,
      10,
      3,
    ).map((q) => q.id),
    ["d", "b", "c"],
  );
});
test("ten private polls reject unknown IDs and malformed choices/notes", () => {
  assert.equal(polls.length, 10);
  assert.equal(new Set(polls.map((p) => p.id)).size, 10);
  assert.deepEqual(parsePolls({ goal: { choice: 1, note: "My reason" } }), {
    goal: { choice: 1, note: "My reason" },
  });
  assert.equal(parsePolls({ goal: { choice: 3, note: "" } }), null);
  assert.equal(parsePolls({ unknown: { choice: 0, note: "" } }), null);
  assert.equal(
    parsePolls({ goal: { choice: 0, note: "x".repeat(1001) } }),
    null,
  );
});

test("generated progress never inflates authored attempts", () => {
 const p = defaultProgress();
 p.questions[bank[0].id] = { correct: true, due: 1, level: 1 };
 p.questions[makeDrill(0).id] = { correct: true, due: 1, level: 1 };
 assert.equal(attemptedCount(bank, p), 1);
});
