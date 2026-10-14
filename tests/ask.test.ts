import test from "node:test";
import assert from "node:assert/strict";
import { deepLink, askLanguage, pollDelay, classify, localConstitution, POLL_LIMIT, pollSteps, ATTEMPT_BUDGET_MS, ASK_RETRIES } from "../lib/ask.ts";

test("the Non-Laws hand-off keeps the question in the fragment", () => {
  const url = new URL(deepLink("ตำรวจค้นบ้านได้ไหม", [33, 36, 1, 2, 3, 4]));
  assert.equal(url.search, "");
  assert.equal(url.hash.slice(0, 6), "#laws?");
  const p = new URLSearchParams(url.hash.slice(6));
  assert.equal(p.get("q"), "ตำรวจค้นบ้านได้ไหม");
  assert.equal(p.get("s"), "33,36,1,2,3");
  assert.equal(new URLSearchParams(new URL(deepLink("x".repeat(5000))).hash.slice(6)).get("q")?.length, 1500);
  assert.equal(new URLSearchParams(new URL(deepLink("x")).hash.slice(6)).has("s"), false);
});

test("languages, polling and outcomes map to what the server understands", () => {
  assert.equal(askLanguage("zh"), "zh-Hans");
  assert.equal(askLanguage("th"), "th");
  const delays = Array.from({ length: 6 }, (_, i) => pollDelay(i));
  assert.deepEqual(delays, [...delays].sort((a, b) => a - b));
  const budget = pollSteps().reduce((sum, delay) => sum + delay, 0);
  assert.equal(ATTEMPT_BUDGET_MS, 120_000);
  assert.ok(budget <= ATTEMPT_BUDGET_MS);
  assert.ok(budget > 60_000);
  assert.equal(POLL_LIMIT, pollSteps().length);
  assert.equal(ASK_RETRIES, 1);
  assert.ok((ASK_RETRIES + 1) * ATTEMPT_BUDGET_MS <= 240_000);
  assert.equal(classify(202, {}), "accepted");
  assert.equal(classify(429, {}), "rate");
  assert.equal(classify(422, { refused: true }), "refused");
  assert.equal(classify(503, {}), "unavailable");
  assert.equal(classify(500, {}), "server");
});

test("only constitution citations inside 1-279 are re-rendered locally", () => {
  assert.deepEqual(
    localConstitution([
      { cite: "รธน. มาตรา 36", section: "36" },
      { cite: "ป.อ. มาตรา 334", section: "334" },
      { cite: "รธน. มาตรา 999", section: "999" },
    ]),
    [36],
  );
});
