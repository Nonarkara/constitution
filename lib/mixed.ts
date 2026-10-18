import { dueQuestions, type Progress, type Question } from "./learning.ts";
import { fisherYates } from "./shuffle.ts";
import { DRILL_COUNT, makeDrill } from "./drills.ts";

function openingForNewLearner(allQuestions: Question[]): Question[] {
  const concepts = fisherYates(
    allQuestions.filter((question) => (question.chapter === 1 || question.chapter === 2) && !question.id.startsWith("drill-")),
  );
  const lead = [...concepts.slice(0, 4), makeDrill(0)];
  const seen = new Set(lead.map((question) => question.id));
  const more = fisherYates(allQuestions.filter((question) => !seen.has(question.id) && !question.id.startsWith("drill-"))).slice(0, 7);
  return [...lead, ...more].slice(0, 12);
}

/** One session: due review, weak questions, number drills, then recall of known items. */
export function buildMixedSession(allQuestions: Question[], progress: Progress, now: number): Question[] {
  if (Object.keys(progress.questions).length === 0) return openingForNewLearner(allQuestions);
  const due = dueQuestions(allQuestions, progress, now).slice(0, 6);
  const dueIds = new Set(due.map((question) => question.id));
  const weak = fisherYates(
    allQuestions.filter(
      (question) => progress.questions[question.id] && !progress.questions[question.id].correct && !dueIds.has(question.id),
    ),
  ).slice(0, 4);
  const known = fisherYates(allQuestions.filter((question) => progress.questions[question.id]?.correct)).slice(0, 3);
  const fresh = fisherYates(allQuestions.filter((question) => !progress.questions[question.id])).slice(0, 5);
  const drills = [0, 97, 8 * 423, 9 * 423 + 10].map((index) => makeDrill(index % 4230));
  const seen = new Set<string>();
  const out: Question[] = [];
  for (const question of [...due, ...weak, ...drills, ...known, ...fresh]) {
    if (seen.has(question.id)) continue;
    seen.add(question.id);
    out.push(question);
    if (out.length === 12) break;
  }
  return out;
}


/** Repair a section using only questions that actually cite it. */
export function buildSectionSession(allQuestions: Question[], section: number): Question[] {
  if (!Number.isInteger(section) || section < 1 || section > 279) return [];
  const own = fisherYates(allQuestions.filter(question => question.sections.includes(section))).slice(0, 5);
  if (own.length === 5) return own;
  const seen = new Set(own.map(question => question.id));
  for (const index of fisherYates(Array.from({ length: DRILL_COUNT }, (_, i) => i))) {
    const drill = makeDrill(index);
    if (!drill.sections.includes(section) || seen.has(drill.id)) continue;
    own.push(drill);
    seen.add(drill.id);
    if (own.length === 5) break;
  }
  return own;
}
