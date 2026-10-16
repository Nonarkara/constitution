import { dueQuestions, type Progress, type Question } from "./learning.ts";
import { fisherYates } from "./shuffle.ts";
import { makeDrill } from "./drills.ts";

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
