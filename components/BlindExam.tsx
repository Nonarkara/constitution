"use client";
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

const byId = new Map<string, BlindQuestion>(bank.map((q) => [q.id, q as BlindQuestion]));

type Phase = "brief" | "sit" | "answers" | "handoff";

/**
 * The blind sitting. Nothing to read first: the point is to find out what you do not
 * know. Every miss then owes an answer, and the answer has to arrive by reasoning,
 * not by recognising the sentence. A question is not finished until it is answered
 * right the second time.
 */
export function BlindExam() {
  const { lang } = useStudy();
  const [phase, setPhase] = useState<Phase>("brief");
  const [s, setS] = useState<Sitting | null>(null);
  const [pick, setPick] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [took, setTook] = useState<number | null>(null);
  const [last, setLast] = useState<"right" | "wrong" | null>(null);
  const [earnedId, setEarnedId] = useState<string | null>(null);
  const head = useRef<HTMLHeadingElement>(null);

  const queue = useMemo(() => (s ? outstanding(s) : []), [s]);
  const open = queue[0] ?? null;
  const q = open ? (byId.get(open) ?? null) : null;

  // every new question starts clean: no leftover marks, no leftover verdict
  useEffect(() => {
    if (!q) return;
    head.current?.focus();
    setPick(null);
    setTook(null);
    setRevealed(false);
    setLast(null);
  }, [q?.id]);

  const begin = () => {
    setS(startSitting(fisherYates(bank.map((q) => q.id))));
    setPhase("sit");
    setLast(null);
    setEarnedId(null);
    setRevealed(false);
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
    setTook(right ? null : pick);
    setRevealed(!right);
    if (right) {
      setPick(null);
      // Hold here. Jumping straight on would wipe the rule the instant the next
      // question mounts, and this is the one beat where the learner finds out
      // that the reasoning actually worked.
      setEarnedId(id);
      if (!outstanding(next).length) return; // the interstitial offers the way out
    }
  };

  // ---------- the brief: no reading, and the expectation set honestly ----------
  if (phase === "brief")
    return (
      <section className="blind">
        <h1>{tr(lang, "สอบจริง แล้วค่อยเรียน", "The test first. Study after.", "先考试，后学习")}</h1>
        <p>
          {tr(
            lang,
            `ข้อสอบนายอำเภอและท้องถิ่น ปี 2568 มีหัวข้อประเมิน 80 หัวข้อ นี่คือการสอบจริงตัวหนึ่ง ไม่ใช่การอ่าน ไม่มีเอกสารให้เปิดล่วงหน้า ไม่มีเฉลยระหว่างทำ`,
            `The 2025 district-chief and local-government exam assesses 80 topics. This is one sitting of it. It is not a reading session: nothing to open first, and no answers while you work.`,
            `2025年县长与地方公务员考试评估80个主题。这是一场真实考试，不是阅读：开始前没有可打开的材料，做题时不显示答案。`,
          )}
        </p>
        <p>
          {tr(
            lang,
            "คุณจะพลาดมาก และนั่นถูกต้อง ถ้าคุณยังไม่ได้อ่านเรื่องนี้มาก่อนเลย การพลาดคือข้อมูลที่มีค่าที่สุดในห้องนี้ เพราะมันบอกว่าคุณต้องไปเรียนอะไรต่อ",
            "You will get a great many wrong, and that is the correct outcome. If you have not read any of this before, the misses are the most valuable thing in the room: they tell you what to go and learn.",
            "你会错很多，而这正是预期结果。如果你之前完全没读过，错题就是这里最有价值的东西——它告诉你接下来该学什么。",
          )}
        </p>
        <p>
          {tr(
            lang,
            "ทุกข้อที่ตอบผิด จะกลับมาอีกจนกว่าคุณจะตอบถูก ไม่ใช่เพราะจำได้ แต่เพราะตัดตัวเลือกที่เหลือออกได้ด้วยเหตุผล นั่นคือทักษะที่ข้อสอบจริงวัด",
            "Every question you miss comes back until you answer it right — not because you remembered it, but because you can rule the other three out by reasoning. That is the skill a real exam measures.",
            "每道错题都会回来，直到你答对——不是因为你记住了，而是因为你能用推理排除另外三项。这才是真实考试衡量的能力。",
          )}
        </p>
        <p className="notice">
          {tr(lang, "ไม่ใช่ข้อสอบจริง ไม่มีคะแนน ไม่เข้าบัญชีความก้าวหน้าของรัฐธรรมนูญ และตัวเลขหรือข่าวที่มีที่มากำกับ ตรวจกับแหล่งล่าสุดก่อนสอบ", "Not an official paper. Unscored, and kept out of constitution progress. Figures and news carry a source and a date; check the latest before the exam.", "非官方真题。不计分，也不计入宪法学习进度。数字与时事均注明来源与日期，考前请核对最新资料。")}
        </p>
        <button className="primary" onClick={begin}>
          {tr(lang, "เริ่มสอบ 80 หัวข้อ", "Begin · 80 topics", "开始 · 80个主题")} →
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
          <h1>{tr(lang, "ส่งแล้ว", "Submitted", "已交卷")}</h1>
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
              setRevealed(false);
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
          {question.choices.map((c, i) => (
            <label className={"answer " + (pick === i ? "selected" : "")} key={i}>
              <input
                type="radio"
                name={`blind-${question.id}`}
                checked={pick === i}
                onChange={() => setPick(i)}
              />
              <span className="answer-letter mono">{choiceLetter(lang, i)}</span>
              <span>{c[lang]}</span>
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
    if (!c) setEarnedId(null);
    else {
      const left = outstanding(s).length;
      return (
        <section className="quiz blind">
          <p className="blind-earned" role="status">
            {tr(
              lang,
              "ได้แล้ว ครั้งนี้คุณตัดตัวเลือกที่เหลือออกได้ด้วยกุญแจนี้",
              "Earned. This time you ruled the rest out with that rule.",
              "答对了。这一次你用这条规则排除了其余选项。",
            )}
          </p>
          <h2 className="blind-reask">{c.prompt[lang]}</h2>
          <p className="micro">
            {tr(lang, "คำตอบคือ", "The answer is", "答案是")} {choiceLetter(lang, c.answer)} —{" "}
            {c.choices[c.answer][lang]}
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
              setTook(null);
              setRevealed(false);
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
        <p className="micro">
          {tr(lang, "เฉลยและเหตุผล", "The answer and the reasoning", "答案与理由")} ·{" "}
          {tr(lang, `เหลือ ${queue.length} ข้อ`, `${queue.length} still owed`, `还剩${queue.length}题`)} ·{" "}
          {tr(lang, `เคยตอบผิด ${s.retries[q.id] ?? 0} ครั้ง`, `missed ${s.retries[q.id] ?? 0}× since`, `此后错${s.retries[q.id] ?? 0}次`)}
        </p>

        <div className="feedback" role="status">
          {q.logic && (
            <>
              <strong>{tr(lang, "กุญแจที่ใช้ตัดตัวเลือก", "The rule that rules options out", "排除选项的规则")}</strong>
              <p>{q.logic[lang]}</p>
            </>
          )}
          <p>{q.explanation[lang]}</p>
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
            {tr(lang, "คุณเลือก", "You chose", "你选了")} {choiceLetter(lang, s.firstTry[q.id])} —{" "}
            {q.choices[s.firstTry[q.id]]?.[lang]}
          </p>
          <p className="micro">
            {tr(lang, "คำตอบคือ", "The answer is", "答案是")} {choiceLetter(lang, answer)} — {q.choices[answer][lang]}
          </p>
        </details>

        <h2 className="blind-reask">{q.prompt[lang]}</h2>

        <fieldset disabled={revealed}>
          <legend className="micro">
            {tr(lang, "ตอบอีกครั้ง โดยไม่ดูเฉลย", "Answer it again, without the text", "不看解析，再答一次")}
          </legend>
          {q.choices.map((c, i) => {
            const right = revealed && i === answer;
            const wrong = revealed && i === took;
            return (
              <label className={"answer " + (pick === i ? "selected " : "") + (right ? "answer-correct " : "") + (wrong ? "answer-wrong" : "")} key={i}>
                <input type="radio" name={`retry-${q.id}`} checked={pick === i} onChange={() => setPick(i)} />
                <span className="answer-letter mono">{choiceLetter(lang, i)}</span>
                <span>{c[lang]}</span>
                {right && <span aria-label={tr(lang, "ถูก", "Correct", "正确")}>✓</span>}
                {wrong && <span aria-label={tr(lang, "ยังผิด", "Still wrong", "仍错")}>×</span>}
              </label>
            );
          })}
        </fieldset>

        {revealed && took !== null && (
          <p className="notice" role="status">
            {tr(
              lang,
              "ยังไม่ใช่ ดูกุญแจด้านบนอีกครั้ง แล้วลองใหม่ ข้อนี้จะไม่ปล่อยไปจนกว่าจะถูก",
              "Not yet. Read the rule again, then try once more. This one does not leave until it is right.",
              "还不对。再读一遍上面的规则，然后重试。这题不会离开，直到你答对。",
            )}
          </p>
        )}

        <button className="primary" disabled={pick === null} onClick={() => onRetryPick(q.id)}>
          {tr(lang, "ตรวจ", "Check", "检查")} →
        </button>

        {last === "right" && (
          <p className="blind-earned" role="status">
            {tr(
              lang,
              "ได้แล้ว ครั้งนี้คุณตัดตัวเลือกที่เหลือออกด้วยกุญแจข้างบน ไม่ใช่การจำประโยค",
              "Earned. This time you ruled the rest out with the rule above, not by remembering the sentence.",
              "答对了。这一次你是用上面的规则排除其余选项，而不是记住了那句话。",
            )}
          </p>
        )}
      </section>
    );
  }

  // ---------- the handoff: what you know, and where to go next ----------
  const score = blindScore(s);
  return (
    <section className="blind">
      <h1>
        {tr(lang, `ผ่าน ${score.right} / ${score.total}`, `${score.right} of ${score.total} first time`, `首次答对${score.right}/${score.total}`)}
      </h1>
      <p>
        {tr(
          lang,
          `ตอบผิด ${score.wrong} ข้อ และตอบถูกทุกข้อนั้นแล้วด้วยการใช้เหตุผล ข้อที่ผ่านแล้วคือข้อที่คุณตอบถูกเองเมื่อเจอซ้ำ`,
          `${score.wrong} missed, and all ${score.wrong} then answered right by reasoning. A question only passes once you get it right yourself, second time round.`,
          `错${score.wrong}题，并且这${score.wrong}题都已被你用推理答对。一道题只有第二次你自己答对才算通过。`,
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
          setRevealed(false);
          setLast(null);
          setEarnedId(null);
        }}
      >
        {tr(lang, "สอบอีกครั้ง", "Sit it again", "再考一次")} →
      </button>
    </section>
  );
}
