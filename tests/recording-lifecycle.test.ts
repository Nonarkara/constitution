import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import ts from "typescript";

type Tree = { type: string; props: { children?: Tree[]; [key: string]: any } };
type Slot = { value?: any; current?: any; deps?: unknown[]; cleanup?: () => void };
const source = readFileSync(
  new URL("../components/Recording.tsx", import.meta.url),
  "utf8",
);

/** Execute the actual component and defer its worker response across React lifecycles. */
function recording(componentSource = source, deferCache = false) {
  const slots: Slot[] = [], effects: (() => void)[] = [];
  const requests: { url: string; resolve: (value: { ok: boolean }) => void }[] = [];
  const checks: { url: string; resolve: (value: { cached: boolean }) => void }[] = [];
  let cursor = 0, writes = 0;
  const React = {
    useState(initial: unknown) {
      const i = cursor++;
      slots[i] ??= { value: initial };
      return [slots[i].value, (value: unknown) => {
        writes++;
        slots[i].value = value;
      }];
    },
    useRef(initial: unknown) {
      const i = cursor++;
      return slots[i] ??= { current: initial };
    },
    useEffect(fn: () => (() => void) | void, deps: unknown[]) {
      const i = cursor++, previous = slots[i];
      if (!previous || deps.some((value, k) => value !== previous.deps?.[k])) {
        const slot = slots[i] = { deps, cleanup: previous?.cleanup };
        effects.push(() => {
          slot.cleanup?.();
          slot.cleanup = fn() ?? undefined;
        });
      }
    },
  };
  const jsx = (type: string, props: Tree["props"]): Tree => ({ type, props });
  const module = { exports: {} as { Recording: (props: unknown) => Tree } };
  vm.runInNewContext(ts.transpileModule(componentSource, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText, {
    module, exports: module.exports,
    navigator: { serviceWorker: { controller: {}, addEventListener() {}, removeEventListener() {} } },
    require(name: string) {
      if (name === "react") return React;
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "@/lib/i18n") return {
        tr: (_lang: string, _th: string, en: string) => en,
      };
      if (name === "@/lib/playback") return {
        playback: () => ({ stop() {}, take() {}, release() {} }),
      };
      if (name === "@/lib/offline") return {
        workerMessage: (_worker: unknown, message: { type: string; url: string }) =>
          message.type === "AUDIO_STATUS" ? new Promise<{ cached: boolean }>((resolve) => {
            checks.push({ url: message.url, resolve });
            if (!deferCache) resolve({ cached: false });
          }) :
          new Promise<{ ok: boolean }>((resolve) =>
            requests.push({ url: message.url, resolve })),
      };
      throw Error(`Unexpected dependency: ${name}`);
    },
  });
  return {
    requests, checks,
    writes: () => writes,
    render(section: number) {
      cursor = 0;
      return module.exports.Recording({ section, lang: "en" });
    },
    effects() {
      while (effects.length) effects.shift()!();
    },
    unmount() {
      for (const slot of slots) slot.cleanup?.();
    },
  };
}
function saveButton(tree: Tree): Tree {
  return tree.props.children![2].props.children![1];
}
function mounted(componentSource = source) {
  const app = recording(componentSource);
  app.render(27);
  app.effects();
  return app;
}

test("saving the current recording reports completion", async () => {
  const app = mounted();
  const pending = saveButton(app.render(27)).props.onClick();
  assert.equal(app.requests[0].url, "/audio/en/027.mp3");
  app.requests[0].resolve({ ok: true });
  await pending;
  const button = saveButton(app.render(27));
  assert.equal(button.props.disabled, true);
  assert.equal(button.props.children, "Saved ✓");
});

test("section 27 completion cannot mark section 28 saved before its effects run", async () => {
  const app = mounted();
  const pending = saveButton(app.render(27)).props.onClick();
  app.render(28);
  const writes = app.writes();
  app.requests[0].resolve({ ok: true });
  await pending;
  assert.equal(app.writes(), writes);
  app.effects();
  const button = saveButton(app.render(28));
  assert.equal(button.props.disabled, false);
  assert.equal(button.props.children, "Save for offline");
});

test("section 27 completion cannot overwrite section 28 after its effects run", async () => {
  const app = mounted();
  const pending = saveButton(app.render(27)).props.onClick();
  app.render(28);
  app.effects();
  const writes = app.writes();
  app.requests[0].resolve({ ok: true });
  await pending;
  assert.equal(app.writes(), writes);
  assert.equal(saveButton(app.render(28)).props.disabled, false);
});

test("a worker completion after unmount does not update recording state", async () => {
  const app = mounted();
  const pending = saveButton(app.render(27)).props.onClick();
  app.unmount();
  const writes = app.writes();
  app.requests[0].resolve({ ok: true });
  await pending;
  assert.equal(app.writes(), writes);
});

test("the original unguarded completion reproduces the wrong-section saved claim", async () => {
  // Roll back only the response guards in memory; leave the workspace source intact.
  const unguarded = source.replaceAll("if (current()) setStatus", "setStatus");
  assert.notEqual(unguarded, source, "Expected the actual lifecycle guards");
  const app = mounted(unguarded);
  const pending = saveButton(app.render(27)).props.onClick();
  app.render(28);
  app.effects();
  app.requests[0].resolve({ ok: true });
  await pending;
  const button = saveButton(app.render(28));
  assert.equal(button.props.disabled, true);
  assert.equal(button.props.children, "Saved ✓");
});

test("the original unguarded completion also updates state after unmount", async () => {
  const unguarded = source.replaceAll("if (current()) setStatus", "setStatus");
  const app = mounted(unguarded);
  const pending = saveButton(app.render(27)).props.onClick();
  app.unmount();
  const writes = app.writes();
  app.requests[0].resolve({ ok: true });
  await pending;
  assert.equal(app.writes(), writes + 1);
});

test("a reopened recording restores Saved from the current cache", async () => {
  const app = recording(source, true);
  app.render(27); app.effects();
  assert.equal(app.checks[0].url, "/audio/en/027.mp3");
  app.checks[0].resolve({ cached: true });
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(saveButton(app.render(27)).props.children, "Saved ✓");
});

test("an old cached-status response cannot mark the next section saved", async () => {
  const app = recording(source, true);
  app.render(27); app.effects();
  app.render(28); app.effects();
  app.checks[0].resolve({ cached: true });
  app.checks[1].resolve({ cached: false });
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(saveButton(app.render(28)).props.children, "Save for offline");
});
