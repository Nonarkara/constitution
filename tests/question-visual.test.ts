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
  // The cabinet's thirty-five seats now belong to the rule about thirty-five
  // ministers, so the cue names that rule — and still carries the seat chart.
  const cabinetCue=questionVisualFor(cabinet,2)?.cue;
  assert.equal(cabinetCue?.topic,'rule-ministers');
  assert.equal(cabinetCue?.diagram,'cabinet-size');
  const unrelated={...term,id:'outside-law',sections:[],prompt:{th:'',en:'',zh:''}};
  assert.equal(questionVisualFor(unrelated,2)?.cue,null);
});

test('section256 visuals distinguish signatures from readings, votes and judicial review',()=>{
  // The rule catalogue gives each of these its OWN rule, so none of them may
  // be shown the fifty-thousand signature picture: that picture belongs to
  // the petition and to nothing else.
  const signature=bank.find(q=>q.id==='c15-02')!;
  assert.equal(questionVisualFor(signature,2)?.cue?.topic,'rule-amend-petition');
  for(const id of ['c15-03','comp-14','s256-b']){
    const q=bank.find(q=>q.id===id)!;
    const cue=questionVisualFor(q,2)?.cue;
    if(cue) assert.notEqual(cue.topic,'rule-amend-petition',id+' must not show the signature picture');
    const answer=q.choices[q.answer].en;
    if(cue?.topic?.startsWith('rule-')){
      assert.ok(!/50[ ,]?000/.test(answer),id+' shows a rule the answer does not state');
    }
  }
  // The readings question states three readings, so it may carry the
  // readings rule and nothing else.
  assert.equal(questionVisualFor(bank.find(q=>q.id==='c15-03')!,2)?.cue?.topic,'rule-amend-readings');
  // The senators' challenge states one tenth, so it carries that rule.
  assert.equal(questionVisualFor(bank.find(q=>q.id==='s256-b')!,2)?.cue?.topic,'rule-amend-senate-petition');
});

test('legacy mnemonic cards also reject unrelated section256 rules',async()=>{
  const {memoryCueFor}=await import('../lib/cues.ts');
  const signature=bank.find(q=>q.id==='c15-02')!;
  assert.equal(memoryCueFor(signature)?.topic,'rule-amend-petition');
  for(const id of ['c15-03','comp-14','s256-b']){
    const cue=memoryCueFor(bank.find(q=>q.id===id)!);
    if(cue) assert.notEqual(cue.topic,'rule-amend-petition',id);
  }
});
