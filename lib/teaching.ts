import type { Lang } from "./i18n.ts";
import { tr } from "./i18n.ts";
import type { Question } from "./learning.ts";

/**
 * Three steps that add something the explanation does not already say:
 * the quoted rule, why this tempting option fails, and one changed fact.
 */
export function teachingBodies(
  q: Pick<Question, "id" | "chapter" | "sections" | "prompt" | "choices" | "answer" | "explanation" | "hook">,
  lang: Lang,
  wrongIndex: number,
  sectionText: string,
): string[] {
  const right = q.choices[q.answer][lang];
  const wrong = q.choices[wrongIndex]?.[lang] ?? right;
  const explanation = q.explanation[lang].trim();
  const section = q.sections[0];
  const quote = sectionText.trim();
  const steps = [
    tr(
      lang,
      `ตัวบทมาตรา ${section}: «${quote}»`,
      `The rule in section ${section}: “${quote}”`,
      `第${section}条的条文：“${quote}”`,
    ),
    tr(
      lang,
      `«${wrong}» ไม่ผ่านข้อนี้ มาตรา ${section} ไม่ได้ใช้เงื่อนไขนั้น ตัวบทชี้ไปที่ «${right}»`,
      `“${wrong}” fails this item. Section ${section} does not use that condition. The text points to “${right}”.`,
      `“${wrong}”通不过本题。第${section}条不用那个条件。条文指向“${right}”。`,
    ),
    tr(
      lang,
      `ถ้าข้อเท็จจริงเป็น «${wrong}» ผลตามมาตรา ${section} จะไม่ใช่ «${right}»`,
      `If the fact were “${wrong}”, the result under section ${section} would not be “${right}”.`,
      `如果事实是“${wrong}”，第${section}条下的结果就不是“${right}”。`,
    ),
  ];
  return steps.filter((step) => {
    const text = step.trim();
    if (!text || text === right.trim()) return false;
    if (explanation && (text === explanation || text.includes(explanation))) return false;
    return true;
  });
}
