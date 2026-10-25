import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, cpSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
// @ts-ignore plain ESM helper shared with the release gate
import { checkIllustrations, readWebp, illustrationPython } from '../scripts/check-illustrations.mjs';

const root = process.cwd();

/**
 * A flat, fully opaque re-export of a master, saved as RGBA with alpha=254.
 * This is the case the old gate passed: an alpha channel, a file that looks
 * right in a viewer, and no transparency at all.
 */
function writeFlatReExport(master: string, out: string) {
  const script = [
    'import sys',
    'import numpy as np',
    'from PIL import Image',
    'a = np.asarray(Image.open(sys.argv[1]).convert("RGBA")).copy()',
    'a[:, :, 3] = 254',
    'Image.fromarray(a).save(sys.argv[2], "WEBP", quality=88, method=6)',
  ].join('\n');
  const done = spawnSync(illustrationPython(), ['-c', script, master, out], {
    encoding: 'utf8',
  });
  assert.equal(done.status, 0, `could not write the flat re-export: ${done.stderr}`);
}

/** A copy of the tree the gate can be pointed at. The repo is never touched. */
function copyTree(): string {
  const tmp = mkdtempSync(path.join(tmpdir(), 'illus-'));
  for (const d of ['public', 'design', 'lib', 'app']) {
    cpSync(path.join(root, d), path.join(tmp, d), { recursive: true });
  }
  return tmp;
}

/** The manifest of a copied tree. */
function manifestOf(tmp: string) {
  return JSON.parse(
    readFileSync(path.join(tmp, 'design', 'illustrations', 'alpha-manifest.json'), 'utf8'),
  );
}

