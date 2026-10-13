import type { Progress, Question } from "./learning.ts";
import type { UserAnnotations } from "./annotations.ts";
import outlineData from "../data/outline.json" with { type: "json" };
import { fisherYates } from "./shuffle.ts";

const chapters = outlineData.chapters;

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

  const answeredTotal = analysis.reduce((sum, row) => sum + row.answeredCount, 0);
  // An empty profile has no errors to explain. Naming the largest chapter
  // (Parliament) would be a guess, not an insight.
  const weakestChapters =
    answeredTotal === 0
      ? []
      : analysis
          .filter((row) => row.errorCount > 0)
          .sort((a, b) => b.errorCount - a.errorCount || b.priorityScore - a.priorityScore)
          .slice(0, 3)
          .map((row) => row.chapter);

  const annotatedSectionsCount = Object.keys(annotations).length;

  // Build adaptive recommendations in 3 languages
  let recTh = "เริ่มต้นฝึกฝนตามเส้นทางปกติ หมั่นทบทวนคำถามที่ตอบผิด";
  let recEn = "Follow your daily learning path; focus on review intervals.";
  let recZh = "按照常规路径练习，重点复习错题。";

  if (weakestChapters.length > 0) {
    const topWeak = analysis.find((row) => row.chapter === weakestChapters[0])!;
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

export type TopicWeakness = {
  id: string;
  title: { th: string; en: string; zh: string };
  description: { th: string; en: string; zh: string };
  sections: number[];
  errorCount: number;
  totalQuestions: number;
  answeredCount: number;
  accuracy: number;
};

export const CORE_TOPICS = [
  {
    id: "court-procedures",
    title: {
      th: "ศาลรัฐธรรมนูญและกระบวนการยื่นคำร้อง (ม.210–214)",
      en: "Constitutional Court Procedures (Sec 210–214)",
      zh: "宪法法院与诉讼审理程序（第210–214条）"
    },
    description: {
      th: "การส่งเรื่องตาม ม.212 (ศาลส่ง) เทียบกับ ม.213 (ประชาชนยื่นตรงผ่านผู้ตรวจการแผ่นดิน)",
      en: "Incidental referral (Sec 212) vs. Direct citizen petition (Sec 213)",
      zh: "第212条法院移送与第213条公民直接申诉之区别"
    },
    sections: [210, 211, 212, 213, 214]
  },
  {
    id: "royal-countersign",
    title: {
      th: "ผู้ลงนามรับสนองพระบรมราชโองการ",
      en: "Countersignatories to Royal Commands",
      zh: "王室谕令副署人制度"
    },
    description: {
      th: "ใครลงนามแต่งตั้งนายกฯ (ประธานสภาผู้แทนฯ) เทียบกับประธานองคมนตรี (ประธานรัฐสภา)",
      en: "Countersignatures: PM (House Speaker) vs. Privy Council President (Assembly President)",
      zh: "任命总理（众议院议长）与任命枢密院院长（国会主席）之副署区分"
    },
    sections: [11, 122, 145, 158, 172, 175, 203]
  },
  {
    id: "emergency-decrees",
    title: {
      th: "พระราชกำหนดและการตรวจสอบความฉุกเฉิน (ม.172–174)",
      en: "Emergency Decrees & 4-Gate Review (Sec 172–174)",
      zh: "紧急法令与紧迫性审查程序（第172–174条）"
    },
    description: {
      th: "เงื่อนไขจำเป็นฉุกเฉิน และสิทธิ ส.ส./ส.ว. 1/5 เข้าชื่อส่งศาลรัฐธรรมนูญ",
      en: "Criteria of urgent necessity & 1/5 MPs/Senators petitioning the Constitutional Court",
      zh: "紧迫法定条件与五分之一议员提请宪法法院审查机制"
    },
    sections: [172, 173, 174]
  },
  {
    id: "proportionality-rights",
    title: {
      th: "หลักความได้สัดส่วนและสิทธิฟ้องรัฐ (ม.25–26, 41, 51)",
      en: "Proportionality & Right to Sue the State (Sec 25–26, 41, 51)",
      zh: "比例原则与公民起诉国家权（第25–26、41、51条）"
    },
    description: {
      th: "การจำกัดสิทธิต้องไม่กระทบสาระสำคัญ และสิทธิฟ้องหน่วยงานรัฐที่ไม่ปฏิบัติหน้าที่",
      en: "Restrictions must not impair essential core; citizen right to sue non-compliant agencies",
      zh: "限制权利不得侵犯核心本质，及对不履职国家机关提起诉讼"
    },
    sections: [25, 26, 33, 41, 43, 51]
  },
  {
    id: "parliamentary-checks",
    title: {
      th: "การตรวจสอบ ส.ส./ส.ว. และการสิ้นสุดสมาชิกภาพ (ม.82, 101, 148)",
      en: "Parliamentary Status Loss & Bill Review (Sec 82, 101, 148)",
      zh: "议员资格终止审查与违宪法案先期审查（第82、101、148条）"
    },
    description: {
      th: "การเข้าชื่อ 1/10 ส่งศาลรัฐธรรมนูญตรวจสอบสมาชิกภาพ หรือตรวจสอบร่าง พ.ร.บ. ก่อนทูลเกล้าฯ",
      en: "1/10 signature threshold to challenge MP qualifications or bills before Royal Assent",
      zh: "十分之一议员联名提请审查议员资格或御准前审查法案"
    },
    sections: [82, 98, 101, 148, 170]
  },
  {
    id: "amendments-referendum",
    title: {
      th: "การแก้ไขรัฐธรรมนูญและประชามติ (ม.255–256)",
      en: "Constitutional Amendments & Referendum (Sec 255–256)",
      zh: "宪法修改程序与公决三道锁（第255–256条）"
    },
    description: {
      th: "ข้อห้ามแก้ไขเด็ดขาด ม.255, เกณฑ์ ส.ว. 1/3, และเกณฑ์ทำประชามติ ม.256(8)",
      en: "Absolute ban (Sec 255), 1/3 Senate lock, and mandatory referendums (Sec 256(8))",
      zh: "绝对禁修条款（第255条）、参议院三分之一锁与必经公投事项"
    },
    sections: [255, 256]
  }
];

export function detectTopicWeaknesses(
  questions: Pick<Question, "id" | "sections">[],
  progress: Progress
): TopicWeakness[] {
  return CORE_TOPICS.map((topic) => {
    const secSet = new Set(topic.sections);
    const topicQuestions = questions.filter((q) =>
      q.sections.some((s) => secSet.has(s))
    );
    let totalQuestions = topicQuestions.length;
    let answeredCount = 0;
    let correctCount = 0;
    let errorCount = 0;

    for (const q of topicQuestions) {
      const record = progress.questions[q.id];
      if (record) {
        answeredCount++;
        if (record.correct) correctCount++;
        else errorCount++;
      }
    }

    const accuracy =
      answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

    return {
      id: topic.id,
      title: topic.title,
      description: topic.description,
      sections: topic.sections,
      errorCount,
      totalQuestions,
      answeredCount,
      accuracy,
    };
  }).sort((a, b) => b.errorCount - a.errorCount);
}

export function buildPracticeQueue(
  allQuestions: Question[],
  progress: Progress,
  mode: "competition" | "weak" | "sprint" | "real-life" | "endless" | "chapter",
  chapterNum?: number
): Question[] {
  if (mode === "chapter" && chapterNum) {
    return allQuestions.filter((q) => q.chapter === chapterNum);
  }

  if (mode === "competition") {
    // Priority to comp-* and constitutional court / procedure questions
    const compList = allQuestions.filter((q) => q.id.startsWith("comp-"));
    const related = allQuestions.filter(
      (q) => !q.id.startsWith("comp-") && (q.chapter === 11 || q.chapter === 8 || q.chapter === 15)
    );
    const shuffledRelated = fisherYates(related);
    return [...compList, ...shuffledRelated].slice(0, 30);
  }

  if (mode === "weak") {
    // Questions answered with errors first, then unmastered questions from weakest chapters
    const errorQuestions: Question[] = [];
    const unmastered: Question[] = [];
    for (const q of allQuestions) {
      const rec = progress.questions[q.id];
      if (rec && !rec.correct) {
        errorQuestions.push(q);
      } else if (!rec) {
        unmastered.push(q);
      }
    }
    const combined = [...errorQuestions, ...fisherYates(unmastered)];
    return combined.slice(0, 20);
  }

  if (mode === "real-life") {
    // Chapters 3 (Rights), 5 (Duties of State), and sections on citizen standing
    const scenarioSections = new Set([25, 26, 27, 28, 29, 32, 33, 34, 41, 42, 43, 47, 50, 51, 54, 59, 212, 213]);
    const matches = allQuestions.filter((q) => q.sections.some((s) => scenarioSections.has(s)));
    return fisherYates(matches).slice(0, 20);
  }

  if (mode === "sprint") {
    return fisherYates(allQuestions).slice(0, 10);
  }

  // Endless / all
  return fisherYates(allQuestions);
}

