"use client";
import { useEffect, useRef, useState } from "react";
import bank from "@/data/pokklong/questions.json";
import { choiceLetter } from "@/lib/shuffle";
import { tr, type Lang } from "@/lib/i18n";
import {
  buildPokklongQueue,
  citationPending,
  creditParagraph,
  loadPokklongProgress,
  recordPokklong,
  savePokklongProgress,
  sectionLine,
  stepAccuracy,
  stepHeader,
  textOf,
  type PokklongBank,
  type PokklongProgress,
  type PokklongQuestion, livePokklong } from "@/lib/pokklong";
import { useStudy } from "./Provider";
import { useHidePageNext } from "./Shell";
import { PracticeTabs } from "./PracticeTabs";
import { GuessFirstCard } from "./GuessFirstCard";

const data = bank as PokklongBank;
const live = livePokklong(data.questions);
const steps = Array.from({ length: 12 }, (_, index) => index + 1);

type Phase = "home" | "intro" | "question" | "done";

export function PokklongPractice() {
  const { lang } = useStudy();
  const [progress, setProgress] = useState<PokklongProgress>({ answers: {} });
  const [stored, setStored] = useState(false);
  const [phase, setPhase] = useState<Phase>("home");
  const [startStep, setStartStep] = useState(1);
  const [queue, setQueue] = useState<PokklongQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [runCorrect, setRunCorrect] = useState(0);
  const [runAnswered, setRunAnswered] = useState(0);
  const answering = useRef(false);
  useHidePageNext(phase === "intro" || phase === "question");

  useEffect(() => {
    setProgress(loadPokklongProgress());
    setStored(true);
  }, []);

  useEffect(() => {
    if (stored) savePokklongProgress(progress);
  }, [progress, stored]);

  const current = queue[index];

  const start = (step: number) => {
    const next = buildPokklongQueue(live, step);
    if (!next.length) return;
    setStartStep(step);
    setQueue(next);
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setRunCorrect(0);
    setRunAnswered(0);
    answering.current = false;
    setPhase("intro");
    window.scrollTo({ top: 0 });
  };

  const commit = (choice: number) => {
    if (answering.current || revealed || !current) return;
    answering.current = true;
    const correct = choice === current.answer;
    setSelected(choice);
    setRevealed(true);
    setRunAnswered((n) => n + 1);
    if (correct) setRunCorrect((n) => n + 1);
    setProgress((prev) => recordPokklong(prev, current.id, correct));
  };

  const goNext = () => {
    answering.current = false;
    const following = queue[index + 1];
    if (!following) {
      setPhase("done");
      window.scrollTo({ top: 0 });
      return;
    }
    setIndex(index + 1);
    setSelected(null);
    setRevealed(false);
    setPhase(following.step !== current.step ? "intro" : "question");
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="practice-arena pokklong-session">
      <PracticeTabs />
      {phase === "home" && (
        <Home
          lang={lang}
          progress={progress}
          startStep={startStep}
          onStep={setStartStep}
          onStart={() => start(startStep)}
          onJump={start}
        />
      )}
      {phase === "intro" && current && (
        <Intro lang={lang} question={current} onContinue={() => setPhase("question")} onJump={start} />
      )}
      {phase === "question" && current && (
        <Question
          lang={lang}
          question={current}
          index={index}
          total={queue.length}
          selected={selected}
          revealed={revealed}
          onChoose={commit}
          onNext={goNext}
          onJump={start}
        />
      )}
      {phase === "done" && (
        <Done
          lang={lang}
          correct={runCorrect}
          total={runAnswered}
          progress={progress}
          onHome={() => setPhase("home")}
          onAgain={() => start(startStep)}
        />
      )}
      <Credit lang={lang} />
    </div>
  );
}

