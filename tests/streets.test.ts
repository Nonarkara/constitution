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

test("every street the app names is a file that ships", () => {
  for (const [, src] of Object.entries(artMap())) {
    if (!src.includes("/illustrations/scene-")) continue;
    const file = read(`/public${src}`);
    assert.ok(file.length > 1000, `${src} is empty`);
  }
});
