import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { guidePaths, lessonChapter } from '../lib/guide-path.ts';
const read = (p:string) => JSON.parse(readFileSync(new URL(`../data/${p}`,import.meta.url),'utf8'));
test('every deep-guide route has a trilingual entry and a valid practice/source path', () => {
 for (const f of readdirSync(new URL('../data/bible/',import.meta.url))) {
  if (!f.endsWith('.json')) continue;
  const slug=f.replace(/^\d+-/,'').replace(/\.json$/,''); const p=guidePaths[slug]; assert.ok(p,slug);
  for (const l of ['th','en','zh'] as const) for (const field of ['title','idea','question','answer'] as const) assert.ok(p[field][l].trim(),`${slug} ${field} ${l}`);
  assert.equal(p.steps.length,2,slug);
  const norm=(s:string)=>s.replace(/\s+/g,' ').trim();
  const checks=(JSON.parse(readFileSync(new URL(`../data/bible/${f}`,import.meta.url),'utf8')).blocks as {kind:string;items?:{q:{th:string};a:{th:string}}[]}[])
    .filter(b=>b.kind==='check').flatMap(b=>b.items??[]);
  for (const step of p.steps) {
    for (const l of ['th','en','zh'] as const) { assert.ok(step.question[l].trim(),slug); assert.ok(step.answer[l].trim(),slug); }
    assert.ok(checks.some(it=>norm(it.q.th)===norm(step.question.th)&&norm(it.a.th)===norm(step.answer.th)),`${slug} step not in chapter checks`);
    for (const n of [...step.answer.en.matchAll(/\d+/g)].map(m=>m[0])) assert.ok(step.answer.zh.includes(n),`${slug} zh answer missing ${n}`);
    for (const n of [...step.question.en.matchAll(/\d+/g)].map(m=>m[0])) assert.ok(step.question.zh.includes(n),`${slug} zh question missing ${n}`);
    assert.ok(step.sections.every(n=>n>=1&&n<=279));
  }
  assert.ok(p.chapters.every(c=>lessonChapter(String(c))===c));
  assert.ok(p.sections.every(n=>n>=1&&n<=279));
 }
 for(const raw of [null,'0','18','1.5','15junk','-1']) assert.equal(lessonChapter(raw),null);
});
test('Organic Act excerpts are pinned to the independently checked official PDF and correct clauses', () => {
 const act=read('sources/oaccp.json');
 const sha=createHash('sha256').update(readFileSync(new URL('../data/sources/constitutional-court-procedure-2018.pdf',import.meta.url))).digest('hex');
 assert.equal(sha,'b11fbbb8db99266a5b62cd77185511116059bc4073cc6e911a6a1019a8bbed87'); assert.equal(act.sha256,sha);
 assert.equal(act.citation.en,'Royal Gazette Vol. 135 Part 12 A, 2 March 2018');
 // Checked visually against PDF page27, not inferred from the app's old source fixture.
 assert.equal(act.sections['48(2)'].th,'ในกรณีที่ผู้ตรวจการแผ่นดินไม่ยื่นคำร้องตามวรรคหนึ่ง หรือไม่ยื่นคำร้องภายในกำหนดเวลาตามวรรคหนึ่ง ผู้ถูกละเมิดมีสิทธิยื่นคำร้องโดยตรงต่อศาลได้');
 assert.ok(act.sections['46(1)'].th.includes('ภายในเก้าสิบวัน'));
 const cram=read('cram.json');
 for(const row of [...cram.time,...cram.traps].filter(r=>r.source==='oaccp')) assert.equal(row.actKey,'48(1)');
 for(const l of ['th','en','zh']) assert.ok(cram.traps.find((t:{id:string;text:Record<string,string>})=>t.id==='trap-ombudsman-60').text[l].includes('90'));
 const court=read('bible/08-courts.json').blocks[16].body;
 assert.ok(court.en.includes('combined membership')&&court.en.includes('70 signatories')&&court.en.includes('90 days of notification'));
 assert.ok(cram.votes.find((v:{id:string;value:Record<string,string>})=>v.id==='v-amend-third').value.en.includes('Deputy Speakers'));
});
test('section 212 explanation keeps the prior-ruling condition in the full lesson', () => {
 const body=read('bible/01-how-to-read.json').blocks[2].body;
 assert.ok(body.th.includes('หากยังไม่มีคำวินิจฉัยเกี่ยวกับบทบัญญัตินั้น'));
 assert.ok(body.en.includes('if that Court has not already ruled on the provision'));
 assert.ok(body.en.includes('judgment must wait'));
});
