"use client";
import { QuestionVisual } from "./QuestionVisual";
import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import questions from "@/data/questions.json";
import { chapters } from "@/lib/outline";
import { recordAnswer } from "@/lib/learning";
import { useStudy } from "./Provider";
import { choiceLetter, fisherYates } from "@/lib/shuffle";
import { encodeMixedRound, MIXED_CHECKPOINT, parseMixedRound, preparePracticeQuestion, practiceSessionScore } from "@/lib/practice-session";
import { tr, sectionLabel, chapterPickerLabel, chapterLabel } from "@/lib/i18n";
import { buildPracticeQueue } from "@/lib/adaptive";
import { buildMixedSession, buildSectionSession, MIXED_DRILLS } from "@/lib/mixed";
import dynamic from "next/dynamic";
import { TeachingSteps } from "./TeachingSteps";
import { ExplainBack } from "./LearningCoach";
import { StudyArt } from "./StudyArt";
import { useHidePageNext } from "./Shell";
import { PracticeTabs } from "./PracticeTabs";

const PokklongPractice = dynamic(() =>
  import("./PokklongPractice").then((mod) => mod.PokklongPractice),
);

type Question = (typeof questions)[number];
const mixedBank = [...questions, ...MIXED_DRILLS];



export function PracticeArena({ guessFirst = false }: { guessFirst?: boolean } = {}) {
  if (guessFirst) return <PokklongPractice />;
  return <ConstitutionArena />;
}

