import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (p: string) => readFileSync(new URL(".." + p, import.meta.url), "utf8");

/**
 * The art map, read from the source rather than imported: the map lives in a
 * component, and a component cannot be loaded outside the browser. Reading
 * the file is enough — what matters is which page names which picture.
 */
function artMap(): Record<string, string> {
  const source = read("/components/StudyArt.tsx");
  const body = source.slice(source.indexOf("STUDY_ART = {"));
  const entries = body.slice(0, body.indexOf("};"));
  const map: Record<string, string> = {};
  for (const match of entries.matchAll(/(\w+):\s*"([^"]+)"/g)) map[match[1]] = match[2];
  return map;
}

test("the streets are recorded, with their credit and their terms", () => {
  const streets = JSON.parse(read("/data/sources/streets.json"));
  assert.ok(streets.credit.th.includes("OpenStreetMap"));
  assert.ok(streets.credit.en.includes("OpenStreetMap"));
  assert.ok(streets.credit.zh.includes("OpenStreetMap"));
  // The terms ask for the credit to travel with the work, and they say the
  // exported file may not be handed on by itself. The record says both.
  assert.ok(streets.terms.en.includes("distributed"));
  assert.ok(streets.terms.th.length > 20 && streets.terms.zh.length > 20);
  assert.equal(streets.scenes.length, 5);
  for (const scene of streets.scenes) {
    assert.ok(scene.place.th && scene.place.en && scene.place.zh, scene.id);
  }
});

test("five pages stand in a Bangkok street, and each drawing appears once", () => {
  const streets = Object.entries(artMap()).filter(([, src]) =>
    src.includes("/illustrations/scene-"),
  );
  assert.equal(streets.length, 5, "five pages carry a street");
  // A street scene is a picture of a place with one of the house's own
  // figures in it. The figure must not appear twice, or one drawing would
  // cue two pages.
  const manifest = JSON.parse(read("/design/illustrations/street-manifest.json"));
  const figures = manifest.scenes.map((s: { figure: string }) => s.figure);
  assert.equal(new Set(figures).size, figures.length, "a figure appears in two streets");
  for (const scene of manifest.scenes) {
    assert.ok(scene.credit.includes("OpenStreetMap"), scene.name);
    assert.ok(scene.source.includes("Location Scout"), scene.name);
  }
});

test("every street names the place it shows, in every language", () => {
  // The name of a place is DATA, printed by the page beside the picture.
  // It used to be printed INTO the picture, where it arrived at 1.8 to 6.2
  // points on the screen — a smudge — and where no screen reader could reach
  // it at all. So the name lives here, and this test is what keeps it honest:
  // a street with no name is a street that cues nothing, and a name for a
  // picture that does not ship is a caption for a picture nobody sees.
  const cues = JSON.parse(read("/data/street-cues.json"));
  const manifest = JSON.parse(read("/design/illustrations/street-manifest.json"));
  const served = new Set(
    manifest.scenes.map((s: { name: string }) => `/illustrations/${s.name}`),
  );
  const names = Object.keys(cues.scenes);
  assert.equal(names.length, served.size, "every street has a name");
  for (const name of names) {
    const cue = cues.scenes[name];
    assert.ok(served.has(cue.served), `${name} names a picture that does not ship`);
    for (const lang of ["th", "en", "zh"]) {
      assert.ok(cue.place[lang] && cue.place[lang].length > 1, `${name} has no ${lang} place name`);
      assert.ok(cue.number[lang] && cue.number[lang].length > 1, `${name} has no ${lang} number`);
    }
  }
  // Every street the app shows is named — the picture and the caption cannot
  // disagree about which place this is.
  for (const [, src] of Object.entries(artMap())) {
    if (!src.includes("/illustrations/scene-")) continue;
    assert.ok(
      names.some((n) => cues.scenes[n].served === src),
      `${src} is shown but not named`,
    );
  }
});

test("the street gate resolves Python the way CI installs it", () => {
  // setup-python puts Pillow on `python3` and does not create `.venv`.
  // A script that names `.venv/bin/python` dies with exit 127, and the
  // byte check never runs. The runner must share the illustration gate's
  // resolver: PYTHON, then .venv, then python3 on PATH.
  const pkg = JSON.parse(read("/package.json"));
  assert.equal(pkg.scripts["check:streets"], "node scripts/run-streets.mjs --check");
  assert.equal(pkg.scripts["build:streets"], "node scripts/run-streets.mjs");
  assert.match(read("/scripts/run-streets.mjs"), /illustrationPython\(\)/);
});

test("every street the app names is a file that ships", () => {
  for (const [, src] of Object.entries(artMap())) {
    if (!src.includes("/illustrations/scene-")) continue;
    const file = read(`/public${src}`);
    assert.ok(file.length > 1000, `${src} is empty`);
  }
});
