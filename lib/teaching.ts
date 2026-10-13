import type { Lang } from "./i18n.ts";
import { tr } from "./i18n.ts";
import type { Question } from "./learning.ts";
import { memoryCueFor } from "./cues.ts";

/** Ten explanation beats. Each one names this item's rule, not a shared filler sentence. */
export function teachingBodies(
  q: Pick<Question, "id" | "chapter" | "sections" | "prompt" | "choices" | "answer" | "explanation" | "hook">,
  lang: Lang,
  wrongIndex: number,
  sectionText: string,
): string[] {
  const right = q.choices[q.answer][lang];
  const wrong = q.choices[wrongIndex]?.[lang] ?? right;
  const explanation = q.explanation[lang];
  const section = q.sections[0];
  const cue = memoryCueFor(q);
  const cueLine = cue?.meaning[lang] ?? q.hook?.[lang] ?? right;
  return [
    right,
    explanation,
    sectionText,
    tr(
      lang,
      `เทียบ «${wrong}» กับ «${right}» ในมาตรา ${section} ต่างกันที่ใคร จำนวน หรือเงื่อนไขในคำอธิบายนี้: ${explanation}`,
      `Compare “${wrong}” with “${right}” under section ${section}. The explanation names the difference: ${explanation}`,
      `把“${wrong}”与第${section}条下的“${right}”比较。解析指出的差别是：${explanation}`,
    ),
    tr(
      lang,
      `เงื่อนไขของข้อนี้ มาตรา ${section}: ${explanation}`,
      `The condition in this item, section ${section}: ${explanation}`,
      `本题的条件，第${section}条：${explanation}`,
    ),
    tr(
      lang,
      `ใช้กับโจทย์นี้: ตัวบทรองรับ «${right}» ไม่ใช่ «${wrong}»`,
      `Applied to this item: the text supports “${right}”, not “${wrong}”.`,
      `用到本题：条文支持“${right}”，而不是“${wrong}”。`,
    ),
    tr(
      lang,
      `ถ้าเปลี่ยนข้อเท็จจริงเป็น «${wrong}» ข้อนี้จะไม่ตรงมาตรา ${section} เพราะ ${explanation}`,
      `Change one fact to “${wrong}” and this item no longer matches section ${section}. ${explanation}`,
      `把一个事实改成“${wrong}”，本题就不再符合第${section}条。${explanation}`,
    ),
    q.hook?.[lang] ??
      tr(
        lang,
        `คำสำคัญของข้อนี้: ${right}`,
        `The key line for this item: ${right}`,
        `本题的关键一句：${right}`,
      ),
    tr(
      lang,
      `เครื่องช่วยจำของข้อนี้ ไม่ใช่ภาพทั้งหมวด: ${cueLine}`,
      `The cue for this item, not the whole chapter: ${cueLine}`,
      `本题的记忆线索，不是整章的图：${cueLine}`,
    ),
    tr(
      lang,
      `เล่ามาตรา ${section} ด้วยคำของคุณ เริ่มจาก «${right}» แล้วบอกเงื่อนไขหรือข้อยกเว้นในคำอธิบาย`,
      `Explain section ${section} in your own words. Start from “${right}”, then name the condition or exception in the explanation.`,
      `用自己的话讲第${section}条。从“${right}”开始，再说出解析里的条件或例外。`,
    ),
  ];
}
