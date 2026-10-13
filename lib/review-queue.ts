import type { Progress } from "./learning";
export function prioritizedReview<T extends { id: string }>(
  items: T[],
  progress: Progress,
  now: number,
  count: number,
): T[] {
  const rank = (id: string) => {
    const q = progress.questions[id];
    return q ? (q.due <= now ? 0 : !q.correct ? 1 : 3) : 2;
  };
  return [...items]
    .sort(
      (a, b) =>
        rank(a.id) - rank(b.id) ||
        (progress.questions[a.id]?.due ?? 0) -
          (progress.questions[b.id]?.due ?? 0),
    )
    .slice(0, count);
}

export function attemptedCount(items: { id: string }[], progress: Progress): number {
  return items.filter(item => Boolean(progress.questions[item.id])).length;
}
