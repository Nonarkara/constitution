import { fisherYates } from "./shuffle.ts";

/** Shuffle whole localized choices once per session, retaining the correct answer. */
export function preparePracticeQuestion<Q extends { choices: readonly unknown[]; answer: number }>(
  question: Q,
  random: () => number = Math.random,
): Q {
  const order = fisherYates(question.choices.map((_, index) => index), random);
  return { ...question, choices: order.map((index) => question.choices[index]), answer: order.indexOf(question.answer) };
}

/** Score submitted question identities, including the answer just given. */
export function practiceSessionScore(
  queue: readonly { id: string; answer: number }[],
  answers: Readonly<Record<string, number>>,
) {
  const submitted = queue.filter((question) => Object.hasOwn(answers, question.id));
  const correct = submitted.filter((question) => answers[question.id] === question.answer).length;
  return { correct, answered: submitted.length, percentage: submitted.length ? Math.round(correct / submitted.length * 100) : 0 };
}
