"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import questions from "@/data/questions.json";
import { chapters } from "@/lib/outline";
import { recordAnswer } from "@/lib/learning";
import { useStudy } from "./Provider";
import { choiceLetter, fisherYates } from "@/lib/shuffle";
import { preparePracticeQuestion, practiceSessionScore } from "@/lib/practice-session";
import { tr, sectionLabel } from "@/lib/i18n";
import {
  analyzeUserLearning,
  detectTopicWeaknesses,
  buildPracticeQueue,
  type TopicWeakness,
} from "@/lib/adaptive";
import { attemptedCount } from "@/lib/review-queue";
import { TeachingSteps } from "./TeachingSteps";
import { ExplainBack } from "./LearningCoach";
import { StudyArt } from "./StudyArt";

type Question = (typeof questions)[number];



export function PracticeArena() {
  const { lang, progress, save, annotations, examTarget } = useStudy();

  const [mode, setMode] = useState<
    "competition" | "weak" | "sprint" | "real-life" | "endless" | "chapter"
  >("competition");
  const [selectedChapter, setSelectedChapter] = useState<number>(11);
  const [immediateFeedback, setImmediateFeedback] = useState<boolean>(true);

  // Active quiz session state
  const [isActive, setIsActive] = useState<boolean>(false);
  const [queue, setQueue] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [sessionNotice, setSessionNotice] = useState("");

  // Adaptive profile and weaknesses
  const profile = useMemo(() => {
    return analyzeUserLearning(questions, progress, annotations, examTarget);
  }, [progress, annotations, examTarget]);

  const topicWeaknesses = useMemo(() => {
    return detectTopicWeaknesses(questions, progress);
  }, [progress]);

  const topTroubleSpots = useMemo(() => {
    return topicWeaknesses.filter((t) => t.errorCount > 0);
  }, [topicWeaknesses]);

  const startSession = (
    chosenMode: "competition" | "weak" | "sprint" | "real-life" | "endless" | "chapter",
    chNum?: number
  ) => {
    const qList = buildPracticeQueue(
      questions,
      progress,
      chosenMode,
      chNum ?? selectedChapter
    );
    if (!qList.length) {
      setSessionNotice(tr(lang, "ไม่มีข้อที่ต้องซ่อมตอนนี้ เลือกโหมดอื่นเพื่อฝึกต่อได้", "No questions need repair right now. Choose another mode to keep practising.", "目前没有待强化的题目，请选择其他模式继续练习。"));
      setIsActive(false);
      return;
    }
    setSessionNotice("");
    setMode(chosenMode);
    if (chNum) setSelectedChapter(chNum);
    setQueue(qList.map((question) => preparePracticeQuestion(question)));
    setCurrentIndex(0);
    setSelectedChoice(null);
    setSessionAnswers({});
    setShowExplanation(false);
    setSessionCompleted(false);
    setIsActive(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentQ = queue[currentIndex];
  const { correct: score, percentage } = practiceSessionScore(queue, sessionAnswers);

  const handleSelectChoice = (choiceIdx: number) => {
    if (selectedChoice !== null && immediateFeedback) return;
    setSelectedChoice(choiceIdx);

    const isCorrect = choiceIdx === currentQ.answer;

    // Record answer in global progress
    const updated = recordAnswer(progress, currentQ, isCorrect, Date.now());
    save(updated);

    setSessionAnswers((prev) => ({ ...prev, [currentQ.id]: choiceIdx }));

    if (immediateFeedback) {
      setShowExplanation(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedChoice(null);
      setShowExplanation(false);
    } else {
      setSessionCompleted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const startTopicDrill = (topic: TopicWeakness) => {
    const secSet = new Set(topic.sections);
    const topicQ = questions.filter((q) => q.sections.some((s) => secSet.has(s)));
    const shuffled = fisherYates(topicQ);
    setMode("weak");
    setQueue(shuffled.slice(0, 15).map((question) => preparePracticeQuestion(question)));
    setCurrentIndex(0);
    setSelectedChoice(null);
    setSessionAnswers({});
    setShowExplanation(false);
    setSessionCompleted(false);
    setIsActive(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="practice-arena">

      {!isActive ? (
        <>
          {sessionNotice && <p role="status">{sessionNotice}</p>}
          <header className="practice-header">
            <div className="intro-copy">
              <StudyArt scene="reading" compact />
              <h1>
                {tr(
                  lang,
                  "ฝึกตอบ\nแล้วดูว่าพลาดตรงไหน",
                  "Practise,\nthen see where you slip.",
                  "练习，\n然后看看哪里出错。"
                )}
              </h1>
              <p>
                {tr(
                  lang,
                  `${questions.length} ข้อ เขียนขึ้นจากตัวบทเพื่อฝึก ไม่ใช่ข้อสอบจริง ข้อที่ตอบผิดจะถูกจับกลุ่มเป็นเรื่อง เพื่อให้เห็นว่าควรกลับไปอ่านตรงไหน`,
                  `${questions.length} questions written from the text for practice, not past exam papers. Missed questions are grouped by subject so you can see what to reread.`,
                  `${questions.length}道依据条文编写的练习题，并非历年真题。答错的题按主题归类，让你知道该回去重读哪里。`
                )}
              </p>
            </div>
          </header>

          {/* Quick Sub-navigation Bar */}
          <nav className="practice-subnav" aria-label="Practice sub-navigation">
            <Link href="/review/" className="subnav-pill">
              {tr(lang, "ทบทวนตามรอบ", "Spaced review", "间隔复习")}
            </Link>
            <Link href="/exam/" className="subnav-pill">
              {tr(lang, "สอบจำลองจับเวลา", "Timed mock exam", "计时模考")}
            </Link>
            <Link href="/drills/" className="subnav-pill">
              {tr(lang, "เจาะตัวเลข 4,230 ข้อ", "4,230 number drills", "4,230道数字速练")}
            </Link>
            <Link href="/flashcards/" className="subnav-pill">
              {tr(lang, "การ์ดความจำ", "Flashcards", "记忆闪卡")}
            </Link>
            <Link href="/cheatsheet/" className="subnav-pill">
              {tr(lang, "สูตรและแผนภาพ", "Cheat sheets", "速查图解")}
            </Link>
            <Link href="/games/" className="subnav-pill">
              {tr(lang, "เกมจับคู่ตัวเลข", "Number games", "数字游戏")}
            </Link>
          </nav>

          {/* THE ADAPTIVE LEARNING DIAGNOSTIC RADAR */}
          <section className="adaptive-diagnostic-box">
            <div className="diag-head">
              <h2>
                {tr(
                  lang,
                  "เรื่องที่คุณพลาดบ่อย",
                  "Where your answers slip",
                  "你常出错的主题"
                )}
              </h2>
              <span className="micro mono">
                {tr(
                  lang,
                  `ฝึกแล้ว ${attemptedCount(questions, progress)} ข้อ / ${questions.length}`,
                  `Attempted ${attemptedCount(questions, progress)} / ${questions.length}`,
                  `已练 ${attemptedCount(questions, progress)} / ${questions.length} 题`
                )}
              </span>
            </div>

            <p className="diag-recommendation-text">{profile.recommendation[lang]}</p>

            {topTroubleSpots.length > 0 ? (
              <div className="trouble-spots-grid">
                {topTroubleSpots.map((topic) => (
                  <div className="trouble-spot-card" key={topic.id}>
                    <div className="spot-head">
                      <span className="spot-title font-bold">{topic.title[lang]}</span>
                      <span className="spot-badge-error mono">
                        {topic.errorCount} {tr(lang, "ข้อผิด", "missed", "处做错")}
                      </span>
                    </div>
                    <p className="micro spot-desc">{topic.description[lang]}</p>
                    <div className="spot-actions">
                      <span className="micro mono">
                        {tr(lang, "ความแม่นยำ:", "Accuracy:", "正确率:")}{" "}
                        <strong>{topic.accuracy}%</strong>
                      </span>
                      <button
                        className="btn-drill-spot micro"
                        onClick={() => startTopicDrill(topic)}
                      >
                        {tr(lang, "ฝึกเรื่องนี้", "Practise this", "练这个主题")} →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="all-clear-notice micro">
                <span>
                  {tr(
                    lang,
                    "ยังไม่มีเรื่องที่พลาดซ้ำ ลองฝึกสักชุด แล้วกลับมาดูที่นี่",
                    "Nothing you keep missing yet. Try a set, then come back here.",
                    "还没有反复出错的主题。先练一组，再回来看看。"
                  )}
                </span>
              </div>
            )}
          </section>

          {/* PRACTICE MODE SELECTOR */}
          <section className="practice-mode-selector">
            <h2>
              {tr(lang, "เลือกวิธีฝึก", "Choose how to practise", "选择练习方式")}
            </h2>

            <div className="mode-cards-grid">
              {/* Competition & Court Drill */}
              <div
                className="mode-card featured-mode"
                onClick={() => startSession("competition")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") startSession("competition");
                }}
              >
                <h3>
                  {tr(
                    lang,
                    "แนวแข่งขันตอบปัญหาศาลรัฐธรรมนูญ",
                    "Constitutional Court quiz-competition style",
                    "宪法法院知识竞赛风格"
                  )}
                </h3>
                <p>
                  {tr(
                    lang,
                    "30 ข้อที่เขียนขึ้นในแนวการแข่งขัน: การยื่นคำร้อง ม.212/213 ผู้รับสนองพระบรมราชโองการ พระราชกำหนด และการขัดกันแห่งผลประโยชน์",
                    "30 questions written in the competition style: s.212/213 petitions, royal countersignature, emergency decrees and conflicts of interest.",
                    "按竞赛风格编写的30道题：第212/213条申请、王室谕令副署、紧急法令及利益冲突。"
                  )}
                </p>
                <button className="primary mode-start-btn">
                  {tr(lang, "เริ่ม 30 ข้อ", "Start 30", "开始30题")} →
                </button>
              </div>

              {/* Adaptive Weakness Drill */}
              <div
                className="mode-card"
                onClick={() => startSession("weak")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") startSession("weak");
                }}
              >
                <h3>
                  {tr(
                    lang,
                    "ข้อที่เคยพลาด",
                    "What you missed",
                    "你答错过的题"
                  )}
                </h3>
                <p>
                  {tr(
                    lang,
                    "ข้อที่คุณตอบผิด และหมวดที่ยังไม่ผ่านเกณฑ์ วนกลับมาให้ลองใหม่",
                    "Questions you got wrong and chapters not yet passed, brought back to try again.",
                    "你答错的题和尚未达标的章节，再来一次。"
                  )}
                </p>
                <button className="mode-start-btn">
                  {tr(lang, "ลองใหม่ 20 ข้อ", "Retry 20", "重练20题")} →
                </button>
              </div>

              {/* 10-Question Sprint */}
              <div
                className="mode-card"
                onClick={() => startSession("sprint")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") startSession("sprint");
                }}
              >
                <h3>
                  {tr(lang, "สุ่ม 10 ข้อ", "Ten at random", "随机10题")}
                </h3>
                <p>
                  {tr(
                    lang,
                    "สิบข้อจากทั้งเล่ม พอดีช่วงพักสั้น ๆ เฉลยพร้อมวิธีคิดหลังตอบทุกข้อ",
                    "Ten from the whole text, for a short break. Each answer comes with the reasoning.",
                    "从全文随机抽十题，适合短暂休息时练。每题答后附解题思路。"
                  )}
                </p>
                <button className="mode-start-btn">
                  {tr(lang, "เริ่ม", "Start", "开始")} →
                </button>
              </div>

              {/* Real-Life Situations */}
              <div
                className="mode-card"
                onClick={() => startSession("real-life")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") startSession("real-life");
                }}
              >
                <h3>
                  {tr(
                    lang,
                    "เรื่องในชีวิตจริง",
                    "Everyday situations",
                    "日常生活情境"
                  )}
                </h3>
                <p>
                  {tr(
                    lang,
                    "การค้นบ้านโดยไม่มีหมาย การฟ้องหน่วยงานรัฐ การชุมนุม และหลักความได้สัดส่วนตามมาตรา 26",
                    "Searches without a warrant, suing a state agency, gathering to protest and the s.26 proportionality test.",
                    "无令搜查、起诉国家机关、集会抗议及第26条比例原则。"
                  )}
                </p>
                <button className="mode-start-btn">
                  {tr(lang, "เริ่ม", "Start", "开始")} →
                </button>
              </div>

              {/* Endless Marathon */}
              <div
                className="mode-card"
                onClick={() => startSession("endless")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") startSession("endless");
                }}
              >
                <h3>
                  {tr(
                    lang,
                    `ทั้งคลัง ${questions.length} ข้อ`,
                    `The whole bank, ${questions.length}`,
                    `全部${questions.length}题`
                  )}
                </h3>
                <p>
                  {tr(
                    lang,
                    "คำถามจากทั้งคลัง ทีละข้อต่อกันไป หยุดเมื่อไรก็ได้",
                    "Questions from the whole bank, one after another, until you stop.",
                    "从整个题库连续出题，一题接一题，随时可停。"
                  )}
                </p>
                <button className="mode-start-btn">
                  {tr(lang, "เริ่ม", "Start", "开始")} →
                </button>
              </div>

              {/* Specific Chapter Filter */}
              <div className="mode-card chapter-select-mode">
                <h3>
                  {tr(lang, "ทีละหมวด", "One chapter", "按章节")}
                </h3>
                <p>
                  {tr(
                    lang,
                    "หมวด 1 ถึง 16 หรือบทเฉพาะกาล",
                    "Chapters 1–16 or the transitory provisions.",
                    "第1至16章或过渡条款。"
                  )}
                </p>
                <div className="chapter-dropdown-row">
                  <select
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(Number(e.target.value))}
                    aria-label="Select Chapter"
                  >
                    {chapters.map((c) => (
                      <option key={c.number} value={c.number}>
                        {c.number === 17 ? "T" : `Ch ${c.number}`}: {c.title[lang]} (ม.{c.start}–{c.end})
                      </option>
                    ))}
                  </select>
                  <button
                    className="primary"
                    onClick={() => startSession("chapter", selectedChapter)}
                  >
                    {tr(lang, "ฝึกหมวดนี้", "Practise", "练习本章")} →
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : sessionCompleted ? (
        /* SESSION RESULT SCREEN */
        <div className="session-result-screen">
          <div className="result-card">
            <h2>
              {tr(lang, "จบรอบนี้แล้ว", "That's the set", "本轮结束")}
            </h2>
            <div className="result-score-display">
              <span className="mono score-number">
                {score} / {queue.length}
              </span>
              <span className="score-percentage mono">
                ({Math.round((score / queue.length) * 100)}%)
              </span>
            </div>
            <p className="micro">
              {tr(
                lang,
                "ข้อที่พลาดจะกลับมาให้ลองอีกครั้งในรอบทบทวน",
                "The ones you missed come back in review.",
                "答错的题会在复习时再出现。"
              )}
            </p>

            <div className="result-actions-row">
              <button
                className="primary"
                onClick={() => startSession(mode, selectedChapter)}
              >
                ↻ {tr(lang, "อีกรอบ", "Again", "再来一轮")}
              </button>
              <button onClick={() => setIsActive(false)}>
                ← {tr(lang, "เลือกวิธีฝึกใหม่", "Choose another way", "换一种方式")}
              </button>
              <Link href="/review/" className="button">
                {tr(lang, "ไปหน้าทบทวน", "Go to review", "前往复习")} →
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* ACTIVE QUESTION CARD */
        <div className="active-quiz-container">
          <div className="quiz-top-bar">
            <button
              className="btn-exit micro"
              onClick={() => setIsActive(false)}
            >
              ← {tr(lang, "ออกจากการฝึก", "Exit Practice", "退出练习")}
            </button>
            <div className="quiz-progress-stats micro mono">
              <span>
                QUESTION {currentIndex + 1} / {queue.length}
              </span>
              <span>
                SCORE: {score} ({percentage}%)
              </span>
            </div>
          </div>

          <progress
            value={currentIndex + 1}
            max={queue.length}
            className="quiz-progress-line"
          />

          <article className="question-card">
            <header className="question-card-head">
              <span className="mono ch-tag">
                {currentQ.chapter === 17
                  ? "TRANSITORY"
                  : `CHAPTER ${currentQ.chapter}`}
              </span>
              <div className="sec-tags">
                {currentQ.sections.map((n) => (
                  <span className="mono sec-pill" key={n}>
                    {sectionLabel(lang, n)}
                  </span>
                ))}
              </div>
            </header>

            <h2 className="question-prompt-text">{currentQ.prompt[lang]}</h2>

            {/* Answer Choices */}
            <div className="choices-list" role="radiogroup">
              {currentQ.choices.map((choice, idx) => {
                const isSelected = selectedChoice === idx;
                const isCorrect = idx === currentQ.answer;
                let choiceStateClass = "";
                if (showExplanation) {
                  if (isCorrect) choiceStateClass = "choice-correct";
                  else if (isSelected) choiceStateClass = "choice-wrong";
                } else if (isSelected) {
                  choiceStateClass = "choice-selected";
                }

                return (
                  <div
                    key={idx}
                    className={`choice-card ${choiceStateClass}`}
                    onClick={() => handleSelectChoice(idx)}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleSelectChoice(idx);
                    }}
                  >
                    <span className="mono choice-letter">
                      {choiceLetter(lang, idx)}
                    </span>
                    <span className="choice-text">{choice[lang]}</span>
                  </div>
                );
              })}
            </div>

            {/* Immediate Explanation Card */}
            {showExplanation && (
              <div
                className={`explanation-panel ${
                  selectedChoice === currentQ.answer
                    ? "panel-correct"
                    : "panel-wrong"
                }`}
              >
                <div className="explanation-head">
                  <span className="font-bold">
                    {selectedChoice === currentQ.answer
                      ? tr(lang, "ถูก", "Correct", "正确")
                      : `${tr(
                          lang,
                          `ยังไม่ถูกต้อง คำตอบที่ถูกคือข้อ ${choiceLetter(lang, currentQ.answer)}`,
                          `Incorrect. The correct answer is (${choiceLetter(lang, currentQ.answer)})`,
                          `回答错误，正确答案为 (${choiceLetter(lang, currentQ.answer)})`
                        )}`}
                  </span>
                </div>

                <p className="explanation-body">{currentQ.explanation[lang]}</p>
                <TeachingSteps question={currentQ} selected={selectedChoice ?? undefined}/>
                <ExplainBack section={currentQ.sections[0]}/>

                {/* Personal Notes Callout if User has Annotated this Section */}
                {currentQ.sections.some((s) => annotations[s]?.note) && (
                  <div className="user-note-callout micro">
                    <span className="mono font-bold text-accent">
                      ✍️ {tr(lang, "บันทึกช่วยจำของคุณในมาตรานี้:", "Your personal note for this section:", "您在相关法条记录的笔记:")}
                    </span>
                    <p>
                      {currentQ.sections
                        .map((s) => annotations[s]?.note)
                        .filter(Boolean)
                        .join("\n")}
                    </p>
                  </div>
                )}

                <div className="explanation-links-row micro">
                  {currentQ.sections.map((s) => (
                    <Link
                      key={s}
                      href={`/notebook/?jump=${s}`}
                      className="link-underlined"
                    >
                      📖 {tr(lang, `เปิดดู ม.${s} ในสมุดคู่หน้า →`, `Open Sec ${s} in Notebook →`, `在双页开本中阅读第${s}条 →`)}
                    </Link>
                  ))}
                  <Link
                    href={`/flashcards/?sec=${currentQ.sections[0]}`}
                    className="link-underlined"
                  >
                    {tr(lang, "เปิดการ์ดความจำ →", "Open flashcard →", "打开记忆闪卡 →")}
                  </Link>
                </div>

                <div className="next-btn-container">
                  <button className="primary btn-next-q" onClick={handleNext}>
                    {currentIndex < queue.length - 1
                      ? tr(lang, "ข้อถัดไป →", "Next Question →", "下一题 →")
                      : tr(lang, "ดูสรุปผลคะแนน →", "View Final Score →", "查看考试成绩 →")}
                  </button>
                </div>
              </div>
            )}
          </article>
        </div>
      )}
    </div>
  );
}
