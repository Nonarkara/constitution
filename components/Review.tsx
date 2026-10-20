"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { questionIndex as questions } from "@/lib/outline";
import { dueQuestions } from "@/lib/learning";
import { mixedPracticeQueue } from "@/lib/shuffle";
import { prioritizedReview, attemptedCount } from "@/lib/review-queue";
import { useStudy } from "./Provider";
import { tr } from "@/lib/i18n";
import dynamic from "next/dynamic";
const Quiz = dynamic(() => import("./Quiz").then((m) => m.Quiz));
import { analyzeUserLearning } from "@/lib/adaptive";
import { StudyArt } from "./StudyArt";

export function Review() {
  const { lang, progress, annotations } = useStudy();
  const [now, setNow] = useState(0),
    [active, setActive] = useState(false),
    [mode, setMode] = useState<"due" | "mix" | "annotated" | "weak">("due");

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const due = dueQuestions(questions, progress, now);

  const profile = useMemo(() => {
    return analyzeUserLearning(questions, progress, annotations);
  }, [progress, annotations]);

  const annotatedQuestions = useMemo(() => {
    const annotatedSecs = new Set(Object.keys(annotations).map(Number));
    return questions.filter((q) => q.sections.some((s) => annotatedSecs.has(s)));
  }, [annotations]);

  const weakQuestions = useMemo(() => {
    const weakChs = new Set(profile.weakestChapters);
    return questions.filter((q) => weakChs.has(q.chapter));
  }, [profile.weakestChapters]);

  const activeQueue = useMemo(() => {
    if (mode === "annotated") return prioritizedReview(annotatedQuestions, progress, now, 8);
    if (mode === "weak") return prioritizedReview(weakQuestions, progress, now, 8);
    if (mode === "mix") return mixedPracticeQueue(questions, 8);
    return due.slice(0, 8);
  }, [mode, due, annotatedQuestions, weakQuestions, progress, now]);

  if (active)
    return (
      <Quiz
        ids={activeQueue.map((q) => q.id)}
        onExit={() => {
          setActive(false);
          setNow(Date.now());
        }}
      />
    );
  const studied = attemptedCount(questions, progress);
  return (
    <>
      <div className="intro-copy">
        <StudyArt scene="review" />
        <div className="intro-text">
          <h1>
            {tr(
              lang,
              "จำได้ดีขึ้น\nเมื่อกลับมาอีกครั้ง",
              "Return to what\nyou’ve learned.",
              "再回顾一次，\n记得更牢。",
          )}
          </h1>
          <p>
            {tr(
              lang,
              "คำถามที่เคยตอบจะกลับมาตามช่วงเวลา ข้อที่พลาดกลับมาเร็ว ข้อที่เข้าใจแล้วเว้นให้นานขึ้น พร้อมโหมดปรับแต่งเฉพาะสำหรับมาตราที่คุณจดโน้ตไว้",
              "Questions return over time. Missed ones return sooner; correct ones get more breathing room. Includes tailored sessions for your annotated sections.",
              "学过的题目会按间隔再次出现。错题早点复习，答对的题目间隔更长。亦可针对您做过边注的法条进行专项自适应温习。",
          )}
          </p>
        </div>
      </div>

      {/* A big "0" is the loudest thing on a page that has nothing to review, and
          a zero states nothing a reader can act on. The count only appears when
          there is something due; otherwise the line says what will happen. */}
      {due.length > 0 ? (
        <div className="review-count">
          <strong className="mono">{due.length}</strong>
          <span>
            {tr(lang, "ข้อถึงเวลาทบทวน", "questions due", "题到期复习")}
          </span>
        </div>
      ) : (
        <p className="review-count-none">
          {tr(
            lang,
            "ยังไม่มีข้อถึงเวลาทบทวน คำถามที่ตอบผิดจะกลับมาหลังผ่านไป 1, 3, 7 และ 14 วัน",
            "Nothing is due for review yet. Questions you miss come back after 1, 3, 7 and 14 days.",
            "目前没有到期复习的题目。答错的题目会在 1、3、7、14 天后回来。",
          )}
        </p>
      )}

      <div className="review-primary-actions">
        <button
          className="primary"
          disabled={!due.length}
          onClick={() => {
            setMode("due");
            setActive(true);
          }}
        >
          {tr(lang, "ทบทวนที่ถึงเวลา", "Review due questions", "复习到期题目")} →
        </button>

        <Link href="/flashcards/" className="button">
          {tr(lang, "เปิดการ์ดความจำ", "Open the flashcards", "打开记忆闪卡")} →
        </Link>
      </div>

      {/* Adaptive Personalized Study Session */}
      <div className="note" style={{ marginTop: "24px" }}>
        <h2>
          {tr(
            lang,
            "ระบบแนะนำสำหรับคุณโดยเฉพาะ",
            "Customized for Your Learning Profile",
            "为您量身定制的专项复习",
          )}
        </h2>
        <p className="micro">{profile.recommendation[lang]}</p>

        <div className="flow-tabs" style={{ marginTop: "14px" }}>
          {annotatedQuestions.length > 0 && (
            <button
              onClick={() => {
                setMode("annotated");
                setActive(true);
              }}
            >
              <span className="mono">{annotatedQuestions.length}</span>
              {tr(lang, "ทบทวนมาตราที่จดโน้ต", "Review My Annotated Sections", "复习我的笔记法条")}
            </button>
          )}

          {weakQuestions.length > 0 && (
            <button
              onClick={() => {
                setMode("weak");
                setActive(true);
              }}
            >
              <span className="mono">{profile.weakestChapters.join(", ")}</span>
              {tr(lang, "ฝึกหมวดที่ต้องเสริมจุดอ่อน", "Strengthen Weak Chapters", "强化薄弱章节专项")}
            </button>
          )}

          <button
            onClick={() => {
              setMode("mix");
              setActive(true);
            }}
          >
            <span className="mono">8</span>
            {tr(lang, "สุ่ม 8 ข้อรอบรวมหมวด", "Start 8-Question Mixed Practice", "随机8题综合练习")}
          </button>
        </div>
      </div>

      <p className="micro">
        {tr(
          lang,
          `เคยฝึก ${studied} ข้อ • มีบันทึกช่วยจำ ${Object.keys(annotations).length} มาตรา • ทบทวนหลังตอบถูกที่ 1, 3, 7 และ 14 วัน`,
          `You’ve tried ${studied} questions · ${Object.keys(annotations).length} annotated sections · Correct answers return after 1, 3, 7 and 14 days`,
          `已练习${studied}题 · 已做笔记${Object.keys(annotations).length}条 · 答对后按1、3、7、14天间隔复习`,
        )}
      </p>
    </>
  );
}
