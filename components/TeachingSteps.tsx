"use client";
import { useState } from "react";
import Link from "next/link";
import type { Question } from "@/lib/learning";
import { sectionBody } from "@/lib/corpus";
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
      : (q.answer + 1) % 4;
  const bodies = [
    q.choices[q.answer][lang],
    q.explanation[lang],
    sectionBody(q.sections[0], lang),
    tr(
      lang,
      `เทียบ «${q.choices[wrong][lang]}» กับคำตอบที่ถูกในบริบทของคำถามนี้ ต่างกันที่ใคร จำนวน หรือเงื่อนไข?`,
      `Compare “${q.choices[wrong][lang]}” with the right answer for this question. Is the difference the actor, number or condition?`,
      `把“${q.choices[wrong][lang]}”与本题正确答案比较。差别在人物、数字还是条件？`,
    ),
    tr(
      lang,
      "หาคำว่า ต้อง อย่างน้อย ไม่เกิน หรือข้อยกเว้นในตัวบท อย่ายกเงื่อนไขหนึ่งไปแทนทั้งกฎ",
      "Look for must, at least, at most and exceptions. One condition does not replace the whole rule.",
      "留意必须、至少、最多与例外。一个条件不等于整个规则。",
    ),
    q.prompt[lang],
    tr(
      lang,
      "ลองเปลี่ยนคน จำนวน หรือชนิดกฎหมายหนึ่งอย่าง คำตอบยังเหมือนเดิมไหม? เปิดตัวบทตรวจ ไม่เดาว่าทุกกรณีเหมือนกัน",
      "Change one actor, number or type of law. Would the answer still hold? Check the text instead of assuming all cases are alike.",
      "改变一个人物、数字或法律类型，答案还成立吗？查看条文，不要假定所有情境都一样。",
    ),
    q.hook?.[lang] ??
      tr(
        lang,
        "ถ้ามีตัวเลข บอกหน่วยและว่าเป็นขั้นต่ำ เพดาน หรือจำนวนรวม ถ้าไม่มีตัวเลข ระบุผู้มีอำนาจและเงื่อนไข",
        "If there is a number, name its unit and whether it is a minimum, cap or total. Otherwise identify the actor and condition.",
        "有数字时，说出单位及其是下限、上限还是总数。没有数字时，说明有权者与条件。",
      ),
    tr(
      lang,
      "ภาพประจำหมวดเป็นตัวช่วยเรียกคืน ไม่ใช่ตัวบท ลองนึกถึงภาพก่อนเปิดดู",
      "The chapter picture is a recall cue, not the legal rule. Picture it before revealing it.",
      "章节图像是回忆线索，不是法律规则。打开前先试着想象。",
    ),
    tr(
      lang,
      "อธิบายสั้น ๆ: ใครทำอะไรได้ เมื่อเงื่อนไขใดครบ และเพราะอะไร? ใช้ช่องสอนกลับด้านล่างเพื่อเก็บเหตุผลของคุณ",
      "Explain briefly: who can do what, under which conditions, and why? Use the teach-back box below to save your reasoning.",
      "简要解释：谁能做什么，须满足哪些条件，为什么？用下方自我解释框保存理由。",
    ),
  ];
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
      {step === 8 && <MemoryCue chapter={q.chapter} />}
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
