import { ASK_ORIGIN, askRequest, classify, looksLikeProviderError, pollDelay, POLL_LIMIT } from './ask.ts';
import type { Lang } from './i18n.ts';
import type { AskSource } from './ask.ts';
export type AskAnswer = {
  answer: string;
  grounded?: boolean;
  sources?: AskSource[];
  final?: { grounded?: boolean; sources?: AskSource[] };
  appendix?: { disclaimer?: string; statutes?: { cite?: string; law?: string; section?: string; text?: string }[]; deka?: { caseId?: string; year?: string; headnote?: string; url?: string }[] } | null;
};
export type AskErrorKind = 'offline' | 'unreachable' | 'rate' | 'refused' | 'unavailable' | 'invalid' | 'server' | 'lost' | 'timeout';
export class AskClientError extends Error {
  kind: AskErrorKind;
  constructor(kind: AskErrorKind) { super(kind); this.kind = kind; }
}
const object = (v: unknown): v is Record<string, unknown> => Boolean(v && typeof v === 'object' && !Array.isArray(v));
const optionalString = (v: unknown, limit: number) => v === undefined || typeof v === 'string' && v.length <= limit;
const sourceList = (v: unknown) => v === undefined || Array.isArray(v) && v.length <= 100 && v.every(s => object(s) && optionalString(s.title, 1000) && optionalString(s.url, 2000));
/** Validate before the external answer reaches React or any citation formatter. */
export function parseAskAnswer(v: unknown): AskAnswer | null {
  if (!object(v) || typeof v.answer !== 'string' || !v.answer.trim() || v.answer.length > 60_000 ||
      v.grounded !== undefined && typeof v.grounded !== 'boolean' || !sourceList(v.sources)) return null;
  if (v.final !== undefined && (!object(v.final) || !sourceList(v.final.sources) || v.final.grounded !== undefined && typeof v.final.grounded !== 'boolean')) return null;
  if (v.appendix !== undefined && v.appendix !== null) {
    const a = v.appendix;
    if (!object(a) || !optionalString(a.disclaimer, 2000)) return null;
    if (a.statutes !== undefined && (!Array.isArray(a.statutes) || a.statutes.length > 50 || !a.statutes.every(s =>
      object(s) && optionalString(s.cite,500) && optionalString(s.law,1000) && optionalString(s.section,100) && optionalString(s.text,20_000)))) return null;
    if (a.deka !== undefined && (!Array.isArray(a.deka) || a.deka.length > 50 || !a.deka.every(d =>
      object(d) && optionalString(d.caseId,200) && optionalString(d.year,20) && optionalString(d.headnote,20_000) && optionalString(d.url,2000)))) return null;
  }
  return v as AskAnswer;
}
export const ASK_REQUEST_MS = 20_000;
export const ASK_TOTAL_MS = 300_000;
const RESPONSE_BYTES = 256_000;
function abortError() { return new DOMException('Request cancelled', 'AbortError'); }
/** The race also bounds a transport or body reader which ignores AbortSignal. */
export async function askJSON(url: string, init: RequestInit, signal: AbortSignal, timeoutMs = ASK_REQUEST_MS, fetcher: typeof fetch = fetch): Promise<{ status: number; body: unknown }> {
  if (signal.aborted) throw abortError();
  if (timeoutMs <= 0) throw new AskClientError('timeout');
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout>;
  let cancel: () => void = () => {};
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => { reject(new AskClientError('timeout')); controller.abort(); }, timeoutMs);
    cancel = () => { reject(abortError()); controller.abort(); };
    signal.addEventListener('abort', cancel, { once: true });
  });
  try {
    return await Promise.race([deadline, (async () => {
      const response = await fetcher(url, { ...init, signal: controller.signal });
      const reader = response.body?.getReader();
      if (!reader) return {status:response.status,body:{}};
      const decoder = new TextDecoder();
      let bytes = 0, text = '';
      try {
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          bytes += chunk.value.byteLength;
          if (bytes > RESPONSE_BYTES) throw new AskClientError('server');
          text += decoder.decode(chunk.value, { stream: true });
        }
        text += decoder.decode();
      } catch (error) {
        void reader.cancel().catch(() => {});
        throw error;
      } finally { reader.releaseLock(); }
      let body: unknown = {};
      try { body = JSON.parse(text); } catch { /* HTTP status still supplies the friendly failure. */ }
      return { status: response.status, body };
    })()]);
  } finally {
    clearTimeout(timer!);
    signal.removeEventListener('abort', cancel);
    controller.abort();
  }
}
function delay(ms: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.reject(abortError());
  return new Promise((resolve,reject) => {
    const cancel = () => { clearTimeout(timer); reject(abortError()); };
    const timer = setTimeout(() => { signal.removeEventListener('abort',cancel); resolve(); },ms);
    signal.addEventListener('abort',cancel,{once:true});
  });
}
export async function requestAsk(question: string, lang: Lang, sections: number[], signal: AbortSignal, onPosition: (n:number)=>void, options: { fetcher?: typeof fetch; requestMs?:number; totalMs?:number; wait?:typeof delay } = {}): Promise<AskAnswer> {
  const expires = Date.now() + (options.totalMs ?? ASK_TOTAL_MS);
  const call = (url:string,init:RequestInit) => askJSON(url,init,signal,Math.min(options.requestMs ?? ASK_REQUEST_MS, expires-Date.now()),options.fetcher);
  const first = await call(`${ASK_ORIGIN}/api/laws`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(askRequest(question,lang,sections))});
  const envelope = object(first.body) ? first.body : {};
  const outcome = classify(first.status,{refused:envelope.refused===true});
  if (outcome !== 'accepted') throw new AskClientError(outcome);
  if (typeof envelope.id !== 'string' || !/^[\w-]{1,200}$/.test(envelope.id)) throw new AskClientError('server');
  for (let attempt=0;attempt<POLL_LIMIT;attempt++) {
    const remaining=expires-Date.now();
    if (remaining<=0) throw new AskClientError('timeout');
    await (options.wait ?? delay)(Math.min(pollDelay(attempt),remaining),signal);
    const poll=await call(`${ASK_ORIGIN}/api/ask/${encodeURIComponent(envelope.id)}`,{});
    if (!object(poll.body)) throw new AskClientError('lost');
    const job=poll.body;
    if (poll.status===429 || looksLikeProviderError(String(job.error??''))) throw new AskClientError('rate');
    if (poll.status!==200 || job.error) throw new AskClientError('lost');
    if (job.status==='done') {
      const parsed=parseAskAnswer(job);
      if (!parsed) throw new AskClientError('lost');
      if (looksLikeProviderError(parsed.answer)) throw new AskClientError('rate');
      return parsed;
    }
    if (!['queued','running','pending','processing','waiting'].includes(String(job.status))) throw new AskClientError('lost');
    onPosition(typeof job.position==='number' && Number.isSafeInteger(job.position) && job.position>=0 ? job.position : 0);
  }
  throw new AskClientError('timeout');
}
