import type { Lang } from "./i18n.ts";

type T = Record<Lang, string>;

export type BlindQuestion = {
  id: string;
  topic: number;
  kind: "constitution" | "concept" | "current";
  sections: number[];
  prompt: T;
  choices: T[];
  answer: number;
  logic?: T;
  explanation: T;
  source?: { title: string; url: string; asOf: string };
};

export type Phase = "brief" | "sit" | "mark" | "answers" | "handoff";

/** One learner, one sitting. A miss is a debt, not a file: it stays until answered right. */
export type Sitting = {
  order: string[];
  at: number;
  /** id -> option picked on the blind pass. */
  firstTry: Record<string, number>;
  /** ids missed on the blind pass. Each must be answered correctly later. */
  owed: string[];
  /** owed ids since re-answered correctly. */
  cleared: string[];
  retries: Record<string, number>;
  lastPick: Record<string, number>;
};

export function startSitting(ids: string[]): Sitting {
  return { order: [...ids], at: 0, firstTry: {}, owed: [], cleared: [], retries: {}, lastPick: {} };
}

export function currentId(s: Sitting): string | null {
  return s.order[s.at] ?? null;
}

/** The blind pass. Record the pick, remember the miss, explain nothing here. */
export function submitBlind(s: Sitting, id: string, pick: number, right: boolean): Sitting {
  if (id in s.firstTry) return s;
  return {
    ...s,
    at: s.at + 1,
    firstTry: { ...s.firstTry, [id]: pick },
    owed: right ? s.owed : [...s.owed, id],
  };
}

/** The answers pass. Right clears the debt for good; wrong keeps it and counts the attempt. */
export function submitRetry(s: Sitting, id: string, pick: number, right: boolean): Sitting {
  if (!s.owed.includes(id) || s.cleared.includes(id)) return s;
  return {
    ...s,
    cleared: right ? [...s.cleared, id] : s.cleared,
    retries: right ? s.retries : { ...s.retries, [id]: (s.retries[id] ?? 0) + 1 },
    lastPick: { ...s.lastPick, [id]: pick },
  };
}

/** Every blind-pass miss not yet answered right. Empty means the sitting is done. */
export function outstanding(s: Sitting): string[] {
  return s.owed.filter((id) => !s.cleared.includes(id));
}

export function blindScore(s: Sitting): { right: number; wrong: number; total: number } {
  const total = Object.keys(s.firstTry).length;
  const wrong = s.owed.length;
  return { right: total - wrong, wrong, total };
}

/** The learner has earned this one only by answering it right after missing it. */
export function earned(s: Sitting, id: string): boolean {
  return s.cleared.includes(id);
}
