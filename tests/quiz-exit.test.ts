import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { JSDOM } from 'jsdom';
import * as learning from '../lib/learning.ts';
import * as i18n from '../lib/i18n.ts';
import * as session from '../lib/session.ts';
import * as coach from '../lib/coach.ts';
import * as shuffle from '../lib/shuffle.ts';
import type { ComponentType } from 'react';

const require=createRequire(import.meta.url);
const dom=new JSDOM('<div id="root"></div>',{url:'https://study.test/memory/'});
for(const[k,v]of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator,IS_REACT_ACT_ENVIRONMENT:true}))Object.defineProperty(globalThis,k,{configurable:true,writable:true,value:v});
const React=require('react'); const {createRoot}=require('react-dom/client');
const bank=(require('../data/questions.json') as learning.Question[]).filter(q=>q.chapter===1).slice(0,2);
let progress=learning.defaultProgress(), saves=0, exits=0, prelude=false, side=false;
const nextButton=({onDone}:{onDone:()=>void})=>React.createElement('button',{onClick:onDone},'Continue story');
const registry:Record<string,unknown>={
 'next/link':{__esModule:true,default:({children,...props}:Record<string,unknown>)=>React.createElement('a',props,children)},
 '@/data/questions.json':{__esModule:true,default:bank}, '@/data/cases.json':{__esModule:true,default:[]},
 '@/lib/corpus':{sections:[{number:1}],chapters:[{number:1,title:{th:'บททั่วไป',en:'General',zh:'总则'}}],sectionBody:()=> 'Source text'},
 '@/lib/learning':learning, '@/lib/i18n':i18n, '@/lib/session':session, '@/lib/coach':coach, '@/lib/shuffle':shuffle,
 '@/lib/puzzles':{chapterPuzzles:()=>prelude?[{id:'story',sections:[1]}]:[]},
 '@/lib/cues':{matchingWhys:()=>[]}, '@/lib/side':{pickSide:()=>side?{id:'side'}:null},
 './Provider':{useStudy:()=>({lang:'en',progress,save:(p:learning.Progress)=>{saves++;progress=p;},annotations:{}})},
 './Shell':{useHidePageNext:()=>{}}, './Puzzle':{Puzzle:nextButton},
 './SideQuestion':{SideQuestionCard:nextButton,seenSide:()=>[]},
 './QuestionVisual':{QuestionVisual:()=>null}, './MemoryCue':{MemoryCue:()=>null}, './TeachingSteps':{TeachingSteps:()=>null},
 './LearningCoach':{RecallFirst:({onReveal}:{onReveal:()=>void})=>React.createElement('button',{onClick:onReveal},'Reveal options'),ConfidenceCheck:()=>null,ExplainBack:()=>null},
};
const mod={exports:{} as {Quiz:ComponentType<{chapter?:number;supplied:learning.Question[];onExit:()=>void}>}};
const source=ts.transpileModule(readFileSync('components/Quiz.tsx','utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
new Function('require','module','exports',source)((id:string)=>registry[id]??require(id),mod,mod.exports);
const button=(text:string)=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes(text));assert.ok(b,`Missing ${text}`);return b;};
const tap=async(e:HTMLElement)=>React.act(async()=>e.click());
async function run(chapter:number|undefined,verify:()=>Promise<void>){
 progress=learning.defaultProgress();saves=0;exits=0;
 const root=createRoot(document.getElementById('root')!);
 try{await React.act(async()=>root.render(React.createElement(mod.exports.Quiz,{chapter,supplied:bank,onExit:()=>{exits++;}})));await verify();}
 finally{await React.act(async()=>root.unmount());prelude=false;side=false;}
}
async function answer(){await tap(button('Reveal options'));await tap(document.querySelector<HTMLInputElement>('input[type=radio]')!);await tap(button('Check answer'));}
test('practice can be left before an answer without recording a result',async()=>run(undefined,async()=>{
 assert.ok(![...document.querySelectorAll('button')].some(b=>b.textContent?.includes('Check answer')), 'checking is not offered before options exist');
 await tap(button('Leave practice'));assert.equal(exits,1);assert.equal(saves,0);
}));
test('leaving after checking keeps exactly the answer already recorded',async()=>run(undefined,async()=>{
 await answer();assert.equal(saves,1);const saved=JSON.stringify(progress);
 await tap(button('Leave practice'));assert.equal(exits,1);assert.equal(saves,1);assert.equal(JSON.stringify(progress),saved);
}));
test('the exit stays available through the story and reading prelude',async()=>{
 prelude=true;await run(1,async()=>{assert.ok(button('Leave practice'));await tap(button('Continue story'));await tap(button('Leave practice'));assert.equal(exits,1);assert.equal(saves,0);});
});
test('the exit stays available on the in-session side question',async()=>{
 side=true;await run(1,async()=>{await tap(button('Go to the questions'));await answer();await tap(button('Question 2'));assert.ok(button('Continue story'));await tap(button('Leave practice'));assert.equal(exits,1);assert.equal(saves,1);});
});
