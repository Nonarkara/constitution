import test from "node:test";
import assert from "node:assert/strict";
import { createBackup, parseBackup } from "../lib/backup.ts";
import { defaultProgress } from "../lib/learning.ts";
import { emptyMarks } from "../lib/marks.ts";
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
  const backup = createBackup(defaultProgress(), emptyMarks(), {}, JSON.stringify(reflection), {});
  const restored = parseBackup(JSON.parse(JSON.stringify(backup)), ids);
  assert.deepEqual(restored?.reflection, reflection);
  assert.equal(restored?.progress.xp, 0);
  assert.deepEqual(restored?.marks, emptyMarks());
  assert.deepEqual(restored?.annotations, {});
  assert.deepEqual(restored?.read, {});
});
test("reading history travels in version4 and older files keep the device's own", () => {
  const backup = createBackup(defaultProgress(), emptyMarks(), {}, null, { 26: 5, 27: 6 });
  assert.deepEqual(parseBackup(JSON.parse(JSON.stringify(backup)), ids)?.read, { 26: 5, 27: 6 });
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
    parseBackup(createBackup(defaultProgress(), emptyMarks(), {}, null, {}), ids)
      ?.reflection,
    null,
  );
});
test("invalid reflection or missing version3 fields rejects the whole import before replacement", () => {
  const backup = createBackup(defaultProgress(), emptyMarks(), {}, JSON.stringify(reflection), {});
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
    createBackup(defaultProgress(), emptyMarks(), {}, JSON.stringify({ version: 99 }), {}),
  );
});
