import type { Text } from "./i18n.ts";
import { memoryCueFor, type MemoryItem } from "./cues.ts";

export type VisualQuestion = MemoryItem & {
  choices: Text[];
  answer: number;
  explanation: Text;
  logic?: Text;
};

/** Position is zero based. Extra matched mnemonics may appear between the regular visual stops. */
export function questionVisualFor(q: VisualQuestion, position: number) {
  const answer = q.choices[q.answer];
  if (!answer) return null;
  let cue = memoryCueFor(q);
  // Section 256 also tests readings, vote thresholds and court review. A petition
  // picture belongs only to a question whose answer actually concerns that count.
  if (cue?.topic === "amendment-petition" && !Object.values(answer).some(s => /50[ ,]?000|ห้าหมื่น|五万/.test(s))) cue = null;
  if (!cue && (position + 1) % 3 !== 0) return null;
  return { answer, cue };
}
