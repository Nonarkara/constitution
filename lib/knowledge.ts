import type { Progress } from "./learning.ts";
import type { Marks } from "./marks.ts";
import type { UserAnnotations } from "./annotations.ts";

/** Section number → when it was first read on this device. */
export type ReadLog = Record<number, number>;
export const READ_KEY = "constitution-read-v1";
export const SECTION_COUNT = 279;

export function parseRead(input: unknown): ReadLog | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const out: ReadLog = {};
  for (const [key, value] of Object.entries(input)) {
    const n = Number(key);
    if (Number.isInteger(n) && n >= 1 && n <= SECTION_COUNT && typeof value === "number" && value > 0)
      out[n] = value;
  }
  return out;
}
export const markRead = (log: ReadLog, n: number, now: number): ReadLog =>
  log[n] || n < 1 || n > SECTION_COUNT ? log : { ...log, [n]: now };

export type Signals = {
  n: number;
  read: boolean;
  marked: boolean; // her own mark: a highlight, a whole-section colour, a note or a bookmark
  notes: number;
  total: number; // questions that cite this section
  answered: number;
  correct: number;
  solid: number; // correct and already survived one spaced return (level ≥ 2)
  due: boolean;
};
/**
 * One state per section. Every section is in exactly one, so the counts always add up to 279.
 * due > known > practising > read > unseen: what needs her next wins.
 */
export type SectionState = "due" | "known" | "practising" | "read" | "unseen";

export function sectionSignals(input: {
  progress: Progress;
  marks: Marks;
  annotations: UserAnnotations;
  read: ReadLog;
  questions: { id: string; sections: number[] }[];
  now: number;
}): Signals[] {
  const out: Signals[] = Array.from({ length: SECTION_COUNT }, (_, i) => ({
    n: i + 1,
    read: Boolean(input.read[i + 1]),
    marked: false,
    notes: 0,
    total: 0,
    answered: 0,
    correct: 0,
    solid: 0,
    due: false,
  }));
  const at = (n: number) => (n >= 1 && n <= SECTION_COUNT ? out[n - 1] : null);
  for (const m of input.marks.marks) {
    const s = at(m.section);
    if (s) (s.marked = true), (s.notes += m.note ? 1 : 0);
  }
  for (const n of input.marks.bookmarks) {
    const s = at(n);
    if (s) s.marked = true;
  }
  for (const a of Object.values(input.annotations)) {
    const s = at(a.section);
    if (s && (a.highlight || a.note)) (s.marked = true), (s.notes += a.note ? 1 : 0);
  }
  for (const q of input.questions) {
    const record = input.progress.questions[q.id];
    for (const n of new Set(q.sections)) {
      const s = at(n);
      if (!s) continue;
      s.total++;
      if (!record) continue;
      s.answered++;
      if (record.correct) s.correct++;
      if (record.correct && record.level >= 2) s.solid++;
      if (record.due <= input.now) s.due = true;
    }
  }
  return out;
}

export function stateOf(s: Signals): SectionState {
  if (s.due) return "due";
  if (s.total > 0 && s.solid === s.total) return "known";
  if (s.answered > 0) return "practising";
  if (s.read || s.marked) return "read";
  return "unseen";
}

/** The counts the strip at the top of every page shows. */
export function knowSummary(signals: Signals[]) {
  const states = signals.map(stateOf);
  return {
    met: states.filter((s) => s !== "unseen").length,
    marked: signals.filter((s) => s.marked).length,
    known: states.filter((s) => s === "known").length,
  };
}
