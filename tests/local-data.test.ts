import test from "node:test";
import assert from "node:assert/strict";
import { DEVICE_PREFERENCES, eraseLearnerData, keepBackup, learnerKeys } from "../lib/local-data.ts";
import { createBackup, parseBackup } from "../lib/backup.ts";
import { defaultProgress } from "../lib/learning.ts";
import { emptyMarks } from "../lib/marks.ts";

function memory(entries: Record<string, string> = {}) {
  const map = new Map(Object.entries(entries));
  return {
    get length() { return map.size; },
    key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    keys: () => [...map.keys()].sort(),
  };
}

test("erasing a shared device removes every learner record and keeps only device preferences", () => {
  const store = memory({
    "constitution-progress": "{}", "constitution-marks": "{}", "constitution-annotations": "{}",
    "constitution-read-v1": "{}", "constitution-amendment-reflection-v1": "{}",
    "constitution-private-polls-v1": "{}", "constitution-blind-v1": "{}", "pokklong-progress": "{}",
    "constitution-progress-backup-1": "x", "constitution-theme": "dark", "constitution-lang": "th",
    "constitution-large": "true", "someone-else": "keep",
  });
  eraseLearnerData(store);
  assert.deepEqual(store.keys(), [...DEVICE_PREFERENCES, "someone-else"].sort());
  assert.deepEqual(learnerKeys(store), []);
});

test("an unreadable value is copied once per distinct value, and only the newest three copies stay", () => {
  const store = memory();
  for (let t = 1; t <= 5; t++) keepBackup(store, "constitution-progress", "broken", t);
  assert.equal(learnerKeys(store).length, 1, "reloading must not add a copy each time");
  for (let t = 10; t <= 14; t++) keepBackup(store, "constitution-progress", `broken-${t}`, t);
  assert.deepEqual(learnerKeys(store).sort(), ["constitution-progress-backup-12", "constitution-progress-backup-13", "constitution-progress-backup-14"]);
});

test("an export carries Pokklong and an unfinished blind exam; older files still import", () => {
  const ids = new Set<string>();
  const backup = createBackup(defaultProgress(), emptyMarks(), {}, null, {}, {
    pokklong: { answers: { "PK-S1-001": true } },
    blind: '{"version":1}',
  });
  const back = parseBackup(JSON.parse(JSON.stringify(backup)), ids);
  assert.deepEqual(back?.pokklong, { answers: { "PK-S1-001": true } });
  assert.equal(back?.blind, '{"version":1}');
  assert.equal(parseBackup({ ...backup, pokklong: { answers: { bad: 1 } } }, ids), null);
  const v4 = { ...backup, version: 4 } as Record<string, unknown>;
  delete v4.pokklong;
  delete v4.blind;
  const old = parseBackup(v4, ids);
  assert.ok(old);
  assert.equal(old!.pokklong, undefined, "an older file leaves this device's Pokklong alone");
});
