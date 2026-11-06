import test from "node:test";
import assert from "node:assert/strict";
import { addMark, anchor, emptyMarks, parseMarks, removeMark, segments, setNote, toggleBookmark } from "../lib/marks.ts";

const text = "บุคคลย่อมมีเสรีภาพในเคหสถาน การเข้าไปในเคหสถานโดยปราศจากความยินยอม";
const base = { section: 33, lang: "th" as const, createdAt: 1 };

test("highlights cover the text exactly once and merge when they overlap", () => {
  let m = addMark(emptyMarks(), text, { ...base, id: "a", start: 0, end: 5, note: "who" });
  m = addMark(m, text, { ...base, id: "b", start: 3, end: 18 });
  assert.equal(m.marks.length, 1);
  assert.equal(m.marks[0].quote, text.slice(0, 18));
  assert.equal(m.marks[0].note, "who");
  const parts = segments(text, m.marks);
  assert.equal(parts.map((p) => p.text).join(""), text);
  assert.equal(parts.filter((p) => p.mark).length, 1);
});

test("a corrected text keeps the highlight on the same words, or detaches it", () => {
  const mark = { start: 0, end: 5, quote: "บุคคล" };
  assert.deepEqual(anchor("  " + text, mark), [2, 7]);
  assert.equal(anchor("ข้อความใหม่", mark), null);
});

test("notes, removal, bookmarks and stored data are validated", () => {
  let m = addMark(emptyMarks(), text, { ...base, id: "a", start: 0, end: 5 });
  m = setNote(m, "a", "  ");
  assert.equal(m.marks[0].note, undefined);
  assert.equal(removeMark(m, "a").marks.length, 0);
  assert.deepEqual(toggleBookmark(toggleBookmark(m, 33), 5).bookmarks, [5, 33]);
  const parsed = parseMarks({ marks: [m.marks[0], { id: "x", section: 400 }], bookmarks: [33, 33, 0] });
  assert.equal(parsed?.marks.length, 1);
  assert.deepEqual(parsed?.bookmarks, [33]);
  assert.equal(parseMarks({}), null);
});

test('local highlight recovery keeps the note while replacing an unusable date safely', () => {
  const raw = { id: 'old-note', section: 1, lang: 'th', start: 0, end: 1, quote: 'x', note: 'Keep my words', createdAt: 1e100 };
  const recovered = parseMarks({ marks: [raw, { nonsense: true }], bookmarks: [1, 280] });
  assert.equal(recovered?.marks.length, 1);
  assert.equal(recovered?.marks[0].note, 'Keep my words');
  assert.equal(recovered?.marks[0].createdAt, 0);
  assert.doesNotThrow(() => new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(recovered!.marks[0].createdAt)));
  assert.deepEqual(recovered?.bookmarks, [1]);
});
