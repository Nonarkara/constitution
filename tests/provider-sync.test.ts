import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import type { ComponentType, ReactNode } from 'react';
import type { useStudy } from '../components/Provider';
import { JSDOM } from 'jsdom';
import * as learning from '../lib/learning.ts';
import * as progress from '../lib/progress.ts';
import * as annotations from '../lib/annotations.ts';
import * as marks from '../lib/marks.ts';
import * as offline from '../lib/offline.ts';
import * as localData from '../lib/local-data.ts';
import * as knowledge from '../lib/knowledge.ts';

const require = createRequire(import.meta.url);
const dom = new JSDOM('<div id="root"></div>', { url: 'https://study.test/' });
for (const [k,v] of Object.entries({ window:dom.window, document:dom.window.document, navigator:dom.window.navigator, localStorage:dom.window.localStorage, IS_REACT_ACT_ENVIRONMENT:true }))
  Object.defineProperty(globalThis,k,{configurable:true,writable:true,value:v});
const React = require('react');
const { createRoot } = require('react-dom/client');
const registry: Record<string,unknown> = {
  '@/lib/learning':learning, '@/lib/progress':progress, '@/lib/annotations':annotations,
  '@/lib/marks':marks, '@/lib/offline':offline, '@/lib/local-data':localData, '@/lib/knowledge':knowledge,
};
const mod = { exports:{} as {Provider: ComponentType<{children:ReactNode}>; useStudy: typeof useStudy} };
const source = ts.transpileModule(readFileSync('components/Provider.tsx','utf8'), {compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
new Function('require','module','exports',source)((id:string)=>registry[id]??require(id),mod,mod.exports);
let current: ReturnType<typeof mod.exports.useStudy>;
function Consumer(){ current=mod.exports.useStudy(); return React.createElement('output',null,JSON.stringify({xp:current.progress.xp,marks:current.marks,read:current.read,annotations:current.annotations})); }
async function run(verify:()=>Promise<void>){
  localStorage.clear();
  localStorage.setItem('constitution-progress',JSON.stringify({...learning.defaultProgress(),xp:30}));
  localStorage.setItem('constitution-marks',JSON.stringify({marks:[],bookmarks:[1]}));
  localStorage.setItem('constitution-read-v1',JSON.stringify({1:100}));
  localStorage.setItem('constitution-annotations',JSON.stringify({1:{section:1,note:'Keep this',updatedAt:100}}));
  localStorage.setItem('constitution-lang','en');
  localStorage.setItem('constitution-large','true');
  const root=createRoot(document.getElementById('root')!);
  try { await React.act(async()=>root.render(React.createElement(mod.exports.Provider,null,React.createElement(Consumer)))); await verify(); }
  finally { await React.act(async()=>root.unmount()); }
}
async function erased(key:string|null){
  if(key===null)localStorage.clear();else localStorage.removeItem(key);
  await React.act(async()=>window.dispatchEvent(new dom.window.StorageEvent('storage',{key,newValue:null,storageArea:localStorage})));
}
test('another tab erasing progress does not leave erased XP available for the next save',async()=>run(async()=>{
  assert.equal(current.progress.xp,30);
  await erased('constitution-progress');
  assert.equal(current.progress.xp,0);
  await React.act(async()=>current.save(current.progress));
  assert.equal(JSON.parse(localStorage.getItem('constitution-progress')!).xp,0);
  assert.equal(current.lang,'en'); assert.equal(current.large,true,'learner reset preserves device preferences');
}));
test('another tab erasing bookmarks removes them from the mounted provider',async()=>run(async()=>{
  assert.deepEqual(current.marks.bookmarks,[1]);
  await erased('constitution-marks');
  assert.deepEqual(current.marks,marks.emptyMarks());
}));
test('a storage clear event clears all four learner stores in the mounted provider',async()=>run(async()=>{
  await erased(null);
  assert.equal(current.progress.xp,0); assert.deepEqual(current.marks,marks.emptyMarks());
  assert.deepEqual(current.read,{}); assert.deepEqual(current.annotations,{});
}));
test('sessionStorage cannot replace the local learner state through a storage event',async()=>run(async()=>{
  await React.act(async()=>window.dispatchEvent(new dom.window.StorageEvent('storage',{key:'constitution-progress',newValue:JSON.stringify({...learning.defaultProgress(),xp:999}),storageArea:dom.window.sessionStorage})));
  assert.equal(current.progress.xp,30);
}));
