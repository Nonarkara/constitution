import { readFileSync } from 'node:fs';
const rows = JSON.parse(readFileSync(process.argv[2] ?? 'design/msh-evidence/2026-11-06/header-after.json', 'utf8'));
const failures = [];
for (const r of rows) {
  const need = (ok, why) => { if (!ok) failures.push(`${r.lang}/${r.large} @${r.width}: ${why}`); };
  need(r.overflow === 0, 'page scrolls sideways');
  need(r.headerHeight <= 54, 'enlarged text inflated the identity band');
  for (const t of r.targets) {
    need(t.width >= 43.9 && t.height >= 43.9, `small target: ${t.label}`);
    need(t.left >= -0.5 && t.right <= r.width + 0.5, `control outside the viewport: ${t.label}`);
  }
  for (const p of r.paint ?? []) {
    need(p.left >= -0.5 && p.right <= r.width + 0.5, `painted label outside viewport: ${p.label}`);
    if (p.left < r.targets[1].left) need(p.right <= r.targets[1].left + 0.5, 'identity text overlaps the display control');
  }
  for (let i=1; i<r.targets.length; i++) need(r.targets[i-1].right <= r.targets[i].left + 0.5, 'header targets overlap');
  if (r.action) need(r.action.bottom <= Math.min(r.height, 720), 'home task is buried below the compact first screen');
}
let quizCount = 0;
if (!process.argv[2]) {
  const { records } = JSON.parse(readFileSync('design/msh-evidence/2026-11-06/independent-quiz-final.json', 'utf8'));
  quizCount = records.length;
  for (const r of records) {
    const need = (ok, why) => { if (!ok) failures.push(`quiz @${r.width}: ${why}`); };
    need(r.scrollY === 0, 'first-screen receipt starts midway down the page');
    need(r.overflow === 0, 'practice scrolls sideways');
    need(r.exit.height >= 43.9 && r.exit.y >= 0 && r.exit.bottom <= 250, 'practice exit is buried or too small');
    need(r.question.y <= 360 && r.question.bottom <= r.height, 'first question is buried');
    need(r.reveal.height >= 43.9 && r.reveal.bottom <= r.height, 'the current answer action is outside the first screen');
    need(r.primaries.length === 1 && !r.checkBeforeOptions, 'a future checking action competes with recalling');
  }
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode=1; }
else console.log(`PASS: ${rows.length} captured header states and ${quizCount} first-screen practice scenes. Saved observations, not a live browser test.`);
