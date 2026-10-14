"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { sectionBody } from "@/lib/corpus";
import { useStudy } from "./Provider";
import { tr, sectionLabel } from "@/lib/i18n";
import {
  ASK_ORIGIN,
  ASK_RETRIES,
  ATTEMPT_BUDGET_MS,
  answerMatchesUi,
  askRequest,
  classify,
  confidenceLabel,
  consentCopy,
  deepLink,
  enforcementTopic,
  friendlyAskError,
  groundedLabel,
  localConstitution,
  looksLikeProviderError,
  notebookFallback,
  outcomeError,
  pollSteps,
  presentAnswer,
  readConfidence,
  readGrounded,
  readSources,
  shapeAskAnswer,
  showGroundedMark,
  showRuling,
  splitRightsAnswer,
  studyDisclaimer,
  wrongLanguageResult,
  type AskExcerpt,
} from "@/lib/ask";

type Statute = { cite?: string; law?: string; section?: string; text?: string };
type Deka = { caseId?: string; year?: string; headnote?: string; url?: string };
type Answer = {
  answer: string;
  grounded?: boolean;
  confidence?: string | null;
  sources?: { title?: string; url?: string }[];
  final?: { grounded?: boolean; confidence?: string | null; sources?: { title?: string; url?: string }[] };
  appendix?: { disclaimer?: string; statutes?: Statute[]; deka?: Deka[] } | null;
};
type State =
  | { kind: "idle" }
  | { kind: "waiting"; position: number; attempt: number; started: number }
  | { kind: "done"; result: Answer; attempts: number; elapsed: number }
  | { kind: "error"; message: string; link: boolean };

