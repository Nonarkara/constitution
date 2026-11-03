import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { palace } from "../lib/palace.ts";
test("each of sixteen chapters has a unique illustrated station and legal anchors", () => {
  const corpus = JSON.parse(
    readFileSync(new URL("../data/constitution.json", import.meta.url), "utf8"),
  );
  assert.deepEqual(
    palace.map((p) => p.chapter),
    Array.from({ length: 16 }, (_, i) => i + 1),
  );
  assert.equal(new Set(palace.map((p) => `${p.atlas}-${p.panel}`)).size, 16);
  for (const p of palace) {
    assert.ok(
      existsSync(
        new URL(
          `../public/illustrations/palace-${p.atlas}.webp`,
          import.meta.url,
        ),
      ),
    );
    assert.ok(
      p.sections.length > 0 &&
        p.sections.every((n) => corpus.sections[n - 1]?.chapter === p.chapter),
    );
    for (const l of ["th", "en", "zh"] as const) {
      assert.ok(p.meaning[l] && p.joke[l] && p.check[l]);
    }
  }
});
test("number cues preserve legal units and guard against misleading totals", () => {
  assert.equal(palace[4].number, "12");
  assert.ok(palace[4].meaning.en.includes("preschool"));
  assert.ok(palace[7].meaning.en.includes("other ministers"));
  assert.ok(palace[10].meaning.en.includes("one term only"));
  assert.ok(palace[11].meaning.en.includes("not five members"));
  assert.ok(
    palace[14].meaning.en.includes("not a 30-day completion guarantee"),
  );
  assert.ok(palace[15].meaning.en.includes("at least"));
});

test("the memory house shows the room before it shows the plan of the house", () => {
  const src = readFileSync(
    new URL("../components/MemoryHouse.tsx", import.meta.url),
    "utf8",
  );
  const room = src.indexOf('<article ref={detail} className="palace-room"');
  const index = src.indexOf('<nav\n        id="memory-rooms"');
  assert.ok(room > 0, "the memory house has no room");
  assert.ok(index > 0, "the memory house has no index of rooms");
  assert.ok(
    room < index,
    "the room must come before the sixteen thumbnails: the page tells the learner to see the picture, so the picture cannot be under the index",
  );
  // The image is evidence for the recall task, so it precedes the action.
  // The rendered task receipt checks that both fit the first screen; a
  // source-order assertion must not protect an oversized illustration.
  const picture = src.indexOf("<PalacePicture chapter={selected} />");
  const action = src.indexOf('className="primary action-panel-cta"');
  const end = src.indexOf("</article>");
  assert.ok(
    picture > 0 && action > 0,
    "the room has neither a picture nor an action",
  );
  assert.ok(
    room < picture && picture < action && action < end,
    "the room's picture and action must stay together before the room index",
  );
});
