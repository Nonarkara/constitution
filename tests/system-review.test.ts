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
