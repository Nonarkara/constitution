import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makePaper,papers} from '../lib/papers.ts';
import {paperFingerprint,parseTimedCheckpoint} from '../lib/exam-checkpoint.ts';
const bank=JSON.parse(readFileSync(new URL('../data/questions.json',import.meta.url),'utf8'));
const list=makePaper(bank,papers[0]);
const now=1_000_000_000;
const saved={paperNumber:1,ends:now+60_000,index:2,answers:{[list[0].id]:1},fingerprint:paperFingerprint(list)};
test('timed paper restores exact question and choice order without resetting the deadline',()=>{
 const recovered=makePaper(bank,papers[0]);
 const result=parseTimedCheckpoint(JSON.stringify(saved),recovered,1,now+30_000);
 assert.deepEqual(result,saved);
 assert.equal(result!.ends,now+60_000);
 // Expired sittings remain recoverable so the UI can submit them rather than erase answers.
 assert.ok(parseTimedCheckpoint(JSON.stringify(saved),recovered,1,now+120_000));
});
test('timed paper rejects changed content, invalid choices, mismatched papers and implausible dates',()=>{
 for(const patch of [{paperNumber:2},{index:-1},{index:list.length},{answers:{unknown:0}},{answers:{[list[0].id]:99}},{fingerprint:'changed'},{ends:now+2*86_400_000},{ends:now-2*86_400_000}])
  assert.equal(parseTimedCheckpoint(JSON.stringify({...saved,...patch}),list,1,now),null);
 assert.equal(parseTimedCheckpoint('invalid',list,1,now),null);
});
