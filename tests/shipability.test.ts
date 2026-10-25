import { questionVisualFor } from "../lib/question-visual.ts";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import { JSDOM } from "jsdom";
import * as pokklong from "../lib/pokklong.ts";
import * as i18n from "../lib/i18n.ts";
import * as shuffle from "../lib/shuffle.ts";
import { buildSectionSession } from "../lib/mixed.ts";

const bank = JSON.parse(readFileSync(new URL("../data/questions.json", import.meta.url), "utf8"));
test("targeted repair keeps every question on the requested section, including generated supplements", () => {
  for (const section of [1, 26, 133, 158, 256, 279]) {
    // Sparse and full banks exercise the actual fallback that previously inserted unrelated drills.
    const own = bank.filter((q: { sections: number[] }) => q.sections.includes(section)).slice(0, 1);
    for (const input of [bank, own]) {
      const queue = buildSectionSession(input, section);
      assert.ok(queue.length > 0 && queue.length <= 5);
      assert.equal(new Set(queue.map(q => q.id)).size, queue.length);
      assert.ok(queue.every(q => q.sections.includes(section)), `section ${section} received unrelated material`);
    }
  }
  assert.deepEqual(buildSectionSession(bank, 999), []);
});

const require = createRequire(import.meta.url);
const React = require("react");
const dom = new JSDOM('<div id="root"></div>', { url: "https://study.test/", pretendToBeVisual: true });
for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document, navigator: dom.window.navigator, IS_REACT_ACT_ENVIRONMENT: true }))
  Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
dom.window.scrollTo = () => {};
const { createRoot } = require("react-dom/client");
function load(file: string, extras: Record<string, unknown> = {}) {
  const module = { exports: {} as Record<string, unknown> };
  const compiled = ts.transpileModule(readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const registry: Record<string, unknown> = {
    "@/lib/pokklong": pokklong, "@/lib/i18n": i18n, "@/lib/shuffle": shuffle,
    "@/data/pokklong/questions.json": JSON.parse(readFileSync(new URL("../data/pokklong/questions.json", import.meta.url), "utf8")),
    "./Provider": { useStudy: () => ({ lang: "en" }) },
    "./Shell": { useHidePageNext: () => {} }, "./PracticeTabs": { PracticeTabs: () => null }, ...extras,
  };
  new Function("require", "module", "exports", compiled)((id: string) => id in registry ? registry[id] : require(id), module, module.exports);
  return module.exports;
}
// the proportions of each plate, measured from the file that ships
const plateRatios = load("../lib/illustration-ratios.ts");
const plate = load("../lib/plate.ts", { "@/lib/illustration-ratios": plateRatios });
const visual = load("../components/QuestionVisual.tsx", {
 "@/lib/question-visual": { questionVisualFor }, "./MemoryCue": { PalacePicture: () => null },
 "@/lib/illustration-ratios": plateRatios, "@/lib/plate": plate,
 "next/image": { __esModule: true, default: ({src,alt}: {src:string;alt:string}) => React.createElement("img", {src,alt}) },
});
const card = load("../components/GuessFirstCard.tsx");
const { PokklongPractice } = load("../components/PokklongPractice.tsx", { "./GuessFirstCard": card, "./QuestionVisual": visual });

test("Pokklong remains usable with blocked storage and warns when an answer cannot save", async () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const root = createRoot(dom.window.document.getElementById("root"));
  const body = () => dom.window.document.body.textContent ?? "";
  async function click(text: string) {
    const button = [...dom.window.document.querySelectorAll("button")].find(b => b.textContent?.trim() === text);
    assert.ok(button, `missing ${text}`);
    await React.act(async () => button.click());
  }
  try {
    Object.defineProperty(globalThis, "localStorage", { configurable: true, get: () => { throw new DOMException("Blocked", "SecurityError"); } });
    await React.act(async () => root.render(React.createElement(PokklongPractice)));
    assert.match(body(), /could not save your answers/);
    await click("Start");
    await click("Continue");
    const first = dom.window.document.querySelector('.choices-list button') as HTMLElement;
    assert.ok(first, "blocked storage must still allow a question to render");
    await React.act(async () => first.click());
    assert.match(body(), /could not save your answers/);
    assert.ok(dom.window.document.querySelector('[data-testid="reveal"]'));
    await React.act(async () => root.unmount());
    const quotaRoot = createRoot(dom.window.document.getElementById("root"));
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
      getItem: () => null,
      setItem: () => { throw new DOMException("Full", "QuotaExceededError"); },
    } });
    try {
      await React.act(async () => quotaRoot.render(React.createElement(PokklongPractice)));
      assert.ok(!body().includes("could not save your answers"));
      await click("Start"); await click("Continue");
      await React.act(async () => (dom.window.document.querySelector('.choices-list button') as HTMLElement).click());
      assert.match(body(), /could not save your answers/);
    } finally { await React.act(async () => quotaRoot.unmount()); }
  } finally {
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else Reflect.deleteProperty(globalThis, "localStorage");
    dom.window.close();
  }
});
