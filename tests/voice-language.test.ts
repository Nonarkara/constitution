import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import ts from "typescript";
/** Execute the actual component with deterministic hooks/recognition to expose late callbacks. */
test("language switching rejects the old recognizer before effects run, then aborts it", () => {
  const hooks: any[] = [],
    queue: (() => void)[] = [];
  let cursor = 0;
  const instances: any[] = [];
  const React = {
    useState: (initial: any) => {
      const i = cursor++;
      if (!hooks[i]) hooks[i] = { value: initial };
      return [
        hooks[i].value,
        (value: any) =>
          (hooks[i].value =
            typeof value === "function" ? value(hooks[i].value) : value),
      ];
    },
    useRef: (initial: any) => {
      const i = cursor++;
      return (hooks[i] ??= { current: initial });
    },
    useEffect: (fn: () => any, deps: any[]) => {
      const i = cursor++,
        previous = hooks[i];
      if (!previous || deps.some((v, k) => v !== previous.deps[k])) {
        hooks[i] = { deps, cleanup: previous?.cleanup };
        queue.push(() => {
          hooks[i].cleanup?.();
          hooks[i].cleanup = fn();
        });
      }
    },
  };
  class Recognition {
    lang = "";
    continuous = false;
    interimResults = false;
    onresult: any;
    onerror: any;
    onend: any;
    aborted = false;
    constructor() {
      instances.push(this);
    }
    start() {}
    abort() {
      this.aborted = true;
      this.onend?.();
    }
  }
  const module = { exports: {} as any };
  const runtime = {
    jsx: (type: any, props: any) => ({ type, props }),
    jsxs: (type: any, props: any) => ({ type, props }),
    Fragment: "fragment",
  };
  const require = (name: string) => {
    if (name === "react") return React;
    if (name === "react/jsx-runtime") return runtime;
    if (name === "@/lib/i18n")
      return {
        tr: (lang: string, th: string, en: string, zh: string) =>
          ({ th, en, zh })[lang],
      };
    throw Error(name);
  };
  const source = ts.transpileModule(
    readFileSync(
      new URL("../components/VoiceSearch.tsx", import.meta.url),
      "utf8",
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  vm.runInNewContext(source, {
    require,
    module,
    exports: module.exports,
    window: { SpeechRecognition: Recognition },
  });
  const received: string[] = [];
  const render = (lang: string) => {
    cursor = 0;
    return module.exports.VoiceSearch({
      lang,
      onText: (text: string) => received.push(text),
    });
  };
  const effects = () => {
    while (queue.length) queue.shift()!();
  };
  let tree = render("th");
  effects();
  tree = render("th");
  tree.props.children[0].props.onClick();
  assert.equal(instances[0].lang, "th-TH");
  render("en");
  instances[0].onresult({
    resultIndex: 0,
    results: [{ isFinal: true, 0: { transcript: "stale Thai" } }],
  });
  assert.deepEqual(received, []);
  effects();
  assert.equal(instances[0].aborted, true);
  tree = render("en");
  tree.props.children[0].props.onClick();
  assert.equal(instances[1].lang, "en-US");
  instances[1].onresult({
    resultIndex: 1,
    results: [
      { isFinal: true, 0: { transcript: "already consumed" } },
      { isFinal: true, 0: { transcript: "Section 27" } },
    ],
  });
  assert.deepEqual(received, ["Section 27"]);
});
