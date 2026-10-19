export const EXAM_CHECKPOINT = "constitution-timed-paper-v1";
export type TimedCheckpoint = {
  paperNumber: number; ends: number; index: number;
  answers: Record<string, number>; fingerprint: string;
};

/** A checkpoint must still describe this exact deterministic paper and choice order. */
export function parseTimedCheckpoint(raw: string, paper: { id: string; choices: unknown[]; answer: number }[], paperNumber: number, now: number): TimedCheckpoint | null {
  try {
    const p = JSON.parse(raw) as TimedCheckpoint;
    if (p.paperNumber !== paperNumber || !Number.isFinite(p.ends) || p.ends < now - 86_400_000 || p.ends > now + 121 * 60_000 ||
      !Number.isInteger(p.index) || p.index < 0 || p.index >= paper.length ||
      p.fingerprint !== paperFingerprint(paper) || !p.answers || typeof p.answers !== "object" || Array.isArray(p.answers)) return null;
    const byId = new Map(paper.map(q => [q.id, q]));
    for (const [id, choice] of Object.entries(p.answers)) {
      const q = byId.get(id);
      if (!q || !Number.isInteger(choice) || choice < 0 || choice >= q.choices.length) return null;
    }
    return p;
  } catch { return null; }
}
export function paperFingerprint(paper: { id: string; choices: unknown[]; answer: number }[]): string {
  return JSON.stringify(paper.map(q => [q.id, q.choices, q.answer]));
}