function ConstitutionArena() {
  const { lang, progress, save, annotations, ready } = useStudy();
  const autostarted = useRef(false);

  const [mode, setMode] = useState<
    "competition" | "weak" | "sprint" | "real-life" | "endless" | "chapter"
  >("competition");
  const [selectedChapter, setSelectedChapter] = useState<number>(11);
  const [mixed, setMixed] = useState(false);
  const [checkpointReady, setCheckpointReady] = useState(false);
  const [checkpointError, setCheckpointError] = useState(false);
  const questionHeading = useRef<HTMLHeadingElement>(null);
  const feedbackHeading = useRef<HTMLSpanElement>(null);

  // Active quiz session state
  const [isActive, setIsActive] = useState<boolean>(false);
  const [queue, setQueue] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [sessionNotice, setSessionNotice] = useState("");
  useHidePageNext(isActive);

  const startSession = (
    chosenMode: "competition" | "weak" | "sprint" | "real-life" | "endless" | "chapter",
    chNum?: number,
    limit?: number,
  ) => {
    const built = buildPracticeQueue(
      questions,
      progress,
      chosenMode,
      chNum ?? selectedChapter
    );
    const qList = limit ? fisherYates(built).slice(0, limit) : built;
    if (!qList.length) {
      setSessionNotice(tr(lang, "ไม่มีข้อที่ต้องซ่อมตอนนี้ เลือกโหมดอื่นเพื่อฝึกต่อได้", "No questions need repair right now. Choose another mode to keep practising.", "目前没有待强化的题目，请选择其他模式继续练习。"));
      setIsActive(false);
      return;
    }
    setSessionNotice("");
    setMode(chosenMode);
    if (chNum) setSelectedChapter(chNum);
    setMixed(false);
    setQueue(qList.map((question) => preparePracticeQuestion(question)));
    setCurrentIndex(0);
    setSelectedChoice(null);
    setSessionAnswers({});
    setShowExplanation(false);
    setSessionCompleted(false);
    setIsActive(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const begin = (items: Question[], isMixed = false) => {
    if (!items.length) {
      setSessionNotice(tr(lang, "ยังไม่มีข้อในชุดนี้", "This set has no questions yet.", "这组还没有题目。"));
      setIsActive(false);
      return;
    }
    setSessionNotice("");
    setMode("weak");
    setMixed(isMixed);
    setQueue(items.map((question) => preparePracticeQuestion(question)));
    setCurrentIndex(0);
    setSelectedChoice(null);
    setSessionAnswers({});
    setShowExplanation(false);
    setSessionCompleted(false);
    setIsActive(true);
  };

  const startMixed = () => begin(buildMixedSession(questions, progress, Date.now()), true);

  const startSectionDrill = (section: number) => {
    begin(buildSectionSession(questions, section));
  };

  const openFromQuery = (session: string | null, check: number, section: number) => {
    if (autostarted.current) return;
    setCheckpointReady(true);
    if (!check && (!session || session === "mixed")) {
      try {
        const raw = localStorage.getItem(MIXED_CHECKPOINT);
        const saved = raw && parseMixedRound(raw, mixedBank);
        if (saved) {
          autostarted.current = true;
          setMode("weak");
          setMixed(true);
          setQueue(saved.queue);
          setCurrentIndex(saved.index);
          setSessionAnswers(saved.answers);
          setSelectedChoice(saved.selected);
          setShowExplanation(Object.hasOwn(saved.answers, saved.queue[saved.index].id));
          setIsActive(true);
          return;
        }
      } catch { setCheckpointError(true); }
    }
    if (session === "mixed") {
      autostarted.current = true;
      startMixed();
    } else if (session === "drill" && section) {
      autostarted.current = true;
      startSectionDrill(section);
    } else if (check) {
      autostarted.current = true;
      startSession("chapter", check, 5);
    }
  };

  const currentQ = queue[currentIndex];
  const { correct: score, percentage } = practiceSessionScore(queue, sessionAnswers);

  useEffect(() => {
    if (!checkpointReady || !mixed) return;
    try {
      if (isActive && !sessionCompleted) {
        localStorage.setItem(MIXED_CHECKPOINT, encodeMixedRound(mixedBank, queue, currentIndex, sessionAnswers, selectedChoice));
      } else {
        localStorage.removeItem(MIXED_CHECKPOINT);
      }
      setCheckpointError(false);
    } catch { setCheckpointError(true); }
  }, [checkpointReady, mixed, isActive, sessionCompleted, queue, currentIndex, sessionAnswers, selectedChoice]);

  useEffect(() => {
    if (isActive && !sessionCompleted) questionHeading.current?.focus();
  }, [isActive, sessionCompleted, currentIndex, queue]);

  useEffect(() => {
    if (showExplanation && isActive && !sessionCompleted) feedbackHeading.current?.focus();
  }, [showExplanation, isActive, sessionCompleted, currentIndex]);

  const submitChoice = () => {
    if (selectedChoice === null || showExplanation || Object.hasOwn(sessionAnswers, currentQ.id)) return;
    const updated = recordAnswer(progress, currentQ, selectedChoice === currentQ.answer, Date.now());
    save(updated);
    setSessionAnswers((prev) => ({ ...prev, [currentQ.id]: selectedChoice }));
    setShowExplanation(true);
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

  return (
    <div className="practice-arena">
      <Suspense fallback={null}>
        <SessionFromQuery ready={ready} onOpen={openFromQuery} />
      </Suspense>

      {checkpointError && <p role="status">{tr(lang, "บันทึกรอบฝึกบนเครื่องนี้ไม่ได้", "This device could not save your practice round.", "此设备无法保存本轮练习。")}</p>}
      {!isActive ? (
        <>
          <PracticeTabs />
          {sessionNotice && <p role="status">{sessionNotice}</p>}
          <header className="study-opening">
            <StudyArt scene="practice" />
            <div className="study-opening-copy">
              <h1>{tr(lang, "ฝึกตอบ", "Practise", "练习")}</h1>
              <p>{tr(lang, `ฝึกจากตัวบท ${questions.length} ข้อ ข้อที่พลาดจะกลับมาให้ทบทวน`, `Practise with ${questions.length} questions written from the constitution. Review the ones you miss.`, `用依据宪法条文编写的 ${questions.length} 道题练习，答错的题会进入复习。`)}</p>
              <button className="primary practice-start-btn" disabled={!ready} onClick={startMixed}>
                <span>{tr(lang, "เริ่มรอบฝึกผสม", "Start mixed practice", "开始混合练习")}</span>
                <span aria-hidden="true">→</span>
              </button>
              <p className="micro">{tr(lang, "รวมข้อที่ถึงกำหนด ข้อที่เคยพลาด แบบฝึกตัวเลข และบัตรคำ", "Mixes due reviews, missed questions, number drills and flashcards.", "混合到期复习、错题、数字练习与闪卡。")}</p>
            </div>
          </header>

          <div className="practice-hub">
            {/* Track 1: Real Exam Simulation & Timed Papers (Top Priority for Passing) */}
            <div className="practice-section">
              <div className="practice-section-header">
                <h2>{tr(lang, "ชุดจับเวลาและแนวข้อสอบ", "Timed papers and exam topics", "计时练习与考试题型")}</h2>
              </div>

              <div className="practice-featured-grid">
                {/* The timed paper leads; the exam topics follow it on a quieter rule. */}
                <div className="practice-featured-card">
                  <h3>
                    {tr(lang, "ข้อสอบจำลองจับเวลา 30 ชุด", "Timed mock exams · 30 papers", "计时模拟考试 · 30套")}
                  </h3>
                  <p className="micro">
                    {tr(lang, "สุ่มจากคลังข้อฝึกที่ครอบคลุมทุกมาตรา เฉลยและคะแนนรายหมวดหลังส่ง", "Sampled from a bank that covers every section. Answers and a chapter-by-chapter score after you submit.", "从覆盖全部条文的题库中抽题。交卷后显示答案与各章得分。")}
                  </p>
                  <Link href="/exam/" className="mode-card-link micro">
                    {tr(lang, "เริ่มชุดจับเวลา", "Start a timed paper", "开始计时练习")} →
                  </Link>
                </div>

                {/* 90 District Exam Topics */}
                <div className="practice-featured-card practice-featured-second">
                  <h3>
                    {tr(lang, "แนวข้อสอบนายอำเภอ 90 ข้อ", "District-chief exam practice · 90 questions", "县长考试练习 · 90题")}
                  </h3>
                  <p className="micro">
                    {tr(lang, "อิงหัวข้อสอบปี 2568 มีที่มาและวันที่ทุกข้อ ครอบคลุมตัวบท ความรู้รอบตัว และการบริหาร", "Based on 2025 exam topics, with a source and date for each question. Covers constitutional law, general knowledge and administration.", "依据2025年考试题型，每题注明来源与日期，涵盖宪法条文、常识和行政管理。")}
                  </p>
                  <Link href="/along/" className="mode-card-link micro">
                    {tr(lang, "ฝึก 90 ข้อ", "Practise the 90", "练习90题")} →
                  </Link>
                </div>
              </div>
            </div>

            {/* Track 2: Precision Drills & Active Recall (Targeted Weaknesses) */}
            <div className="practice-section">
              <div className="practice-section-header">
                <span className="mono micro text-muted font-bold">
                  {tr(lang, "เจาะจุด", "Focused", "专项")}
                </span>
                <h3>
                  {tr(lang, "แบบฝึกเฉพาะจุดและเครื่องช่วยจำ", "Focused drills and memory aids", "专项练习与记忆工具")}
                </h3>
              </div>

              <div className="practice-grid">
                {/* Number Drills */}
                <div className="practice-mode-card">
                  <div className="mode-card-top">
                    <span className="mono micro font-bold">{tr(lang, "แบบฝึกตัวเลข", "Number Drills", "数字专项")}</span>
                    <span className="micro text-muted">4,230 {tr(lang, "โจทย์", "drills", "题")}</span>
                  </div>
                  <h3>
                    {tr(lang, "ฝึกจำตัวเลข 41 ค่าสำคัญ", "41 Key Constitutional Numbers", "41个核心宪法数字速记")}
                  </h3>
                  <p className="micro">
                    {tr(lang, "ฝึกจำนวนวัน องค์ประชุม และจำนวนที่นั่งที่ตัวบทกำหนด", "Drill the days, quorums and seat counts the text sets.", "专练条文规定的天数、法定人数与席位数。")}
                  </p>
                  <Link href="/drills/" className="mode-card-link micro">
                    {tr(lang, "เปิดแบบฝึกตัวเลข", "Open Number Drills", "打开数字专项")} →
                  </Link>
                </div>

                {/* Chapter Check */}
                <div className="practice-mode-card">
                  <div className="mode-card-top">
                    <span className="mono micro font-bold">{tr(lang, "ตรวจรายหมวด", "Chapter Drill", "按章抽测")}</span>
                    <span className="micro text-muted">5 {tr(lang, "ข้อ", "items", "题")}</span>
                  </div>
                  <h3>{tr(lang, "เลือกหมวดที่ต้องการฝึก", "Drill a specific chapter", "选择指定章节练习")}</h3>
                  <p className="micro">
                    {tr(lang, "เจาะเฉพาะหมวดที่คุณต้องการทบทวนเป็นพิเศษ", "Target a specific chapter you want to solidify.", "重点强化你需要攻克的特定章节。")}
                  </p>
                  <div className="chapter-drill-action">
                    <select
                      value={selectedChapter}
                      onChange={(e) => setSelectedChapter(Number(e.target.value))}
                      aria-label={tr(lang, "เลือกหมวด", "Select a chapter", "选择章节")}
                    >
                      {chapters.map((c) => (
                        <option key={c.number} value={c.number}>
                          {chapterPickerLabel(lang, c)}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => startSession("chapter", selectedChapter, 5)}>
                      {tr(lang, "ตรวจ 5 ข้อ", "Drill 5", "测5题")} →
                    </button>
                  </div>
                </div>

                {/* Flashcards */}
                <div className="practice-mode-card">
                  <div className="mode-card-top">
                    <span className="mono micro font-bold">{tr(lang, "การ์ดความจำ", "Flashcards", "闪卡")}</span>
                    <span className="micro text-muted">279 {tr(lang, "มาตรา", "sections", "条")}</span>
                  </div>
                  <h3>
                    {tr(lang, "นึกก่อนแล้วพลิกดูตัวบท", "Recall First, Then Flip", "先回想再翻面")}
                  </h3>
                  <p className="micro">
                    {tr(lang, "ฝึกระลึกหลักการของมาตรา พร้อมทบทวนโน้ตย่อที่คุณจดไว้ข้างตัวบท", "Active recall for section rules, plus your own margin notes.", "主动回想条文要点，并结合你在页边记录的个人笔记。")}
                  </p>
                  <Link href="/flashcards/" className="mode-card-link micro">
                    {tr(lang, "เปิดการ์ดความจำ", "Open Flashcards", "打开记忆闪卡")} →
                  </Link>
                </div>

                {/* Match & Formula Sheet */}
                <div className="practice-mode-card">
                  <div className="mode-card-top">
                    <span className="mono micro font-bold">{tr(lang, "สูตร & เกม", "Formulas & Match", "公式与速配")}</span>
                    <span className="micro text-muted">{tr(lang, "สรุป", "Cheat Sheet", "速记")}</span>
                  </div>
                  <h3>
                    {tr(lang, "แผ่นสรุปสูตร & เกมจับคู่", "Cheat Sheet & Matching Game", "速记公式与条文配对")}
                  </h3>
                  <p className="micro">
                    {tr(lang, "สูตรช่วยจำสัดส่วนทางกฎหมาย และมินิเกมจับคู่สาระสำคัญ", "Mnemonic formula sheets and rapid concept-matching mini-games.", "法律比例速记公式与条文核心要点快速配对游戏。")}
                  </p>
                  <div className="card-dual-links micro">
                    <Link href="/cheatsheet/">{tr(lang, "แผ่นสรุปสูตร", "Formula Sheet", "速记公式")} →</Link>
                    <Link href="/games/">{tr(lang, "เกมจับคู่", "Match Game", "配对游戏")} →</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </>
      ) : sessionCompleted ? (
        /* SESSION RESULT SCREEN */
        <div className="session-result-screen">
          <div className="result-card">
            <h1>{mixed
              ? tr(lang, "ผลรอบฝึกผสม", "Mixed practice results", "混合练习结果")
              : tr(lang, "ผลการฝึก", "Practice results", "练习结果")}
            </h1>
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
              <button className="primary" onClick={startMixed}>
                {tr(lang, "อีกรอบ", "Again", "再来一轮")} →
              </button>
              <button onClick={() => setIsActive(false)}>
                {tr(lang, "← กลับไปฝึก", "← Back to Practise", "← 返回练习")}
              </button>
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
              {mixed && <span>{tr(lang, "รอบฝึกผสม", "Mixed practice", "混合练习")}</span>}
              <span>
                {tr(lang, "ข้อ", "Question", "题目")} {currentIndex + 1} / {queue.length}
              </span>
              <span>
                {tr(lang, "คะแนน", "Score", "得分")} {score} ({percentage}%)
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
                {chapterLabel(lang, currentQ.chapter)}
              </span>
              <div className="sec-tags">
                {currentQ.sections.map((n) => (
                  <span className="mono sec-pill" key={n}>
                    {sectionLabel(lang, n)}
                  </span>
                ))}
              </div>
            </header>

            <h1 id="practice-question" ref={questionHeading} tabIndex={-1} className="question-prompt-text">{currentQ.prompt[lang]}</h1>

            {/* Answer Choices */}
            <fieldset className="choices-list practice-choices" aria-labelledby="practice-question" disabled={showExplanation}>
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
                  <label key={idx} className={`choice-card ${choiceStateClass}`}>
                    <input type="radio" name={`practice-${currentQ.id}`} checked={isSelected} onChange={() => setSelectedChoice(idx)} />
                    <span className="mono choice-letter">
                      {choiceLetter(lang, idx)}
                    </span>
                    <span className="choice-text">{choice[lang]}</span>
                  </label>
                );
              })}
            </fieldset>
            {!showExplanation && (
              <button className="primary" disabled={selectedChoice === null} onClick={submitChoice}>
                {tr(lang, "ตรวจคำตอบ", "Check answer", "检查答案")}
              </button>
            )}

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
                  <span className="font-bold" ref={feedbackHeading} tabIndex={-1}>
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
                <div className="next-btn-container">
                  <button className="primary btn-next-q" onClick={handleNext}>
                    {currentIndex < queue.length - 1
                      ? tr(lang, `ข้อ ${currentIndex + 2} →`, `Question ${currentIndex + 2} →`, `第${currentIndex + 2}题 →`)
                      : tr(lang, "ดูสรุปผลคะแนน →", "View Final Score →", "查看考试成绩 →")}
                  </button>
                </div>
                <QuestionVisual question={currentQ} position={currentIndex} selected={selectedChoice ?? undefined} lang={lang} />
                <TeachingSteps question={currentQ} selected={selectedChoice ?? undefined}/>
                <ExplainBack section={currentQ.sections[0]}/>

                {/* Personal Notes Callout if User has Annotated this Section */}
                {currentQ.sections.some((s) => annotations[s]?.note) && (
                  <div className="user-note-callout micro">
                    <span className="mono font-bold text-accent">
                      {tr(lang, "บันทึกช่วยจำของคุณในมาตรานี้:", "Your personal note for this section:", "您在相关法条记录的笔记:")}
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
                      {tr(lang, `เปิดดู ม.${s} ในสมุดคู่หน้า →`, `Open Sec ${s} in Notebook →`, `在双页开本中阅读第${s}条 →`)}
                    </Link>
                  ))}
                  <Link
                    href={`/flashcards/?sec=${currentQ.sections[0]}`}
                    className="link-underlined"
                  >
                    {tr(lang, "เปิดการ์ดความจำ →", "Open flashcard →", "打开记忆闪卡 →")}
                  </Link>
                </div>

              </div>
            )}
          </article>
        </div>
      )}
    </div>
  );
}

function SessionFromQuery({
  ready,
  onOpen,
}: {
  ready: boolean;
  onOpen: (session: string | null, check: number, section: number) => void;
}) {
  const params = useSearchParams();
  const started = useRef(false);
  const openRef = useRef(onOpen);
  openRef.current = onOpen;
  useEffect(() => {
    if (!ready || started.current) return;
    started.current = true;
    openRef.current(params.get("session"), Number(params.get("check")) || 0, Number(params.get("section")) || 0);
  }, [params, ready]);
  return null;
}
