import test from "node:test";
import assert from "node:assert/strict";
import { createPlaybackCoordinator } from "../lib/playback.ts";
test("unmounting an idle language cannot cancel the active player, but deliberate takeover can", () => {
  let cancelled = 0,
    thaiStopped = 0;
  const coordinator = createPlaybackCoordinator(() => cancelled++),
    th = Symbol("Thai"),
    en = Symbol("English"),
    zh = Symbol("Chinese");
  coordinator.take(th, () => thaiStopped++);
  coordinator.stop(en);
  coordinator.stop(zh);
  assert.equal(cancelled, 0);
  assert.equal(thaiStopped, 0);
  assert.ok(coordinator.owns(th));
  coordinator.take(en, () => {});
  assert.equal(cancelled, 1);
  assert.equal(thaiStopped, 1);
  assert.ok(coordinator.owns(en));
  coordinator.release(th);
  assert.ok(coordinator.owns(en));
  coordinator.stop(en);
  assert.equal(cancelled, 2);
});
