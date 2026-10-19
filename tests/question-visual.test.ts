import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {questionVisualFor, type VisualQuestion} from '../lib/question-visual.ts';
const bank=JSON.parse(readFileSync(new URL('../data/questions.json',import.meta.url),'utf8')) as VisualQuestion[];
test('visual cadence reaches every third question without changing shuffled answer content',()=>{
 let count=0;
 for(const [index,q] of bank.entries()){
  const model=questionVisualFor(q,index);
  if((index+1)%3===0)assert.ok(model,`missing visual stop ${index+1}`);
  if(model){count++;assert.deepEqual(model.answer,q.choices[q.answer]);}
 }
 assert.ok(count>=Math.floor(bank.length/3));
});
test('shared section158 is not enough to confuse a term clock with a cabinet seat chart',()=>{
 const term=bank.find(q=>q.id==='pm-eight-years'||q.id==='s158-a')!;
 assert.ok(term);
 assert.equal(questionVisualFor(term,2)?.cue?.topic,'pm-term');
 const cabinet=bank.find(q=>q.id==='c08-01')!;
 assert.equal(questionVisualFor(cabinet,2)?.cue?.topic,'cabinet-size');
 const unrelated={...term,id:'outside-law',sections:[],prompt:{th:'',en:'',zh:''}};
 assert.equal(questionVisualFor(unrelated,2)?.cue,null);
});


test('section256 visuals distinguish signatures from readings, votes and judicial review',()=>{
 for(const id of ['c15-03','comp-14','s256-b']){
  const q=bank.find(q=>q.id===id)!;
  const model=questionVisualFor(q,2);
  assert.ok(model);
  assert.equal(model.cue,null,id+' must use its own answer map');
 }
 assert.equal(questionVisualFor(bank.find(q=>q.id==='c15-02')!,2)?.cue?.topic,'amendment-petition');
});

test('legacy mnemonic cards also reject unrelated section256 rules',async()=>{
 const {memoryCueFor}=await import('../lib/cues.ts');
 for(const id of ['c15-03','comp-14','s256-b'])assert.equal(memoryCueFor(bank.find(q=>q.id===id)!),null,id);
});
