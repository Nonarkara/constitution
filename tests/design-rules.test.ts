import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const fontsCss = readFileSync(new URL("../public/fonts/fonts.css", import.meta.url), "utf8");
const homeSrc = readFileSync(new URL("../components/Home.tsx", import.meta.url), "utf8");
const practiceSrc = readFileSync(new URL("../components/PracticeArena.tsx", import.meta.url), "utf8");

test("no AI-slop fonts are referenced as design typefaces", () => {
  const bannedFonts = [
    "Inter",
    "Poppins",
    "Montserrat",
    "Roboto",
    "Open Sans",
    "Lato",
    "DM Sans",
    "Space Grotesk",
    "Geist",
    "Plus Jakarta Sans",
    "Manrope",
    "Nunito",
  ];

  for (const font of bannedFonts) {
    const re = new RegExp(`font-family:[^;]*["']?${font}["']?`, "i");
    assert.ok(!re.test(css), `app/globals.css must not use banned font ${font}`);
    assert.ok(!re.test(fontsCss), `public/fonts/fonts.css must not use banned font ${font}`);
  }
});

test("Bauhaus Universal lookalike font (Jost) and non-looped Thai are enforced", () => {
  assert.ok(css.includes('"Jost"'), 'app/globals.css must specify "Jost" as primary Latin geometric face');
  assert.ok(
    css.includes('"IBM Plex Sans Thai"'),
    'app/globals.css must specify "IBM Plex Sans Thai" as non-looped Thai face',
  );
  assert.ok(fontsCss.includes("'Jost'"), "public/fonts/fonts.css must declare @font-face for Jost");
  assert.ok(
    fontsCss.includes("'IBM Plex Sans Thai'"),
    "public/fonts/fonts.css must declare @font-face for IBM Plex Sans Thai",
  );
});

test("buttons and action links hug their content without arbitrary bloated min-widths", () => {
  // Strip CSS comments before testing rules
  const cleanCss = css.replace(/\/\*[\s\S]*?\*\//g, "");

  // Match any button or anchor selector that sets min-width >= 100px
  const buttonRules = cleanCss.match(/(\.[a-z0-9_-]*(?:btn|button|cta)[^\{]*\{[^\}]*\})/gi) ?? [];
  for (const rule of buttonRules) {
    assert.ok(
      !/min-width:\s*[0-9]{3}px/i.test(rule),
      `Button rule has arbitrary fixed min-width: ${rule.slice(0, 100)}`,
    );
    assert.ok(
      !(/width:\s*100%/i.test(rule) && /justify-content:\s*space-between/i.test(rule)),
      `Button rule stretches 100% with space-between chasm: ${rule.slice(0, 100)}`,
    );
  }
});

test("body paragraphs and prose are constrained to readable A4/A5 measure", () => {
  // Check that generic p tag has a max-width <= 68ch
  const pMatch = css.match(/p\s*\{[^}]*max-width:\s*([0-9]+)ch/);
  assert.ok(pMatch, "globals.css must set max-width in ch on p elements");
  const chLimit = Number(pMatch[1]);
  assert.ok(chLimit <= 68 && chLimit >= 45, `p max-width should be 45-68ch (A4/A5 measure), got ${chLimit}ch`);
});

test("home page uses tiered editorial architecture without equal 4-box card wall", () => {
  assert.ok(!homeSrc.includes("home-pathways"), "Home.tsx must not use flat home-pathways grid");
  assert.ok(!homeSrc.includes("pathway-card"), "Home.tsx must not use flat pathway-card components");

  assert.ok(homeSrc.includes("home-anchor"), "Home.tsx must feature home-anchor as dominant Tier 1 focus");
  assert.ok(homeSrc.includes("home-engines"), "Home.tsx must feature home-engines for Practice & Memory");
  assert.ok(homeSrc.includes("home-reference"), "Home.tsx must feature home-reference for Study Bible");
});

test("practice arena ranks exam simulation over secondary tools", () => {
  assert.ok(
    practiceSrc.includes("practice-featured-grid"),
    "PracticeArena.tsx must feature practice-featured-grid for real exam papers",
  );
  assert.ok(
    practiceSrc.includes("practice-featured-card"),
    "PracticeArena.tsx must use practice-featured-card for prominent simulation focus",
  );
});
