import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { JSDOM } from 'jsdom';
const require = createRequire(import.meta.url);
const dom = new JSDOM('<button id="opener">Section reference</button><div id="root"></div>', {url:'https://study.test/'});
for (const [key,value] of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator,HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true}))
  Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
const React=require('react');
const {createRoot}=require('react-dom/client');
const text='A complete statute paragraph. '.repeat(150);
const modules:Record<string,unknown>={
 'next/link':{__esModule:true,default:({children,...props}:Record<string,unknown>)=>React.createElement('a',props,children)},
 '@/lib/corpus':{readingText:()=>text,sections:Array.from({length:279},(_,i)=>({number:i+1,chapter:15}))},
 '@/lib/reading':{readingTokens:()=>[]},
 '@/lib/i18n':{tr:(lang:string,th:string,en:string,zh:string)=>({th,en,zh}[lang]),sectionLabel:(lang:string,n:number)=>`${lang} ${n}`},
};
const module={exports:{} as {Peek?:unknown}};
const compiled=ts.transpileModule(readFileSync('components/LawRef.tsx','utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
new Function('require','module','exports',compiled)((id:string)=>modules[id]??require(id),module,module.exports);
for(const lang of ['th','en','zh']) test(`${lang} preview preserves complete text and returns keyboard focus on Escape`,async()=>{
 const root=createRoot(document.getElementById('root'));
 const opener=document.getElementById('opener')!;
 function Harness(){const [open,setOpen]=React.useState(true);return open?React.createElement(module.exports.Peek,{n:256,lang,onClose:()=>setOpen(false)}):null;}
 try{
  opener.focus();
  await React.act(async()=>root.render(React.createElement(Harness)));
  const sheet=document.querySelector('[role=dialog]')!;
  assert.equal(sheet.getAttribute('aria-label'),`${lang} 256`);
  assert.equal(document.activeElement,sheet);
  assert.equal(document.querySelector('.sheet-text')?.textContent,text,'no statute truncation');
  assert.equal(document.querySelector('a')?.getAttribute('href'),'/read/?c=15#s-256');
  await React.act(async()=>sheet.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true})));
  assert.equal(document.querySelector('[role=dialog]'),null);
  assert.equal(document.activeElement,opener);
 } finally {await React.act(async()=>root.unmount());}
});
