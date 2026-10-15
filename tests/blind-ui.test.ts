/**
 * Drives components/BlindExam.tsx in jsdom as a learner would.
 *
 * This protects the promise the page makes: during the blind pass the answer,
 * its explanation and its rule must not be in the DOM at all, and a missed
 * question must not leave the queue until it has been answered correctly.
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import ts from "typescript";

const repo = process.cwd();

function transpile(file: string): string {
  return ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
}

const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
  pretendToBeVisual: true,
});
const { window } = dom;

function define(key: string, value: unknown) {
  Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
}
define("window", window);
define("document", window.document);
define("navigator", window.navigator);
define("HTMLElement", window.HTMLElement);
define("Element", window.Element);
define("Node", window.Node);
define("Event", window.Event);
define("MouseEvent", window.MouseEvent);
define("IS_REACT_ACT_ENVIRONMENT", true);

const require_ = (await import("node:module")).createRequire(import.meta.url);
const React = require_("react");
const ReactDOMClient = require_("react-dom/client");
type Bank = { id: string; prompt: { th: string }; choices: { th: string }[]; answer: number }[];
const bank = JSON.parse(readFileSync(path.join(repo, "data/exam-topics.json"), "utf8")) as Bank;

function load(file: string, registry: Record<string, unknown>): Record<string, unknown> {
  const mod = { exports: {} as Record<string, unknown> };
  const req = (id: string) => {
    if (id in registry) return registry[id];
    // let real node_modules through (react, react/jsx-runtime, next/link …)
    return require_(id);
  };
  new Function("exports", "require", "module", "__filename", "__dirname", transpile(path.join(repo, file)))(
    mod.exports, req, mod, file, path.dirname(file),
  );
  return mod.exports;
}

const registry: Record<string, unknown> = {
  react: React,
  "@/lib/shuffle": { fisherYates: (a: string[]) => a, choiceLetter: (_l: string, i: number) => "ABCD"[i] },
  "@/lib/i18n": {
    tr: (l: string, th: string, en: string) => (l === "th" ? th : en),
    sectionLabel: (_l: string, n: number | string) => `มาตรา ${n}`,
  },
  "@/data/exam-topics.json": bank,
  "next/link": {
    __esModule: true,
    default: ({ href, children, ...rest }: { href: string; children?: unknown }) =>
      React.createElement("a", { href, ...rest }, children as React.ReactNode),
  },
  "./Provider": { useStudy: () => ({ lang: "th", progress: { questions: {} }, ready: true }) },
};
registry["@/lib/blind"] = load("lib/blind.ts", registry);
const { BlindExam } = load("components/BlindExam.tsx", registry) as { BlindExam: () => unknown };

const rootEl = window.document.getElementById("root")!;
const rootApi = ReactDOMClient.createRoot(rootEl);
const settle = async () => {
  await React.act(async () => {});
  await new Promise((r) => setTimeout(r, 0));
  await React.act(async () => {});
};
await React.act(async () => {
  rootApi.render(React.createElement(BlindExam));
});
await settle();

const doc = window.document;
const body = () => doc.body.textContent ?? "";
const buttons = () => [...doc.querySelectorAll("button")];
const button = (needle: string) => {
  const b = buttons().find((x: Element) => (x.textContent ?? "").includes(needle));
  assert.ok(b, `no button containing ${needle}`);
  return b;
};
const tap = async (el: Element) => {
  await React.act(async () => {
    el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  });
  await settle();
};
const radios = () => [...doc.querySelectorAll('input[type="radio"]')];
// the prompt is an h1 on the blind pass and an h2 once the answer is on screen
const currentPrompt = () =>
  (doc.querySelector("h1")?.textContent ??
   doc.querySelector("h2.blind-reask")?.textContent ??
   "").trim();
const choose = async (index: number) => {
  const rs = radios();
  assert.equal(rs.length, 4, "four options must be offered");
  const input = rs[index] as HTMLInputElement;
  await React.act(async () => {
    input.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    input.dispatchEvent(new window.Event("change", { bubbles: true }));
  });
  await settle();
  // the submit control must now be live: proof that React saw the choice
  const submit = buttons().find((b) => /ส่งคำตอบ|ตรวจ/.test(b.textContent ?? ""));
  assert.ok(submit && !submit.disabled, "choosing an option must enable submit");
};

after(() => rootApi.unmount());

test("the brief offers the sitting and leaks nothing", async () => {
  assert.match(body(), /เริ่มสอบ 80 หัวข้อ/);
  assert.equal(radios().length, 0, "no questions before the sitting starts");
  // no answer content is on the page yet
  for (const q of bank.slice(0, 10)) {
    assert.ok(!body().includes(q.choices[q.answer].th), "an answer choice is visible before the test");
  }
});

test("the blind pass shows four options and never shows the answer", async () => {
  await tap(button("เริ่มสอบ"));
  await settle();

  assert.equal(radios().length, 4, "four options on the first question");
  const q = bank.find((x: Bank[number]) => x.prompt.th === currentPrompt())!;
  assert.ok(q, "the prompt on screen is a real question");

  // the whole blind pass: answer every question wrongly, and never see a key
  for (let i = 0; i < bank.length; i++) {
    const rs = radios();
    if (!rs.length) break;
    const wrong = (rs[0] as HTMLInputElement);
    const current = bank.find((x: Bank[number]) => x.prompt.th === currentPrompt());
    // deliberately pick a wrong option
    const idx = current ? (current.answer + 1) % 4 : 0;
    void wrong;
    await choose(idx);
    const shown = body();
    assert.ok(!/เฉลย|คำตอบคือ|กุญแจที่ใช้ตัดตัวเลือก/.test(shown), "the blind pass must not show an answer or rule");
    await tap(button("ส่งคำตอบ"));
    await settle();
  }

  assert.match(body(), /ผิด \d+ ข้อ|ส่งแล้ว/);
});

test("every miss is owed and re-asked until it is right", async () => {
  await tap(button("ดูเฉลยทีละข้อ"));
  await settle();

  // the answers pass opens on a missed question, with its rule and reasoning up
  assert.match(body(), /กุญแจที่ใช้ตัดตัวเลือก|เฉลยและเหตุผล/);
  const owed = Number(body().match(/เหลือ (\d+) ข้อ/)?.[1] ?? 0);
  assert.ok(owed > 0, "misses must still be owed");

  // answer it wrongly on the retry: it must not clear
  const promptText = currentPrompt();
  const q = bank.find((x: Bank[number]) => x.prompt.th === promptText)!;
  await choose((q.answer + 2) % 4);
  await tap(button("ตรวจ"));
  await settle();
  assert.match(body(), /ยังไม่ใช่|ไม่ปล่อยไปจนกว่าจะถูก/, "a wrong retry must keep the question");
  assert.equal(Number(body().match(/เหลือ (\d+) ข้อ/)?.[1] ?? -1), owed, "the debt must not shrink");

  // now answer it right: it clears and the count drops
  await choose(q.answer);
  await tap(button("ตรวจ"));
  await settle();
  assert.match(body(), /ได้แล้ว/, "a correct retry must be acknowledged, not skipped");
  assert.match(body(), /กุญแจ/, "the rule is restated once it has been used correctly");
  const remaining = body().match(/\(เหลือ (\d+)\)|เหลือ (\d+) ข้อ/);
  assert.equal(Number(remaining?.[1] ?? remaining?.[2] ?? -1), owed - 1, "clearing drops the debt");

  await tap(button("ข้อถัดไป"));
  assert.ok(/กุญแจที่ใช้ตัดตัวเลือก/.test(body()), "the next owed question opens with its rule");
});

test("the sitting ends only when nothing is owed, then hands off", async () => {
  let guard = 0;
  while (/\(เหลือ \d+\)|เหลือ \d+ ข้อ/.test(body()) && guard++ < bank.length * 3) {
    const prompt = currentPrompt();
    if (/ได้แล้ว/.test(body())) {
      await tap(button("ข้อถัดไป"));
      continue;
    }
    const q = bank.find((x: Bank[number]) => x.prompt.th === prompt);
    if (!q) break;
    await choose(q.answer);
    await tap(button("ตรวจ"));
    await settle();
  }
  if (/ได้แล้ว/.test(body())) await tap(button("ดูผลรวม"));
  assert.ok(guard < bank.length * 3, "the queue must drain");
  assert.match(body(), /ผ่าน \d+ \/ \d+/, "the result must state the first-time score");
  assert.match(body(), /ตอบผิด \d+ ข้อ/);
  assert.match(body(), /คู่มืออ่านรัฐธรรมนูญ/, "must hand off into the guide");
});
