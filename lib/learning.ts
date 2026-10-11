export type Localized = { th: string; en: string; zh: string };
export type Question = {
  id: string;
  chapter: number;
  sections: number[];
  prompt: Localized;
  choices: Localized[];
  answer: number;
  explanation: Localized;
};
export type QuestionProgress = { correct: boolean; level: number; due: number };
export type Progress = {
  questions: Record<string, QuestionProgress>;
  xp: number;
  streak: number;
  lastStudyDay: string | null;
  energy: number;
  energyDay: string | null;
};
const DAY = 86_400_000;
const INTERVALS = [DAY, 3 * DAY, 7 * DAY, 14 * DAY];
export const DAILY_ENERGY = 12;
export function bangkokDay(now: number): string {
  return new Date(now + 7 * 3_600_000).toISOString().slice(0, 10);
}
export function defaultProgress(): Progress {
  return {
    questions: {},
    xp: 0,
    streak: 0,
    lastStudyDay: null,
    energy: DAILY_ENERGY,
    energyDay: null,
  };
}
/** Energy is a daily pacing indicator; zero energy never prevents study. */
export function energyRemaining(progress: Progress, now: number): number {
  return progress.energyDay === bangkokDay(now)
    ? progress.energy
    : DAILY_ENERGY;
}
export function recordAnswer(
  progress: Progress,
  question: Pick<Question, "id">,
  correct: boolean,
  now: number,
): Progress {
  if (!Number.isFinite(now)) throw new RangeError("Invalid study time");
  const day = bangkokDay(now);
  const previous = progress.questions[question.id];
  // Advancing a due card earns a longer interval. Repeated early taps cannot do so.
  const eligible = !previous || previous.due <= now;
  const level = correct
    ? eligible
      ? Math.min((previous?.correct ? previous.level : 0) + 1, INTERVALS.length)
      : previous.correct
        ? Math.max(previous.level, 1)
        : 1
    : 0;
  const due = correct
    ? eligible || !previous?.correct
      ? now + INTERVALS[level - 1]
      : previous.due
    : now + 600_000;
  const yesterday = bangkokDay(now - DAY);
  const streak =
    progress.lastStudyDay === day
      ? progress.streak
      : progress.lastStudyDay === yesterday
        ? progress.streak + 1
        : 1;
  return {
    ...progress,
    questions: {
      ...progress.questions,
      [question.id]: { correct, level, due },
    },
    xp: progress.xp + (correct && (!previous?.correct || eligible) ? 10 : 0),
    streak,
    lastStudyDay: day,
    energy: Math.max(0, energyRemaining(progress, now) - 1),
    energyDay: day,
  };
}
export function dueQuestions<T extends Pick<Question, "id">>(
  questions: T[],
  progress: Progress,
  now: number,
): T[] {
  return questions
    .filter((q) => progress.questions[q.id]?.due <= now)
    .sort(
      (a, b) => progress.questions[a.id].due - progress.questions[b.id].due,
    );
}
export function chapterMastery(
  questions: Pick<Question, "id" | "chapter">[],
  progress: Progress,
  chapter: number,
) {
  const ids = [
    ...new Set(questions.filter((q) => q.chapter === chapter).map((q) => q.id)),
  ];
  const correct = ids.filter((id) => progress.questions[id]?.correct).length;
  const total = ids.length;
  const required = Math.ceil(total * 0.8);
  return {
    correct,
    total,
    percent: total ? Math.round((correct / total) * 100) : 0,
    mastered: total > 0 && correct >= required,
  };
}
