"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import cases from "@/data/cases.json";
import { useStudy } from "./Provider";
import { tr, sectionLabel } from "@/lib/i18n";
export type Case = (typeof cases)[number];

// A guess before reading primes the law to stick. It is never scored or stored:
// a pre-reading guess is not retrieval, so it must not touch mastery or review.
export function Puzzle({
  item,
  onDone,
  doneLabel,
}: {
  item: Case;
  onDone: () => void;
  doneLabel?: string;
}) {
  const { lang } = useStudy();
  const [guess, setGuess] = useState<number | null>(null),
    [revealed, setRevealed] = useState(false);
  useEffect(() => {
    document.querySelector<HTMLElement>("#puzzle-heading")?.focus();
  }, [revealed]);
  const letter = (i: number) => ["ก", "ข", "ค", "ง"][i];
  if (!revealed)
    return (
      <section className="quiz">
        <span className="mono">PUZZLE · BEFORE YOU READ</span>
        <h1 id="puzzle-heading" tabIndex={-1}>
          {item.prompt[lang]}
        </h1>
        <fieldset>
          <legend className="micro">
            {tr(
              lang,
              "เดาก่อนอ่าน ผิดได้ ไม่มีคะแนน",
              "Guess before you read. Wrong is fine; nothing is scored.",
              "先猜再读。猜错没关系，不计分。",
            )}
          </legend>
          {item.choices.map((c, i) => (
            <label className={"answer " + (guess === i ? "selected" : "")} key={i}>
              <input
                type="radio"
                name={`puzzle-${item.id}`}
                checked={guess === i}
                onChange={() => setGuess(i)}
              />
              <span className="answer-letter mono">{letter(i)}</span>
              <span>{c[lang]}</span>
            </label>
          ))}
        </fieldset>
        <button className="primary" disabled={guess === null} onClick={() => setRevealed(true)}>
          {tr(lang, "ยืนยันคำเดา", "Commit my guess", "确定我的猜测")} →
        </button>
        <button className="text-button" onClick={onDone}>
          {tr(lang, "ข้ามไปอ่านกฎหมาย", "Skip to the law", "跳过，直接读条文")}
        </button>
      </section>
    );
  return (
    <section className="quiz">
      <span className="mono">PUZZLE · WHAT THE LAW SAYS</span>
      <h1 id="puzzle-heading" tabIndex={-1}>
        {item.choices[item.answer][lang]}
      </h1>
      <div className="feedback" role="status">
        <strong>
          {guess === item.answer
            ? tr(lang, "เดาตรงกับตัวบท", "Your guess matches the text.", "你的猜测与条文一致。")
            : tr(
                lang,
                `คุณเดา ${letter(guess ?? 0)} ตัวบทว่าอีกอย่าง ความแปลกใจนี้แหละที่ช่วยให้จำ`,
                `You guessed ${letter(guess ?? 0)}. The text says otherwise, and that surprise is what helps it stick.`,
                `你猜的是${letter(guess ?? 0)}，条文另有规定。正是这份意外让人记得住。`,
              )}
        </strong>
        <p>{item.story[lang]}</p>
      </div>
      {item.quotes.map((q) => (
        <div className="reading-excerpt" key={q.th}>
          <h2>{sectionLabel(lang, q.section)}</h2>
          <p lang="th">{q.th}</p>
        </div>
      ))}
      <details className="quiz-law">
        <summary>
          {tr(
            lang,
            "ทำไมถึงเขียนไว้แบบนี้ ลองคิดก่อนแล้วค่อยเปิด",
            "Why would it be written this way? Think first, then open.",
            "为什么要这样写？先想一想，再打开。",
          )}
        </summary>
        <p>{item.why[lang]}</p>
      </details>
      <div>
        {item.sections.map((n) => (
          <Link className="citation" href={`/section/?n=${n}`} key={n}>
            {sectionLabel(lang, n)} ↗
          </Link>
        ))}
      </div>
      <p className="micro">
        {tr(
          lang,
          "สื่อการเรียน ไม่ใช่คำแนะนำทางกฎหมาย ตัวบทภาษาไทยเป็นหลัก",
          "Study material, not legal advice. The Thai legal text prevails.",
          "学习材料，并非法律意见。以泰文法条为准。",
        )}
      </p>
      <button className="primary" onClick={onDone}>
        {doneLabel ??
          tr(lang, "อ่านมาตรา แล้วฝึกตอบ", "Read the sections, then practise", "阅读条文，然后练习")}{" "}
        →
      </button>
    </section>
  );
}
