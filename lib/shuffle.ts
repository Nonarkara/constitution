import type { Lang } from "./i18n.ts";

/** Unbiased Fisher–Yates. `random` must return a uniform value in [0, 1). */
export function fisherYates<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const next = items.slice();
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const swap = next[i];
    next[i] = next[j];
    next[j] = swap;
  }
  return next;
}

const LETTERS: Record<Lang, readonly string[]> = {
  th: ["ก", "ข", "ค", "ง"],
  en: ["A", "B", "C", "D"],
  zh: ["1", "2", "3", "4"],
};

export function choiceLetter(lang: Lang, index: number): string {
  return LETTERS[lang][index] ?? String(index + 1);
}

export function mixedPracticeQueue<T>(
  items: readonly T[],
  count: number,
  random: () => number = Math.random,
): T[] {
  return fisherYates(items, random).slice(0, count);
}
