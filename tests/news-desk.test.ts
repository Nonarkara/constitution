import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { JSDOM } from 'jsdom';
import * as news from '../lib/news.ts';
import * as palace from '../lib/palace.ts';
import * as homes from '../lib/news-palace.ts';
import * as i18n from '../lib/i18n.ts';

const require = createRequire(import.meta.url);
const dom = new JSDOM('<div id="root"></div>', { url:'https://study.test/news/', pretendToBeVisual:true });
for(const [k,v] of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator,IS_REACT_ACT_ENVIRONMENT:true}))
 Object.defineProperty(globalThis,k,{configurable:true,writable:true,value:v});
const React=require('react');
const {createRoot}=require('react-dom/client');
const registry:Record<string,unknown>={
 '@/lib/news':news,'@/lib/palace':palace,'@/lib/news-palace':homes,'@/lib/i18n':i18n,
 '@/data/news.json':JSON.parse(readFileSync('data/news.json','utf8')),
 '@/data/outline.json':JSON.parse(readFileSync('data/outline.json','utf8')),
 './Provider':{useStudy:()=>({lang:'en',online:false})},'./StudyArt':{StudyArt:()=>null},
 'next/link':{__esModule:true,default:({children,...props}:Record<string,unknown>)=>React.createElement('a',props,children)},
};
function load(file:string){
 const module={exports:{}};
 const compiled=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 new Function('require','module','exports',compiled)((id:string)=>id in registry?registry[id]:require(id),module,module.exports);
 return module.exports as Record<string,unknown>;
}
registry['./PageAction']=load('components/PageAction.tsx');
const {NewsDesk}=load('components/NewsDesk.tsx');

test('a news search with no results cannot advertise an unrelated headline as matching',async()=>{
 const originalFetch=globalThis.fetch;
 globalThis.fetch=async()=>new Response('',{status:503});
 const root=createRoot(dom.window.document.getElementById('root'));
 try{
  await React.act(async()=>root.render(React.createElement(NewsDesk)));
  assert.ok(dom.window.document.querySelector('.action-panel-cta'),'unfiltered news offers the latest headline');
  assert.ok(dom.window.document.querySelector('.action-panel-subject')?.textContent?.trim(),'the featured action names its headline');
  const search=dom.window.document.querySelector('input[type=search]')!;
  const set=Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype,'value')!.set!;
  await React.act(async()=>{set.call(search,'no-match-7f48c78f');search.dispatchEvent(new dom.window.Event('input',{bubbles:true}));});
  assert.match(dom.window.document.body.textContent??'',/No headlines match/);
  assert.equal(dom.window.document.querySelector('.action-panel-cta'),null,'no unrelated publisher link may be promoted as a search match');
  await React.act(async()=>{set.call(search,'');search.dispatchEvent(new dom.window.Event('input',{bubbles:true}));});
  assert.ok(dom.window.document.querySelector('.action-panel-cta'),'clearing the query restores the action');
 }finally{await React.act(async()=>root.unmount());globalThis.fetch=originalFetch;dom.window.close();}
});
