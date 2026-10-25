import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  filterHeadlines,
  headlineMatches,
  topicCounts,
  topics,
  type Headline,
} from "../lib/news.ts";

const root = process.cwd();
const seed = JSON.parse(
  readFileSync(path.join(root, "data/news.json"), "utf8"),
) as { generatedAt: string; headlines: Headline[] };

const rows = seed.headlines;

/** The number the map shows beside a topic, for a given search word. */
const mapCount = (id: string, query = "") =>
  topicCounts(rows, query).find((row) => row.id === id)?.count ?? 0;

test("the number beside a topic is the number of headlines its filter yields", () => {
  for (const topic of topics) {
    const yield_ = rows.filter((h) => h.topics.includes(topic.id)).length;
    assert.equal(
      mapCount(topic.id),
      yield_,
      `${topic.id}: the map's count is not the filter's yield`,
    );
  }
});

test("the list head counts the rows the reader sees, and the map counts the same rows", () => {
  for (const query of ["", "รัฐธรรมนูญ", "สิทธิ", "คำที่ไม่มีในข่าว"]) {
    for (const topic of ["all", ...topics.map((t) => t.id)]) {
      const shown = filterHeadlines(rows, topic, query);
      assert.equal(
        shown.length,
        shown.filter((h) =>
          topic === "all" ? true : h.topics.includes(topic),
        ).length,
        `${topic} / "${query}": the list head does not count the rows shown`,
      );
      if (topic === "all") continue;
      assert.equal(
        shown.length,
        mapCount(topic, query),
        `${topic} / "${query}": the map's count and the list head disagree`,
      );
    }
  }
});

test("the count narrows with the search word exactly as the list does", () => {
  for (const query of ["รัฐธรรมนูญ", "ศาล", "สส."]) {
    const narrowed = rows.filter((h) => headlineMatches(h.title, query));
    for (const topic of topics) {
      const expected = narrowed.filter((h) =>
        h.topics.includes(topic.id),
      ).length;
      assert.equal(
        mapCount(topic.id, query),
        expected,
        `${topic.id} / "${query}": the count does not narrow with the word`,
      );
    }
  }
});

test("the topics are listed in order of the headlines they carry", () => {
  const counts = topicCounts(rows);
  assert.ok(counts.length > 0, "the edition has topics");
  for (let i = 1; i < counts.length; i++)
    assert.ok(
      counts[i - 1].count >= counts[i].count,
      "the topics are not in order of the headlines they carry",
    );
  assert.equal(
    counts.reduce((a, b) => a + b.count, 0) >= rows.length,
    true,
    "the counts of the topics together cover the edition",
  );
});

test("an edition that ages does not empty itself", () => {
  const old = rows.map((h) => ({ ...h, publishedAt: "2020-01-01T00:00:00Z" }));
  assert.deepEqual(
    topicCounts(old).map((row) => [row.id, row.count]),
    topicCounts(rows).map((row) => [row.id, row.count]),
    "the counts are of the edition being read, not of the wall clock",
  );
});

test("a headline that touches two topics is counted in both, and the counts do not add up to the list", () => {
  const many = rows.filter((h) => h.topics.length > 1);
  assert.ok(many.length > 0, "the edition has a headline that touches two topics");
  const total = topicCounts(rows).reduce((a, b) => a + b.count, 0);
  assert.ok(
    total > rows.length,
    "the topic counts overlap, so they do not add up to the whole list",
  );
});
