import type { Lang } from "./i18n.ts";
import { tr } from "./i18n.ts";
import type { Question } from "./learning.ts";

/**
 * Steps that add something the explanation does not already say:
 * the quoted rule, why this option is tempting, and — when the section
 * states one — a different fact with a different result.
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
    whyTempting(wrong, right, q.prompt[lang], explanation, section, lang),
    changedFact(quote, right, explanation, section, lang) ?? "",
  ];
  return steps.filter((step) => {
    const text = step.trim();
    if (!text || text === right.trim()) return false;
    if (explanation && (text === explanation || text.includes(explanation))) return false;
    if (/does not use that condition|ไม่ได้ใช้เงื่อนไขนั้น|不用那个条件/.test(text)) return false;
    if (/If the fact were|ถ้าข้อเท็จจริงเป็น «|如果事实是“/.test(text)) return false;
    return true;
  });
}

function clip(text: string, max: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : `${flat.slice(0, max).trimEnd()}…`;
}

/** Name this option and the question, then the rule it misses. */
function whyTempting(
  wrong: string,
  right: string,
  prompt: string,
  explanation: string,
  section: number,
  lang: Lang,
): string {
  const sentences = explanation.split(/(?<=[.。])\s+/).map((s) => s.trim()).filter(Boolean);
  const named = sentences.find((s) => s.includes(wrong.slice(0, Math.min(24, wrong.length))));
  const rule = named ?? (sentences.length > 1 ? sentences[0] : "");
  const because = tr(
    lang,
    `«${wrong}» ชวนให้เลือกเพราะโจทย์ถามว่า «${clip(prompt, 140)}» และตัวเลือกนี้ดูเหมือนคำตอบตรง ๆ`,
    `“${wrong}” is tempting because the question asks “${clip(prompt, 160)}”, and this option looks like a direct answer.`,
    `“${wrong}”容易被选中，因为题目问的是“${clip(prompt, 80)}”，而这个选项像一句直接的回答。`,
  );
  const fails = rule
    ? tr(lang, `มันไม่ผ่านเพราะ ${rule}`, `It fails because ${rule}`, `它不成立，因为${rule}`)
    : tr(
        lang,
        `มันไม่ผ่านเพราะมาตรา ${section} ให้ผลเป็น «${right}» ไม่ใช่ตัวเลือกนี้`,
        `It fails because section ${section} gives this result to “${right}”, not to this option.`,
        `它不成立，因为第${section}条把这个结果给了“${right}”，而不是这个选项。`,
      );
  const step = `${because} ${fails}`;
  if (explanation && step.includes(explanation)) {
    return `${because} ${tr(
      lang,
      `มันไม่ผ่านเพราะมาตรา ${section} ให้ผลเป็น «${right}» ไม่ใช่ตัวเลือกนี้`,
      `It fails because section ${section} gives this result to “${right}”, not to this option.`,
      `它不成立，因为第${section}条把这个结果给了“${right}”，而不是这个选项。`,
    )}`;
  }
  return step;
}

type OtherCase = { fact: string; outcome: string };

/** Another case in the section text, with an outcome other than the right answer. */
function otherCase(sectionText: string, right: string, lang: Lang): OtherCase | null {
  const text = sectionText.replace(/\s+/g, " ").trim();
  let fact = "";
  let outcome = "";
  if (lang === "en") {
    const match = text.match(/\b[Hh]owever,\s+if\s+(.+?),\s+(.+?)\./) ?? text.match(/\bif\s+(.{20,240}?),\s+(.{20,240}?)\./i);
    if (!match) return null;
    fact = match[1];
    outcome = match[2];
  } else if (lang === "th") {
    const match = text.match(/แต่ในกรณีที่(.+?)ให้(.+?)ทั้งนี้/);
    if (!match) return null;
    fact = match[1];
    outcome = match[2];
  } else {
    const match = text.match(/但([^。]{12,200}?)的，([^。]{8,180}?)[。]/);
    if (!match) return null;
    fact = match[1];
    outcome = match[2];
  }
  fact = fact.trim();
  outcome = outcome.trim();
  if (fact.length < 12 || outcome.length < 8) return null;
  if (outcome.includes(right)) return null;
  return { fact, outcome };
}

function changedFact(
  sectionText: string,
  right: string,
  explanation: string,
  section: number,
  lang: Lang,
): string | null {
  const found = otherCase(sectionText, right, lang);
  if (!found) return null;
  const step = tr(
    lang,
    `เปลี่ยนหนึ่งข้อเท็จจริงตามมาตรา ${section}: ${found.fact} ผลจึงเปลี่ยนเป็น ${found.outcome} ซึ่งคนละผลกับ «${right}» ที่ตอบโจทย์นี้`,
    `Change one fact in section ${section}: ${found.fact}. The result changes: ${found.outcome}. That is a different result from “${right}”, which answers the facts in this question.`,
    `把第${section}条里的一个事实改掉：${found.fact}。结果变为：${found.outcome}。这与本题事实下的“${right}”不是同一个结果。`,
  );
  if (explanation && step.includes(explanation)) return null;
  return step;
}
