"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { sections as corpus } from "@/lib/corpus";
import { useStudy } from "./Provider";
import { tr, sectionLabel } from "@/lib/i18n";
import {
  ASK_ORIGIN,
  consentCopy,
  deepLink,
  friendlyAskError,
  groundedLabel,
  localConstitution,
  presentAnswer,
  readGrounded,
  readSources,
  showGroundedMark,
  studyDisclaimer,
  safeAskURL,
} from "@/lib/ask";

import { requestAsk, AskClientError, type AskAnswer } from "@/lib/ask-client";

type State =
  | { kind: "idle" }
  | { kind: "waiting"; position: number }
  | { kind: "done"; result: AskAnswer }
  | { kind: "error"; message: string; link: boolean };

// Questions the notebook cannot answer go to Non-Laws, which retrieves real
// statutes and Supreme Court rulings. Sections being read travel as numbers only.
export function Ask({ sections = [], initial = "" }: { sections?: number[]; initial?: string }) {
  const { lang } = useStudy();
  const [question, setQuestion] = useState(initial),
    [consent, setConsent] = useState(false),
    [state, setState] = useState<State>({ kind: "idle" });
  const run = useRef(0);
  const activeRequest = useRef<AbortController | null>(null);
  useEffect(() => () => { run.current++; activeRequest.current?.abort(); }, []);
  useEffect(() => setQuestion(initial), [initial]);
  const length = question.trim().length;
  const busy = state.kind === "waiting";
  const fail = (message: string, link = true) => setState({ kind: "error", message, link });

  async function ask() {
    const mine = ++run.current;
    if (!navigator.onLine) return fail(friendlyAskError("offline", lang));
    setState({ kind: "waiting", position: 0 });
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    try {
      const result = await requestAsk(question.trim(), lang, sections, controller.signal,
        (position) => { if (run.current === mine) setState({kind:"waiting",position}); });
      if (run.current === mine) setState({kind:"done",result});
    } catch (error) {
      if (run.current !== mine || controller.signal.aborted) return;
      fail(friendlyAskError(error instanceof AskClientError ? error.kind : "unreachable", lang));
    } finally { if (activeRequest.current === controller) activeRequest.current = null; }
  }

  const open = (
    <a
      href={deepLink(question, sections)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={tr(
        lang,
        "เปิดคำถามนี้ใน Non-Laws",
        "Open this question in Non-Laws",
        "在 Non-Laws 中打开此问题",
      )}
    >
      {tr(lang, "เปิดใน Non-Laws", "Open in Non-Laws", "在 Non-Laws 中打开")} ↗
    </a>
  );
  const presented =
    state.kind === "done" ? presentAnswer(state.result.answer, readSources(state.result)) : null;
  const grounded = state.kind === "done" && showGroundedMark({ grounded: readGrounded(state.result) });
  const appendix = state.kind === "done" ? state.result.appendix : null;
  const ours = localConstitution(appendix?.statutes);
  const others = (appendix?.statutes ?? []).filter((s) => !s.cite?.startsWith("รธน."));
  return (
    <details className="quiz-law ask" open={Boolean(initial) || undefined}>
      <summary>
        {tr(
          lang,
          "ถามสิ่งที่สมุดเล่มนี้ตอบไม่ได้",
          "Ask a question this notebook can't answer",
          "问一个这本笔记答不了的问题",
        )}
      </summary>
      <label className="micro" htmlFor="ask-question">
        {tr(
          lang,
          "Non-Laws ค้นตัวบทและคำพิพากษาฎีกาจริง แล้วเล่าคำตอบให้ฟัง",
          "Non-Laws searches real statutes and Supreme Court rulings, then tells you the answer as a story.",
          "Non-Laws 检索真实法条与最高法院判例，再用讲故事的方式回答。",
        )}
      </label>
      <textarea
        id="ask-question"
        rows={3}
        maxLength={4000}
        value={question}
        disabled={busy}
        onChange={(e) => setQuestion(e.target.value)}
      />
      {sections.length > 0 && (
        <p className="micro">
          {tr(lang, "ถามพร้อม", "Asking with", "附带")}{" "}
          {sections.map((n) => sectionLabel(lang, n)).join(" · ")}
        </p>
      )}
      <label className="ask-consent micro">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>
          {consentCopy(lang)}{" "}
          <a
            href={`${ASK_ORIGIN}/#fineprint`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={tr(lang, "ข้อตกลงของ Non-Laws", "Non-Laws fine print", "Non-Laws 说明")}
          >
            {tr(lang, "ข้อตกลง", "Fine print", "说明")} ↗
          </a>
        </span>
      </label>
      <button className="primary" disabled={!consent || busy || length < 8} onClick={ask}>
        {tr(lang, "ถาม Non-Laws", "Ask Non-Laws", "询问 Non-Laws")} →
      </button>
      {busy && <>
        <button onClick={() => { run.current++; activeRequest.current?.abort(); setState({kind:"idle"}); }}>
          {tr(lang, "หยุดรอ", "Stop waiting", "停止等待")}
        </button>
        <p className="micro">{tr(lang,"หยุดรอได้ คำถามที่ส่งไปแล้วจะยังอยู่กับ Non-Laws","You can stop waiting. The submitted question remains with Non-Laws.","可以停止等待，但已提交的问题仍由 Non-Laws 保存。")}</p>
      </>}
      <div role="status" aria-live="polite">
        {state.kind === "waiting" && (
          <p className="micro">
            {state.position > 0
              ? tr(lang, `อยู่ในคิวลำดับที่ ${state.position}`, `In queue · position ${state.position}`, `排队中 · 第${state.position}位`)
              : tr(lang, "กำลังค้นตัวบทและเขียนคำตอบ อาจใช้เวลาหนึ่งถึงสองนาที", "Searching the law and writing. This can take a minute or two.", "正在检索法条并撰写答案，可能需要一两分钟。")}
          </p>
        )}
        {state.kind === "error" && (
          <div className="feedback">
            <p>{state.message}</p>
            <button type="button" onClick={ask} disabled={!consent || length < 8}>
              {tr(lang, "ลองอีกครั้ง", "Try again", "再试一次")}
            </button>
          </div>
        )}
      </div>
      {state.kind === "done" && (
        <div className="ask-answer">
          <p className="ask-text">{presented?.text}</p>
          {grounded && <p className="micro">{groundedLabel(lang)}</p>}
          {(presented?.sources.length ?? 0) > 0 && (
            <ol className="ask-sources">
              {presented?.sources.map((source) => (
                <li key={source.n} value={source.n}>
                  {source.url ? (
                    <a href={source.url} target="_blank" rel="noopener noreferrer nofollow">
                      [{source.n}] {source.title} ↗
                    </a>
                  ) : (
                    <>[{source.n}] {source.title}</>
                  )}
                </li>
              ))}
            </ol>
          )}
          {ours.map((n) => (
            <div className="reading-excerpt" key={`c${n}`}>
              <h3>{sectionLabel(lang, n)}</h3>
              <p lang="th">{corpus[n - 1].th}</p>
              <Link href={`/section/?n=${n}`}>
                {tr(lang, "อ่านในสมุด", "Read in the notebook", "在笔记中阅读")} →
              </Link>
            </div>
          ))}
          {others.map((s, i) => (
            <div className="reading-excerpt" key={`s${i}`}>
              <h3>{s.cite}</h3>
              <p className="micro">
                {s.law} ·{" "}
                {tr(lang, "ค้นโดย Non-Laws ตรวจต้นฉบับก่อนใช้", "Retrieved by Non-Laws. Check the original.", "由 Non-Laws 检索，请核对原文。")}
              </p>
              {s.text && <p lang="th">{s.text}</p>}
            </div>
          ))}
          {(appendix?.deka ?? []).map((d, i) => (
            <p className="micro" key={`d${i}`}>
              {safeAskURL(d.url) ? (
                <a href={safeAskURL(d.url)} target="_blank" rel="noopener noreferrer nofollow">
                  ฎีกาที่ {d.caseId} ↗
                </a>
              ) : (
                <>ฎีกาที่ {d.caseId}</>
              )}
              {d.headnote ? ` · ${d.headnote.slice(0, 240)}` : ""}
            </p>
          ))}
          <p className="micro">{studyDisclaimer(lang)}</p>
        </div>
      )}
      <p className="micro">{open}</p>
    </details>
  );
}
