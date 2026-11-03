import { readFileSync } from 'node:fs';

// Receipts are read directly from rendered pages through CUA. This checks the
// declared four tasks; it is not a claim about every state of the application.
const file = process.argv[2] ?? 'design/msh-evidence/2026-11-03/compact/measurements-after.json';
const cells = JSON.parse(readFileSync(file, 'utf8'));
const routes = ['/', '/bible/local-and-amendment/', '/practice/', '/memory/'];
const widths = [390, 1024, 1440];
const failures = [];
for (const path of routes) for (const width of widths) {
  const rows = cells.filter(c => c.path === path && c.width === width);
  const name = `${path} @${width}`;
  if (rows.length !== 1) { failures.push(`${name}: expected one rendered receipt`); continue; }
  const c = rows[0];
  const need = (ok, reason) => { if (!ok) failures.push(`${name}: ${reason}`); };
  need(c.overflow === 0, 'horizontal overflow');
  need(c.header?.height <= 60, 'identity bar exceeds 60px including 44px controls');
  need(c.brandBorder === '0px', 'logo is boxed');
  need(c.action && c.action.height >= 44 && c.action.bottom <= c.height, 'complete usable action outside first screen');
  need(c.art && c.art.width >= 64, 'illustration missing or made illegible');
  need(Array.isArray(c.targets) && c.targets.length > 0, 'dedicated controls were not measured');
  for (const t of c.targets ?? []) {
    // Allow subpixel rounding, not smaller targets. Inline prose citations
    // are outside this navigation-control set and retain reading line-height.
    need(t.width >= 43.9 && t.height >= 43.9, `small navigation target: ${t.text}`);
  }
  if (path === '/') {
    need(c.intro?.height <= (width === 390 ? 280 : 320), 'welcome displaces the study paths');
    need(c.anchor?.y <= 550, 'alternate reading door starts after 550px');
  }
  if (path.startsWith('/bible/')) need(c.intro?.height <= 160, 'title wraps around an oversized marginal illustration');
  if (path === '/practice/') {
    need(c.action?.bottom <= 620, 'session action is buried beneath orientation');
    need(c.practiceInfo && Math.abs(c.action.x - c.practiceInfo.x) <= 24, 'button detached from session evidence');
  }
  if (path === '/memory/') {
    need(c.art?.bottom <= 760 && c.action?.bottom <= 760, 'picture and recall action do not fit together');
  }
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log('PASS: 12 rendered task compositions; compact chrome, evidence and action together, illustrations preserved.');
