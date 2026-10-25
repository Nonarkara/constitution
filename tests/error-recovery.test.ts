import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { JSDOM } from 'jsdom';

const require = createRequire(import.meta.url);
const dom = new JSDOM('<div id="root"></div>', { url: 'https://study.test/news/' });
let reloads = 0;
for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document,
  navigator: dom.window.navigator, location: { reload: () => reloads++ }, IS_REACT_ACT_ENVIRONMENT: true })) {
  Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
}
const React = require('react');
const { createRoot } = require('react-dom/client');
const module = { exports: {} as { default?: unknown } };
const compiled = ts.transpileModule(readFileSync('app/error.tsx', 'utf8'), {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;
new Function('require', 'module', 'exports', compiled)((id: string) => id === 'next/link'
  ? { __esModule: true, default: ({ children, ...props }: Record<string, unknown>) => React.createElement('a', props, children) }
  : require(id), module, module.exports);

for (const [label, error, shouldReload] of [
  ['webpack chunk', Object.assign(new Error('Loading chunk 2324 failed.'), { name: 'ChunkLoadError' }), true],
  ['dynamic import', new TypeError('Failed to fetch dynamically imported module: https://study.test/chunk.js'), true],
  ['Safari module import', new TypeError('Importing a module script failed.'), true],
  ['ordinary error', new Error('The study data could not be read'), false],
  ['unknown thrown value', null, false],
] as const) {
  test(`explicit retry recovers ${label} without automatic reload`, async () => {
    reloads = 0;
    let retries = 0;
    const root = createRoot(dom.window.document.getElementById('root'));
    try {
      await React.act(async () => root.render(React.createElement(module.exports.default, { error, retry: () => retries++ })));
      assert.equal(reloads, 0, 'rendering an error must not start a reload loop');
      assert.equal(retries, 0);
      await React.act(async () => (dom.window.document.querySelector('button') as HTMLButtonElement).click());
      assert.equal(reloads, shouldReload ? 1 : 0);
      assert.equal(retries, shouldReload ? 0 : 1);
    } finally { await React.act(async () => root.unmount()); }
  });
}
