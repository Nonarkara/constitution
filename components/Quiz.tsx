"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import questions from "@/data/questions.json";
import cases from "@/data/cases.json";
import { sections, chapters, sectionBody } from "@/lib/corpus";
import { recordAnswer, lessonQueue } from "@/lib/learning";
import { chapterPuzzles } from "@/lib/puzzles";
import { choiceLetter, fisherYates } from "@/lib/shuffle";
import { sessionSummary } from "@/lib/session";
import { useStudy } from "./Provider";
import { tr, sectionLabel } from "@/lib/i18n";
import { Puzzle } from "./Puzzle";
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
  const lesson = chapter ? chapterPuzzles(cases, chapter) : [];
  const opening = ids
    ? ids.flatMap((id) => questions.filter((q) => q.id === id))
    : lessonQueue(questions, progress, chapter ?? 0, Date.now());
  const [list, setList] = useState<Question[]>(opening);
  const [firstTotal] = useState(opening.length);
  const [index, setIndex] = useState(0),
    [choice, setChoice] = useState<number | null>(null),
    [checked, setChecked] = useState(false),
    [read, setRead] = useState(!chapter),
    [correct, setCorrect] = useState(0),
    [puzzleAt, setPuzzleAt] = useState(0),
    [missed, setMissed] = useState<string[]>([]),
    [retried, setRetried] = useState(false),
    [order, setOrder] = useState<number[]>(() =>
      fisherYates(opening[0]?.choices.map((_, i) => i) ?? []),
    );
  const puzzle = lesson[puzzleAt] ?? null;
  const q = list[index];
  const readSections = [
    ...new Set(lesson.flatMap((item) => item.sections)),
  ].sort((a, b) => a - b);
  useEffect(() => {
    document.querySelector<HTMLElement>("#quiz-heading")?.focus();
  }, [index, read, puzzleAt]);
  if (puzzle)
    return (
      <Puzzle
        key={puzzle.id}
        item={puzzle}
        onDone={() => setPuzzleAt((n) => n + 1)}
      />
    );
  if (!q)
    return (
      <section className="complete">
        <span className="mono">
          {tr(lang, "จบรอบนี้", "Session complete", "本轮结束")}
        </span>
        <h1 id="quiz-heading" tabIndex={-1}>
          {tr(
            lang,
            "วันนี้ได้เพิ่มอีกนิดแล้ว",
            "Another small step, done.",
            "今天又前进了一点。",
          )}
        </h1>
        <p>{sessionSummary(correct, firstTotal, lang)}</p>
        <button className="primary" onClick={onExit}>
          {tr(lang, "กลับสู่เส้นทาง", "Back to your path", "返回学习路径")} →
        </button>
      </section>
    );
  const related = sections.filter((s) =>
    (read ? q.sections : readSections).includes(s.number),
  );
  if (!read)
    return (
      <section>
        <span className="mono">
          {tr(lang, "อ่านได้ ถ้าต้องการ", "Read, if you want", "想读就可以读")}
          {" · "}
          {chapters.find((c) => c.number === chapter)?.title[lang]}
        </span>
        <h1 id="quiz-heading" tabIndex={-1}>
          {tr(
            lang,
            "มาตราที่ใช้ในโจทย์",
            "The sections behind the puzzle",
            "题目用到的条文",
          )}
        </h1>
        <p>
          {tr(
            lang,
            "คุณเดาไปแล้ว การอ่านไม่ใช่ประตูที่ล็อกข้อสอบ อ่านมาตราเหล่านี้ หรือไปตอบได้เลย",
            "You have already guessed. Reading is not a gate. Read these sections, or go straight to the questions.",
            "你已经猜过了。阅读不是一道门锁。可以读这些条文，也可以直接作答。",
          )}
        </p>
        {related.map((s) => (
          <div className="reading-excerpt" key={s.number}>
            <h2>{sectionLabel(lang, s.number)}</h2>
            <p lang={lang}>{sectionBody(s.number, lang)}</p>
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
          {tr(lang, "ไปตอบคำถาม", "Go to the questions", "去回答")} →
        </button>
        <button className="text-button" onClick={() => setRead(true)}>
          {tr(lang, "ข้ามการอ่าน", "Skip the reading", "跳过阅读")}
        </button>
      </section>
    );
  const openLaw = sections.filter((s) => q.sections.includes(s.number));
  const check = () => {
    if (choice === null || checked) return;
    const picked = order[choice];
    const ok = picked === q.answer;
    save(recordAnswer(progress, q, ok, Date.now()));
    if (ok && index < firstTotal) setCorrect((x) => x + 1);
    if (!ok && !retried) setMissed((ids) => (ids.includes(q.id) ? ids : [...ids, q.id]));
    setChecked(true);
  };
  const advance = () => {
    const more = index < list.length - 1;
    if (!more && !retried && (missed.length > 0 || (choice !== null && order[choice] !== q.answer && !missed.includes(q.id)))) {
      const ids = missed.includes(q.id) || (choice !== null && order[choice] === q.answer) ? missed : [...missed, q.id];
      const extra = ids
        .map((id) => questions.find((item) => item.id === id))
        .filter((item): item is Question => Boolean(item));
      if (extra.length) {
        const next = [...list, ...extra];
        setList(next);
        setRetried(true);
        setIndex(index + 1);
        setOrder(fisherYates(next[index + 1].choices.map((_, i) => i)));
        setChoice(null);
        setChecked(false);
        return;
      }
    }
    const following = list[index + 1];
    setIndex(index + 1);
    if (following) setOrder(fisherYates(following.choices.map((_, i) => i)));
    setChoice(null);
    setChecked(false);
  };
  return (
    <section className="quiz">
      <div className="section-heading">
        <span className="mono">
          {tr(
            lang,
            `ทบทวน ${String(index + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`,
            `Recall ${String(index + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`,
            `回忆 ${String(index + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`,
          )}
        </span>
        <span className="micro">
          {tr(lang, "ไม่จับเวลา", "No timer", "不限时")}
        </span>
      </div>
      <progress
        value={index}
        max={list.length}
        aria-label={tr(lang, "ความก้าวหน้าในรอบนี้", "Session progress", "本次练习进度")}
      />
      <h1 id="quiz-heading" tabIndex={-1}>
        {q.prompt[lang]}
      </h1>
      <fieldset disabled={checked}>
        <legend className="micro">
          {tr(lang, "เลือกคำตอบที่ถูกต้องที่สุด", "Choose the best answer", "选择最合适的答案")}
        </legend>
        {order.map((original, display) => {
          const picked = choice !== null && order[choice] === original;
          const right = checked && original === q.answer;
          const wrong = checked && picked && original !== q.answer;
          return (
            <label
              className={
                "answer " +
                (choice === display ? "selected " : "") +
                (right ? "answer-correct " : "") +
                (wrong ? "answer-wrong" : "")
              }
              key={original}
            >
              <input
                type="radio"
                name={`question-${q.id}-${index}`}
                value={display}
                checked={choice === display}
                onChange={() => setChoice(display)}
              />
              <span className="answer-letter mono">{choiceLetter(lang, display)}</span>
              <span>{q.choices[original][lang]}</span>
              {right && (
                <span aria-label={tr(lang, "คำตอบถูกต้อง", "Correct answer", "正确答案")}>✓</span>
              )}
              {wrong && (
                <span aria-label={tr(lang, "คำตอบที่เลือกผิด", "The choice that missed", "选错的一项")}>
                  ×
                </span>
              )}
            </label>
          );
        })}
      </fieldset>
      {!checked ? (
        <button className="primary" disabled={choice === null} onClick={check}>
          {tr(lang, "ตรวจคำตอบ", "Check answer", "检查答案")} →
        </button>
      ) : (
        <>
          <div className="feedback" role="status">
            <strong>
              {order[choice ?? 0] === q.answer
                ? tr(lang, "ถูกต้อง เข้าใจจุดนี้แล้ว", "Correct. You’ve got this idea.", "答对了，你理解了这个概念。")
                : tr(
                    lang,
                    `ยังไม่ใช่ คุณเลือก ${choiceLetter(lang, choice ?? 0)}`,
                    `Not yet. You chose ${choiceLetter(lang, choice ?? 0)}.`,
                    `还不对。你选的是${choiceLetter(lang, choice ?? 0)}。`,
                  )}
            </strong>
            <p>{q.explanation[lang]}</p>
            {"hook" in q && q.hook ? <p>{q.hook[lang]}</p> : null}
            {q.sections.some((n) => annotations[n]?.note) && (
              <div className="note" style={{ margin: "12px 0", borderLeft: "3px solid var(--accent)" }}>
                <strong className="micro">
                  {tr(lang, "บันทึกช่วยจำของคุณในมาตรานี้", "Your note on this section", "你在这条上的笔记")}
                </strong>
                <p style={{ margin: "4px 0 0" }}>
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
          <button className="primary" onClick={advance}>
            {index === list.length - 1 && (retried || missed.length === 0)
              ? tr(lang, "ดูผลรอบนี้", "Finish session", "查看结果")
              : tr(lang, "ข้อต่อไป", "Next question", "下一题")}{" "}
            →
          </button>
        </>
      )}
      <details className="quiz-law">
        <summary>
          {tr(lang, "เปิดมาตราที่เกี่ยวข้อง", "Open the relevant law", "查看相关条文")}
        </summary>
        {openLaw.map((s) => (
          <div className="reading-excerpt" key={s.number}>
            <h3>{sectionLabel(lang, s.number)}</h3>
            <p lang="th">{s.th}</p>
          </div>
        ))}
      </details>
    </section>
  );
}
