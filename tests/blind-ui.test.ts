import { questionVisualFor } from "../lib/question-visual.ts";
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
  url: "https://constitution.test/along/",
});
const { window } = dom;
window.scrollTo = () => {};

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
type Bank = { id: string; prompt: { th: string }; choices: { th: string }[]; answer: number; logic: { th: string }; explanation: { th: string }; source?: { title: string; url: string; asOf: string } }[];
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
  "@/lib/shuffle": { fisherYates: (a: unknown[]) => typeof a[0] === "number" ? [...a].reverse() : a, choiceLetter: (_l: string, i: number) => "ABCD"[i] },
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
registry["./blind.ts"] = registry["@/lib/blind"];
registry["@/lib/blind-checkpoint"] = load("lib/blind-checkpoint.ts", registry);
registry["@/lib/question-visual"] = { questionVisualFor };
registry["./MemoryCue"] = { PalacePicture: () => null };
registry["next/image"] = { __esModule: true, default: ({src,alt}: {src:string;alt:string}) => React.createElement("img", {src,alt}) };
registry["./QuestionVisual"] = load("components/QuestionVisual.tsx", registry);
// The brief carries the page's crayon drawing. It is loaded for real, not
// stubbed away, so the test sees the same DOM the learner does — and the
// drawing only ever appears on the brief, never during the blind pass.
registry["./StudyArt"] = load("components/StudyArt.tsx", registry);
const { BlindExam } = load("components/BlindExam.tsx", registry) as { BlindExam: () => unknown };

const rootEl = window.document.getElementById("root")!;
let rootApi = ReactDOMClient.createRoot(rootEl);
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
    assert.ok(!el.matches(":disabled"), "a learner cannot click disabled controls");
    (el as HTMLElement).click();
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
  const question = bank.find(x => x.prompt.th === currentPrompt())!;
  const input = rs.find(r => r.closest("label")!.textContent!.includes(question.choices[index].th)) as HTMLInputElement;
  assert.ok(input && !input.matches(":disabled"), "a learner cannot choose a disabled option");
  await React.act(async () => {
    input.click();
  });
  await settle();
  // the submit control must now be live: proof that React saw the choice
  const submit = buttons().find((b) => /ส่งคำตอบ|ตรวจ/.test(b.textContent ?? ""));
  assert.ok(submit && !submit.disabled, "choosing an option must enable submit");
};

after(async () => { await React.act(async () => rootApi.unmount()); });

async function remount() {
  await React.act(async () => rootApi.unmount());
  rootApi = ReactDOMClient.createRoot(rootEl);
  await React.act(async () => rootApi.render(React.createElement(BlindExam)));
  await settle();
}

test("the brief offers the sitting and leaks nothing", async () => {
  assert.match(body(), /เริ่มสอบ 90 ข้อ/);
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
    assert.equal(rs.length, 4, "every question must render");
    assert.equal(doc.querySelector(".question-visual"), null, "blind sitting contains no answer diagram");
    assert.equal(doc.activeElement, doc.querySelector("h1"), "each new prompt receives keyboard focus");
    const wrong = (rs[0] as HTMLInputElement);
    const current = bank.find((x: Bank[number]) => x.prompt.th === currentPrompt());
    // deliberately pick a wrong option
    const idx = current ? (current.answer + 1) % 4 : 0;
    void wrong;
    assert.ok(current);
    assert.ok(!body().includes(current.logic.th));
    assert.ok(!body().includes(current.explanation.th));
    if (i === 20) {
      const before = currentPrompt();
      await remount();
      assert.equal(currentPrompt(), before, "reload resumes the same question");
    }
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
  assert.equal(radios().length, 0, "review has no answer controls alongside the key");
  if (q.source) {
    assert.ok([...doc.querySelectorAll("a")].some(a => a.href === q.source!.url));
    assert.ok(body().includes(q.source.asOf));
  }
  await tap(button("ซ่อนเฉลย"));
  assert.ok(!body().includes(q.logic.th));
  assert.ok(!body().includes(q.explanation.th));
  assert.equal(doc.querySelector(".blind-recap"), null);
  assert.equal(doc.querySelector(".question-visual"), null, "visual must be removed while retry is concealed");
  await choose((q.answer + 2) % 4);
  await tap(button("ตรวจ"));
  await settle();
  assert.match(body(), /ยังไม่ใช่|ไม่ปล่อยไปจนกว่าจะถูก/, "a wrong retry must keep the question");
  assert.equal(Number(body().match(/เหลือ (\d+) ข้อ/)?.[1] ?? -1), owed, "the debt must not shrink");

  // now answer it right: it clears and the count drops
  await tap(button("ซ่อนเฉลย"));
  await choose(q.answer);
  await tap(button("ตรวจ"));
  await settle();
  assert.match(body(), /ได้แล้ว/, "a correct retry must be acknowledged, not skipped");
  assert.match(body(), /กุญแจ/, "the rule is restated once it has been used correctly");
  const remaining = body().match(/\(เหลือ (\d+)\)|เหลือ (\d+) ข้อ/);
  assert.equal(Number(remaining?.[1] ?? remaining?.[2] ?? -1), owed - 1, "clearing drops the debt");

  await remount();
  assert.match(body(), /ได้แล้ว/, "reload preserves the earned confirmation");
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
    await tap(button("ซ่อนเฉลย"));
    await choose(q.answer);
    await tap(button("ตรวจ"));
    await settle();
  }
  if (/ได้แล้ว/.test(body())) await tap(button("ดูผลรวม"));
  assert.ok(guard < bank.length * 3, "the queue must drain");
  assert.match(body(), /ครั้งแรกได้ 0 \/ 90/, "the result must state the first-time score");
  assert.match(body(), /ตอบผิด \d+ ข้อ/);
  assert.match(body(), /คู่มืออ่านรัฐธรรมนูญ/, "must hand off into the guide");
});


test("a perfect sitting skips review and restarts cleanly", async () => {
  await tap(button("สอบอีกครั้ง"));
  await remount();
  assert.match(body(), /เริ่มสอบ 90 ข้อ/);
  await tap(button("เริ่มสอบ"));
  for (const q of bank) {
    await choose(q.answer);
    await tap(button("ส่งคำตอบ"));
  }
  await tap(button("ไปต่อ"));
  assert.match(body(), /ครั้งแรกได้ 90 \/ 90/);
  assert.equal(radios().length, 0);
});

test("visual stops follow the review queue even when every third blind item was correct", async () => {
  await tap(button("สอบอีกครั้ง"));
  await tap(button("เริ่มสอบ"));
  for (const [i, q] of bank.entries()) {
    await choose(i % 3 === 2 ? q.answer : (q.answer + 1) % 4);
    await tap(button("ส่งคำตอบ"));
  }
  await tap(button("ดูเฉลยทีละข้อ"));
  for (let i = 0; i < 2; i++) {
    const q = bank.find(x => x.prompt.th === currentPrompt())!;
    await tap(button("ซ่อนเฉลย"));
    await choose(q.answer);
    await tap(button("ตรวจ"));
    await tap(button("ข้อถัดไป"));
  }
  assert.ok(doc.querySelector(".question-visual"), "the third owed question gets a visual regardless of its original position");
});

test("storage failure is visible rather than claiming a save", async () => {
  const original = window.Storage.prototype.setItem;
  window.Storage.prototype.setItem = () => { throw new Error("quota"); };
  try {
    await remount();
    assert.match(body(), /บันทึกในเบราว์เซอร์ไม่ได้/);
  } finally { window.Storage.prototype.setItem = original; }
});
