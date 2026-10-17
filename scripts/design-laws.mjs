/**
 * Anti-slop design laws, as a function the release gate and the test suite
 * both call. They used to carry two copies of this logic, which is how a rule
 * started passing while it could not see half the stylesheet.
 *
 * The version this replaces matched a rule only when the selector was a single
 * class whose own name contained btn/button/cta. It therefore missed
 * `.quiz-bottom button`, a bare `button`, and `input.jump-field` — verified:
 * injecting `min-width: 240px` into each of those passed the gate and the
 * suite. It also passed vacuously when it matched nothing at all.
 *
 * This version parses `selector { declarations }` pairs and asks whether the
 * selector targets something a person clicks or types into, wherever it sits
 * in the tree. It also refuses to pass silently: if the parser stops finding
 * rules, that is a failure, not a clean bill of health.
 */
import { readFileSync } from "node:fs";

/**
 * Only buttons and links are held to the hug-your-label law. Form controls
 * need a floor: a chapter <select> with `min-width: 140px` stops collapsing to
 * an unreadable sliver as the toolbar narrows, and banning that would be
 * banning good practice.
 */
const MIN_WIDTH_TARGET = /(^|[\s>+~,])(?:button|a)\b|\b[\w-]*(?:btn|button|cta|action|toggle|tab|chip)[\w-]*\b/i;

/**
 * A full-width control with space-between is only a defect when the gap is
 * dead air inside a single action. In a list row it is deliberate: the step
 * name sits left and the question count sits right, like a contents page.
 * So this is reported, not failed — see the note in the release gate.
 */
const SPACE_BETWEEN_TARGET = /(^|[\s>+~,])button\b|\b[\w-]*btn[\w-]*\b/i;

/** Fonts that make every product look like the same product. */
export const SLOP_FONTS = [
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

/**
 * Looped Thai faces break tone marks and vowel stacks at small sizes, and the
 * project has banned them outright. This is the law worth enforcing, as
 * opposed to "the Latin face must be the one I happened to pick".
 */
const LOOPED_THAI = ["Sarabun", "Chakra Petch", "Mitr", "Itim"];

/** Split CSS into selector/declaration pairs, ignoring comments and strings. */
export function parseRules(css) {
  const clean = css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '""');
  const rules = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(clean)) !== null) {
    const selector = m[1].trim();
    if (!selector || selector.startsWith("@")) continue;
    rules.push({ selector, body: m[2], at: selector });
  }
  return rules;
}

export function designViolations(css, { minRules = 25 } = {}) {
  const failures = [];
  const reported = [];
  const rules = parseRules(css);

  // A detector that suddenly matches nothing is a broken detector.
  if (rules.length < minRules) {
    failures.push(
      `design: parsed only ${rules.length} CSS rules (expected >= ${minRules}) — ` +
        `the design-law detector has stopped seeing the stylesheet`,
    );
  }

  for (const font of SLOP_FONTS) {
    if (new RegExp(`font-family:[^;]*["']?${font}["']?`, "i").test(css)) {
      failures.push(`design: CSS uses banned AI-slop font "${font}"`);
    }
  }
  for (const font of LOOPED_THAI) {
    if (new RegExp(`font-family:[^;]*["']?${font}["']?`, "i").test(css)) {
      failures.push(`design: CSS uses looped Thai face "${font}" — banned; use IBM Plex Sans Thai`);
    }
  }

  for (const rule of rules) {
    if (MIN_WIDTH_TARGET.test(rule.selector)) {
      const fixed = rule.body.match(/min-width:\s*(\d+)px/i);
      if (fixed && Number(fixed[1]) >= 100) {
        failures.push(
          `design: "${rule.selector}" pins min-width: ${fixed[1]}px on a button or link — ` +
            `use fit-content or padding so it hugs its label`,
        );
      }
    }
    if (
      SPACE_BETWEEN_TARGET.test(rule.selector) &&
      /width:\s*100%/i.test(rule.body) &&
      /justify-content:\s*space-between/i.test(rule.body)
    ) {
      reported.push(
        `design: "${rule.selector}" is full-width with space-between — fine in a list row ` +
          `(label left, count right), dead air in a single action`,
      );
    }
  }

  return { failures, reported, ruleCount: rules.length };
}

export function designCheck(root, { minRules = 25 } = {}) {
  const css = readFileSync(`${root}/app/globals.css`, "utf8");
  return designViolations(css, { minRules });
}