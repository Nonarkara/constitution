"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import cases from "@/data/cases.json";
import { sections } from "@/lib/corpus";
import { choiceLetter, fisherYates } from "@/lib/shuffle";
import { quoteFrame } from "@/lib/quotes";
import { useStudy } from "./Provider";
import { tr, sectionLabel } from "@/lib/i18n";
import { RuleDiagram } from "./RuleDiagram";
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
  const [order] = useState(() => fisherYates(item.choices.map((_, i) => i)));
  const [guess, setGuess] = useState<number | null>(null),
    [revealed, setRevealed] = useState(false);
  useEffect(() => {
    document.querySelector<HTMLElement>("#puzzle-heading")?.focus();
  }, [revealed]);
  const letter = (displayIndex: number) => choiceLetter(lang, displayIndex);
  const guessed = guess === null ? null : order[guess];
  if (!revealed)
    return (
      <section className="quiz">
        <span className="mono">
          {tr(lang, "โจทย์ · ก่อนอ่าน", "Puzzle · before you read", "题目 · 先猜再读")}
        </span>
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
          {order.map((original, display) => (
            <label className={"answer " + (guess === display ? "selected" : "")} key={original}>
              <input
                type="radio"
                name={`puzzle-${item.id}`}
                checked={guess === display}
                onChange={() => setGuess(display)}
              />
              <span className="answer-letter mono">{letter(display)}</span>
              <span>{item.choices[original][lang]}</span>
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
  const matched = guessed === item.answer;
  return (
    <section className="quiz">
      <span className="mono">
        {tr(lang, "โจทย์ · ตัวบทว่าอย่างไร", "Puzzle · what the law says", "题目 · 条文怎么说")}
      </span>
      <h1 id="puzzle-heading" tabIndex={-1}>
        {tr(lang, "ตัวบทว่าอย่างไร", "What the section says", "条文怎么说")}
      </h1>
      <div className="feedback" role="status">
        <strong>
          {matched
            ? tr(lang, "เดาตรงกับตัวบท", "Your guess matches the text.", "你的猜测与条文一致。")
            : tr(
                lang,
                `คุณเดา ${letter(guess ?? 0)} ตัวบทว่าอีกอย่าง`,
                `You guessed ${letter(guess ?? 0)}. The text says otherwise.`,
                `你猜的是${letter(guess ?? 0)}。条文另有规定。`,
              )}
        </strong>
        <p>
          <span className="micro">
            {tr(lang, "คำตอบจากตัวบท", "What the text answers", "条文的回答")}
          </span>
          <br />
          {item.choices[item.answer][lang]}
        </p>
        <RuleDiagram id={item.id} />
        <p>{item.story[lang]}</p>
        <p>{item.why[lang]}</p>
        {"hook" in item && item.hook ? <p className="micro">{item.hook[lang]}</p> : null}
      </div>
      <fieldset disabled>
        <legend className="micro">
          {tr(lang, "คำเดาของคุณกับตัวบท", "Your guess, beside the text", "你的猜测与条文")}
        </legend>
        {order.map((original, display) => {
          const correct = original === item.answer;
          const wrong = guessed === original && !correct;
          return (
            <label
              className={
                "answer " + (correct ? "answer-correct " : "") + (wrong ? "answer-wrong" : "")
              }
              key={original}
            >
              <span className="answer-letter mono">{letter(display)}</span>
              <span>{item.choices[original][lang]}</span>
              {correct && (
                <span aria-label={tr(lang, "คำตอบจากตัวบท", "What the text says", "条文的回答")}>
                  ✓
                </span>
              )}
              {wrong && (
                <span aria-label={tr(lang, "คำเดาที่ไม่ตรง", "The guess that missed", "未猜中")}>
                  ×
                </span>
              )}
            </label>
          );
        })}
      </fieldset>
      {item.quotes.map((q) => {
        const full = sections[q.section - 1]?.th ?? "";
        return (
          <div className="reading-excerpt" key={q.th}>
            <h2>{sectionLabel(lang, q.section)}</h2>
            <p className="micro">
              {tr(lang, "คัดจากตัวบท", "Verbatim from the section", "摘自条文原文")}
            </p>
            <p lang="th">{quoteFrame(full, q.th)}</p>
            {lang !== "th" && "en" in q && "zh" in q && (
              <p lang={lang === "zh" ? "zh" : "en"} className="quote-gloss">
                <span className="micro">
                  {lang === "zh"
                    ? "学习译文"
                    : "en" in q && q.en
                      ? tr(lang, "", "Translation", "")
                      : ""}
                </span>
                <br />
                {lang === "zh" ? q.zh : q.en}
              </p>
            )}
          </div>
        );
      })}
      <div>
        {item.sections.map((n) => (
          <Link className="citation" href={`/section/?n=${n}`} key={n}>
            {sectionLabel(lang, n)} →
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