// Questions the notebook cannot answer go to Non-Laws, which retrieves real
// statutes and Supreme Court rulings. Sections being read travel as numbers only.
export function Ask({ sections = [], initial = "" }: { sections?: number[]; initial?: string }) {
  const { lang } = useStudy();
  const [question, setQuestion] = useState(initial),
    [consent, setConsent] = useState(false),
    [state, setState] = useState<State>({ kind: "idle" });
  const run = useRef(0);
  const [elapsed, setElapsed] = useState(0);
  const waitStarted = state.kind === "waiting" ? state.started : 0;
  useEffect(() => () => void run.current++, []);
  useEffect(() => {
    if (!waitStarted) return;
    setElapsed(Date.now() - waitStarted);
    const id = window.setInterval(() => setElapsed(Date.now() - waitStarted), 1000);
    return () => window.clearInterval(id);
  }, [waitStarted]);
  useEffect(() => setQuestion(initial), [initial]);
  const length = question.trim().length;
  const busy = state.kind === "waiting";
  const fail = (message: string, link = true) => setState({ kind: "error", message, link });
  const excerpts: AskExcerpt[] = sections.map((n) => ({ number: n, text: sectionBody(n, lang) }));
  const settle = (result: Answer & { shaped?: boolean }, attempts: number, startedAt: number) => {
    const translations = excerpts.map((excerpt) => excerpt.text);
    const topic = enforcementTopic(question, sections);
    const answer = result.shaped
      ? result.answer
      : shapeAskAnswer(result.answer ?? "", lang, sections, translations, question);
    setState({
      kind: "done",
      result: {
        ...result,
        answer,
        ...(topic
          ? result.confidence == null && result.shaped
            ? { grounded: false }
            : { confidence: "MIXED" as const, grounded: false }
          : {}),
      },
      attempts,
      elapsed: Date.now() - startedAt,
    });
  };

  async function ask() {
    const mine = ++run.current;
    const startedAt = Date.now();
    if (!navigator.onLine) return fail(friendlyAskError("offline", lang));
    const tries = ASK_RETRIES + 1;
    let sawTimeout = false;
    for (let attempt = 0; attempt < tries; attempt++) {
      if (run.current !== mine) return;
      setState({ kind: "waiting", position: 0, attempt, started: startedAt });
      const outcome = await runAsk(mine, attempt, startedAt);
      if (run.current !== mine || outcome === "done" || outcome === "stopped") return;
      if (outcome === "timeout") sawTimeout = true;
      if (outcome === "language" && attempt + 1 >= tries) {
        settle(wrongLanguageResult(lang, excerpts), tries, startedAt);
        return;
      }
    }
    if (run.current !== mine) return;
    if (excerpts.length) return settle(notebookFallback(lang, excerpts, sawTimeout ? "timeout" : "early"), tries, startedAt);
    fail(friendlyAskError(sawTimeout ? "timeout" : "lost", lang));
  }

  async function runAsk(
    mine: number,
    attempt: number,
    startedAt: number,
  ): Promise<"done" | "retry" | "timeout" | "stopped" | "language"> {
    const deadline = AbortSignal.timeout(ATTEMPT_BUDGET_MS);
    const pause = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        if (deadline.aborted) {
          reject(deadline.reason);
          return;
        }
        const timer = setTimeout(resolve, ms);
        deadline.addEventListener(
          "abort",
          () => {
            clearTimeout(timer);
            reject(deadline.reason);
          },
          { once: true },
        );
      });
    let res: Response;
    try {
      res = await fetch(`${ASK_ORIGIN}/api/laws`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(askRequest(question, lang, sections, excerpts)),
        signal: deadline,
      });
    } catch {
      return deadline.aborted ? "timeout" : "retry";
    }
    const body = await res.json().catch(() => ({}));
    const outcome = classify(res.status, body);
    if (outcome === "refused" || outcome === "invalid") {
      fail(outcomeError(outcome, lang));
      return "stopped";
    }
    if (outcome !== "accepted") return "retry";
    const started = Date.now();
    try {
      for (const delay of pollSteps()) {
        if (Date.now() - started >= ATTEMPT_BUDGET_MS) return "timeout";
        await pause(delay);
        if (run.current !== mine) return "stopped";
        if (deadline.aborted || Date.now() - started >= ATTEMPT_BUDGET_MS) return "timeout";
        const poll = await fetch(`${ASK_ORIGIN}/api/ask/${encodeURIComponent(body.id)}`, {
          signal: deadline,
        });
        const job = await poll.json();
        if (run.current !== mine) return "stopped";
        if (!poll.ok || job.error) return "retry";
        if (job.status === "done") {
          if (looksLikeProviderError(String(job.answer ?? ""))) return "retry";
          if (!answerMatchesUi(String(job.answer ?? ""), lang)) return "language";
          settle(job, attempt + 1, startedAt);
          return "done";
        }
        setState({ kind: "waiting", position: Number(job.position) || 0, attempt, started: startedAt });
      }
    } catch {
      if (run.current !== mine) return "stopped";
      return deadline.aborted ? "timeout" : "retry";
    }
    return "timeout";
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
  const rightsParts = presented ? splitRightsAnswer(presented.text) : null;
  const topic = enforcementTopic(question, sections);
  const confidenceLevel = state.kind === "done" ? readConfidence(state.result) : null;
  const confidenceText = confidenceLevel
    ? confidenceLabel(confidenceLevel, lang)
    : state.kind === "done" && showGroundedMark({ grounded: readGrounded(state.result) })
      ? groundedLabel(lang)
      : null;
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
      <div role="status" aria-live="polite">
        {state.kind === "waiting" && (
          <div className="ask-wait">
            <progress
              value={Math.min(elapsed, ATTEMPT_BUDGET_MS * (ASK_RETRIES + 1))}
              max={ATTEMPT_BUDGET_MS * (ASK_RETRIES + 1)}
              aria-label={tr(lang, "ความคืบหน้าของการค้น", "Search progress", "检索进度")}
            />
            <p className="micro">
              {state.attempt > 0
                ? tr(lang, "รอบแรกไม่กลับมา กำลังถามอีกครั้งหนึ่ง", "The first try did not come back. Asking once more.", "第一次没有返回。正在再问一次。")
                : state.position > 0
                  ? tr(lang, `อยู่ในคิวลำดับที่ ${state.position}`, `In queue · position ${state.position}`, `排队中 · 第${state.position}位`)
                  : tr(lang, "กำลังค้นตัวบทและเขียนคำตอบ", "Searching the law and writing.", "正在检索法条并撰写答案。")}
              {" · "}
              {tr(
                lang,
                `ครั้งที่ ${state.attempt + 1} จาก ${ASK_RETRIES + 1}`,
                `try ${state.attempt + 1} of ${ASK_RETRIES + 1}`,
                `第${state.attempt + 1}次，共${ASK_RETRIES + 1}次`,
              )}
              {" · "}
              {tr(lang, `${Math.round(elapsed / 1000)} วินาที`, `${Math.round(elapsed / 1000)}s`, `${Math.round(elapsed / 1000)}秒`)}
            </p>
          </div>
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
          {state.attempts > 1 && (
            <p className="micro">
              {tr(
                lang,
                `ถามซ้ำอัตโนมัติแล้วหนึ่งครั้ง รวม ${Math.round(state.elapsed / 1000)} วินาที`,
                `Asked again automatically once. ${Math.round(state.elapsed / 1000)}s in all.`,
                `已自动再问一次。一共${Math.round(state.elapsed / 1000)}秒。`,
              )}
            </p>
          )}
          <p className="ask-text">{rightsParts?.lead}</p>
          {rightsParts?.context && (
            <div className="ask-context">
              <p className="micro">
                {tr(lang, "จากคำค้น แยกไว้ต่างหาก", "From the search, set apart", "检索补充，另行列出")}
              </p>
              <p className="micro">{rightsParts.context}</p>
            </div>
          )}
          {confidenceText && <p className="micro">{confidenceText}</p>}
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
              <p lang={lang}>{sectionBody(n, lang)}</p>
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
          {(appendix?.deka ?? []).filter((d) => showRuling(d, topic)).map((d, i) => (
            <p className="micro" key={`d${i}`}>
              {d.url?.startsWith("https://") ? (
                <a href={d.url} target="_blank" rel="noopener noreferrer nofollow">
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
