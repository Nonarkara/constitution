import type { Progress, Question } from "./learning";
import type { UserAnnotations } from "./annotations";
import { chapters } from "./outline";

export type ExamTarget = "all" | "ocsc" | "governor" | "legal" | "civic";

export type ChapterAnalysis = {
  chapter: number;
  title: { th: string; en: string; zh: string };
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  errorCount: number;
  accuracy: number;
  priorityScore: number; // Higher means user needs more work here
};

export type UserLearningProfile = {
  examTarget: ExamTarget;
  weakestChapters: number[];
  annotatedSectionsCount: number;
  recommendation: {
    th: string;
    en: string;
    zh: string;
  };
};

// No exam-frequency weights: without a verified past-paper corpus they would be
// invented (context.md). Priority comes only from the learner's own answers.
const EXAM_WEIGHTS: Record<ExamTarget, Record<number, number>> = {
  all: {},
  ocsc: {},
  governor: {},
  legal: {},
  civic: {},
};

export function analyzeUserLearning(
  questions: Pick<Question, "id" | "chapter">[],
  progress: Progress,
  annotations: UserAnnotations,
  examTarget: ExamTarget = "all",
): UserLearningProfile {
  const chapterStats: Record<
    number,
    { total: number; answered: number; correct: number; errors: number }
  > = {};

  for (const c of chapters) {
    chapterStats[c.number] = { total: 0, answered: 0, correct: 0, errors: 0 };
  }

  for (const q of questions) {
    const stats = chapterStats[q.chapter];
    if (!stats) continue;
    stats.total += 1;

    const record = progress.questions[q.id];
    if (record) {
      stats.answered += 1;
      if (record.correct) {
        stats.correct += 1;
      } else {
        stats.errors += 1;
      }
    }
  }

  const analysis: ChapterAnalysis[] = chapters.map((c) => {
    const stats = chapterStats[c.number];
    const accuracy =
      stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0;
    const targetMultiplier = EXAM_WEIGHTS[examTarget]?.[c.number] ?? 1.0;

    // Priority score: higher when accuracy is low, errors are high, or target weight is high
    const errorWeight = stats.errors * 2.5;
    const unmasteredWeight = (stats.total - stats.correct) * 1.2;
    const priorityScore = (errorWeight + unmasteredWeight) * targetMultiplier;

    return {
      chapter: c.number,
      title: c.title,
      totalQuestions: stats.total,
      answeredCount: stats.answered,
      correctCount: stats.correct,
      errorCount: stats.errors,
      accuracy,
      priorityScore,
    };
  });

  // Sort by priorityScore descending
  analysis.sort((a, b) => b.priorityScore - a.priorityScore);

  const weakestChapters = analysis
    .filter((a) => a.errorCount > 0 || a.answeredCount < a.totalQuestions)
    .slice(0, 3)
    .map((a) => a.chapter);

  const annotatedSectionsCount = Object.keys(annotations).length;

  // Build adaptive recommendations in 3 languages
  let recTh = "เริ่มต้นฝึกฝนตามเส้นทางปกติ หมั่นทบทวนคำถามที่ตอบผิด";
  let recEn = "Follow your daily learning path; focus on review intervals.";
  let recZh = "按照常规路径练习，重点复习错题。";

  if (weakestChapters.length > 0) {
    const topWeak = analysis[0];
    const topChapterTitle = topWeak.title.th;
    recTh = `ระบบตรวจพบว่าคุณควรเน้น "${topChapterTitle}" (หมวด ${topWeak.chapter}) มีข้อที่ควรเสริมความแม่นยำ`;
    recEn = `We noticed Chapter ${topWeak.chapter} (${topWeak.title.en}) has areas to reinforce.`;
    recZh = `系统发现您在第${topWeak.chapter}章（${topWeak.title.zh}）有待加强，建议重点攻克。`;
  }

  if (annotatedSectionsCount > 0) {
    recTh += ` และคุณมีบันทึกช่วยจำส่วนตัว ${annotatedSectionsCount} มาตรา สามารถทบทวนผ่านการ์ดความจำได้`;
    recEn += ` You also have ${annotatedSectionsCount} annotated sections ready in your Flashcard deck.`;
    recZh += ` 您还在${annotatedSectionsCount}条法条中添加了个人笔记，可在闪卡中针对性复习。`;
  }

  return {
    examTarget,
    weakestChapters,
    annotatedSectionsCount,
    recommendation: {
      th: recTh,
      en: recEn,
      zh: recZh,
    },
  };
}
