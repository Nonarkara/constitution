import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
// @ts-ignore plain ESM helper shared with the release gate
import { checkRuntimeImages } from '../scripts/runtime-images.mjs';

const root = process.cwd();
const every = [
  // The original crayon scenes.
  'civic-palace-pastel','core-lock-pastel','listening-pastel','reading-pastel',
  'term-clock-pastel','thinking-pastel',
  'palace-1','palace-2','palace-3','palace-4',
  // The Tikki series — one mnemonic drawing per route.
  'tikki-along-pastel','tikki-amend-pastel','tikki-bible-pastel','tikki-cheatsheet-pastel',
  'tikki-cram-pastel','tikki-drills-pastel','tikki-exam-pastel','tikki-flashcards-pastel',
  'tikki-games-pastel','tikki-glossary-pastel','tikki-library-pastel','tikki-news-pastel',
  'tikki-notebook-pastel','tikki-notes-pastel','tikki-officer-pastel','tikki-overwhelmed-pastel',
  'tikki-pass-pastel','tikki-polls-pastel','tikki-practice-pastel','tikki-read-pastel',
  'tikki-rights-pastel','tikki-review-pastel','tikki-section-pastel','tikki-settings-pastel',
  'tikki-smart-pastel','tikki-sources-pastel','tikki-student-pastel','tikki-topics-pastel',
].map((n) => `/illustrations/${n}.webp`);

test('every illustration used at runtime is found, including ones built from templates', () => {
 const { refs, failures } = checkRuntimeImages(root, { out: '__no_out__' });
 assert.deepEqual(failures, []);
 for (const url of every) assert.ok(refs.has(url), `${url} not detected as a runtime image`);
});

test('deleting any runtime illustration fails the check', () => {
 const tmp = mkdtempSync(path.join(tmpdir(), 'rtimg-'));
 try {
  for (const d of ['app','components','lib','worker','data','public']) cpSync(path.join(root, d), path.join(tmp, d), { recursive: true, filter: (s) => !s.includes('node_modules') && (d !== 'public' || !/\.[a-z0-9]+$/i.test(s) || /\.(png|jpe?g|webp|svg|avif|gif)$/i.test(s)) });
  for (const url of every) {
   const file = path.join(tmp, 'public', url);
   cpSync(file, file + '.bak');
   rmSync(file);
   const { failures } = checkRuntimeImages(tmp, { out: '__no_out__' });
   assert.ok(failures.some((f: string) => f.includes(url)), `removing ${url} went undetected`);
   cpSync(file + '.bak', file);
   rmSync(file + '.bak');
  }
 } finally { rmSync(tmp, { recursive: true, force: true }); }
});
