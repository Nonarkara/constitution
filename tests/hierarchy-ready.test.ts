import test from 'node:test';
import assert from 'node:assert/strict';
// @ts-ignore JavaScript helper is embedded verbatim in the browser gate.
import { waitForHierarchy } from '../scripts/hierarchy-ready.mjs';
function trial(absent:(time:number)=>boolean, duplicate=false, studyReady=(time:number)=>true) {
 let time=0, successAt:number|null=null, error=''; const queue:Array<()=>void>=[];
 const title={getBoundingClientRect:()=>({x:0,y:20,width:300,height:44})};
 const main={getAttribute:()=>studyReady(time)?"true":"false",querySelector:()=>absent(time)?null:title,getBoundingClientRect:()=>({height:800}),querySelectorAll:()=>duplicate?[title,title]:[title]};
 const doc={readyState:'complete',fonts:{status:'loaded'},querySelector:()=>main};
 waitForHierarchy(()=>doc,()=>{successAt=time},(e:string)=>{error=e},()=>true,{now:()=>time,later:(fn:()=>void)=>queue.push(fn)});
 while(queue.length){time+=60;queue.shift()!();assert.ok(time<=12100);}
 return {successAt,error};
}
test('a title removed during hydration must settle again before measurement',()=>{
 const result=trial(t=>t>=120&&t<360); assert.ok(result.successAt!>=580); assert.equal(result.error,'');
});
test('a permanent missing title fails as readiness, never a measured design defect',()=>{
 const result=trial(()=>true); assert.equal(result.successAt,null); assert.match(result.error,/readiness-timeout/);
});
test('duplicate titles still reach the hierarchy validator',()=>{
 assert.equal(trial(()=>false,true).successAt,240);
});

test('persisted study state must load before the page is measured',()=>{
 const result=trial(()=>false,false,t=>t>=600);
 assert.equal(result.successAt,840);
});
