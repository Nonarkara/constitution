import {readFile} from 'node:fs/promises';
import {makeDrill,DRILL_COUNT} from '../lib/drills.ts';
const corpus=JSON.parse(await readFile('data/constitution.json','utf8'));
for(const [section,proofs] of [[256,['กึ่งหนึ่ง','หนึ่งในสาม','หนึ่งในห้า','ห้าหมื่น']],[133,['หนึ่งหมื่น']],[158,['สามสิบห้า']]]){
 for(const proof of proofs)if(!corpus.sections[section-1].th.includes(proof))throw Error(`Drill rule not found: ${section} ${proof}`);
}
const ids=new Set(),prompts=new Set();
for(let i=0;i<DRILL_COUNT;i++){const q=makeDrill(i);if(ids.has(q.id)||prompts.has(q.prompt.th))throw Error(`Duplicate drill ${i}`);ids.add(q.id);prompts.add(q.prompt.th);for(const l of ['th','en','zh'])if(!q.prompt[l]||!q.explanation[l]||new Set(q.choices.map(c=>c[l])).size!==4)throw Error(`Invalid drill ${i} ${l}`);for(const n of q.sections)if(!corpus.sections[n-1])throw Error(`No source for ${i}`);}
console.log(`Generated drills: ${ids.size} distinct parameter cases, rule vocabulary verified in Thai source.`);
