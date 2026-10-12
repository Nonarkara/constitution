"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import questions from "@/data/questions.json";
import cases from "@/data/cases.json";
import { Puzzle } from "./Puzzle";
import { sections, chapters, chineseText, readingText } from "@/lib/corpus";
import { recordAnswer, lessonQueue } from "@/lib/learning";
import { useStudy } from "./Provider";
import { tr, labels, sectionLabel } from "@/lib/i18n";
type Question = (typeof questions)[number];
export function Quiz({
  chapter,
  ids,
  onExit,
}: {
  chapter?: number;
  ids?: string[];
  onExit: () => void;
}) {
  const { lang, progress, save, annotations } = useStudy();
  const [list] = useState<Question[]>(() =>
    ids
      ? ids.flatMap((id) => questions.filter((q) => q.id === id))
      : lessonQueue(questions, progress, chapter ?? 0, Date.now()),
  );
  const [index, setIndex] = useState(0),
    [choice, setChoice] = useState<number | null>(null),
    [checked, setChecked] = useState(false),
    [read, setRead] = useState(!chapter),
    [correct, setCorrect] = useState(0);
  // Chapter lessons open with a real-life puzzle; review sessions stay pure retrieval.
  const [puzzle, setPuzzle] = useState(() => {
    const own = chapter ? cases.filter((c) => c.chapter === chapter) : [];
    return own.length ? own[Math.floor(Math.random() * own.length)] : null;
  });
  const q = list[index];
  useEffect(() => {
    document.querySelector<HTMLElement>("#quiz-heading")?.focus();
  }, [index, read, puzzle]);
  if (puzzle) return <Puzzle item={puzzle} onDone={() => setPuzzle(null)} />;
  if (!q)
    return (
      <section className="complete">
        <span className="mono">SESSION COMPLETE</span>
        <h1>
          {tr(
            lang,
            "วันนี้ได้เพิ่มอีกนิดแล้ว",
            "Another small step, done.",
            "今天又前进了一点。",
          )}
        </h1>
        <p>
          {tr(
            lang,
            `ตอบถูก ${correct} จาก ${list.length} ข้อ อ่านคำอธิบายแล้วกลับมาลองใหม่ได้`,
            `${correct} of ${list.length} correct. You can return to the explanations and try again.`,
            `${list.length}题中答对${correct}题。可以回看解析，再试一次。`,
          )}
        </p>
        <button className="primary" onClick={onExit}>
          {tr(lang, "กลับสู่เส้นทาง", "Back to your path", "返回学习路径")} →
        </button>
      </section>
    );
  const related = sections.filter((s) => q.sections.includes(s.number));
  if (!read)
    return (
      <section>
        <span className="mono">
          READ FIRST · {chapters.find((c) => c.number === chapter)?.title[lang]}
        </span>
        <h1 id="quiz-heading" tabIndex={-1}>
          {tr(
            lang,
            "อ่านก่อน แล้วลองนึก",
            "Read it. Then recall it.",
            "先阅读，再回忆。",
          )}
        </h1>
        <p>
          {tr(
            lang,
            "เริ่มด้วยมาตราแรกที่ใช้ในบทเรียนนี้ ก่อนฝึกตอบสถานการณ์",
            "Start with the sections behind the first question. Then try a scenario.",
            "先读第一题涉及的条文，再做情境练习。",
          )}
        </p>
        {related.map((s) => (
          <div className="reading-excerpt" key={s.number}>
            <h2>{sectionLabel(lang, s.number)}</h2>
            <p lang={lang}>{readingText(s.number, lang)}</p>
            {lang === "zh" && (
              <p className="micro">中文学习译文，以泰文原文为准。</p>
            )}
            {lang === "en" && s.amended && (
              <p className="notice">
                Historical 2017 English. Read the amended Thai text before
                relying on this section.
              </p>
            )}
            <Link href={`/section/?n=${s.number}`}>
              {tr(
                lang,
                "อ่านเทียบภาษาและฟัง",
                "Compare languages and listen",
                "对照阅读与朗读",
              )}{" "}
              ↗
            </Link>
          </div>
        ))}
        <button className="primary" onClick={() => setRead(true)}>
          {tr(lang, "พร้อมลองตอบแล้ว", "Ready to recall", "开始练习")} →
        </button>
      </section>
    );
  const check = () => {
    if (choice === null || checked) return;
    const ok = choice === q.answer;
    save(recordAnswer(progress, q, ok, Date.now()));
    if (ok) setCorrect((x) => x + 1);
    setChecked(true);
  };
  return (
    <section className="quiz">
      <div className="section-heading">
        <span className="mono">
          RECALL / {String(index + 1).padStart(2, "0")} OF{" "}
          {String(list.length).padStart(2, "0")}
        </span>
        <span className="micro">
          {tr(lang, "ไม่จับเวลา", "No timer", "不限时")}
        </span>
      </div>
      <progress
        value={index}
        max={list.length}
        aria-label={tr(
          lang,
          "ความก้าวหน้าในรอบนี้",
          "Session progress",
          "本次练习进度",
        )}
      />
      <h1 id="quiz-heading" tabIndex={-1}>
        {q.prompt[lang]}
      </h1>
      <fieldset disabled={checked}>
        <legend className="micro">
          {tr(
            lang,
            "เลือกคำตอบที่ถูกต้องที่สุด",
            "Choose the best answer",
            "选择最合适的答案",
          )}
        </legend>
        {q.choices.map((c, i) => (
          <label
            className={
              "answer " +
              (choice === i ? "selected " : "") +
              (checked && i === q.answer ? "answer-correct" : "")
            }
            key={i}
          >
            <input
              type="radio"
              name={`question-${q.id}`}
              value={i}
              checked={choice === i}
              onChange={() => setChoice(i)}
            />
            <span className="answer-letter mono">
              {["ก", "ข", "ค", "ง"][i]}
            </span>
            <span>{c[lang]}</span>
            {checked && i === q.answer && (
              <span
                aria-label={tr(
                  lang,
                  "คำตอบถูกต้อง",
                  "Correct answer",
                  "正确答案",
                )}
              >
                ✓
              </span>
            )}
          </label>
        ))}
      </fieldset>
      {!checked ? (
        <button className="primary" disabled={choice === null} onClick={check}>
          {tr(lang, "ตรวจคำตอบ", "Check answer", "检查答案")} →
        </button>
      ) : (
        <>
          <div className="feedback" role="status">
            <strong>
              {choice === q.answer
                ? tr(
                    lang,
                    "ถูกต้อง เข้าใจจุดนี้แล้ว",
                    "Correct. You’ve got this idea.",
                    "答对了，你理解了这个概念。",
                  )
                : tr(
                    lang,
                    "ยังไม่ใช่ ลองดูเหตุผลกัน",
                    "Not yet. Let’s look at why.",
                    "还不对，一起看看原因。",
                  )}
            </strong>
            <p>{q.explanation[lang]}</p>
            {q.sections.some((n) => annotations[n]?.note) && (
              <div className="note" style={{ margin: "12px 0", borderLeft: "3px solid var(--accent)" }}>
                <strong className="micro">
                  ✍️ {tr(
                    lang,
                    "บันทึกช่วยจำของคุณในมาตรานี้:",
                    "Your personal note for this section:",
                    "您在相关法条记录的笔记:",
                  )}
                </strong>
                <p style={{ margin: "4px 0 0", fontStyle: "italic" }}>
                  {q.sections.map((n) => annotations[n]?.note).filter(Boolean).join(" · ")}
                </p>
              </div>
            )}
            <div>
              {q.sections.map((n) => (
                <Link className="citation" href={`/section/?n=${n}`} key={n}>
                  {sectionLabel(lang, n)} ↗
                </Link>
              ))}
            </div>
          </div>
          <button
            className="primary"
            onClick={() => {
              setIndex((i) => i + 1);
              setChoice(null);
              setChecked(false);
            }}
          >
            {index === list.length - 1
              ? tr(lang, "ดูผลรอบนี้", "Finish session", "查看结果")
              : tr(lang, "ข้อต่อไป", "Next question", "下一题")}{" "}
            →
          </button>
        </>
      )}
      <details className="quiz-law">
        <summary>
          {tr(
            lang,
            "เปิดมาตราที่เกี่ยวข้อง",
            "Open the relevant law",
            "查看相关条文",
          )}
        </summary>
        {related.map((s) => (
          <div className="reading-excerpt" key={s.number}>
            <h3>{sectionLabel(lang, s.number)}</h3>
            <p lang="th">{s.th}</p>
          </div>
        ))}
      </details>
    </section>
  );
}
