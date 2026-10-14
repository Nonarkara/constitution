"use client";
import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import questions from "@/data/questions.json";
import { chapters } from "@/lib/outline";
import { recordAnswer } from "@/lib/learning";
import { useStudy } from "./Provider";
import { choiceLetter, fisherYates } from "@/lib/shuffle";
import { preparePracticeQuestion, practiceSessionScore } from "@/lib/practice-session";
import { tr, sectionLabel, chapterPickerLabel } from "@/lib/i18n";
import { buildPracticeQueue } from "@/lib/adaptive";
import { buildMixedSession } from "@/lib/mixed";
import { makeDrill } from "@/lib/drills";
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
    setQueue(qList.map((question) => preparePracticeQuestion(question)));
    setCurrentIndex(0);
    setSelectedChoice(null);
    setSessionAnswers({});
    setShowExplanation(false);
    setSessionCompleted(false);
    setIsActive(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const begin = (items: Question[], chosen: typeof mode = "weak") => {
    if (!items.length) {
      setSessionNotice(tr(lang, "ยังไม่มีข้อในชุดนี้", "This set has no questions yet.", "这组还没有题目。"));
      setIsActive(false);
      return;
    }
    setSessionNotice("");
    setMode(chosen);
    setQueue(items.map((question) => preparePracticeQuestion(question)));
    setCurrentIndex(0);
    setSelectedChoice(null);
    setSessionAnswers({});
    setShowExplanation(false);
    setSessionCompleted(false);
    setIsActive(true);
  };

  const startMixed = () => begin(buildMixedSession(questions, progress, Date.now()), "weak");

  const startSectionDrill = (section: number) => {
    const own = fisherYates(questions.filter((question) => question.sections.includes(section))).slice(0, 4);
    const drills = [0, 1, 2].map((index) => makeDrill((section * 17 + index) % 4230));
    begin([...own, ...drills].slice(0, 5), "weak");
  };

  const openFromQuery = (session: string | null, check: number, section: number) => {
    if (autostarted.current) return;
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

  return (
    <div className="practice-arena">
      <Suspense fallback={null}>
        <SessionFromQuery ready={ready} onOpen={openFromQuery} />
      </Suspense>

      {!isActive ? (
        <>
          <PracticeTabs />
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

          <div className="practice-choices">
            <button className="primary" onClick={startMixed}>
              {tr(lang, "เริ่มรอบฝึก", "Start session", "开始练习")} →
            </button>
          </div>
          <p>
            {tr(
              lang,
              "รอบนี้รวมข้อที่ถึงเวลาทบทวน ข้อที่ยังพลาด แบบฝึกตัวเลข และการ์ดที่เคยตอบถูก สอบจำลองอยู่ที่ท้ายหน้า",
              "This session mixes what is due, what you miss, number drills and cards you already know. The mock exam is the step at the end of the page.",
              "这一轮混合到期的复习、你还错过的题、数字练习和已经答对的卡片。模拟考试在页面末尾。",
            )}
          </p>
          <details className="inside-session">
            <summary>{tr(lang, "ในรอบฝึก", "Inside the session", "练习里面")}</summary>
            <p>
              <Link href="/review/">{tr(lang, "ทบทวน", "Review", "复习")}</Link>
              {" · "}
              <Link href="/flashcards/">{tr(lang, "การ์ด", "Flashcards", "闪卡")}</Link>
              {" · "}
              <Link href="/drills/">{tr(lang, "แบบฝึกตัวเลข", "Drills", "数字练习")}</Link>
              {" · "}
              <Link href="/cheatsheet/">{tr(lang, "สูตร", "Formulas", "公式")}</Link>
              {" · "}
              <Link href="/games/">{tr(lang, "จับคู่", "Match", "配对")}</Link>
            </p>
            <div className="chapter-dropdown-row">
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
                {tr(lang, "ตรวจหมวดนี้ 5 ข้อ", "Check this chapter, 5", "本章小测5题")} →
              </button>
            </div>
          </details>

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

                <div className="next-btn-container">
                  <button className="primary btn-next-q" onClick={handleNext}>
                    {currentIndex < queue.length - 1
                      ? tr(lang, `ข้อ ${currentIndex + 2} →`, `Question ${currentIndex + 2} →`, `第${currentIndex + 2}题 →`)
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
