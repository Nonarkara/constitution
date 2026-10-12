"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import questions from "@/data/questions.json";
import cases from "@/data/cases.json";
import { sections, chapters, sectionBody } from "@/lib/corpus";
import { recordAnswer, lessonQueue } from "@/lib/learning";
import { chapterPuzzles } from "@/lib/puzzles";
import { choiceLetter, fisherYates } from "@/lib/shuffle";
import { sessionSummary } from "@/lib/session";
import { useStudy } from "./Provider";
import { tr, sectionLabel } from "@/lib/i18n";
import { MemoryCue } from "./MemoryCue";
import { RecallFirst, ConfidenceCheck, ExplainBack } from "./LearningCoach";
import { emptyCalibration, recordCalibration, nextReviewAt, type Confidence } from "@/lib/coach";
import { Puzzle } from "./Puzzle";
type Question = (typeof questions)[number];

export function Quiz({
  chapter,
  ids,
  onExit,
}: {
  chapter?: number;
  ids?: string[];
  onExit: () => void;
}) {
  const { lang, progress, save, annotations } = useStudy();
  const lesson = chapter ? chapterPuzzles(cases, chapter) : [];
  const opening = ids
    ? ids.flatMap((id) => questions.filter((q) => q.id === id))
    : lessonQueue(questions, progress, chapter ?? 0, Date.now());
  const [list, setList] = useState<Question[]>(opening);
  const [firstTotal] = useState(opening.length);
  const [index, setIndex] = useState(0),
    [choice, setChoice] = useState<number | null>(null),
    [checked, setChecked] = useState(false),
    [read, setRead] = useState(!chapter),
    [correct, setCorrect] = useState(0),
    [puzzleAt, setPuzzleAt] = useState(0),
    [missed, setMissed] = useState<string[]>([]),
    [retried, setRetried] = useState(false),
    [order, setOrder] = useState<number[]>(() =>
      fisherYates(opening[0]?.choices.map((_, i) => i) ?? []),
    );
  const [recallMode, setRecallMode] = useState(true);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [recallDraft, setRecallDraft] = useState("");
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [calibration, setCalibration] = useState(emptyCalibration);
  const puzzle = lesson[puzzleAt] ?? null;
  const q = list[index];
  const readSections = [
    ...new Set(lesson.flatMap((item) => item.sections)),
  ].sort((a, b) => a - b);
  useEffect(() => {
    document.querySelector<HTMLElement>("#quiz-heading")?.focus();
  }, [index, read, puzzleAt]);
  if (puzzle)
    return (
      <Puzzle
        key={puzzle.id}
        item={puzzle}
        onDone={() => setPuzzleAt((n) => n + 1)}
      />
    );
  if (!q)
    return (
      <section className="complete">
        <span className="mono">
          {tr(lang, "จบรอบนี้", "Session complete", "本轮结束")}
        </span>
        <h1 id="quiz-heading" tabIndex={-1}>
          {tr(
            lang,
            "วันนี้ได้เพิ่มอีกนิดแล้ว",
            "Another small step, done.",
            "今天又前进了一点。",
          )}
        </h1>
        <p>{sessionSummary(correct, firstTotal, lang)}</p>
        {calibration.sure > 0 && <p>{tr(lang, `มั่นใจ ${calibration.sure} ข้อ แต่พลาด ${calibration.sureMissed} ข้อ จุดนี้เหมาะกลับไปถามว่ากฎต่างจากที่คิดตรงไหน`, `High-confidence responses: ${calibration.sure}; incorrect: ${calibration.sureMissed}. Revisit where the rule differed from your expectation.`, `你对${calibration.sure}题很确定，其中${calibration.sureMissed}题答错了。回顾规则与预期不同之处。`)}</p>}
        {calibration.uncertainCorrect > 0 && <p>{tr(lang, `ไม่มั่นใจแต่ตอบถูก ${calibration.uncertainCorrect} ข้อ ลองอธิบายเหตุผลเพื่อแยกความเข้าใจจากการเดา`, `Correct while unsure: ${calibration.uncertainCorrect}. Explain why to distinguish understanding from a lucky guess.`, `有${calibration.uncertainCorrect}题虽然不确定却答对了。解释理由，以区分理解与猜中。`)}</p>}
        <p>{tr(lang,"ตอบซ้ำทันทีช่วยแก้ความเข้าใจ แต่ยังไม่พิสูจน์ว่าจำได้หลังเว้นเวลา","An immediate retry helps correct your understanding; it does not yet prove delayed retention.","立即重试有助于纠正理解，但尚不能证明隔一段时间仍能记住。")}</p>
        {nextReviewAt(progress, list.map(q=>q.id), Date.now()) !== null && <p>{tr(lang,"กลับมาทบทวนเร็วที่สุด:","Earliest next review:","最早下次复习：")} {new Date(nextReviewAt(progress,list.map(q=>q.id),Date.now())!).toLocaleString(lang === "th" ? "th-TH" : lang === "zh" ? "zh-CN" : "en-GB", {timeZone:"Asia/Bangkok",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})} · {tr(lang,"เวลาไทย","Bangkok time","曼谷时间")}</p>}
        {missed.length > 0 && <details><summary>{tr(lang,"จุดที่ควรกลับมาอธิบายใหม่","Ideas to explain again","值得重新解释的概念")}</summary><ul>{missed.map(id=>{const item=questions.find(q=>q.id===id);return item?<li key={id}><Link href={`/section/?n=${item.sections[0]}`}>{item.prompt[lang]} →</Link></li>:null;})}</ul></details>}
        <p><Link href="/review/">{tr(lang,"ทบทวนแบบสลับเรื่อง","Mix topics for review","交错复习不同主题")} →</Link> · <Link href="/memory/">{tr(lang,"เดินบ้านความจำโดยไม่ดูเฉลย","Recall the memory house without answers","不看答案回忆记忆屋")} →</Link></p>
        <button className="primary" onClick={onExit}>
          {tr(lang, "กลับสู่เส้นทาง", "Back to your path", "返回学习路径")} →
        </button>
      </section>
    );
  const related = sections.filter((s) =>
    (read ? q.sections : readSections).includes(s.number),
  );
  if (!read)
    return (
      <section>
        <span className="mono">
          {tr(lang, "อ่านได้ ถ้าต้องการ", "Read, if you want", "想读就可以读")}
          {" · "}
          {chapters.find((c) => c.number === chapter)?.title[lang]}
        </span>
        <h1 id="quiz-heading" tabIndex={-1}>
          {tr(
            lang,
            "มาตราที่ใช้ในโจทย์",
            "The sections behind the puzzle",
            "题目用到的条文",
          )}
        </h1>
        <p>
          {tr(
            lang,
            "คุณเดาไปแล้ว การอ่านไม่ใช่ประตูที่ล็อกข้อสอบ อ่านมาตราเหล่านี้ หรือไปตอบได้เลย",
            "You have already guessed. Reading is not a gate. Read these sections, or go straight to the questions.",
            "你已经猜过了。阅读不是一道门锁。可以读这些条文，也可以直接作答。",
          )}
        </p>
        {related.map((s) => (
          <div className="reading-excerpt" key={s.number}>
            <h2>{sectionLabel(lang, s.number)}</h2>
            <p lang={lang}>{sectionBody(s.number, lang)}</p>
            {lang === "zh" && (
              <p className="micro">中文学习译文，以泰文原文为准。</p>
            )}
            {lang === "en" && s.amended && (
              <p className="notice">
                Historical 2017 English. Read the amended Thai text before
                relying on this section.
              </p>
            )}
            <Link href={`/section/?n=${s.number}`}>
              {tr(
                lang,
                "อ่านเทียบภาษาและฟัง",
                "Compare languages and listen",
                "对照阅读与朗读",
              )}{" "}
              →
            </Link>
          </div>
        ))}
        <button className="primary" onClick={() => setRead(true)}>
          {tr(lang, "ไปตอบคำถาม", "Go to the questions", "去回答")} →
        </button>
        <button className="text-button" onClick={() => setRead(true)}>
          {tr(lang, "ข้ามการอ่าน", "Skip the reading", "跳过阅读")}
        </button>
      </section>
    );
  const openLaw = sections.filter((s) => q.sections.includes(s.number));
  const check = () => {
    if (choice === null || checked) return;
    const picked = order[choice];
    const ok = picked === q.answer;
    save(recordAnswer(progress, q, ok, Date.now()));
    if (index < firstTotal) setCalibration(c => recordCalibration(c, confidence, ok));
    if (ok && index < firstTotal) setCorrect((x) => x + 1);
    if (!ok && !retried) setMissed((ids) => (ids.includes(q.id) ? ids : [...ids, q.id]));
    setChecked(true);
  };
  const advance = () => {
    setOptionsVisible(false);
    setConfidence(null);
    setRecallDraft("");
    const more = index < list.length - 1;
    if (!more && !retried && (missed.length > 0 || (choice !== null && order[choice] !== q.answer && !missed.includes(q.id)))) {
      const ids = missed.includes(q.id) || (choice !== null && order[choice] === q.answer) ? missed : [...missed, q.id];
      const extra = ids
        .map((id) => questions.find((item) => item.id === id))
        .filter((item): item is Question => Boolean(item));
      if (extra.length) {
        const next = [...list, ...extra];
        setList(next);
        setRetried(true);
        setIndex(index + 1);
        setOrder(fisherYates(next[index + 1].choices.map((_, i) => i)));
        setChoice(null);
        setChecked(false);
        return;
      }
    }
    const following = list[index + 1];
    setIndex(index + 1);
    if (following) setOrder(fisherYates(following.choices.map((_, i) => i)));
    setChoice(null);
    setChecked(false);
  };
  return (
    <section className="quiz">
      <div className="section-heading">
        <span className="mono">
          {tr(
            lang,
            `ทบทวน ${String(index + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`,
            `Recall ${String(index + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`,
            `回忆 ${String(index + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`,
          )}
        </span>
        <span className="micro">
          {tr(lang, "ไม่จับเวลา", "No timer", "不限时")}
        </span>
      </div>
      <progress
        value={index}
        max={list.length}
        aria-label={tr(lang, "ความก้าวหน้าในรอบนี้", "Session progress", "本次练习进度")}
      />
      <h1 id="quiz-heading" tabIndex={-1}>
        {q.prompt[lang]}
      </h1>
      {!checked && <label className="recall-mode"><input type="checkbox" checked={recallMode} onChange={e=>setRecallMode(e.target.checked)}/>{tr(lang,"ลองจำก่อนเห็นตัวเลือก","Recall before options","看选项前先回忆")}</label>}
      {recallMode && !optionsVisible && !checked ? <RecallFirst key={index} draft={recallDraft} onDraftChange={setRecallDraft} onReveal={()=>setOptionsVisible(true)}/> : <>
      <fieldset disabled={checked}>
        <legend className="micro">
          {tr(lang, "เลือกคำตอบที่ถูกต้องที่สุด", "Choose the best answer", "选择最合适的答案")}
        </legend>
        {order.map((original, display) => {
          const picked = choice !== null && order[choice] === original;
          const right = checked && original === q.answer;
          const wrong = checked && picked && original !== q.answer;
          return (
            <label
              className={
                "answer " +
                (choice === display ? "selected " : "") +
                (right ? "answer-correct " : "") +
                (wrong ? "answer-wrong" : "")
              }
              key={original}
            >
              <input
                type="radio"
                name={`question-${q.id}-${index}`}
                value={display}
                checked={choice === display}
                onChange={() => setChoice(display)}
              />
              <span className="answer-letter mono">{choiceLetter(lang, display)}</span>
              <span>{q.choices[original][lang]}</span>
              {right && (
                <span aria-label={tr(lang, "คำตอบถูกต้อง", "Correct answer", "正确答案")}>✓</span>
              )}
              {wrong && (
                <span aria-label={tr(lang, "คำตอบที่เลือกผิด", "The choice that missed", "选错的一项")}>
                  ×
                </span>
              )}
            </label>
          );
        })}
      </fieldset>
      {!checked && <ConfidenceCheck value={confidence} onChange={setConfidence}/>}
      </>}
      {!checked ? (
        <button className="primary" disabled={choice === null || (recallMode && !optionsVisible)} onClick={check}>
          {tr(lang, "ตรวจคำตอบ", "Check answer", "检查答案")} →
        </button>
      ) : (
        <>
          <div className="feedback" role="status">
            <strong>
              {order[choice ?? 0] === q.answer
                ? tr(lang, "ตอบถูก มาดูเหตุผล", "Correct. Now check the reasoning.", "答对了，再核对理由。")
                : tr(
                    lang,
                    `ยังไม่ใช่ คุณเลือก ${choiceLetter(lang, choice ?? 0)}`,
                    `Not yet. You chose ${choiceLetter(lang, choice ?? 0)}.`,
                    `还不对。你选的是${choiceLetter(lang, choice ?? 0)}。`,
                  )}
            </strong>
            <p>{q.explanation[lang]}</p>
            {recallDraft.trim() && <p className="micro">{tr(lang,"ความคิดก่อนเห็นตัวเลือก:","Your thought before the options:","看选项前的想法：")} {recallDraft}</p>}
            {cases
              .filter((item) => item.sections.some((n) => q.sections.includes(n)))
              .map((item) => (
                <p key={item.id}>{item.why[lang]}</p>
              ))}
            {"hook" in q && q.hook ? <p className="micro">{q.hook[lang]}</p> : null}
            <MemoryCue chapter={q.chapter}/>
            {q.sections.some((n) => annotations[n]?.note) && (
              <div className="note" style={{ margin: "12px 0", borderLeft: "3px solid var(--accent)" }}>
                <strong className="micro">
                  {tr(lang, "บันทึกช่วยจำของคุณในมาตรานี้", "Your note on this section", "你在这条上的笔记")}
                </strong>
                <p style={{ margin: "4px 0 0" }}>
                  {q.sections.map((n) => annotations[n]?.note).filter(Boolean).join(" · ")}
                </p>
              </div>
            )}
            <div>
              {q.sections.map((n) => (
                <Link className="citation" href={`/section/?n=${n}`} key={n}>
                  {sectionLabel(lang, n)} →
                </Link>
              ))}
            </div>
          </div>
          <ExplainBack key={index} section={q.sections[0]}/>
          <button className="primary" onClick={advance}>
            {index === list.length - 1 && (retried || missed.length === 0)
              ? tr(lang, "ดูผลรอบนี้", "Finish session", "查看结果")
              : tr(lang, "ข้อต่อไป", "Next question", "下一题")}{" "}
            →
          </button>
        </>
      )}
      <details className="quiz-law">
        <summary>
          {tr(lang, "เปิดมาตราที่เกี่ยวข้อง", "Open the relevant law", "查看相关条文")}
        </summary>
        {openLaw.map((s) => (
          <div className="reading-excerpt" key={s.number}>
            <h3>{sectionLabel(lang, s.number)}</h3>
            <p lang="th">{s.th}</p>
          </div>
        ))}
      </details>
    </section>
  );
}
