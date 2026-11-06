import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createBackup, parseBackup } from "../lib/backup.ts";
import { defaultProgress } from "../lib/learning.ts";
import { addMark, emptyMarks, parseMarks } from "../lib/marks.ts";
const ids = new Set<string>();
const reflection = {
  version: 1,
  savedAt: "2026-10-12T10:00:00Z",
  choice: "no",
  proposal: "Keep this thought",
  benefit: "",
  cost: "Time matters",
  evidence: "New evidence could change my mind",
};
test("version4 backup round-trips political reflection with study notes and progress", () => {
  const backup = createBackup(
    defaultProgress(),
    emptyMarks(),
    {},
    JSON.stringify(reflection),
    {},
  );
  const restored = parseBackup(JSON.parse(JSON.stringify(backup)), ids);
  assert.deepEqual(restored?.reflection, reflection);
  assert.equal(restored?.progress.xp, 0);
  assert.deepEqual(restored?.marks, emptyMarks());
  assert.deepEqual(restored?.annotations, {});
  assert.deepEqual(restored?.read, {});
});
test("reading history travels in version4 and older files keep the device's own", () => {
  const backup = createBackup(defaultProgress(), emptyMarks(), {}, null, {
    26: 5,
    27: 6,
  });
  assert.deepEqual(parseBackup(JSON.parse(JSON.stringify(backup)), ids)?.read, {
    26: 5,
    27: 6,
  });
  assert.equal(parseBackup({ ...backup, version: 3 }, ids)?.read, undefined);
  assert.equal(parseBackup({ ...backup, read: "nope" }, ids), null);
});
test("old backup imports distinguish missing reflection from an explicit empty one", () => {
  for (const version of [1, 2])
    assert.equal(
      parseBackup(
        {
          version,
          progress: defaultProgress(),
          marks: emptyMarks(),
          annotations: {},
        },
        ids,
      )?.reflection,
      undefined,
    );
  assert.equal(
    parseBackup(
      createBackup(defaultProgress(), emptyMarks(), {}, null, {}),
      ids,
    )?.reflection,
    null,
  );
});
test("invalid reflection or missing version3 fields rejects the whole import before replacement", () => {
  const backup = createBackup(
    defaultProgress(),
    emptyMarks(),
    {},
    JSON.stringify(reflection),
    {},
  );
  assert.equal(
    parseBackup(
      { ...backup, reflection: { ...reflection, choice: "force-yes" } },
      ids,
    ),
    null,
  );
  assert.equal(parseBackup({ ...backup, reflection: undefined }, ids), null);
  assert.equal(parseBackup({ ...backup, marks: null }, ids), null);
  assert.equal(parseBackup({ ...backup, annotations: null }, ids), null);
  assert.throws(() =>
    createBackup(defaultProgress(), emptyMarks(), {}, "broken-json", {}),
  );
  assert.throws(() =>
    createBackup(
      defaultProgress(),
      emptyMarks(),
      {},
      JSON.stringify({ version: 99 }),
      {},
    ),
  );
});

test("version4 imports reject invalid reading timestamps rather than erase history", () => {
  const backup = createBackup(defaultProgress(), emptyMarks(), {}, null, {
    1: 1720000000000,
  });
  for (const read of [
    { 1: Infinity },
    { 1: "wrong" },
    { 1: -1 },
    { 1: 1.5 },
    { 280: 1720000000000 },
    { "01": 1720000000000 },
  ])
    assert.equal(parseBackup({ ...backup, read }, ids), null);
  assert.deepEqual(parseBackup(backup, ids)?.read, { 1: 1720000000000 });
});

test('highlight import rejects malformed entries rather than replacing them with an empty list', () => {
  const backup = createBackup(defaultProgress(), emptyMarks(), {}, null, {});
  for (const marks of [
    { marks: [{ nonsense: true }], bookmarks: [] },
    { marks: [], bookmarks: [1, 280] },
    { marks: [{ id: 'm', section: 1, lang: 'th', start: 0, end: 1, quote: 'x', note: 4, createdAt: 1 }], bookmarks: [] },
  ]) assert.equal(parseBackup({ ...backup, marks }, ids), null);
});

test('highlight import rejects dates that would crash the notebook date formatter', () => {
  const backup = createBackup(defaultProgress(), emptyMarks(), {}, null, {});
  for (const createdAt of [1e100, -1, 1.5, Infinity, 'yesterday']) {
    const marks = { marks: [{ id: 'm', section: 1, lang: 'th', start: 0, end: 1, quote: 'x', createdAt }], bookmarks: [] };
    assert.equal(parseBackup({ ...backup, marks }, ids), null);
  }
});


test('complete legal-section highlights and merged notes round-trip without truncation', () => {
  const corpus = JSON.parse(readFileSync(new URL('../data/constitution.json', import.meta.url), 'utf8')) as {sections:{number:number;th:string}[]};
  const text = corpus.sections.find(s=>s.number===258)!.th;
  assert.ok(text.length > 4000, 'exercise a real long section');
  let marks = addMark(emptyMarks(), text, {id:'full-section',section:258,lang:'th',start:0,end:text.length,note:'a'.repeat(5000),createdAt:100});
  marks = addMark(marks, text, {id:'merged-note',section:258,lang:'th',start:1,end:3,note:'b'.repeat(5000),createdAt:101});
  assert.ok(marks.marks[0].note!.length > 5000);
  const loaded = parseMarks(JSON.parse(JSON.stringify(marks)));
  const restored = parseBackup(JSON.parse(JSON.stringify(createBackup(defaultProgress(), marks, {}, null, {}))), ids);
  assert.equal(loaded?.marks[0].quote, text);
  assert.equal(restored?.marks?.marks[0].quote, text);
  assert.equal(loaded?.marks[0].note, marks.marks[0].note);
  assert.equal(restored?.marks?.marks[0].note, marks.marks[0].note);
});
