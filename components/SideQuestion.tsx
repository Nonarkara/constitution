"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useStudy } from "./Provider";
import { choiceLetter, fisherYates } from "@/lib/shuffle";
import { sectionLabel, tr } from "@/lib/i18n";
import { SIDE_SEEN_KEY, type SideQuestion } from "@/lib/side";

// "2025-04" → "เม.ย. 2568" / "Apr 2025" / "2025年4月": dates read the way each reader counts years.
function asOfLabel(asOf: string, lang: "th" | "en" | "zh") {
  const [y, m] = asOf.split("-").map(Number);
  if (lang === "zh") return m ? `${y}年${m}月` : `${y}年`;
  const month = m ? new Date(Date.UTC(y, m - 1, 1)).toLocaleString(lang === "th" ? "th-TH" : "en-GB", { month: "short", timeZone: "UTC" }) + " " : "";
  return month + (lang === "th" ? y + 543 : y);
}
export function rememberSide(id: string) {
  try {
    const seen: string[] = JSON.parse(localStorage.getItem(SIDE_SEEN_KEY) ?? "[]");
    if (!seen.includes(id)) localStorage.setItem(SIDE_SEEN_KEY, JSON.stringify([...seen, id]));
  } catch {
    // Storage blocked: she may meet the same question again, nothing worse.
  }
}
export function seenSide(): string[] {
  try {
    const seen = JSON.parse(localStorage.getItem(SIDE_SEEN_KEY) ?? "[]");
    return Array.isArray(seen) ? seen.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** One exam question met along the way. Guess, check, read why; it never touches the score. */
export function SideQuestionCard({ q, onDone, doneLabel }: { q: SideQuestion; onDone: () => void; doneLabel?: string }) {
  const { lang } = useStudy();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [q.id]);
  const [order] = useState(() => fisherYates(q.choices.map((_, i) => i)));
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const finish = () => {
    rememberSide(q.id);
    onDone();
  };
  return (
    <section className="side-question">
      <p className="side-kicker micro">
        {tr(lang, "คำถามข้างทาง · แนวข้อสอบนายอำเภอและท้องถิ่น · ไม่นับคะแนน", "Along the way · district-chief and local-government exam topics · not scored", "沿途一题 · 县长与地方公务员考试题型 · 不计分")}
        {q.sections.length === 0 && tr(lang, " · นอกตัวบทรัฐธรรมนูญ", " · beyond the constitution", " · 宪法以外")}
      </p>
      <h1 ref={heading} id="quiz-heading" tabIndex={-1}>
        {q.prompt[lang]}
      </h1>
      <fieldset disabled={checked}>
        <legend className="micro">{tr(lang, "เลือกคำตอบที่ถูกต้องที่สุด", "Choose the best answer", "选择最合适的答案")}</legend>
        {order.map((original, display) => {
          const right = checked && original === q.answer;
          const wrong = checked && choice === display && original !== q.answer;
          return (
            <label className={"answer " + (choice === display ? "selected " : "") + (right ? "answer-correct " : "") + (wrong ? "answer-wrong" : "")} key={original}>
              <input type="radio" name={`side-${q.id}`} checked={choice === display} onChange={() => setChoice(display)} />
              <span className="answer-letter mono">{choiceLetter(lang, display)}</span>
              <span>{q.choices[original][lang]}</span>
              {right && <span aria-label={tr(lang, "คำตอบถูกต้อง", "Correct answer", "正确答案")}>✓</span>}
              {wrong && <span aria-label={tr(lang, "คำตอบที่เลือกผิด", "The choice that missed", "选错的一项")}>×</span>}
            </label>
          );
        })}
      </fieldset>
      {!checked ? (
        <div className="side-actions">
          <button className="primary" disabled={choice === null} onClick={() => setChecked(true)}>
            {tr(lang, "ตรวจคำตอบ", "Check answer", "检查答案")} →
          </button>
          <button className="text-button" onClick={finish}>
            {tr(lang, "ข้ามข้อนี้", "Skip this one", "跳过")}
          </button>
        </div>
      ) : (
        <>
          <div className="feedback" role="status">
            <strong>
              {choice !== null && order[choice] === q.answer
                ? tr(lang, "ตอบถูก มาดูเหตุผล", "Correct. Now check the reasoning.", "答对了，再核对理由。")
                : tr(lang, "ยังไม่ใช่ มาดูเหตุผล", "Not this time. Here is why.", "这次没答对，看看理由。")}
            </strong>
            <p>{q.explanation[lang]}</p>
            {q.sections.length > 0 && (
              <div>
                {q.sections.map((n) => (
                  <Link className="citation" href={`/section/?n=${n}`} key={n}>
                    {sectionLabel(lang, n)} →
                  </Link>
                ))}
              </div>
            )}
            {q.source && (
              <p className="micro">
                {tr(lang, "ที่มา", "Source", "来源")}:{" "}
                <a href={q.source.url} target="_blank" rel="noreferrer">
                  {q.source.title} ↗
                </a>{" "}
                · {tr(lang, `ข้อมูล ณ ${asOfLabel(q.source.asOf, "th")}`, `as of ${asOfLabel(q.source.asOf, "en")}`, `截至 ${asOfLabel(q.source.asOf, "zh")}`)}
                {q.kind === "current" && tr(lang, " · ตัวเลขนี้เปลี่ยนได้ ตรวจกับแหล่งล่าสุดก่อนสอบ", " · this can change; check the latest source before the exam", " · 数据可能更新，考前请核对最新来源")}
              </p>
            )}
          </div>
          <button className="primary" onClick={finish}>
            {doneLabel ?? tr(lang, "กลับสู่บทเรียน", "Back to the lesson", "回到课程")} →
          </button>
        </>
      )}
    </section>
  );
}
