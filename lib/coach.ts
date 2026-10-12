import type { Progress } from "./learning";
import type { UserAnnotations } from "./annotations";
export type Confidence = "unsure" | "maybe" | "sure";
export type Calibration = {
  sure: number;
  sureMissed: number;
  uncertainCorrect: number;
};
export const emptyCalibration = (): Calibration => ({
  sure: 0,
  sureMissed: 0,
  uncertainCorrect: 0,
});
/** An optional self-report informs reflection, never the mastery score or schedule. */
export function recordCalibration(
  c: Calibration,
  confidence: Confidence | null,
  correct: boolean,
): Calibration {
  return {
    sure: c.sure + (confidence === "sure" ? 1 : 0),
    sureMissed: c.sureMissed + (confidence === "sure" && !correct ? 1 : 0),
    uncertainCorrect:
      c.uncertainCorrect + (confidence === "unsure" && correct ? 1 : 0),
  };
}
/** Append, never silently replace a learner's existing annotation. */
export function explanationNote(
  current: UserAnnotations,
  section: number,
  note: string,
  now: number,
): UserAnnotations | null {
  if (
    !Number.isInteger(section) ||
    section < 1 ||
    section > 279 ||
    !note.trim() ||
    !Number.isFinite(now)
  )
    return null;
  const existing = current[section];
  const joined = [existing?.note, note.trim()].filter(Boolean).join("\n\n");
  if (joined.length > 5000) return null;
  return {
    ...current,
    [section]: { ...existing, section, note: joined, updatedAt: now },
  };
}
export function nextReviewAt(
  progress: Progress,
  ids: string[],
  now: number,
): number | null {
  const times = ids
    .flatMap((id) =>
      progress.questions[id] ? [progress.questions[id].due] : [],
    )
    .filter((n) => Number.isFinite(n) && n >= 0);
  return times.length ? Math.max(now, Math.min(...times)) : null;
}
