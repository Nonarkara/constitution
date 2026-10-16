import test from 'node:test';
import assert from 'node:assert/strict';
import { askJSON, parseAskAnswer, AskClientError } from '../lib/ask-client.ts';
import { readSources, presentAnswer, safeAskURL, looksLikeProviderError } from '../lib/ask.ts';
import { defaultProgress, recordAnswer } from '../lib/learning.ts';
const signal = () => new AbortController().signal;
test('malformed AI payloads are rejected before rendering and helpers tolerate invalid source containers', () => {
 for(const value of [null,{}, {answer:4}, {answer:'ok',sources:{}}, {answer:'ok',sources:[null]}, {answer:'ok',appendix:{statutes:[{cite:5}]}}, {answer:'ok',appendix:{deka:{}}}, {answer:'x'.repeat(60001)}]) assert.equal(parseAskAnswer(value),null);
 assert.equal(parseAskAnswer({answer:'ok',sources:[{}, {title:'Law',url:'https://example.org/law'}]})?.answer,'ok');
 assert.deepEqual(readSources({sources:{}}),[]);
 assert.deepEqual(readSources({sources:[null]}),[{title:undefined,url:undefined}]);
});
test('citation holes retain original identity and unsafe links never become clickable', () => {
 const result=presentAnswer('Unsupported [1]; supported [2].', [{},{title:'Actual source',url:'https://example.org/law'}]);
 assert.equal(result.text,'Unsupported; supported [2].');
 assert.deepEqual(result.sources,[{n:2,title:'Actual source',url:'https://example.org/law'}]);
 for(const raw of ['javascript:alert(1)','https://','https://user:password@example.org','http://example.org']) assert.equal(safeAskURL(raw),undefined);
});
test('request deadline covers a hanging transport and a hanging response body', async () => {
 const never:typeof fetch=async()=>new Promise(()=>{});
 await assert.rejects(askJSON('https://example.org',{},signal(),20,never), (e:unknown)=>e instanceof AskClientError&&e.kind==='timeout');
 const body:typeof fetch=async()=>new Response(new ReadableStream({start(){}}));
 await assert.rejects(askJSON('https://example.org',{},signal(),20,body),(e:unknown)=>e instanceof AskClientError&&e.kind==='timeout');
});
test('oversized responses are refused and cancellation exits waiting even if transport ignores abort', async () => {
 const large:typeof fetch=async()=>new Response('x'.repeat(256001));
 await assert.rejects(askJSON('https://example.org',{},signal(),100,large),AskClientError);
 const controller=new AbortController();
 const pending=askJSON('https://example.org',{},controller.signal,100,async()=>new Promise(()=>{}));
 controller.abort(); await assert.rejects(pending,{name:'AbortError'});
});
test('a finished answer is validated before the page shows it', () => {
 assert.equal(parseAskAnswer({status:'done',answer:'Read [2].',sources:[{},{title:'Law'}]})?.answer,'Read [2].');
 assert.equal(parseAskAnswer({status:'done',sources:{}}),null);
 assert.equal(parseAskAnswer({status:'done',answer:'x',sources:{}}),null);
 assert.equal(parseAskAnswer({status:'done',answer:'x',grounded:'yes'}),null);
 assert.equal(parseAskAnswer({status:'done',answer:'x'.repeat(60_001)}),null);
});
test('wrong/right cycles cannot farm XP, and due retrieval remains rewarded without changing existing XP',()=>{
 const now=Date.parse('2026-10-15T12:00:00Z'), q={id:'q'};
 let p=recordAnswer({...defaultProgress(),xp:40},q,true,now);
 assert.equal(p.xp,50);
 for(let i=0;i<5;i++){p=recordAnswer(p,q,false,now);p=recordAnswer(p,q,true,now);}
 assert.equal(p.xp,50);assert.equal(p.questions.q.correct,true);
 p=recordAnswer(p,q,true,p.questions.q.due);assert.equal(p.xp,60);
});

test('a legitimate law section number is not misclassified as a provider rate limit',()=>{
 assert.equal(looksLikeProviderError('Under section 429, the parent may be jointly liable.'),false);
 assert.equal(looksLikeProviderError('The transitory rule applied temporarily.'),false);
 assert.equal(looksLikeProviderError('OpenRouter HTTP 429: too many requests'),true);
});
