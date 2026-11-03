import { readFileSync } from 'node:fs';
const raw = JSON.parse(readFileSync(process.argv[2] ?? 'design/msh-evidence/2026-11-03/compact/notebook-after.json', 'utf8'));
const rows = Array.isArray(raw) ? raw : [{ width: raw.viewport[0], height: raw.viewport[1], tools: raw.toolbar, heading: raw.pages[0].heading, pages: raw.pages }];
const failures = [];
for (const c of rows) {
  const need = (ok, why) => { if (!ok) failures.push(`/notebook/ @${c.width}: ${why}`); };
  need(c.tools.height <= 120, 'configuration displaces reading');
  need((c.heading.y ?? c.heading.top) + c.heading.height <= 650, 'current section heading is buried');
  if (c.text) need(c.text.bottom <= c.height, 'the current law is outside the first screen');
  need(c.pages.length === 2 && c.pages.every(p => p.minHeight === '0px'), 'paper has a fixed empty minimum');
  if (c.mains !== undefined) need(c.mains === 1, 'nested main landmarks');
  if (c.overflow !== undefined) need(c.overflow === 0, 'horizontal overflow');
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`PASS: ${rows.length} rendered notebook compositions; current law visible, optional tools retained.`);
