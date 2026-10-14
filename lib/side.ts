import bank from "../data/exam-topics.json" with { type: "json" };
import type { Lang } from "./i18n.ts";

type T = Record<Lang, string>;
/**
 * A question "along the way": a topic from the district-chief / local-government exam,
 * tied to the lesson it fits best. It teaches; it never counts toward chapter mastery.
 */
export type SideQuestion = {
  id: string;
  topic: number;
  kind: "constitution" | "concept" | "current";
  chapters: number[];
  sections: number[];
  proof?: string;
  prompt: T;
  choices: T[];
  answer: number;
  explanation: T;
  source?: { title: string; url: string; asOf: string };
};
export const sideQuestions = bank as SideQuestion[];
export const SIDE_SEEN_KEY = "constitution-side-seen-v1";

/**
 * One question for this lesson: unseen ones tied to the chapter first. A chapter with no honest
 * link (the King, the courts) draws from the general topics outside the constitution instead of
 * pretending to a connection.
 */
export function pickSide(chapter: number, seen: string[], random = Math.random): SideQuestion | null {
  const tied = sideQuestions.filter((q) => q.chapters.includes(chapter));
  const own = tied.length ? tied : sideQuestions.filter((q) => q.sections.length === 0);
  const pool = own.filter((q) => !seen.includes(q.id));
  const from = pool.length ? pool : own;
  return from.length ? from[Math.floor(random() * from.length)] : null;
}
