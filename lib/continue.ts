import type { Progress, Question } from "./learning.ts";
import { chapterOfSection, GUIDE } from "./nav.ts";

export type ContinueKind = "review" | "drill" | "guide";
export type ContinueTarget = { href: string; kind: ContinueKind; section: number | null };

/** Due review, then a drill on the weakest section, then the next guide chapter. */
export function continueTarget(input: {
  due: number;
  weak: number | null;
  lastSection: number | null;
}): ContinueTarget {
  if (input.due > 0) return { href: "/practice/?session=mixed", kind: "review", section: null };
  if (input.weak) {
    return {
      href: `/practice/?session=drill&section=${input.weak}`,
      kind: "drill",
      section: input.weak,
    };
  }
  return { href: nextGuideHref(input.lastSection), kind: "guide", section: null };
}

export function weakSection(
  questions: Pick<Question, "id" | "sections">[],
  progress: Progress,
): number | null {
  const counts = new Map<number, number>();
  for (const question of questions) {
    const record = progress.questions[question.id];
    if (!record || record.correct) continue;
    for (const section of question.sections) counts.set(section, (counts.get(section) ?? 0) + 1);
  }
  let best: number | null = null;
  let most = 0;
  for (const [section, count] of counts) {
    if (count > most || (count === most && (best === null || section < best))) {
      best = section;
      most = count;
    }
  }
  return best;
}

export function nextGuideHref(lastSection: number | null): string {
  if (!lastSection) return `/bible/${GUIDE[0].slug}/`;
  const chapter = chapterOfSection(lastSection);
  const index = GUIDE.findIndex((guide) => guide.chapters.includes(chapter));
  if (index < 0) return `/bible/${GUIDE[0].slug}/`;
  const following = GUIDE[index + 1] ?? GUIDE[index];
  return `/bible/${following.slug}/`;
}
