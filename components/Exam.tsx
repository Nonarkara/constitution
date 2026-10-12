"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import questions from "@/data/questions.json";
import { chapters } from "@/lib/outline";
import { recordAnswer } from "@/lib/learning";
import { useStudy } from "./Provider";
import { tr, labels, sectionLabel } from "@/lib/i18n";

type Question = (typeof questions)[number];
const FORMATS = [
  { count: 25, minutes: 30 },
  { count: 50, minutes: 60 },
  { count: 100, minutes: 120 },
];
const letters = ["ก", "ข", "ค", "ง"];

/** A fair random draw: shuffle the whole bank, so chapters appear in proportion to their sections. */
function draw(count: number): Question[] {
  const bank = [...questions];
  for (let i = bank.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bank[i], bank[j]] = [bank[j], bank[i]];
  }
  return bank.slice(0, count);
}

const clock = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

// A timed, mixed test. Nothing is shown until the end, as in a real exam; then every
// answer counts as retrieval practice and the misses come back in spaced review.
export function Exam() {
  const { lang, progress, save } = useStudy();
  const [paper, setPaper] = useState<{ list: Question[]; ends: number } | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!paper || done) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [paper, done]);

  useEffect(() => {
    if (paper && !done) document.querySelector<HTMLElement>("#quiz-heading")?.focus();
  }, [index, paper, done]);

  const finish = () => {
    if (!paper || done) return;
    let p = progress;
    const at = Date.now();
    for (const q of paper.list) if (q.id in answers) p = recordAnswer(p, q, answers[q.id] === q.answer, at);
    save(p);
    setDone(true);
    window.scrollTo(0, 0);
  };
  useEffect(() => {
    if (paper && !done && now >= paper.ends) finish();
  });

  const result = useMemo(() => {
    if (!paper || !done) return null;
    const byChapter = new Map<number, { right: number; total: number }>();
    for (const q of paper.list) {
      const row = byChapter.get(q.chapter) ?? { right: 0, total: 0 };
      row.total++;
      if (answers[q.id] === q.answer) row.right++;
      byChapter.set(q.chapter, row);
    }
    const right = paper.list.filter((q) => answers[q.id] === q.answer).length;
    return { right, byChapter: [...byChapter].sort((a, b) => a[0] - b[0]) };
  }, [paper, done, answers]);

  if (!paper)
    return (
      <>
        <h1>{tr(lang, "ข้อสอบจำลอง", "Mock exam", "模拟考试")}</h1>
        <p>
          {tr(
            lang,
            `สุ่มจากคลัง ${questions.length} ข้อ ครอบคลุมทุกมาตรา จับเวลา ไม่เฉลยจนกว่าจะส่ง แล้วดูคะแนนแยกตามหมวด ข้อที่ผิดจะกลับมาในการทบทวน`,
            `Drawn from all ${questions.length} questions, covering every section. Timed, no answers until you submit, then a score by chapter. Misses come back in spaced review.`,
            `从覆盖全部条文的${questions.length}道题中随机抽取。计时作答，交卷前不显示答案，交卷后按章节显示得分，错题会进入间隔复习。`,
          )}
        </p>
        <p className="micro">
          {tr(
            lang,
            "ข้อฝึกเขียนขึ้นเพื่อการเรียน ไม่ใช่ข้อสอบจริงหรือสถิติข้อสอบ",
            "Questions are written for study; they are not real exam papers or exam statistics.",
            "题目为学习而编写，并非真实考题或考试统计。",
          )}
        </p>
        <div className="exam-formats">
          {FORMATS.map((f, i) => (
            <button
              key={f.count}
              className={i === 0 ? "primary" : ""}
              onClick={() => {
                setAnswers({});
                setIndex(0);
                setDone(false);
                setNow(Date.now());
                setPaper({ list: draw(f.count), ends: Date.now() + f.minutes * 60_000 });
              }}
            >
              {f.count} {tr(lang, "ข้อ", "questions", "题")} · {f.minutes} {tr(lang, "นาที", "min", "分钟")}
            </button>
          ))}
        </div>
      </>
    );

  if (done && result)
    return (
      <>
        <h1>
          {result.right} / {paper.list.length}
        </h1>
        <p>
          {tr(
            lang,
            `ตอบถูก ${Math.round((result.right / paper.list.length) * 100)}% ข้อที่ผิดอยู่ด้านล่าง พร้อมเหตุผลและมาตรา`,
            `${Math.round((result.right / paper.list.length) * 100)}% correct. Your misses are below, with reasons and sections.`,
            `正确率${Math.round((result.right / paper.list.length) * 100)}%。错题及解析、条文见下方。`,
          )}
        </p>
        <table className="exam-table">
          <thead>
            <tr>
              <th>{labels.chapter[lang]}</th>
              <th>{tr(lang, "ถูก", "Right", "正确")}</th>
            </tr>
          </thead>
          <tbody>
            {result.byChapter.map(([c, row]) => (
              <tr key={c}>
                <td>
                  {c === 17 ? "T" : c} · {chapters.find((h) => h.number === c)?.title[lang]}
                </td>
                <td className="mono">
                  {row.right}/{row.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paper.list
          .filter((q) => answers[q.id] !== q.answer)
          .map((q) => (
            <article className="reading-excerpt" key={q.id}>
              <h3>{q.prompt[lang]}</h3>
              <p className="micro">
                {q.id in answers
                  ? `${tr(lang, "คุณตอบ", "You answered", "你的答案")} ${letters[answers[q.id]]} · `
                  : `${tr(lang, "ไม่ได้ตอบ", "Not answered", "未作答")} · `}
                {tr(lang, "คำตอบ", "Answer", "答案")} {letters[q.answer]}. {q.choices[q.answer][lang]}
              </p>
              <p>{q.explanation[lang]}</p>
              <div>
                {q.sections.map((n) => (
                  <Link className="citation" key={n} href={`/read/?c=${chapters.find((c) => n >= c.start && n <= c.end)?.number}#s-${n}`}>
                    {sectionLabel(lang, n)} →
                  </Link>
                ))}
              </div>
            </article>
          ))}
        <button className="primary" onClick={() => setPaper(null)}>
          {tr(lang, "ทำชุดใหม่", "Take another", "再考一次")} →
        </button>
      </>
    );

  const q = paper.list[index];
  const answered = Object.keys(answers).length;
  return (
    <section className="quiz">
      <div className="section-heading">
        <span className="mono">
          {String(index + 1).padStart(2, "0")} / {String(paper.list.length).padStart(2, "0")}
        </span>
        <span className="mono" role="timer" aria-live="off">
          {clock(paper.ends - now)}
        </span>
      </div>
      <progress value={answered} max={paper.list.length} aria-label={tr(lang, "ตอบแล้ว", "Answered", "已答")} />
      <h1 id="quiz-heading" tabIndex={-1}>
        {q.prompt[lang]}
      </h1>
      <fieldset>
        <legend className="micro">{tr(lang, "เลือกคำตอบที่ถูกต้องที่สุด", "Choose the best answer", "选择最合适的答案")}</legend>
        {q.choices.map((c, i) => (
          <label className={"answer " + (answers[q.id] === i ? "selected" : "")} key={i}>
            <input type="radio" name={`exam-${q.id}`} checked={answers[q.id] === i} onChange={() => setAnswers({ ...answers, [q.id]: i })} />
            <span className="answer-letter mono">{letters[i]}</span>
            <span>{c[lang]}</span>
          </label>
        ))}
      </fieldset>
      <div className="reader-navigation">
        <button disabled={index === 0} onClick={() => setIndex(index - 1)}>
          ← {tr(lang, "ข้อก่อน", "Previous", "上一题")}
        </button>
        {index < paper.list.length - 1 ? (
          <button className="primary" onClick={() => setIndex(index + 1)}>
            {tr(lang, "ข้อถัดไป", "Next", "下一题")} →
          </button>
        ) : (
          <button className="primary" onClick={finish}>
            {tr(lang, "ส่งข้อสอบ", "Submit", "交卷")} →
          </button>
        )}
      </div>
      <button className="text-button" onClick={finish}>
        {tr(lang, `ส่งเลย (ตอบแล้ว ${answered} ข้อ)`, `Submit now (${answered} answered)`, `立即交卷（已答${answered}题）`)}
      </button>
    </section>
  );
}
