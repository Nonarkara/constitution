import test from 'node:test';
import assert from 'node:assert/strict';
import { chapterLabel } from '../lib/i18n.ts';
import { crumbsFor } from '../lib/nav.ts';
import { analyzeUserLearning } from '../lib/adaptive.ts';
import { defaultProgress, recordAnswer } from '../lib/learning.ts';

test('internal study unit17 is titled Transitory Provisions in every language',()=>{
  assert.equal(chapterLabel('th',17),'บทเฉพาะกาล');
  assert.equal(chapterLabel('en',17),'Transitory provisions');
  assert.equal(chapterLabel('zh',17),'过渡条款');
  assert.equal(chapterLabel('en',16),'Chapter 16');
});

test('section and short-check journeys never present the transitory unit as chapter17',()=>{
  for(const [route,context] of [['/section/',{section:262}],['/practice/',{check:17}]] as const){
    const crumb=crumbsFor(route,context).find(c=>c.href==='/read/?c=17');
    assert.ok(crumb,'the transitory study unit remains reachable');
    assert.deepEqual(crumb.label,{th:'บทเฉพาะกาล',en:'Transitory provisions',zh:'过渡条款'});
  }
});

test('a miss in the transitory unit recommends that part without inventing a chapter',()=>{
  const q={id:'transitory-miss',chapter:17};
  const progress=recordAnswer(defaultProgress(),q,false,Date.parse('2026-10-25T00:00:00Z'));
  const profile=analyzeUserLearning([q],progress,{});
  assert.equal(profile.weakestChapters[0],17,'the practice queue still uses its internal unit key');
  assert.match(profile.recommendation.th,/บทเฉพาะกาล/);
  assert.match(profile.recommendation.en,/Transitory/i);
  assert.match(profile.recommendation.zh,/过渡/);
  for(const text of Object.values(profile.recommendation)) assert.doesNotMatch(text,/17/);
});
