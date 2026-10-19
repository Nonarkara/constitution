"use client";
import { QuestionVisual } from "./QuestionVisual";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { choiceLetter, fisherYates } from "@/lib/shuffle";
import { sectionLabel, tr } from "@/lib/i18n";
import { useStudy } from "./Provider";
import bank from "@/data/exam-topics.json";
import {
  startSitting, submitBlind, submitRetry, outstanding, blindScore,
  type BlindQuestion, type Sitting,
} from "@/lib/blind";

import { readCheckpoint, writeCheckpoint } from "@/lib/blind-checkpoint";

const byId = new Map<string, BlindQuestion>(bank.map((q) => [q.id, q as BlindQuestion]));

type Phase = "brief" | "sit" | "answers" | "handoff";

/**
 * The blind sitting. Nothing to read first: the point is to find out what you do not
 * know. Every miss then owes an answer, and the answer has to arrive by reasoning,
 * with the explanation hidden. Correct retries are practice, not proof of mastery.
 */
export function BlindExam() {
  const { lang } = useStudy();
  const [phase, setPhase] = useState<Phase>("brief");
  const [s, setS] = useState<Sitting | null>(null);
  const [pick, setPick] = useState<number | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [last, setLast] = useState<"right" | "wrong" | null>(null);
  const [earnedId, setEarnedId] = useState<string | null>(null);
  const head = useRef<HTMLHeadingElement>(null);

  const queue = useMemo(() => (s ? outstanding(s) : []), [s]);
  const open = queue[0] ?? null;
  const q = open ? (byId.get(open) ?? null) : null;

  const shownId = phase === "sit" ? s?.order[s.at] : earnedId ?? q?.id;
  const choiceOrder = useMemo(() => fisherYates([0, 1, 2, 3]), [shownId, retrying]);
  useEffect(() => {
    try {
      const saved = readCheckpoint(window.localStorage.getItem("constitution-blind-v1"), bank);
      if (saved) {
        setS(saved.sitting);
        setPhase(saved.phase);
        setEarnedId(saved.earnedId);
      }
    } catch { setSaveFailed(true); }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      writeCheckpoint(window.localStorage, { sitting: s, phase, earnedId }, bank);
      setSaveFailed(false);
    } catch { setSaveFailed(true); }
  }, [loaded, s, phase, earnedId]);
  useEffect(() => { head.current?.focus(); }, [loaded, phase, shownId, retrying, last]);

  const begin = () => {
    setS(startSitting(fisherYates(bank.map((q) => q.id))));
    setPhase("sit");
    setLast(null);
    setEarnedId(null);
    setRetrying(false);
    setPick(null);
    window.scrollTo(0, 0);
  };

  const onBlindPick = (id: string) => {
    const question = byId.get(id);
    if (!question || !s || pick === null) return;
    setS(submitBlind(s, id, pick, pick === question.answer));
  };

  const onRetryPick = (id: string) => {
    const question = byId.get(id);
    if (!question || !s || pick === null) return;
    const right = pick === question.answer;
    const next = submitRetry(s, id, pick, right);
    setS(next);
    setLast(right ? "right" : "wrong");
    setRetrying(false);
    if (right) {
      setPick(null);
      // Hold here. Jumping straight on would wipe the rule the instant the next
      // question mounts. Give the learner time to restate the rule.
      setEarnedId(id);
      if (!outstanding(next).length) return; // the interstitial offers the way out
    }
  };

  if (!loaded) return <p role="status">{tr(lang, "กำลังเปิดแบบฝึก…", "Opening practice…", "正在打开练习…")}</p>;
  const savedNotice = <p className="micro" role="status">{saveFailed
    ? tr(lang, "บันทึกในเบราว์เซอร์ไม่ได้ หากออกจากหน้านี้ คำตอบอาจหาย", "This browser could not save your sitting. Leaving may lose your answers.", "此浏览器无法保存进度，离开页面可能会丢失答案。")
    : tr(lang, "บันทึกอัตโนมัติในเบราว์เซอร์นี้ กลับมาทำต่อได้ · ไม่ซิงก์ข้ามเครื่อง", "Saved in this browser. Return to continue · no cross-device sync.", "进度保存在此浏览器，可随时回来继续 · 不跨设备同步。")}</p>;

  // ---------- the brief: no reading, and the expectation set honestly ----------
  if (phase === "brief")
    return (
      <section className="blind">
        {savedNotice}
        <h1 ref={head} tabIndex={-1}>{tr(lang, "ลองสอบ แล้วค่อยเรียน", "Try first. Study after.", "先试一试，再学解析")}</h1>
        <p>
          {tr(
            lang,
            `แบบฝึกที่เรียบเรียงขึ้น 90 ข้อ ครอบคลุม 80 หัวข้อ ลองตอบจากสิ่งที่รู้ก่อน ไม่จับเวลา และยังไม่แสดงเฉลยจนกว่าจะส่งครบทุกข้อ`,
            `90 authored practice questions across 80 topics. Start with what you know. There is no timer, and answers stay hidden until you submit all questions.`,
            `这套自编练习共90题，覆盖80个主题。先用已有知识作答，不限时，全部提交后才显示答案。`,
          )}
        </p>
        <p>
          {tr(
            lang,
            "ถ้ายังไม่เคยอ่าน ตอบผิดได้ ไม่เป็นไร ใช้ข้อที่พลาดเป็นแผนว่าควรเรียนเรื่องไหนต่อ",
            "New to these topics? Mistakes are useful: they show you what to study next.",
            "如果还没学过，答错也没关系。错题能帮你找到接下来要学的内容。",
          )}
        </p>
        <p>
          {tr(
            lang,
            "หลังส่งครบ อ่านหลักคิดของข้อที่พลาด แล้วซ่อนเฉลยเพื่อลองใหม่ ฝึกอธิบายด้วยว่าทำไมตัวเลือกอื่นจึงไม่ใช่",
            "After submitting, read the rule for each miss, then hide the explanation and retry. Practise explaining why the other choices do not fit.",
            "交卷后，先读错题的判断方法，再隐藏解析重试。试着说清楚：其他选项为什么不合适？",
          )}
        </p>
        <p className="notice">
          {tr(lang, "ไม่ใช่ข้อสอบทางการ แสดงคะแนนครั้งแรกแยกจากความก้าวหน้ารายบท ข้อที่มีแหล่งอ้างอิงจะแสดงที่มาและวันที่ในเฉลย ควรตรวจข้อมูลล่าสุดก่อนสอบ", "Not an official paper. Your first-attempt score is separate from chapter mastery. Available sources and dates appear in the review; check dated facts before your exam.", "非官方试卷。首次成绩与各章学习进度分开记录。解析中列出已有来源和日期；考前请核对时效性资料。")}
        </p>
        <button className="primary" onClick={begin}>
          {tr(lang, "เริ่มสอบ 90 ข้อ", "Begin · 90 questions", "开始 · 90题")} →
        </button>
      </section>
    );

  if (!s) return null;

  // ---------- the pass: a question and four options, nothing else ----------
  if (phase === "sit") {
    const id = s.order[s.at];
    const question = id ? byId.get(id) : null;
    if (!question)
      return (
        <section className="blind">
        {savedNotice}
          <h1 ref={head} tabIndex={-1}>{tr(lang, "ส่งแล้ว", "Submitted", "已交卷")}</h1>
          <p>
            {tr(
              lang,
              `ตอบไป ${s.order.length} ข้อ ผิด ${s.owed.length} ข้อ เฉลยจะมาต่อทีหลัง ข้อที่ผิดจะกลับมาทั้งหมด`,
              `All ${s.order.length} answered. ${s.owed.length} missed. The answers come next, and every miss comes back.`,
              `已作答${s.order.length}题，错${s.owed.length}题。接下来是答案，每道错题都会回来。`,
            )}
          </p>
          <button
            className="primary"
            onClick={() => {
              setLast(null);
              setRetrying(false);
              setPick(null);
              setPhase(s.owed.length ? "answers" : "handoff");
            }}
          >
            {s.owed.length
              ? tr(lang, "ดูเฉลยทีละข้อ", "See the answers, one at a time", "逐题看答案")
              : tr(lang, "ไปต่อ", "Continue", "继续")}
            →
          </button>
        </section>
      );
    return (
      <section className="quiz blind">
        {savedNotice}
        <div className="section-heading">
          <span className="mono">
            {String(s.at + 1).padStart(2, "0")} / {String(s.order.length).padStart(2, "0")}
          </span>
          <span className="mono micro">
            {tr(lang, `หัวข้อที่ ${question.topic}`, `topic ${question.topic}`, `主题 ${question.topic}`)}
          </span>
        </div>
        <h1 ref={head} id="quiz-heading" tabIndex={-1}>
          {question.prompt[lang]}
        </h1>
        <fieldset>
          <legend className="micro">{tr(lang, "เลือกคำตอบที่ถูกต้องที่สุด", "Choose the best answer", "选择最合适的答案")}</legend>
          {choiceOrder.map((i, position) => (
            <label className={"answer " + (pick === i ? "selected" : "")} key={i}>
              <input
                type="radio"
                name={`blind-${question.id}`}
                checked={pick === i}
                onChange={() => setPick(i)}
              />
              <span className="answer-letter mono">{choiceLetter(lang, position)}</span>
              <span>{question.choices[i][lang]}</span>
            </label>
          ))}
        </fieldset>
        <button
          className="primary"
          disabled={pick === null}
          onClick={() => {
            onBlindPick(question.id);
            setPick(null);
          }}
        >
          {tr(lang, "ส่งคำตอบ", "Submit", "提交")} →
        </button>
      </section>
    );
  }

  // ---------- earned: the same rule, now that it has just been used correctly ----------
  if (phase === "answers" && earnedId) {
    const c = byId.get(earnedId);
    if (c) {
      const left = outstanding(s).length;
      return (
        <section className="quiz blind">
        {savedNotice}
          <p className="blind-earned" role="status">
            {tr(
              lang,
              "ได้แล้ว ลองอธิบายด้วยว่าทำไมตัวเลือกอื่นจึงไม่ใช่",
              "Correct on this retry. Can you explain why the other choices do not fit?",
              "这次答对了。你能解释其他选项为什么不合适吗？",
            )}
          </p>
          <h2 ref={head} tabIndex={-1} className="blind-reask">{c.prompt[lang]}</h2>
          <p className="micro">
            {tr(lang, "คำตอบคือ", "The answer is", "答案是")} {c.choices[c.answer][lang]}
          </p>
          {c.logic && (
            <div className="feedback" role="status">
              <strong>{tr(lang, "กุญแจ", "The rule", "规则")}</strong>
              <p>{c.logic[lang]}</p>
            </div>
          )}
          <button
            className="primary"
            onClick={() => {
              setEarnedId(null);
              setPick(null);
              setRetrying(false);
              setLast(null);
              if (!left) setPhase("handoff");
            }}
          >
            {left
              ? tr(lang, `ข้อถัดไป (เหลือ ${left})`, `Next question (${left} left)`, `下一题（还剩${left}题）`)
              : tr(lang, "ดูผลรวม", "See the result", "查看结果")} →
          </button>
        </section>
      );
    }
  }

  // ---------- the answers: the rule, then the same question again ----------
  if (phase === "answers" && q) {
    const answer = q.answer;
    return (
      <section className="quiz blind">
        {savedNotice}
        <p className="micro">
          {tr(lang, "เฉลยและเหตุผล", "The answer and the reasoning", "答案与理由")} ·{" "}
          {tr(lang, `เหลือ ${queue.length} ข้อ`, `${queue.length} still owed`, `还剩${queue.length}题`)} ·{" "}
          {tr(lang, `เคยตอบผิด ${s.retries[q.id] ?? 0} ครั้ง`, `missed ${s.retries[q.id] ?? 0}× since`, `此后错${s.retries[q.id] ?? 0}次`)}
        </p>

        <h2 ref={head} tabIndex={-1} className="blind-reask">{q.prompt[lang]}</h2>
        {!retrying && <>
        <div className="feedback" role="status">
          {q.logic && (
            <>
              <strong>{tr(lang, "กุญแจที่ใช้ตัดตัวเลือก", "The rule that rules options out", "排除选项的规则")}</strong>
              <p>{q.logic[lang]}</p>
            </>
          )}
          <p>{q.explanation[lang]}</p>
          <QuestionVisual question={q} position={s.owed.indexOf(q.id)} selected={s.firstTry[q.id]} lang={lang} />
          {q.source && <p className="micro"><a href={q.source.url} target="_blank" rel="noopener noreferrer">{q.source.title} ↗</a> · {tr(lang, "ข้อมูล ณ", "As of", "资料日期")} {q.source.asOf}</p>}
          {q.sections.length > 0 && (
            <div className="micro">
              {tr(lang, "ไปต่อที่ตัวบท", "Go further in the text", "继续读条文")}:{" "}
              {q.sections.map((n) => (
                <Link className="citation" key={n} href={`/section/?n=${n}`}>
                  {sectionLabel(lang, n)} →
                </Link>
              ))}
            </div>
          )}
        </div>

        <details className="blind-recap" open>
          <summary>{tr(lang, "คุณเลือกอะไรไป", "What you picked", "你选了什么")}</summary>
          <p className="micro">
            {tr(lang, "คุณเลือก", "You chose", "你选了")} {q.choices[s.firstTry[q.id]]?.[lang]}
          </p>
          <p className="micro">
            {tr(lang, "คำตอบคือ", "The answer is", "答案是")} {q.choices[answer][lang]}
          </p>
        </details>

        {last === "wrong" && <p className="notice" role="status">{tr(lang, "ยังไม่ใช่ อ่านหลักคิดอีกครั้ง แล้วลองใหม่ ข้อนี้ยังอยู่ในคิว", "Not yet. Read the rule, then try again. This question stays in your queue.", "还不对。再读一遍判断方法，然后重试。这题仍在待练习列表中。")}</p>}
        <button className="primary" onClick={() => { setPick(null); setLast(null); setRetrying(true); }}>
          {tr(lang, "ซ่อนเฉลย แล้วลองใหม่", "Hide explanation and retry", "隐藏解析，再试一次")} →
        </button>
        </>}
        {retrying && <>
        <fieldset>
          <legend className="micro">{tr(lang, "ลองตอบโดยไม่ดูเฉลย", "Try without the explanation", "不看解析，再答一次")}</legend>
          {choiceOrder.map((i, position) => <label className={"answer " + (pick === i ? "selected" : "")} key={i}>
            <input type="radio" name={`retry-${q.id}`} checked={pick === i} onChange={() => setPick(i)} />
            <span className="answer-letter mono">{choiceLetter(lang, position)}</span>
            <span>{q.choices[i][lang]}</span>
          </label>)}
        </fieldset>
        <button className="primary" disabled={pick === null} onClick={() => onRetryPick(q.id)}>
          {tr(lang, "ตรวจ", "Check", "检查")} →
        </button>
        </>}

      </section>
    );
  }

  // ---------- the handoff: what you know, and where to go next ----------
  const score = blindScore(s);
  return (
    <section className="blind">
        {savedNotice}
      <h1 ref={head} tabIndex={-1}>
        {tr(lang, `ครั้งแรกได้ ${score.right} / ${score.total}`, `${score.right} of ${score.total} first time`, `首次答对${score.right}/${score.total}`)}
      </h1>
      <p>
        {tr(
          lang,
          `ตอบผิด ${score.wrong} ข้อ และลองใหม่จนตอบถูกครบแล้ว การตอบถูกทันทีหลังดูเฉลยยังไม่แปลว่าจำได้ระยะยาว กลับมาฝึกวันถัดไปและลองโจทย์ใหม่ด้วย`,
          `${score.wrong} missed; all have now been answered correctly on retry. An immediate retry does not establish lasting recall. Return another day and try fresh questions too.`,
          `首次错${score.wrong}题，现已全部重试答对。刚看完解析就答对，还不能说明已经长期记住。改天再来复习，也试试新题。`,
        )}
      </p>
      <p>
        <Link href="/bible/">{tr(lang, "เข้าสู่คู่มืออ่านรัฐธรรมนูญ 13 บท", "Go to the 13-chapter study guide", "进入13章学习指南")} →</Link>
        {" · "}
        <Link href="/cram/">{tr(lang, "หน้าสรุปก่อนเข้าห้องสอบ", "The night-before sheet", "考前速记页")} →</Link>
        {" · "}
        <Link href="/practice/">{tr(lang, "ฝึกตอบเพิ่ม", "More practice", "更多练习")} →</Link>
        {" · "}
        <Link href="/read/">{tr(lang, "อ่านตัวบทที่สอบถาม", "Read the sections they asked about", "阅读被考到的条文")} →</Link>
      </p>
      <button
        className="primary"
        onClick={() => {
          setS(null);
          setPhase("brief");
          setPick(null);
          setRetrying(false);
          setLast(null);
          setEarnedId(null);
        }}
      >
        {tr(lang, "สอบอีกครั้ง", "Sit it again", "再考一次")} →
      </button>
    </section>
  );
}
