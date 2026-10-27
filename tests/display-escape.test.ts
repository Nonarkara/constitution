import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {JSDOM} from 'jsdom';
import * as i18n from '../lib/i18n.ts';
const require=createRequire(import.meta.url);
const dom=new JSDOM('<div id="root"></div>',{url:'https://study.test/read/'});
for(const [k,v] of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator,IS_REACT_ACT_ENVIRONMENT:true}))Object.defineProperty(globalThis,k,{configurable:true,writable:true,value:v});
const React=require('react');const {createRoot}=require('react-dom/client');
const registry:Record<string,unknown>={
 'next/link':{__esModule:true,default:({children,...props}:Record<string,unknown>)=>React.createElement('a',props,children)},
 'next/navigation':{usePathname:()=>'/read/',useSearchParams:()=>new URLSearchParams()},
 './Provider':{useStudy:()=>({lang:'en',setLang:()=>{},progress:{},ready:true,online:true,marks:{},annotations:{},read:{},large:false,setLarge:()=>{}})},
 '@/lib/i18n':i18n,'@/lib/theme':{THEMES:[],SWATCH:{},THEME_NAME:{}},'@/lib/use-theme':{useTheme:()=>({shown:'light',choose:()=>{}})},
 '@/lib/outline':{questionIndex:[]},'@/lib/learning':{dueQuestions:()=>[]},'@/lib/knowledge':{sectionSignals:()=>[],knowSummary:()=>({met:0})},
 '@/lib/nav':{DOORS:[],doorFor:()=>null,backFor:()=>null,crumbsFor:()=>[],nextFor:()=>null},
};
const module={exports:{} as {Shell?:unknown}};
const compiled=ts.transpileModule(readFileSync('components/Shell.tsx','utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
new Function('require','module','exports',compiled)((id:string)=>registry[id]??require(id),module,module.exports);
test('Display Escape dismisses only the open menu before a document-level sheet listener',async()=>{
 const root=createRoot(document);let sheetCloses=0;
 const outer=(event:KeyboardEvent)=>{if(event.key==='Escape')sheetCloses++;};
 try {
  await React.act(async()=>root.render(React.createElement('html',null,React.createElement('body',null,React.createElement(module.exports.Shell,null,React.createElement('p',null,'Study text'))))));
  document.addEventListener('keydown',outer);
  const menu=document.querySelector('details')!,summary=menu.querySelector('summary')!;
  await React.act(async()=>summary.click()); assert.equal(menu.open,true);
  summary.focus();
  await React.act(async()=>summary.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true})));
  assert.equal(menu.open,false); assert.equal(sheetCloses,0); assert.equal(document.activeElement,summary);
  await React.act(async()=>summary.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true})));
  assert.equal(sheetCloses,1,'a closed menu must let Escape reach the open sheet');
 }finally{document.removeEventListener('keydown',outer);await React.act(async()=>root.unmount());}
});
