"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import questions from "@/data/questions.json";
import { chapters } from "@/lib/outline";
import { recordAnswer } from "@/lib/learning";
import { useStudy } from "./Provider";
import { tr, sectionLabel } from "@/lib/i18n";
import {
  analyzeUserLearning,
  detectTopicWeaknesses,
  buildPracticeQueue,
  type TopicWeakness,
} from "@/lib/adaptive";
import { StudyArt } from "./StudyArt";

type Question = (typeof questions)[number];

const letters = ["ก", "ข", "ค", "ง"];

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
  const [score, setScore] = useState<number>(0);

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
    setMode(chosenMode);
    if (chNum) setSelectedChapter(chNum);
    setQueue(qList);
    setCurrentIndex(0);
    setSelectedChoice(null);
    setSessionAnswers({});
    setShowExplanation(false);
    setSessionCompleted(false);
    setScore(0);
    setIsActive(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentQ = queue[currentIndex];

  const handleSelectChoice = (choiceIdx: number) => {
    if (selectedChoice !== null && immediateFeedback) return;
    setSelectedChoice(choiceIdx);

    const isCorrect = choiceIdx === currentQ.answer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

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
    const shuffled = [...topicQ].sort(() => Math.random() - 0.5);
    setMode("weak");
    setQueue(shuffled.slice(0, 15));
    setCurrentIndex(0);
    setSelectedChoice(null);
    setSessionAnswers({});
    setShowExplanation(false);
    setSessionCompleted(false);
    setScore(0);
    setIsActive(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="practice-arena">
      <span className="page-kicker mono">EXAM PRACTICE ARENA · 03</span>

      {!isActive ? (
        <>
          <header className="practice-header">
            <div className="intro-copy">
              <StudyArt scene="reading" compact />
              <h1>
                {tr(
                  lang,
                  "คลังฝึกทำข้อสอบรัฐธรรมนูญ\nพร้อมระบบวิเคราะห์จุดที่ต้องช่วยเสริม",
                  "Constitutional Exam Practice:\nAdaptive Mastery & Competition Arena.",
                  "宪法题库强化练习：\n自适应诊断与竞赛专项。"
                )}
              </h1>
              <p>
                {tr(
                  lang,
                  `ฝึกทำข้อสอบจริง ${questions.length} ข้อ ทั้งแนวแข่งขันตอบปัญหากฎหมายศาลรัฐธรรมนูญ ข้อสอบราชการ และสถานการณ์จริงในชีวิต ระบบจะตรวจจับจุดที่คุณยังตอบผิดและจัดชุดฝึกแก้จุดอ่อนให้โดยอัตโนมัติ`,
                  `Practice across all ${questions.length} competition and real-situation exam questions. The adaptive engine detects your specific trouble spots and personalizes targeted drills.`,
                  `练习全部${questions.length}道宪法竞赛与实战案例题。系统实时诊断您的薄弱知识点，自动量身定制针对性强化训练。`
                )}
              </p>
            </div>
          </header>

          {/* Quick Sub-navigation Bar */}
          <nav className="practice-subnav" aria-label="Practice sub-navigation">
            <Link href="/review/" className="subnav-pill">
              ⏱ {tr(lang, "ทบทวนตามรอบ (Spaced)", "Spaced Review", "间隔复习")}
            </Link>
            <Link href="/exam/" className="subnav-pill">
              📝 {tr(lang, "สอบจำลองจับเวลา (Mock Exam)", "Timed Mock Exam", "计时模考")}
            </Link>
            <Link href="/flashcards/" className="subnav-pill">
              🗂 {tr(lang, "การ์ดความจำ (Flashcards)", "Flashcards", "记忆闪卡")}
            </Link>
            <Link href="/cheatsheet/" className="subnav-pill">
              📊 {tr(lang, "สูตร & แผนภาพ (Cheat Sheets)", "Cheat Sheets", "速查公式")}
            </Link>
          </nav>

          {/* THE ADAPTIVE LEARNING DIAGNOSTIC RADAR */}
          <section className="adaptive-diagnostic-box">
            <div className="diag-head">
              <h2>
                🧠 {tr(
                  lang,
                  "ระบบตรวจจับและเรียนรู้จุดที่ต้องช่วยเสริมของคุณ",
                  "What the System Learns You Need Help On",
                  "系统为您诊断出的待加强薄弱点"
                )}
              </h2>
              <span className="micro mono">
                {tr(
                  lang,
                  `ฝึกแล้ว ${Object.keys(progress.questions).length} ข้อ / ${questions.length}`,
                  `Attempted ${Object.keys(progress.questions).length} / ${questions.length}`,
                  `已练 ${Object.keys(progress.questions).length} / ${questions.length} 题`
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
                        ❌ {topic.errorCount} {tr(lang, "ข้อผิด", "missed", "处做错")}
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
                        🎯 {tr(lang, "ฝึกซ่อมจุดนี้ทันที", "Drill This Spot", "立即专练此项")} →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="all-clear-notice micro">
                <span>
                  ✨ {tr(
                    lang,
                    "ยังไม่มีจุดผิดสะสม! เลือกลองทำชุดข้อสอบแข่งขันเพื่อทดสอบความจำเชิงลึก",
                    "No accumulated trouble spots yet! Choose a competition drill to test deep recall.",
                    "暂无明显错题累积！建议选择竞赛专项或情境题目检验深层记忆。"
                  )}
                </span>
              </div>
            )}
          </section>

          {/* PRACTICE MODE SELECTOR */}
          <section className="practice-mode-selector">
            <h2>
              {tr(lang, "เลือกโหมดฝึกทำข้อสอบ", "Choose Your Practice Mode", "选择练习模式")}
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
                <div className="mode-badge mono">RECOMMENDED</div>
                <div className="mode-card-icon">🏛️</div>
                <h3>
                  {tr(
                    lang,
                    "ข้อสอบแข่งขันตอบปัญหากฎหมายศาลรัฐธรรมนูญ",
                    "Constitutional Court Competition Exam",
                    "宪法法院法律竞赛真题与模拟题"
                  )}
                </h3>
                <p>
                  {tr(
                    lang,
                    "30 ข้อคัดสรร: วิธีพิจารณาคดี ม.212/213, ผู้ลงนามรับสนองพระบรมราชโองการ, พระราชกำหนด, และการขัดกันแห่งผลประโยชน์",
                    "30 curated high-yield questions: Sec 212/213 petitions, royal countersignatures, emergency decrees, and judicial review.",
                    "30道高频真题：第212/213条审理程序、王室谕令副署、紧急法令审查及利益冲突。"
                  )}
                </p>
                <button className="primary mode-start-btn">
                  {tr(lang, "เริ่มฝึก 30 ข้อ", "Start 30 Questions", "开始30题专项")} →
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
                <div className="mode-card-icon">🎯</div>
                <h3>
                  {tr(
                    lang,
                    "โหมดซ่อมจุดอ่อนส่วนบุคคล",
                    "Adaptive Personal Weakness Drill",
                    "个人专属薄弱点强化"
                  )}
                </h3>
                <p>
                  {tr(
                    lang,
                    "ระบบดึงเฉพาะข้อที่คุณเคยตอบผิดและหมวดที่ยังไม่แม่นยำมาให้ฝึกซ้ำจนกว่าจะเชี่ยวชาญ",
                    "Automatically serves past mistakes and unmastered chapters until you reach full recall.",
                    "系统自动提取您的既往错题及未完全掌握章节，循环训练直至彻底掌握。"
                  )}
                </p>
                <button className="mode-start-btn">
                  {tr(lang, "ซ่อมจุดอ่อน 20 ข้อ", "Drill Weak Spots (20)", "攻克薄弱20题")} →
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
                <div className="mode-card-icon">⚡</div>
                <h3>
                  {tr(lang, "สปรินต์ด่วน 10 ข้อ", "Rapid 10-Question Sprint", "10题极速挑战")}
                </h3>
                <p>
                  {tr(
                    lang,
                    "สุ่ม 10 ข้อรวดเร็ว เหมาะสำหรับการฝึกสั้นๆ ระหว่างวัน เฉลยพร้อมสูตรคิดทันที",
                    "10 fast random questions ideal for quick daily practice with instant algorithmic explanations.",
                    "随机10道快题，适合碎片化时间练习，附即时算法解析。"
                  )}
                </p>
                <button className="mode-start-btn">
                  {tr(lang, "เริ่มสปรินต์", "Start Sprint", "开始极速答题")} →
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
                <div className="mode-card-icon">🔍</div>
                <h3>
                  {tr(
                    lang,
                    "สถานการณ์จริง & การใช้สิทธิประชาชน",
                    "Real-Life Situations & Citizen Rights",
                    "现实生活法律案例与公民维权"
                  )}
                </h3>
                <p>
                  {tr(
                    lang,
                    "โจทย์ปัญหาประยุกต์: การค้นบ้านโดยไม่มีหมาย, สิทธิฟ้องรัฐ, การรวมกลุ่ม, และหลักความได้สัดส่วน ม.26",
                    "Scenario-based problem-solving: warrantless searches, suing state agencies, community protests, and Sec 26 proportionality.",
                    "实用情境题：无令搜查、起诉国家机关不作为、社区环境维权及第26条比例原则。"
                  )}
                </p>
                <button className="mode-start-btn">
                  {tr(lang, "เริ่มฝึกเคสจริง", "Practice Scenarios", "练习实战案例")} →
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
                <div className="mode-card-icon">♾️</div>
                <h3>
                  {tr(
                    lang,
                    `ฝึกไม่จำกัด (${questions.length} ข้อรวด)`,
                    `Endless Marathon (All ${questions.length})`,
                    `全题库无尽马拉松（共${questions.length}题）`
                  )}
                </h3>
                <p>
                  {tr(
                    lang,
                    "ฝึกตอบต่อเนื่องไม่รู้จบ สะสมคะแนนและสตรีค เหมาะสำหรับผู้เตรียมสอบแข่งขันเข้มข้น",
                    "Continuous practice through the entire bank. Keep your streak and XP rising without interruption.",
                    "无尽连续练习，持续累积经验值与连击，适合深度备考。"
                  )}
                </p>
                <button className="mode-start-btn">
                  {tr(lang, "เปิดโหมดไม่จำกัด", "Start Endless", "开启无尽模式")} →
                </button>
              </div>

              {/* Specific Chapter Filter */}
              <div className="mode-card chapter-select-mode">
                <div className="mode-card-icon">📑</div>
                <h3>
                  {tr(lang, "เลือกฝึกเจาะจงรายหมวด", "Practice by Specific Chapter", "按具体章节专练")}
                </h3>
                <p>
                  {tr(
                    lang,
                    "เลือกหมวด 1 ถึง 16 หรือบทเฉพาะกาล เพื่อทบทวนเนื้อหาเฉพาะด้าน",
                    "Pick any specific chapter (1–16 or Transitory Provisions) to focus deeply on that subject.",
                    "自选第1至16章或过渡条款，深度攻克单章考点。"
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
                    {tr(lang, "ฝึกหมวดนี้", "Drill Chapter", "专练此章")} →
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
              🎉 {tr(lang, "เสร็จสิ้นการฝึกฝนรอบนี้!", "Practice Session Completed!", "本轮练习完成！")}
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
                "คำตอบของคุณถูกบันทึกลงในสถิติการเรียนรู้ และข้อที่ตอบผิดจะถูกส่งต่อไปยังระบบทบทวนตามรอบและสำรับการ์ดความจำโดยอัตโนมัติ",
                "Your answers have updated your study profile. Any missed questions have entered your spaced repetition and weakness queues.",
                "您的作答数据已更新至个人学习画像，错题已自动同步至间隔复习与薄弱练习队列。"
              )}
            </p>

            <div className="result-actions-row">
              <button
                className="primary"
                onClick={() => startSession(mode, selectedChapter)}
              >
                ↻ {tr(lang, "ฝึกซ้ำอีกรอบ", "Practice Again", "再练一轮")}
              </button>
              <button onClick={() => setIsActive(false)}>
                ← {tr(lang, "กลับหน้ารวมโหมดฝึก", "Back to Modes", "返回模式选择")}
              </button>
              <Link href="/review/" className="button">
                ⏱ {tr(lang, "ไปหน้าทบทวน", "Go to Review", "前往复习")} ↗
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
                SCORE: {score} ({currentIndex > 0 ? Math.round((score / currentIndex) * 100) : 0}%)
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
                      {letters[idx] ?? String.fromCharCode(65 + idx)}
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
                      ? `✅ ${tr(lang, "ถูกต้องยอดเยี่ยม!", "Correct!", "回答正确！")}`
                      : `❌ ${tr(
                          lang,
                          `ยังไม่ถูกต้อง คำตอบที่ถูกคือข้อ ${letters[currentQ.answer]}`,
                          `Incorrect. The correct answer is (${letters[currentQ.answer]})`,
                          `回答错误，正确答案为 (${letters[currentQ.answer]})`
                        )}`}
                  </span>
                </div>

                <p className="explanation-body">{currentQ.explanation[lang]}</p>

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
                      📖 {tr(lang, `เปิดดู ม.${s} ในสมุดคู่หน้า ↗`, `Open Sec ${s} in Notebook ↗`, `在双页开本中阅读第${s}条 ↗`)}
                    </Link>
                  ))}
                  <Link
                    href={`/flashcards/?sec=${currentQ.sections[0]}`}
                    className="link-underlined"
                  >
                    🗂 {tr(lang, "เปิดการ์ดความจำ ↗", "Open Flashcard ↗", "打开记忆闪卡 ↗")}
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