function writeManifest(tmp: string, manifest: unknown) {
  writeFileSync(
    path.join(tmp, 'design', 'illustrations', 'alpha-manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
  );
}

/** The plate entry of a manifest. */
function plateEntry(manifest: any, name: string) {
  return manifest.plates.find((p: any) => p.served.endsWith(name));
}

/** Make the manifest describe the file that is now on disk. */
function rewriteManifestToMatch(tmp: string, name: string) {
  const manifest = manifestOf(tmp);
  const entry = plateEntry(manifest, name);
  const file = path.join(tmp, 'public', 'illustrations', name);
  const bytes = readFileSync(file);
  entry.sha256 = createHash('sha256').update(bytes).digest('hex');
  entry.bytes = bytes.length;
  writeManifest(tmp, manifest);
}

/** The real tree, audited once: the audit reads every plate's pixels. */
let realTree: Promise<any> | null = null;
function auditRealTree() {
  if (!realTree) realTree = checkIllustrations(root);
  return realTree;
}

test('every illustration in the repository carries a real alpha channel', async () => {
  const { failures, plates } = await auditRealTree();
  assert.deepEqual(failures, []);
  assert.ok(plates > 0, 'no plates found');
});

test('every plate is really transparent, not merely flagged as having alpha', async () => {
  const { failures, transparency, measured } = await auditRealTree();
  assert.deepEqual(failures, []);
  assert.ok(measured > 0, 'nothing was measured');
  for (const [name, t] of Object.entries(transparency) as [string, any][]) {
    assert.ok(
      t.transparent_fraction > 0,
      `${name} has no transparent pixels — the paper ground is back`,
    );
    assert.ok(t.transparent_pixels > 0, `${name} has no transparent pixels`);
  }
});

test('no plate has a hole — transparency enclosed by ink', async () => {
  const { failures, transparency } = await auditRealTree();
  assert.deepEqual(failures, []);
  for (const [name, t] of Object.entries(transparency) as [string, any][]) {
    assert.equal(
      t.interior_holes,
      0,
      `${name} has ${t.interior_holes}px of transparency enclosed by ink`,
    );
    assert.equal(t.interior_hole_regions, 0, `${name} has an enclosed hole`);
  }
});

test('every plate follows from its master', async () => {
  const { failures, derivation } = await auditRealTree();
  assert.deepEqual(failures, []);
  const rederived = Object.entries(derivation).filter(([, d]: [string, any]) => d.sha256);
  assert.ok(rederived.length >= 8, `only ${rederived.length} plates were re-derived`);
  for (const [name, d] of rederived as [string, any][]) {
    const bytes = readFileSync(path.join(root, 'public', 'illustrations', name));
    const served = createHash('sha256').update(bytes).digest('hex');
    assert.equal(d.sha256, served, `${name} is not the bytes its master derives`);
    assert.ok(d.master_sha256, `${name} has no master hash`);
  }
});

test('a plate whose paper ground comes back fails the gate', async () => {
  const tmp = copyTree();
  try {
    // put the flat master back in place of a transparent plate
    const name = 'tikki-news-pastel.webp';
    const master = path.join(tmp, 'design', 'illustrations', 'masters', name);
    const served = path.join(tmp, 'public', 'illustrations', name);
    writeFileSync(served, readFileSync(master));
    const { failures } = await checkIllustrations(tmp);
    assert.ok(
      failures.some((f: string) => f.includes('no alpha channel')),
      `a flat plate went undetected: ${JSON.stringify(failures)}`,
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('a flat opaque plate with the manifest rewritten to match still fails', async () => {
  const tmp = copyTree();
  try {
    const name = 'tikki-topics-pastel.webp';
    const master = path.join(tmp, 'design', 'illustrations', 'masters', name);
    const served = path.join(tmp, 'public', 'illustrations', name);
    writeFileSync(served, readFileSync(master));
    rewriteManifestToMatch(tmp, name);
    const { failures } = await checkIllustrations(tmp);
    assert.ok(
      failures.some((f: string) => f.includes('fully opaque') || f.includes('no alpha channel')),
      `a flat plate went undetected: ${JSON.stringify(failures)}`,
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('a flat opaque re-export (RGBA alpha=254) with the manifest rewritten still fails', async () => {
  const tmp = copyTree();
  try {
    const name = 'tikki-topics-pastel.webp';
    const master = path.join(tmp, 'design', 'illustrations', 'masters', name);
    const served = path.join(tmp, 'public', 'illustrations', name);
    writeFlatReExport(master, served);
    rewriteManifestToMatch(tmp, name);
    const { failures } = await checkIllustrations(tmp);
    assert.ok(
      failures.some((f: string) => f.includes('fully opaque')),
      `a flat re-export went undetected: ${JSON.stringify(failures)}`,
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('a manifest that points at the wrong master fails', async () => {
  const tmp = copyTree();
  try {
    const name = 'tikki-topics-pastel.webp';
    const manifest = manifestOf(tmp);
    const entry = plateEntry(manifest, name);
    entry.master = 'design/illustrations/masters/tikki-notebook-pastel.webp';
    writeManifest(tmp, manifest);
    const { failures } = await checkIllustrations(tmp);
    assert.ok(
      failures.some((f: string) => f.includes('master')),
      `a wrong master went undetected: ${JSON.stringify(failures)}`,
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('a manifest that records the wrong transparency fails', async () => {
  const tmp = copyTree();
  try {
    const name = 'tikki-topics-pastel.webp';
    const manifest = manifestOf(tmp);
    const entry = plateEntry(manifest, name);
    entry.transparent_fraction = entry.transparent_fraction + 0.25;
    writeManifest(tmp, manifest);
    const { failures } = await checkIllustrations(tmp);
    assert.ok(
      failures.some((f: string) => f.includes('transparent')),
      `a wrong transparency went undetected: ${JSON.stringify(failures)}`,
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('a plate drawn at proportions the file does not have fails the gate', async () => {
  const tmp = copyTree();
  try {
    const file = path.join(tmp, 'lib', 'illustration-ratios.ts');
    const text = readFileSync(file, 'utf8');
    writeFileSync(file, text.replace('ratio: "527 / 731"', 'ratio: "1 / 1"'));
    const { failures } = await checkIllustrations(tmp);
    assert.ok(
      failures.some((f: string) => f.includes('proportions')),
      `a wrong proportion went undetected: ${JSON.stringify(failures)}`,
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('the webp reader finds the alpha channel and the canvas size', () => {
  const buffer = readFileSync(path.join(root, 'public', 'illustrations', 'tikki-news-pastel.webp'));
  const head = readWebp(buffer);
  assert.equal(head.alpha, true);
  assert.equal(head.width, 527);
  assert.equal(head.height, 731);
});

test('the webp reader reports a lossy frame at the size it really is', () => {
  // A "VP8 " frame stores the size itself, not size-1. The civic scenes are
  // the only lossy frames here: 2172x726, not 2173x727.
  const buffer = readFileSync(path.join(root, 'public', 'illustrations', 'civic-palace-pastel.webp'));
  const head = readWebp(buffer);
  assert.equal(head.width, 2172);
  assert.equal(head.height, 726);
});