function Home({
  lang,
  progress,
  startStep,
  onStep,
  onStart,
  onJump,
}: {
  lang: Lang;
  progress: PokklongProgress;
  startStep: number;
  onStep: (step: number) => void;
  onStart: () => void;
  onJump: (step: number) => void;
}) {
  return (
    <>
      <header className="practice-header">
        <h1>{textOf(data.meta.title, lang)}</h1>
        <p>
          {tr(
            lang,
            "ทายก่อน แล้วจึงดูเหตุผลและตรรกะจนถึงตอนนี้",
            "Guess first. Then read why, and the logic so far.",
            "先猜，再看原因和迄今的逻辑。",
          )}
        </p>
      </header>
      <form
        className="chapter-dropdown-row"
        onSubmit={(event) => {
          event.preventDefault();
          onStart();
        }}
      >
        <label>
          {tr(lang, "เริ่มจากขั้น", "Start from step", "从步骤开始")}{" "}
          <select
            value={startStep}
            aria-label={tr(lang, "เริ่มจากขั้น", "Start from step", "从步骤开始")}
            onChange={(event) => onStep(Number(event.target.value))}
          >
            {steps.map((step) => (
              <option key={step} value={step}>
                {step}. {textOf(data.meta.steps[String(step)].name, lang)}
              </option>
            ))}
          </select>
        </label>
        <button className="primary" type="submit">
          {tr(lang, "เริ่ม", "Start", "开始")}
        </button>
      </form>
      <ol className="pokklong-steps">
        {steps.map((step) => {
          const accuracy = stepAccuracy(live, progress, step);
          const name = textOf(data.meta.steps[String(step)].name, lang);
          return (
            <li key={step}>
              <button type="button" onClick={() => onJump(step)}>
                <span>
                  {step}. {name}
                </span>
                <span className="micro">
                  {accuracy.answered > 0
                    ? tr(
                        lang,
                        `${accuracy.correct}/${accuracy.answered} ถูก`,
                        `${accuracy.correct}/${accuracy.answered} correct`,
                        `${accuracy.correct}/${accuracy.answered} 正确`,
                      )
                    : tr(lang, `${accuracy.total} ข้อ`, `${accuracy.total}`, `${accuracy.total}题`)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </>
  );
}

function Intro({
  lang,
  question,
  onContinue,
  onJump,
}: {
  lang: Lang;
  question: PokklongQuestion;
  onContinue: () => void;
  onJump: (step: number) => void;
}) {
  const step = data.meta.steps[String(question.step)];
  return (
    <section className="pokklong-intro">
      <StepJump lang={lang} step={question.step} onJump={onJump} />
      <p className="mono">{stepHeader(lang, question.step, textOf(step.name, lang))}</p>
      <h2>{textOf(step.name, lang)}</h2>
      <p className="micro">{tr(lang, "ตรรกะจนถึงตอนนี้", "The logic so far", "迄今的逻辑")}</p>
      <p>{textOf(step.logic_so_far, lang)}</p>
      <button className="primary" type="button" onClick={onContinue}>
        {tr(lang, "ไปที่ข้อ", "Continue", "继续")}
      </button>
    </section>
  );
}

function Question({
  lang,
  question,
  index,
  total,
  selected,
  revealed,
  onChoose,
  onNext,
  onJump,
}: {
  lang: Lang;
  question: PokklongQuestion;
  index: number;
  total: number;
  selected: number | null;
  revealed: boolean;
  onChoose: (index: number) => void;
  onNext: () => void;
  onJump: (step: number) => void;
}) {
  const mnemonic = question.mnemonic ? textOf(question.mnemonic, lang) : "";
  return (
    <div className="active-quiz-container">
      <div className="quiz-top-bar">
        <p className="mono">
          {stepHeader(lang, question.step, textOf(question.step_name, lang))}
        </p>
        <p className="micro mono">
          {index + 1} / {total}
        </p>
      </div>
      <StepJump lang={lang} step={question.step} onJump={onJump} />
      <GuessFirstCard
        prompt={textOf(question.prompt, lang)}
        options={question.options.map((option) => textOf(option, lang))}
        letters={question.options.map((_, option) => choiceLetter(lang, option))}
        answer={question.answer}
        selected={selected}
        revealed={revealed}
        why={textOf(question.why, lang)}
        stepName={textOf(question.step_name, lang)}
        logic={textOf(question.logic_so_far, lang)}
        mnemonic={mnemonic || null}
        sourceAct={textOf(question.source.act, lang)}
        sourceSection={sectionLine(question.source.section, lang)}
        verified={question.source.verified}
        note={question.source.note}
        whyLabel={tr(lang, "เหตุผล", "Why", "原因")}
        logicLabel={tr(lang, "ตรรกะจนถึงตอนนี้", "The logic so far", "迄今的逻辑")}
        mnemonicLabel={tr(lang, "จำง่าย", "Mnemonic", "口诀")}
        sourceLabel={tr(lang, "ที่มา", "Source", "出处")}
        correctLabel={tr(lang, "ถูก", "Correct", "正确")}
        wrongLabel={tr(lang, "ผิด", "Wrong", "错误")}
        verdictStop={lang === "zh" ? "。" : lang === "en" ? ". " : " "}
        letterStop={lang === "zh" ? "" : ". "}
        citationLabel={citationPending(lang)}
        nextLabel={
          index < total - 1
            ? tr(lang, "ข้อถัดไป", "Next", "下一题")
            : tr(lang, "จบรอบ", "Finish", "结束")
        }
        optionsLabel={tr(lang, "ตัวเลือก", "Options", "选项")}
        onChoose={onChoose}
        onNext={onNext}
      />
    </div>
  );
}

function Done({
  lang,
  correct,
  total,
  progress,
  onHome,
  onAgain,
}: {
  lang: Lang;
  correct: number;
  total: number;
  progress: PokklongProgress;
  onHome: () => void;
  onAgain: () => void;
}) {
  return (
    <div className="session-result-screen">
      <div className="result-card">
        <h2>{tr(lang, "จบรอบนี้แล้ว", "That's the set", "本轮结束")}</h2>
        <p className="mono score-number">
          {correct} / {total}
        </p>
        <ul className="pokklong-steps">
          {steps.map((step) => {
            const accuracy = stepAccuracy(live, progress, step);
            if (!accuracy.answered) return null;
            return (
              <li key={step}>
                <span>
                  {step}. {textOf(data.meta.steps[String(step)].name, lang)}
                </span>
                <span className="micro">
                  {accuracy.correct}/{accuracy.answered}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="result-actions-row">
          <button className="primary" type="button" onClick={onAgain}>
            {tr(lang, "อีกรอบ", "Again", "再来一轮")}
          </button>
          <button type="button" onClick={onHome}>
            {tr(lang, "เลือกขั้น", "Choose a step", "选择步骤")}
          </button>
        </div>
      </div>
    </div>
  );
}

function StepJump({ lang, step, onJump }: { lang: Lang; step: number; onJump: (step: number) => void }) {
  return (
    <p>
      <label>
        {tr(lang, "เริ่มจากขั้น", "Start from step", "从步骤开始")}{" "}
        <select
          value={step}
          aria-label={tr(lang, "เริ่มจากขั้น", "Start from step", "从步骤开始")}
          onChange={(event) => onJump(Number(event.target.value))}
        >
          {steps.map((n) => (
            <option key={n} value={n}>
              {n}. {textOf(data.meta.steps[String(n)].name, lang)}
            </option>
          ))}
        </select>
      </label>
    </p>
  );
}

function Credit({ lang }: { lang: Lang }) {
  return (
    <footer className="pokklong-credit">
      <p>
        {tr(
          lang,
          "ที่มา: สไลด์ของประพันธ์ เวารัมย์ (Praphan Waorom)",
          "Source: Praphan Waorom's slides",
          "来源：Praphan Waorom 的课件",
        )}
      </p>
      <p className="micro">{creditParagraph(lang, data.meta.credit)}</p>
    </footer>
  );
}
