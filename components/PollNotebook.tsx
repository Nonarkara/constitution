"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { polls, parsePolls, POLLS_KEY, type PollAnswers } from "@/lib/polls";
import { useStudy } from "./Provider";
import { tr } from "@/lib/i18n";
import { StudyArt } from "./StudyArt";
import { ActionPanel } from "./PageAction";
export function PollNotebook() {
  const { lang } = useStudy();
  const [answers, setAnswers] = useState<PollAnswers>({}),
    [at, setAt] = useState(0),
    [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(POLLS_KEY);
      if (raw) {
        const p = parsePolls(JSON.parse(raw));
        if (p) setAnswers(p);
        else setFailed(true);
      }
    } catch {
      setFailed(true);
    }
    setReady(true);
  }, []);
  const p = polls[at],
    own = answers[p.id];
  // The next poll you have not answered, wrapping round the ten. This is the
  // page's one action: on a ten-question poll, the thing a reader wants is
  // always "which one is left", not "which one is next in sequence".
  const nextUnanswered = () => {
    for (let k = 1; k <= polls.length; k++) {
      const i = (at + k) % polls.length;
      if (!answers[polls[i].id]) return i;
    }
    return at;
  };
  const save = (choice: number, note: string) => {
    const next = { ...answers, [p.id]: { choice, note } };
    setAnswers(next);
    try {
      localStorage.setItem(POLLS_KEY, JSON.stringify(next));
      setFailed(false);
    } catch {
      setFailed(true);
    }
  };
  return (
    <section>
      <div className="intro-copy">
        <StudyArt scene="polls" />
        <div className="intro-text">
          <h1>
            {tr(
              lang,
              "คำถามที่เป็นของคุณ",
              "Questions that belong to you",
              "属于你的问题",
          )}
          </h1>
          <p>
            {tr(
              lang,
              "10 โพลส่วนตัว ไม่มีคำตอบที่ให้คะแนน ไม่มีสถิติคนอื่น คำตอบอยู่ในเบราว์เซอร์นี้และไม่ได้ส่งขึ้นเซิร์ฟเวอร์ คนใช้เบราว์เซอร์ร่วมกันจะเห็นบันทึกเดียวกัน",
              "Ten private polls. No graded opinions and no public voting totals. Answers stay in this browser and are not sent to a server. People sharing a browser share these notes.",
              "十个私人问卷，不给观点评分，也不显示公众投票总数。答案保存在本浏览器，不发送到服务器。共用浏览器就共用记录。",
          )}
          </p>
        </div>
      </div>
      {/* One thing to do. The question, the choices, the reason box and the
          counter all sat at the same weight, so the page had no main
          function. The answer is the page, so the answer is the panel. */}
      <ActionPanel kicker={tr(lang, "ตอบโพล", "Answer the poll", "回答问卷")}>
        <button
          className="primary action-panel-cta"
          onClick={() => setAt(nextUnanswered())}
        >
          {tr(
            lang,
            "ไปคำถามที่ยังไม่ได้ตอบ",
            "Go to the next unanswered question",
            "前往下一个未回答的问题",
          )}{" "}
          →
        </button>
        <h2>{p.question[lang]}</h2>
        <fieldset disabled={!ready} style={{ width: "100%" }}>
          {p.choices.map((c, i) => (
            <label className="answer" key={i}>
              <input
                type="radio"
                name={p.id}
                checked={own?.choice === i}
                onChange={() => save(i, own?.note ?? "")}
              />
              {c[lang]}
            </label>
          ))}
        </fieldset>
        <label htmlFor="poll-note">
          {tr(
            lang,
            "เหตุผลของฉัน (ไม่จำเป็น)",
            "My reason (optional)",
            "我的理由（可选）",
          )}
        </label>
        <textarea
          id="poll-note"
          rows={3}
          maxLength={1000}
          disabled={!own || !ready}
          value={own?.note ?? ""}
          onChange={(e) => save(own.choice, e.target.value)}
          style={{ width: "100%" }}
        />
        <p role="status">
          {failed
            ? tr(
                lang,
                "บันทึกไม่ได้หรือข้อมูลเก่าอ่านไม่ได้ อย่าเพิ่งถือว่าเก็บถาวรแล้ว",
                "Saving failed or old data could not be read. Do not assume permanent storage.",
                "保存失败或旧数据无法读取，请勿假定已永久保存。",
              )
            : own
              ? tr(
                  lang,
                  "เก็บไว้ในเครื่องนี้แล้ว",
                  "Saved on this device",
                  "已保存在本设备",
                )
              : ""}
        </p>
        <p className="micro action-panel-reason">
          {tr(
            lang,
            "คำตอบกับเหตุผลของคุณถูกเก็บไว้ในเครื่องนี้ ไม่มีคะแนนและไม่มีผลรวมของคนอื่น",
            "Your answer and your reason are kept on this device — no score, and no tally from anyone else.",
            "你的答案与理由保存在本设备——不计分，也没有他人的统计。",
          )}
        </p>
      </ActionPanel>
      <p>
        {at + 1}/10 · {Object.keys(answers).length}{" "}
        {tr(lang, "ข้อที่จดไว้", "recorded", "题已记录")}
      </p>
      <div className="reader-navigation">
        <button disabled={at === 0} onClick={() => setAt(at - 1)}>
          ← {tr(lang, "ก่อนหน้า", "Previous", "上一题")}
        </button>
      </div>
      <p className="micro">
        {tr(
          lang,
          "ส่งออกคำตอบจากหน้านี้แยกต่างหาก ไฟล์สำรองความก้าวหน้าเดิมไม่รวมโพล",
          "Export these answers separately here; the progress backup does not include polls.",
          "请在本页单独导出这些答案；学习进度备份不含问卷。",
        )}
      </p>
      <button
        disabled={!ready}
        onClick={() => {
          const url = URL.createObjectURL(
            new Blob([JSON.stringify({ version: 1, answers }, null, 2)], {
              type: "application/json",
            }),
          );
          const a = document.createElement("a");
          a.href = url;
          a.download = "my-private-polls.json";
          a.click();
          URL.revokeObjectURL(url);
        }}
      >
        {tr(lang, "ส่งออกคำตอบโพล", "Export poll answers", "导出问卷答案")}
      </button>
      <p>
        <Link href="/drills/">
          {tr(
            lang,
            "ลอง 5 โจทย์เงื่อนไข",
            "Try five application drills",
            "试五道应用题",
          )}{" "}
          →
        </Link>{" "}
        ·{" "}
        <Link href="/news/">
          {tr(
            lang,
            "อ่านข่าวแล้วถามต่อ",
            "Read a headline and ask again",
            "读新闻后再问",
          )}{" "}
          →
        </Link>
      </p>
    </section>
  );
}
