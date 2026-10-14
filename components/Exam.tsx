"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import questions from "@/data/questions.json";
import { chapters } from "@/lib/outline";
import { papers, makePaper } from "@/lib/papers";
import { choiceLetter } from "@/lib/shuffle";
import { ExplainBack } from "./LearningCoach";
import { TeachingSteps } from "./TeachingSteps";
import { Quiz } from "./Quiz";
import { recordAnswer } from "@/lib/learning";
import { useStudy } from "./Provider";
import { tr, labels, sectionLabel } from "@/lib/i18n";

type Question = (typeof questions)[number];
const FORMATS = papers;
const clock = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

// A timed, mixed test. Nothing is shown until the end, as in a real exam; then every
// answer counts as retrieval practice and the misses come back in spaced review.
export function Exam() {
  const { lang, progress, save, ready } = useStudy();
  const [repair, setRepair] = useState<string[] | null>(null);
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
    const blanks = paper.list.filter(q => !(q.id in answers)).length;
    return { right, blanks, wrong: paper.list.length - right - blanks, byChapter: [...byChapter].sort((a, b) => a[0] - b[0]) };
  }, [paper, done, answers]);

  if (repair) return <Quiz ids={repair} onExit={() => setRepair(null)}/>;
  if (!paper)
    return (
      <>
        <h1>{tr(lang, "ข้อสอบจำลอง", "Mock exam", "模拟考试")}</h1>
        <p>
          {tr(
            lang,
            `30 ชุดฝึกจากโจทย์เขียนเอง ${questions.length} ข้อ คลังครอบคลุมทุกมาตรา แต่แต่ละชุดเป็นการสุ่มตัวอย่าง ชุดเน้นเรื่องมีโจทย์หมวดอื่นเสริม เฉลยหลังส่ง ข้อที่ตอบผิดจะเข้าคิวทบทวน ข้อว่างยังไม่นับว่าลองตอบ`,
            `30 study papers from ${questions.length} authored questions. The bank covers every section; each paper samples it. Topic papers include mixed supplements. Answers appear after submission. Wrong submitted answers enter review; blanks remain unattempted.`,
            `30套练习卷来自${questions.length}道原创题。题库覆盖全部条文，每套只是抽样；主题卷补充其他章节。交卷后显示解析。已答错题进入复习，空白题仍算未尝试。`,
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
        <p className="notice">{tr(lang,"ชุดจับเวลาทั้ง 30 ชุดนี้ใช้คลังรัฐธรรมนูญ ส่วน 90 คำถามนายอำเภอและท้องถิ่นเป็นแบบฝึกเสริมแยก ไม่รวมในคะแนนหรือเกณฑ์ผ่านหมวด","These 30 timed papers use the Constitution bank. The 90 district-chief and local topics are separate, unscored extras and do not change chapter mastery.","这30套计时卷使用宪法题库。90道县长与地方考试题为单独、不计分的补充题，不改变章节掌握标准。")}</p>
        <p><Link href="/along/">{tr(lang,"ลองแนวข้อสอบเสริม","Try the extra exam topics","试做补充题")} →</Link> · <Link href="/bible/exam-method/">{tr(lang,"อ่านวิธีทำข้อสอบ","Read the exam method","阅读答题方法")} →</Link></p>
        <div className="exam-formats">
          {FORMATS.map((f, i) => (
            <button
              key={f.id}
              disabled={!ready}
              className={"exam-paper-card" + (i === 0 ? " primary" : "")}
              onClick={() => {
                setAnswers({});
                setIndex(0);
                setDone(false);
                setNow(Date.now());
                setPaper({ list: makePaper(questions, f), ends: Date.now() + f.minutes * 60_000 });
              }}
            >
              <div className="paper-card-top">
                <span className="mono paper-card-num">
                  {tr(
                    lang,
                    `ชุดที่ ${String(f.number).padStart(2, "0")}`,
                    `Paper ${String(f.number).padStart(2, "0")}`,
                    `第${String(f.number).padStart(2, "0")}套`,
                  )}
                </span>
                <span className="paper-card-time mono">
                  {f.minutes} {tr(lang, "นาที", "min", "分钟")}
                </span>
              </div>
              <div className="paper-card-title">{f.title[lang]}</div>
              <div className="paper-card-meta micro">
                {f.count}{" "}
                {tr(
                  lang,
                  "ข้อสอบจับเวลา",
                  "timed questions",
                  "道计时题",
                )}{" "}
                ·{" "}
                {tr(
                  lang,
                  "เฉลยหลังส่ง",
                  "solutions at end",
                  "交卷后解析",
                )}
              </div>
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
        <p>{tr(lang, `ตอบผิด ${result.wrong} ข้อ · ยังไม่ตอบ ${result.blanks} ข้อ`, `${result.wrong} wrong answers · ${result.blanks} unanswered`, `答错${result.wrong}题 · 未答${result.blanks}题`)}</p>
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
        <p>{tr(lang,"ข้อที่ยังไม่ตอบจะเข้าการฝึกเมื่อคุณเลือกลอง ไม่ให้คะแนนการเรียนจากการเว้นว่าง","Unanswered questions stay unattempted until you practise them.","未作答题在实际练习前仍算未尝试。")}</p>
        <button onClick={()=>setRepair(paper.list.filter(q=>answers[q.id]!==q.answer).map(q=>q.id))}>{tr(lang,"ฝึกข้อที่ผิดและข้อที่ยังไม่ตอบ","Practise wrong and unanswered questions","练习错题与未答题")} →</button>
        {paper.list
          .filter((q) => answers[q.id] !== q.answer)
          .map((q) => (
            <article className="reading-excerpt" key={q.id}>
              <h3>{q.prompt[lang]}</h3>
              <p className="micro">
                {q.id in answers
                  ? `${tr(lang, "คุณตอบ", "You answered", "你的答案")} ${choiceLetter(lang,answers[q.id])} · `
                  : `${tr(lang, "ไม่ได้ตอบ", "Not answered", "未作答")} · `}
                {tr(lang, "คำตอบ", "Answer", "答案")} {choiceLetter(lang,q.answer)}. {q.choices[q.answer][lang]}
              </p>
              <p>{q.explanation[lang]}</p>
              <TeachingSteps question={q} selected={answers[q.id]}/>
              <ExplainBack section={q.sections[0]}/>
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
            <span className="answer-letter mono">{choiceLetter(lang,i)}</span>
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
