"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { sections as corpus } from "@/lib/corpus";
import { useStudy } from "./Provider";
import { tr, sectionLabel } from "@/lib/i18n";
import {
  ASK_ORIGIN,
  askRequest,
  classify,
  consentCopy,
  deepLink,
  friendlyAskError,
  groundedLabel,
  localConstitution,
  looksLikeProviderError,
  outcomeError,
  pollDelay,
  POLL_LIMIT,
  presentAnswer,
  readGrounded,
  readSources,
  showGroundedMark,
  studyDisclaimer,
} from "@/lib/ask";

type Statute = { cite?: string; law?: string; section?: string; text?: string };
type Deka = { caseId?: string; year?: string; headnote?: string; url?: string };
type Answer = {
  answer: string;
  grounded?: boolean;
  sources?: { title?: string; url?: string }[];
  final?: { grounded?: boolean; sources?: { title?: string; url?: string }[] };
  appendix?: { disclaimer?: string; statutes?: Statute[]; deka?: Deka[] } | null;
};
type State =
  | { kind: "idle" }
  | { kind: "waiting"; position: number }
  | { kind: "done"; result: Answer }
  | { kind: "error"; message: string; link: boolean };

// Questions the notebook cannot answer go to Non-Laws, which retrieves real
// statutes and Supreme Court rulings. Sections being read travel as numbers only.
export function Ask({ sections = [], initial = "" }: { sections?: number[]; initial?: string }) {
  const { lang } = useStudy();
  const [question, setQuestion] = useState(initial),
    [consent, setConsent] = useState(false),
    [state, setState] = useState<State>({ kind: "idle" });
  const run = useRef(0);
  useEffect(() => () => void run.current++, []);
  useEffect(() => setQuestion(initial), [initial]);
  const length = question.trim().length;
  const busy = state.kind === "waiting";
  const fail = (message: string, link = true) => setState({ kind: "error", message, link });

  async function ask() {
    const mine = ++run.current;
    if (!navigator.onLine) return fail(friendlyAskError("offline", lang));
    setState({ kind: "waiting", position: 0 });
    let res: Response;
    try {
      res = await fetch(`${ASK_ORIGIN}/api/laws`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(askRequest(question, lang, sections)),
      });
    } catch {
      return fail(friendlyAskError("unreachable", lang));
    }
    const body = await res.json().catch(() => ({}));
    const outcome = classify(res.status, body);
    if (outcome !== "accepted") return fail(outcomeError(outcome, lang));
    for (let attempt = 0; attempt < POLL_LIMIT; attempt++) {
      await new Promise((r) => setTimeout(r, pollDelay(attempt)));
      if (run.current !== mine) return;
      try {
        const poll = await fetch(`${ASK_ORIGIN}/api/ask/${encodeURIComponent(body.id)}`);
        const job = await poll.json();
        if (run.current !== mine) return;
        if (!poll.ok || job.error) {
          const raw = String(job.error ?? "");
          return fail(friendlyAskError(looksLikeProviderError(raw) ? "rate" : "lost", lang));
        }
        if (job.status === "done") {
          if (looksLikeProviderError(String(job.answer ?? "")))
            return fail(friendlyAskError("rate", lang));
          return setState({ kind: "done", result: job });
        }
        setState({ kind: "waiting", position: Number(job.position) || 0 });
      } catch {
        return fail(friendlyAskError("lost", lang));
      }
    }
    fail(friendlyAskError("timeout", lang));
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
