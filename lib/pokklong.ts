import type { Lang, Text } from "./i18n.ts";
import { fisherYates } from "./shuffle.ts";

/** Separate from constitution-progress so Pokklong answers never enter constitution stats. */
export const POKKLONG_KEY = "pokklong-progress";
export const STEP_COUNT = 12;

const SLIDE_SET = "แนวข้อสอบ พ.ร.บ.วิธีปฏิบัติราชการทางปกครอง พ.ศ. 2539 (ชุดสู้ไม่ถอย)";

export function citationPending(lang: Lang): string {
  if (lang === "th") return "รอยืนยันการอ้างอิง";
  if (lang === "zh") return "引用待核实";
  return "citation to be confirmed";
}

/** Local rendering of meta.credit. The English string stays the bank's own paragraph. */
export function creditParagraph(lang: Lang, english: string): string {
  if (lang === "th") {
    return `ได้แรงบันดาลใจจาก ${SLIDE_SET} โดย ประพันธ์ เวารัมย์ (SlideShare) เขียนคำถามใหม่ทั้งหมด ไม่ได้คัดลอกข้อความ ตรวจตัวบทกับวิกิซอร์ซภาษาไทย`;
  }
  if (lang === "zh") {
    return `灵感来自${SLIDE_SET}，作者 ประพันธ์ เวารัมย์（Praphan Waorom，SlideShare）。题目均已重写，未逐字照搬；法条已对照泰文维基文库核对。`;
  }
  return english;
}

/** "มาตรา N / s.N" shows the Thai half on Thai pages and the English half on EN and ZH. */
export function sectionLine(section: string, lang: Lang): string {
  const parts = section.split(" / ");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return section;
  return lang === "th" ? parts[0] : parts[1];
}

/** Number keys pick an option. Enter commits the option that already has focus. */
export function guessKey(key: string, optionCount: number, focusedIndex: number | null): number | null {
  const numbered = ["1", "2", "3", "4"].indexOf(key);
  if (numbered >= 0 && numbered < optionCount) return numbered;
  if (key === "Enter" && focusedIndex !== null && focusedIndex >= 0 && focusedIndex < optionCount) return focusedIndex;
  return null;
}

export type PokklongSource = {
  act: Text;
  section: string;
  verified: boolean;
  note?: string;
};

export type PokklongQuestion = {
  id: string;
  step: number;
  step_name: Text;
  prompt: Text;
  options: Text[];
  answer: number;
  why: Text;
  logic_so_far: Text;
  mnemonic: Text | null;
  source: PokklongSource;
};

export type PokklongStep = {
  name: Text;
  logic_so_far: Text;
};

export type PokklongBank = {
  meta: {
    title: Text;
    version: string;
    languages: string[];
    mode: string;
    credit: string;
    steps: Record<string, PokklongStep>;
  };
  questions: PokklongQuestion[];
};

export type PokklongProgress = {
  answers: Record<string, boolean>;
};

export function emptyPokklong(): PokklongProgress {
  return { answers: {} };
}

/** Missing or blank text falls back to Thai, the source language. */
export function textOf(value: Text | null | undefined, lang: Lang): string {
  if (!value) return "";
  const chosen = value[lang];
  if (typeof chosen === "string" && chosen.trim()) return chosen;
  return typeof value.th === "string" ? value.th : "";
}

export function questionReady(question: PokklongQuestion, lang: Lang): boolean {
  return (
    textOf(question.prompt, lang).length > 0 &&
    question.options.length === 4 &&
    question.options.every((option) => textOf(option, lang).length > 0)
  );
}

/**
 * Only questions whose citation was checked against the Act reach learners. The 14 flagged
 * `verified: false` stay in the data, waiting for a check, and are hidden until then.
 */
export function livePokklong<T extends { source: { verified: boolean } }>(questions: readonly T[]): T[] {
  return questions.filter((question) => question.source.verified);
}

/** Steps in order. Questions are shuffled inside a step, never across steps. */
export function buildPokklongQueue(
  questions: readonly PokklongQuestion[],
  startStep: number,
  random: () => number = Math.random,
): PokklongQuestion[] {
  const queue: PokklongQuestion[] = [];
  for (let step = startStep; step <= STEP_COUNT; step++) {
    const group = questions.filter((question) => question.step === step && questionReady(question, "th"));
    queue.push(...fisherYates(group, random));
  }
  return queue;
}

export function stepHeader(lang: Lang, step: number, name: string): string {
  if (lang === "zh") return `第${step}步，共${STEP_COUNT}步：${name}`;
  if (lang === "en") return `Step ${step} of ${STEP_COUNT}: ${name}`;
  return `ขั้นที่ ${step} จาก ${STEP_COUNT}: ${name}`;
}

export function parsePokklong(input: unknown): PokklongProgress {
  const answers: Record<string, boolean> = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) return { answers };
  const raw = (input as { answers?: unknown }).answers;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { answers };
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (id.startsWith("PK-") && typeof value === "boolean") answers[id] = value;
  }
  return { answers };
}

export function recordPokklong(progress: PokklongProgress, id: string, correct: boolean): PokklongProgress {
  return { answers: { ...progress.answers, [id]: correct } };
}

export function stepAccuracy(
  questions: readonly Pick<PokklongQuestion, "id" | "step">[],
  progress: PokklongProgress,
  step: number,
) {
  const ids = questions.filter((question) => question.step === step).map((question) => question.id);
  const answered = ids.filter((id) => Object.hasOwn(progress.answers, id));
  const correct = answered.filter((id) => progress.answers[id]).length;
  return { correct, answered: answered.length, total: ids.length };
}

export function loadPokklongProgress(): PokklongProgress {
  if (typeof localStorage === "undefined") return emptyPokklong();
  try {
    return parsePokklong(JSON.parse(localStorage.getItem(POKKLONG_KEY) ?? "null"));
  } catch {
    return emptyPokklong();
  }
}

export function savePokklongProgress(progress: PokklongProgress): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    localStorage.setItem(POKKLONG_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}
