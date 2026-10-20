#!/usr/bin/env node
/**
 * Falsify the hierarchy gate.
 *
 * A gate that has never failed proves nothing. This injects one real violation
 * per rule into the BUILT site and checks that the gate catches each one, then
 * restores the build. The violations are injected into the built stylesheet
 * rather than the source so each one is isolated and the run is quick — the
 * gate measures what a browser renders, so what it renders is what matters.
 *
 * Usage: node scripts/falsify-hierarchy.mjs
 */
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "out");

function cssFiles() {
  const dir = path.join(OUT, "_next", "static", "css");
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith(".css"))
      .map((f) => path.join(dir, f));
  } catch {
    return [];
  }
}

const files = cssFiles();
if (!files.length) {
  console.error("\nFAIL — no built stylesheet found in out/. Nothing was falsified.\n");
  process.exit(1);
}
const target = files[0];
const original = readFileSync(target, "utf8");

/** Each violation: a rule appended to the sheet, and the message it must trip. */
const VIOLATIONS = [
  {
    name: "title loses to the next biggest text",
    rule: ".exam-featured-title{font-size:var(--display)!important}",
    expect: "title is only",
  },
  {
    name: "title is only slightly bigger than the body",
    rule: "main#content p{font-size:40px!important}",
    expect: "title is only",
  },
  {
    name: "a third volume of loud text",
    rule: ".exam-paper-row .paper-card-title{font-weight:800!important;font-size:22px!important}.exam-featured-title{font-size:26px!important}",
    expect: "groups of loud text",
  },
  {
    name: "three filled primary actions compete",
    rule: ".exam-paper-row:nth-child(-n+3){background:var(--accent)!important;border-color:var(--accent)!important}",
    expect: "filled primary actions",
  },
  {
    name: "the quiet list turns back into a wall of cards",
    rule: ".exam-paper-row{background:var(--paper)!important;border:1px solid var(--line)!important;padding:14px 16px!important}",
    expect: "card-like actions",
  },
  {
    name: "the page loses the one thing it asks you to do",
    rule: ".action-panel{border-left-color:var(--line)!important}.action-panel-cta,.primary{background:transparent!important;color:inherit!important}.lookup-input{border-left-color:var(--edge)!important}.notebook-next{background:transparent!important;color:inherit!important}",
    expect: "no dominant affordance",
  },
  {
    name: "a second main action competes with the first",
    rule: ".hub-list a{background:var(--accent)!important;border-color:var(--accent)!important}",
    expect: "dominant affordances compete",
  },
];

function runGate() {
  try {
    execFileSync(process.execPath, [path.join(ROOT, "scripts/check-hierarchy.mjs")], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { pass: true, out: "" };
  } catch (e) {
    return { pass: false, out: `${e.stdout || ""}${e.stderr || ""}` };
  }
}

const baseline = runGate();
if (!baseline.pass) {
  console.error("\nFAIL — the gate does not pass on the clean build. Fix that first.\n");
  console.error(baseline.out);
  process.exit(1);
}
console.log("  · clean build passes");

let failures = 0;
for (const v of VIOLATIONS) {
  writeFileSync(target, original + "\n" + v.rule + "\n");
  const res = runGate();
  writeFileSync(target, original);
  if (res.pass) {
    console.error(`  ✗ ${v.name} — the gate did NOT catch it. The rule is dead.`);
    failures++;
  } else if (!res.out.includes(v.expect)) {
    console.error(
      `  ✗ ${v.name} — the gate failed, but not for the expected reason.\n` +
        `      expected a message containing "${v.expect}", got:\n${res.out.trim().split("\n").slice(0, 6).join("\n")}`,
    );
    failures++;
  } else {
    console.log(`  · caught: ${v.name}`);
  }
}

if (failures) {
  console.error(`\nFAIL — ${failures} rule(s) did not bite. The gate is not trustworthy.\n`);
  process.exit(1);
}

// The one-h1 rule needs a real second h1 in the DOM, which no stylesheet can
// produce, so it is falsified at the source and rebuilt. Slower, but it is the
// only way to prove the rule sees what it claims to see.
const VICTIM = path.join(ROOT, "components", "Glossary.tsx");
const victimOriginal = readFileSync(VICTIM, "utf8");
try {
  writeFileSync(
    VICTIM,
    victimOriginal.replace(
      "<h1>{tr(lang, \"อภิธานศัพท์\", \"Glossary\", \"术语表\")}</h1>",
      "<h1>{tr(lang, \"อภิธานศัพท์\", \"Glossary\", \"术语表\")}</h1>\n          <h1>{tr(lang, \"อภิธานศัพท์\", \"Glossary\", \"术语表\")}</h1>",
    ),
  );
  execFileSync("npm", ["run", "build"], { cwd: ROOT, stdio: "ignore" });
  const res = runGate();
  if (res.pass) {
    console.error("  ✗ a second h1 on the page — the gate did NOT catch it. The rule is dead.");
    failures++;
  } else if (!res.out.includes("h1 elements")) {
    console.error(`  ✗ a second h1 on the page — failed for the wrong reason:\n${res.out.trim().split("\n").slice(0, 6).join("\n")}`);
    failures++;
  } else {
    console.log("  · caught: a second h1 on the page");
  }
} finally {
  writeFileSync(VICTIM, victimOriginal);
  execFileSync("npm", ["run", "build"], { cwd: ROOT, stdio: "ignore" });
}

if (failures) {
  console.error(`\nFAIL — ${failures} rule(s) did not bite. The gate is not trustworthy.\n`);
  process.exit(1);
}
console.log(
  `\n  · hierarchy gate: ${VIOLATIONS.length + 1} injected violations, all caught. ` +
    `Every rule has failed at least once.\n`,
);
