"use client";
import { useState } from "react";
import Link from "next/link";
import type { Question } from "@/lib/learning";
import { sectionBody } from "@/lib/corpus";
import { teachingBodies } from "@/lib/teaching";
import { useStudy } from "./Provider";
import { tr, sectionLabel } from "@/lib/i18n";
import { MemoryCue } from "./MemoryCue";
export function TeachingSteps({
  question: q,
  selected,
}: {
  question: Question;
  selected?: number;
}) {
  const { lang } = useStudy();
  const [step, setStep] = useState(0);
  const titles = [
    tr(lang, "ใจความเดียว", "One key idea", "一个核心概念"),
    tr(lang, "ทำไมคำตอบนี้", "Why this answer", "为什么选它"),
    tr(lang, "ดูตัวบท", "Read the rule", "看条文"),
    tr(lang, "ตัวลวงต่างตรงไหน", "Compare a tempting choice", "比较迷惑选项"),
    tr(lang, "เงื่อนไขที่ห้ามข้าม", "Check the conditions", "核对条件"),
    tr(lang, "ใช้กับโจทย์นี้", "Apply to this case", "应用到本题"),
    tr(lang, "เปลี่ยนหนึ่งข้อเท็จจริง", "Change one fact", "改变一个事实"),
    tr(lang, "ตัวเลขหรือคำสำคัญ", "Numbers and key words", "数字与关键词"),
    tr(lang, "เรียกภาพกลับมา", "Recall the picture", "回想图像"),
    tr(lang, "เล่าให้คนอื่นเข้าใจ", "Explain to someone", "讲给别人听"),
  ];
  const wrong =
    selected !== undefined && selected !== q.answer
      ? selected
      : (q.answer + 1) % q.choices.length;
  const bodies = teachingBodies(q, lang, wrong, sectionBody(q.sections[0], lang));
  return (
    <details className="teaching-steps">
      <summary>
        {tr(
          lang,
          "เข้าใจเรื่องนี้ทีละมุม",
          "Understand it one step at a time",
          "逐步理解这个概念",
        )}
      </summary>
      <nav aria-label={tr(lang, "ขั้นอธิบาย", "Explanation steps", "解释步骤")}>
        {titles.map((s, i) => (
          <button key={i} aria-pressed={step === i} onClick={() => setStep(i)}>
            {i + 1}. {s}
          </button>
        ))}
      </nav>
      <h3>{titles[step]}</h3>
      <p>{bodies[step]}</p>
      {step === 8 && <MemoryCue item={q} />}
      <p>
        {q.sections.map((n) => (
          <Link className="citation" href={`/section/?n=${n}`} key={n}>
            {sectionLabel(lang, n)} →
          </Link>
        ))}
      </p>
      <div className="reader-navigation">
        <button disabled={!step} onClick={() => setStep(step - 1)}>
          ← {tr(lang, "ก่อนหน้า", "Previous", "上一步")}
        </button>
        <button disabled={step === 9} onClick={() => setStep(step + 1)}>
          {tr(lang, "มุมถัดไป", "Next angle", "下一角度")} →
        </button>
      </div>
    </details>
  );
}
