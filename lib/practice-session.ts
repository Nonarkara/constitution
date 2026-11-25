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

export const MIXED_CHECKPOINT = "constitution-mixed-round-v1";

type MixedQuestion = { id: string; choices: readonly unknown[]; answer: number };

export function encodeMixedRound<Q extends MixedQuestion>(
  bank: readonly Q[],
  queue: readonly Q[],
  index: number,
  answers: Record<string, number>,
  selected: number | null,
) {
  const byId = new Map(bank.map((q) => [q.id, q]));
  const originals = queue.map((q) => byId.get(q.id)!);
  return JSON.stringify({
    order: queue.map((q, at) => [q.id, q.choices.map((choice) => originals[at].choices.indexOf(choice))]),
    originals: JSON.stringify(originals),
    index, answers, selected,
  });
}

export function parseMixedRound<Q extends MixedQuestion>(raw: string, bank: readonly Q[]) {
  try {
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved.order) || !saved.order.length || saved.order.length > 12 ||
        !Number.isInteger(saved.index) || saved.index < 0 || saved.index >= saved.order.length ||
        !saved.answers || typeof saved.answers !== "object" || Array.isArray(saved.answers)) return null;
    const byId = new Map(bank.map((q) => [q.id, q]));
    const seen = new Set<string>();
    const queue: Q[] = [];
    const originals: Q[] = [];
    for (const row of saved.order) {
      if (!Array.isArray(row) || row.length !== 2) return null;
      const [id, order] = row;
      const question = byId.get(id);
      if (!question || seen.has(id) || !Array.isArray(order) ||
          order.length !== question.choices.length || new Set(order).size !== order.length ||
          order.some((i) => !Number.isInteger(i) || i < 0 || i >= order.length)) return null;
      seen.add(id);
      originals.push(question);
      queue.push({ ...question, choices: order.map((i) => question.choices[i]), answer: order.indexOf(question.answer) });
    }
    if (saved.originals !== JSON.stringify(originals)) return null;
    for (const [id, choice] of Object.entries(saved.answers)) {
      const at = queue.findIndex((q) => q.id === id);
      if (at < 0 || at > saved.index || typeof choice !== "number" || !Number.isInteger(choice) ||
          choice < 0 || choice >= queue[at].choices.length) return null;
    }
    if (queue.slice(0, saved.index).some((q) => !Object.hasOwn(saved.answers, q.id))) return null;
    if (saved.selected !== null && (!Number.isInteger(saved.selected) || saved.selected < 0 ||
        saved.selected >= queue[saved.index].choices.length)) return null;
    const answers: Record<string, number> = saved.answers;
    const submitted = answers[queue[saved.index].id];
    if (submitted !== undefined && submitted !== saved.selected) return null;
    return { queue, index: saved.index as number, answers, selected: saved.selected as number | null };
  } catch {
    return null;
  }
}
