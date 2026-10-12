"use client";
import { StudyArt } from "./StudyArt";
import { useEffect, useState } from "react";
import questions from "@/data/questions.json";
import { dueQuestions } from "@/lib/learning";
import { useStudy } from "./Provider";
import { tr } from "@/lib/i18n";
import { Quiz } from "./Quiz";
export function Review() {
  const { lang, progress } = useStudy();
  const [now, setNow] = useState(0),
    [active, setActive] = useState(false),
    [mix, setMix] = useState(false);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  const due = dueQuestions(questions, progress, now);
  if (active)
    return (
      <Quiz
        queue={
          mix
            ? [...questions].sort(() => Math.random() - 0.5).slice(0, 8)
            : due.slice(0, 8)
        }
        onExit={() => {
          setActive(false);
          setNow(Date.now());
        }}
      />
    );
  const studied = Object.values(progress.questions).length;
  return (
    <>
      <span className="page-kicker mono">RETURN & REMEMBER · 04</span>
      <div className="review-intro">
        <StudyArt scene="review" />
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
            "คำถามที่เคยตอบจะกลับมาตามช่วงเวลา ข้อที่พลาดกลับมาเร็ว ข้อที่เข้าใจแล้วเว้นให้นานขึ้น",
            "Questions return over time. Missed ones return sooner; correct ones get more breathing room.",
            "学过的题目会按间隔再次出现。错题早点复习，答对的题目间隔更长。",
          )}
        </p>
      </div>
      <div className="review-count">
        <strong className="mono">{due.length}</strong>
        <span>
          {tr(lang, "ข้อถึงเวลาทบทวน", "questions due", "题到期复习")}
        </span>
      </div>
      <button
        className="primary"
        disabled={!due.length}
        onClick={() => {
          setMix(false);
          setActive(true);
        }}
      >
        {tr(lang, "ทบทวนที่ถึงเวลา", "Review due questions", "复习到期题目")} →
      </button>
      <div className="note">
        <h2>
          {tr(
            lang,
            "อยากลองหลายหมวด?",
            "Try a mixed session?",
            "想练习不同章节？",
          )}
        </h2>
        <p>
          {tr(
            lang,
            "สุ่ม 8 ข้อจากทุกหมวด ไม่ต้องรอคิวทบทวน",
            "Eight questions across chapters. You don’t have to wait for the review queue.",
            "从不同章节抽取八题，不用等待复习时间。",
          )}
        </p>
        <button
          onClick={() => {
            setMix(true);
            setActive(true);
          }}
        >
          {tr(lang, "เริ่มรอบรวมหมวด", "Start mixed practice", "开始综合练习")}{" "}
          ↗
        </button>
      </div>
      <p className="micro">
        {tr(
          lang,
          `เคยฝึก ${studied} ข้อ • ทบทวนหลังตอบถูกที่ 1, 3, 7 และ 14 วัน`,
          `You’ve tried ${studied} questions · Correct answers return after 1, 3, 7 and 14 days`,
          `已练习${studied}题 · 答对后按1、3、7、14天间隔复习`,
        )}
      </p>
    </>
  );
}
