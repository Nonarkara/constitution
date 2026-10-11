import { defaultProgress, type Progress } from "./learning.ts";
/** Validate saved and imported data before it can affect scheduling or rendering. */
function validDay(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export function parseProgress(
  input: unknown,
  allowedIds?: ReadonlySet<string>,
): Progress | null {
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
  if (p.lastStudyDay !== null && !validDay(p.lastStudyDay)) return null;
  for (const [id, value] of Object.entries(p.questions)) {
    if (
      !id ||
      (allowedIds && !allowedIds.has(id)) ||
      ["__proto__", "constructor", "prototype"].includes(id) ||
      !value ||
      typeof value !== "object" ||
      Array.isArray(value)
    )
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
      q.due < 0 ||
      (q.correct ? q.level === 0 : q.level !== 0)
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
    energyDay: validDay(p.energyDay) ? p.energyDay : null,
  };
}
