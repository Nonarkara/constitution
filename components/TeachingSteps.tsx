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
  const wrong =
    selected !== undefined && selected !== q.answer
      ? selected
      : (q.answer + 1) % q.choices.length;
  const bodies = teachingBodies(q, lang, wrong, sectionBody(q.sections[0], lang));
  const titles = [
    tr(lang, "ตัวบท", "The rule", "条文"),
    tr(lang, "ตัวเลือกที่ชวนเชื่อ", "Why that option fails", "为什么那个选项不成立"),
    tr(lang, "เปลี่ยนหนึ่งข้อเท็จจริง", "Change one fact", "改一个事实"),
  ].slice(0, bodies.length);
  const last = Math.max(bodies.length - 1, 0);
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
      <MemoryCue item={q} />
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
        <button disabled={step === last} onClick={() => setStep(step + 1)}>
          {tr(lang, "อีกมุม", "Another angle", "换一个角度")} →
        </button>
      </div>
    </details>
  );
}
