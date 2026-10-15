import { startSitting, submitBlind, outstanding, type BlindQuestion, type Sitting } from "./blind.ts";

type CheckpointQuestion = Pick<BlindQuestion, "id" | "choices" | "answer">;

type Phase = "brief" | "sit" | "answers" | "handoff";
export type Checkpoint = { sitting: Sitting | null; phase: Phase; earnedId: string | null };
const KEY = "constitution-blind-v1";

// Content changes invalidate answer indices saved against the old question bank.
function revision(bank: CheckpointQuestion[]): string {
  let hash = 2166136261;
  for (const char of JSON.stringify(bank)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(36);
}

/** Restore only internally consistent checkpoints; browser storage is untrusted. */
export function readCheckpoint(raw: string | null, bank: CheckpointQuestion[]): Checkpoint | null {
  if (!raw || raw.length > 100_000) return null;
  try {
    const saved = JSON.parse(raw);
    if (saved.version !== 1 || saved.revision !== revision(bank)) return null;
    const s = saved.sitting as Sitting;
    const questions = new Map(bank.map(q => [q.id, q]));
    if (!s || !Array.isArray(s.order) || s.order.length !== bank.length || new Set(s.order).size !== bank.length || s.order.some(id => !questions.has(id))) return null;
    if (!Number.isInteger(s.at) || s.at < 0 || s.at > s.order.length) return null;
    if (!s.firstTry || !s.retries || !s.lastPick || !Array.isArray(s.owed) || !Array.isArray(s.cleared)) return null;
    const validPick = (pick: number, id: string) => Number.isInteger(pick) && pick >= 0 && pick < questions.get(id)!.choices.length;
    let rebuilt = startSitting(s.order);
    for (const id of s.order.slice(0, s.at)) {
      if (!validPick(s.firstTry[id], id)) return null;
      rebuilt = submitBlind(rebuilt, id, s.firstTry[id], s.firstTry[id] === questions.get(id)!.answer);
    }
    if (Object.keys(s.firstTry).length !== s.at || JSON.stringify(s.owed) !== JSON.stringify(rebuilt.owed)) return null;
    if (new Set(s.cleared).size !== s.cleared.length || s.cleared.some(id => !s.owed.includes(id))) return null;
    for (const [id, count] of Object.entries(s.retries)) {
      if (!s.owed.includes(id) || !Number.isSafeInteger(count) || count < 1) return null;
    }
    for (const [id, pick] of Object.entries(s.lastPick)) {
      if (!s.owed.includes(id) || !validPick(pick, id)) return null;
      if ((pick === questions.get(id)!.answer) !== s.cleared.includes(id)) return null;
      if (!s.cleared.includes(id) && !s.retries[id]) return null;
    }
    if (s.cleared.some(id => !(id in s.lastPick)) || Object.keys(s.retries).some(id => !(id in s.lastPick))) return null;
    rebuilt = { ...rebuilt, cleared: [...s.cleared], retries: { ...s.retries }, lastPick: { ...s.lastPick } };
    const phase = saved.phase as Phase;
    if (!["sit", "answers", "handoff"].includes(phase)) return null;
    if (phase !== "sit" && s.at !== s.order.length) return null;
    if (phase === "sit" && (s.cleared.length || Object.keys(s.lastPick).length)) return null;
    const earnedId = saved.earnedId;
    if (earnedId !== null && (phase !== "answers" || !s.cleared.includes(earnedId))) return null;
    if (phase === "answers" && !outstanding(rebuilt).length && !earnedId) return null;
    if (phase === "handoff" && outstanding(rebuilt).length) return null;
    return { sitting: rebuilt, phase, earnedId };
  } catch { return null; }
}

export function writeCheckpoint(storage: Pick<Storage, "setItem" | "removeItem">, checkpoint: Checkpoint, bank: CheckpointQuestion[]): void {
  if (!checkpoint.sitting) storage.removeItem(KEY);
  else storage.setItem(KEY, JSON.stringify({ version: 1, revision: revision(bank), ...checkpoint }));
}
