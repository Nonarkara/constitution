"use client";
import { useEffect, useRef } from "react";
import { guessKey } from "@/lib/pokklong";

export type GuessFirstCardProps = {
  prompt: string;
  options: string[];
  letters: string[];
  answer: number;
  selected: number | null;
  revealed: boolean;
  why: string;
  stepName: string;
  logic: string;
  mnemonic: string | null;
  sourceAct: string;
  sourceSection: string;
  verified: boolean;
  note?: string;
  whyLabel: string;
  logicLabel: string;
  mnemonicLabel: string;
  sourceLabel: string;
  correctLabel: string;
  wrongLabel: string;
  /** After the verdict word: ". " in English, a space in Thai, "。" in Chinese. */
  verdictStop: string;
  /** After the choice letter. Empty in Chinese, where the verdict already ends with "。". */
  letterStop: string;
  citationLabel: string;
  nextLabel: string;
  optionsLabel: string;
  onChoose: (index: number) => void;
  onNext: () => void;
};

/** Blind guess, then the reveal. Used by the practice engine when guessFirst is set. */
export function GuessFirstCard({
  prompt,
  options,
  letters,
  answer,
  selected,
  revealed,
  why,
  stepName,
  logic,
  mnemonic,
  sourceAct,
  sourceSection,
  verified,
  note,
  whyLabel,
  logicLabel,
  mnemonicLabel,
  sourceLabel,
  correctLabel,
  wrongLabel,
  verdictStop,
  letterStop,
  citationLabel,
  nextLabel,
  optionsLabel,
  onChoose,
  onNext,
}: GuessFirstCardProps) {
  const nextRef = useRef<HTMLButtonElement>(null);
  const onChooseRef = useRef(onChoose);
  const onNextRef = useRef(onNext);
  onChooseRef.current = onChoose;
  onNextRef.current = onNext;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (revealed) return;
      const index = guessKey(event.key, options.length, null);
      if (index === null) return;
      event.preventDefault();
      onChooseRef.current(index);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, options.length]);

  useEffect(() => {
    if (revealed) nextRef.current?.focus();
  }, [revealed]);

  const right = selected === answer;

  return (
    <article className="question-card">
      <h2 className="question-prompt-text">{prompt}</h2>
      <div className="choices-list" role="group" aria-label={optionsLabel}>
        {options.map((option, index) => {
          const state = revealed
            ? index === answer
              ? "choice-correct"
              : selected === index
                ? "choice-wrong"
                : ""
            : "";
          return (
            <button
              key={index}
              type="button"
              className={`guess-choice ${state}`}
              disabled={revealed}
              aria-pressed={selected === index}
              onClick={() => onChoose(index)}
              onKeyDown={(event) => {
                if (revealed || guessKey(event.key, options.length, index) === null || event.key !== "Enter") return;
                event.preventDefault();
                onChoose(index);
              }}
            >
              <span className="mono choice-letter">{letters[index]}</span>
              <span className="choice-text">{option}</span>
              {revealed && index === answer && <span className="guess-mark">{correctLabel}</span>}
              {revealed && selected === index && index !== answer && <span className="guess-mark">{wrongLabel}</span>}
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {revealed && (
          <div
            className={`explanation-panel ${right ? "panel-correct" : "panel-wrong"}`}
            data-testid="reveal"
          >
            <p className="explanation-head" data-reveal="verdict">
              {right ? correctLabel : wrongLabel}
              {verdictStop}
              {letters[answer]}
              {letterStop}
              {options[answer]}
            </p>
            <p data-reveal="why">
              <span className="micro">{whyLabel}</span>
              <br />
              {why}
            </p>
            <p data-reveal="logic">
              <span className="micro">{stepName}{verdictStop === "。" ? "。" : ". "}{logicLabel}</span>
              <br />
              {logic}
            </p>
            {mnemonic && (
              <p data-reveal="mnemonic">
                <span className="micro">{mnemonicLabel}</span>
                <br />
                {mnemonic}
              </p>
            )}
            <p data-reveal="source">
              <span className="micro">{sourceLabel}</span>
              <br />
              {sourceAct}
              {sourceSection && sourceSection !== "-" ? ` · ${sourceSection}` : ""}
              {!verified && (
                <>
                  <br />
                  <span className="pokklong-unverified">{citationLabel}</span>
                  {note ? ` ${note}` : ""}
                </>
              )}
            </p>
          </div>
        )}
      </div>
      <div className="next-btn-container">
        <button
          ref={nextRef}
          type="button"
          className="primary btn-next-q"
          data-testid="next"
          disabled={!revealed}
          hidden={!revealed}
          onClick={onNext}
        >
          {nextLabel}
        </button>
      </div>
    </article>
  );
}
