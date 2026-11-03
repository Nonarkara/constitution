import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Exercise the vendored readiness function itself, not a second implementation.
const source = readFileSync('scripts/spatial/spatial-check.mjs', 'utf8');
const start = source.indexOf('function rendered(d, cb) {');
const end = source.indexOf('\nfunction loadPage(', start);
assert.ok(start >= 0 && end > start);
const rendered = source.slice(start, end);
const box = (height: number, ready: string | null = null) => ({
  querySelector: () => null,
  getAttribute: () => ready,
  getBoundingClientRect: () => ({ width: 390, height }),
});
function observe(main: ReturnType<typeof box> | null, body: ReturnType<typeof box>) {
  let clock = 0;
  let result: boolean | undefined;
  vm.runInNewContext(`${rendered}\nrendered(doc, done);`, {
    doc: { querySelector: () => main, body, fonts: { status: 'loaded' } },
    Date: { now: () => clock },
    setTimeout: (callback: () => void, delay: number) => { clock += delay; callback(); },
    done: (value: boolean) => { result = value; },
  });
  return result;
}

test('spatial readiness measures visible body content without a main or heading', () => {
  assert.equal(observe(null, box(24)), true);
});
test('body fallback does not bypass an application main waiting for state', () => {
  assert.equal(observe(box(300, 'false'), box(600)), false);
});
test('a blank body cannot become a valid spatial measurement', () => {
  assert.equal(observe(null, box(0)), false);
});
