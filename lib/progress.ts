import { defaultProgress, type Progress } from "./learning.ts";
/** Validate saved and imported data before it can affect scheduling or rendering. */
export function parseProgress(input: unknown): Progress | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const p = input as Record<string, unknown>;
  if (
    typeof p.xp !== "number" ||
    !Number.isFinite(p.xp) ||
    p.xp < 0 ||
    typeof p.streak !== "number" ||
    !Number.isInteger(p.streak) ||
    p.streak < 0 ||
    !p.questions ||
    typeof p.questions !== "object" ||
    Array.isArray(p.questions)
  )
    return null;
  if (
    p.lastStudyDay !== null &&
    (typeof p.lastStudyDay !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(p.lastStudyDay))
  )
    return null;
  for (const [id, value] of Object.entries(p.questions)) {
    if (!id || !value || typeof value !== "object" || Array.isArray(value))
      return null;
    const q = value as Record<string, unknown>;
    if (
      typeof q.correct !== "boolean" ||
      typeof q.level !== "number" ||
      !Number.isInteger(q.level) ||
      q.level < 0 ||
      q.level > 4 ||
      typeof q.due !== "number" ||
      !Number.isFinite(q.due) ||
      q.due < 0
    )
      return null;
  }
  const base = defaultProgress();
  return {
    questions: p.questions as Progress["questions"],
    xp: p.xp,
    streak: p.streak,
    lastStudyDay: p.lastStudyDay as string | null,
    energy:
      typeof p.energy === "number" &&
      Number.isInteger(p.energy) &&
      p.energy >= 0 &&
      p.energy <= 12
        ? p.energy
        : base.energy,
    energyDay:
      typeof p.energyDay === "string" && /^\d{4}-\d{2}-\d{2}$/.test(p.energyDay)
        ? p.energyDay
        : null,
  };
}
