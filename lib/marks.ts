import type { Lang } from "./i18n";

/** A highlighted phrase in one language's text of one section, with an optional note. */
export type Mark = {
  id: string;
  section: number;
  lang: Lang;
  start: number;
  end: number;
  quote: string;
  note?: string;
  createdAt: number;
};
export type Marks = { marks: Mark[]; bookmarks: number[] };
export const MARKS_KEY = "constitution-marks";
export const emptyMarks = (): Marks => ({ marks: [], bookmarks: [] });
const LANGS = new Set(["th", "en", "zh"]);
const MAX_NOTE = 5000;

/** Validate stored or imported marks; bad entries are dropped, not fatal. */
export function parseMarks(input: unknown): Marks | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const raw = input as Record<string, unknown>;
  if (!Array.isArray(raw.marks) || !Array.isArray(raw.bookmarks)) return null;
  const section = (n: unknown): n is number =>
    Number.isInteger(n) && (n as number) >= 1 && (n as number) <= 279;
  const marks: Mark[] = [];
  for (const m of raw.marks as Record<string, unknown>[]) {
    if (
      !m ||
      typeof m.id !== "string" ||
      !section(m.section) ||
      !LANGS.has(m.lang as string) ||
      !Number.isInteger(m.start) ||
      !Number.isInteger(m.end) ||
      (m.start as number) < 0 ||
      (m.end as number) <= (m.start as number) ||
      typeof m.quote !== "string" ||
      !m.quote
    )
      continue;
    marks.push({
      id: m.id,
      section: m.section,
      lang: m.lang as Lang,
      start: m.start as number,
      end: m.end as number,
      quote: m.quote.slice(0, 4000),
      note: typeof m.note === "string" && m.note.trim() ? m.note.slice(0, MAX_NOTE) : undefined,
      createdAt: Number.isFinite(m.createdAt) ? (m.createdAt as number) : 0,
    });
  }
  return { marks, bookmarks: [...new Set((raw.bookmarks as unknown[]).filter(section))].sort((a, b) => a - b) };
}

/**
 * Where a mark sits in the current text. Offsets win when they still hold the
 * quote; after a text correction the quote is searched for; a lost quote returns null
 * so the notebook can show it as detached instead of highlighting the wrong words.
 */
export function anchor(text: string, mark: Pick<Mark, "start" | "end" | "quote">): [number, number] | null {
  if (text.slice(mark.start, mark.end) === mark.quote) return [mark.start, mark.end];
  const at = text.indexOf(mark.quote);
  return at < 0 ? null : [at, at + mark.quote.length];
}

export type Segment = { text: string; start: number; mark?: Mark };
/** Split a text into plain and highlighted runs, in order, covering every character once. */
export function segments(text: string, marks: Mark[]): Segment[] {
  const placed = marks
    .map((m) => ({ m, at: anchor(text, m) }))
    .filter((x): x is { m: Mark; at: [number, number] } => x.at !== null)
    .sort((a, b) => a.at[0] - b.at[0]);
  const out: Segment[] = [];
  let cursor = 0;
  for (const { m, at } of placed) {
    const [s, e] = [Math.max(at[0], cursor), at[1]];
    if (e <= s) continue;
    if (s > cursor) out.push({ text: text.slice(cursor, s), start: cursor });
    out.push({ text: text.slice(s, e), start: s, mark: m });
    cursor = e;
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor), start: cursor });
  return out;
}

/** Add a highlight; any overlapping highlight in the same text is merged into it. */
export function addMark(state: Marks, text: string, mark: Omit<Mark, "quote">): Marks {
  let { start, end } = mark;
  const notes: string[] = [];
  const keep: Mark[] = [];
  for (const m of state.marks) {
    const at = m.section === mark.section && m.lang === mark.lang ? anchor(text, m) : null;
    if (at && at[0] < end && at[1] > start) {
      start = Math.min(start, at[0]);
      end = Math.max(end, at[1]);
      if (m.note) notes.push(m.note);
    } else keep.push(m);
  }
  if (mark.note) notes.push(mark.note);
  return {
    ...state,
    marks: [
      ...keep,
      { ...mark, start, end, quote: text.slice(start, end), note: notes.join("\n\n") || undefined },
    ],
  };
}

export const removeMark = (state: Marks, id: string): Marks => ({
  ...state,
  marks: state.marks.filter((m) => m.id !== id),
});
export const setNote = (state: Marks, id: string, note: string): Marks => ({
  ...state,
  marks: state.marks.map((m) =>
    m.id === id ? { ...m, note: note.trim() ? note.slice(0, MAX_NOTE) : undefined } : m,
  ),
});
export const toggleBookmark = (state: Marks, section: number): Marks => ({
  ...state,
  bookmarks: state.bookmarks.includes(section)
    ? state.bookmarks.filter((n) => n !== section)
    : [...state.bookmarks, section].sort((a, b) => a - b),
});
