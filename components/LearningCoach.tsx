"use client";
import { useState, useId } from "react";
import Link from "next/link";
import { useStudy } from "./Provider";
import { tr, sectionLabel } from "@/lib/i18n";
import { explanationNote, type Confidence } from "@/lib/coach";
export function RecallFirst({ onReveal, draft, onDraftChange }: { onReveal: () => void; draft: string; onDraftChange: (draft: string) => void }) {
  const { lang } = useStudy();
  return (
    <div className="recall-first">
      <label htmlFor="recall-draft">
        <strong>
          {tr(
            lang,
            "ก่อนดูตัวเลือก ลองเรียกคำตอบกลับมา",
            "Before the options, try recalling",
            "看选项前，先试着回忆",
          )}
        </strong>
      </label>
      <p className="micro">
        {tr(
          lang,
          "คิด พูด หรือเขียนสั้น ๆ ไม่ต้องตอบครบ ข้อความนี้ไม่คิดคะแนนและไม่บันทึก บน iPad ใช้ไมค์ของแป้นพิมพ์ได้",
          "Think, speak or jot a line. No complete answer is required; this draft is unscored and unsaved. On iPad you can use keyboard dictation.",
          "先想、说或写一句。不必完整作答；草稿不计分、不保存。iPad可使用键盘听写。",
        )}
      </p>
      <textarea
        id="recall-draft"
        rows={2}
        maxLength={1000}
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
      />
      <button onClick={onReveal}>
        {tr(
          lang,
          "ดูตัวเลือกและตรวจความคิด",
          "Show options and check my thinking",
          "显示选项，核对思路",
        )}{" "}
        →
      </button>
    </div>
  );
}
export function ConfidenceCheck({
  value,
  onChange,
}: {
  value: Confidence | null;
  onChange: (v: Confidence) => void;
}) {
  const { lang } = useStudy();
  return (
    <fieldset className="confidence-check">
      <legend>
        {tr(
          lang,
          "มั่นใจแค่ไหน? ไม่กระทบคะแนน",
          "How confident? This does not affect your score.",
          "有多确定？不影响分数。",
        )}
      </legend>
      {(["unsure", "maybe", "sure"] as Confidence[]).map((v, i) => (
        <label key={v}>
          <input
            type="radio"
            name="confidence"
            checked={value === v}
            onChange={() => onChange(v)}
          />
          {
            [
              tr(lang, "ยังไม่แน่ใจ", "Unsure", "不确定"),
              tr(lang, "พอมีเหตุผล", "Some reason", "有些依据"),
              tr(lang, "มั่นใจ", "Sure", "确定"),
            ][i]
          }
        </label>
      ))}
    </fieldset>
  );
}
export function ExplainBack({ section }: { section: number }) {
  const draftId = useId();
  const { lang, annotations, saveAnnotations, storageError } = useStudy();
  const [draft, setDraft] = useState(""),
    [message, setMessage] = useState<"saved" | "long" | null>(null);
  return (
    <details className="explain-back">
      <summary>
        {tr(
          lang,
          "สอนติ๊กกี้กลับด้วยคำของคุณ",
          "Teach it back in your own words",
          "用自己的话讲给蒂琪听",
        )}
      </summary>
      <p>
        {tr(
          lang,
          "อธิบายว่าใครมีอำนาจ ต้องครบเงื่อนไขอะไร และตัวเลือกที่น่าเชื่อผิดตรงไหน ลองเปลี่ยนตัวละครหรือจำนวนคน: กฎเดิมยังใช้ไหม?",
          "Explain who has authority, which conditions matter, and why a tempting alternative fails. Change the character or number: does the rule still hold?",
          "解释谁有权、需要哪些条件，以及看似可信的选项错在哪里。换人物或人数：规则还适用吗？",
        )}
      </p>
      <label htmlFor={draftId}>
        {tr(
          lang,
          "เหตุผลหรือภาพช่วยจำของฉัน",
          "My reasoning or memory cue",
          "我的理由或记忆线索",
        )}
      </label>
      <textarea
        id={draftId}
        rows={3}
        maxLength={1500}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setMessage(null);
        }}
      />
      <button
        disabled={!draft.trim() || message === "saved"}
        onClick={() => {
          const next = explanationNote(annotations, section, draft, Date.now());
          if (!next) {
            setMessage("long");
            return;
          }
          saveAnnotations(next);
          setMessage("saved");
        }}
      >
        {tr(lang, "เพิ่มในบันทึกเดิม", "Append to my notes", "追加到原有笔记")}{" "}
        · {sectionLabel(lang, section)}
      </button>
      {message && (
        <p role="status">
          {message === "long"
            ? tr(
                lang,
                "บันทึกเต็มแล้ว ข้อความเดิมยังอยู่ เปิดแก้ที่มาตรานี้",
                "The note is full. Existing text is preserved; edit it on the section page.",
                "笔记已满，原文保留。请到条文页编辑。",
              )
            : storageError
              ? tr(
                  lang,
                  "เพิ่มในรอบนี้แล้ว แต่เบราว์เซอร์บันทึกไม่ได้",
                  "Added for this session, but the browser could not save it.",
                  "已加入本次会话，但浏览器无法保存。",
                )
              : tr(
                  lang,
                  "เพิ่มแล้ว รวมในไฟล์สำรองด้วย",
                  "Added. It is included in your backup.",
                  "已追加，也会包含在备份中。",
                )}
        </p>
      )}
      <p className="micro">
        {tr(
          lang,
          "ข้อความนี้เป็นความเข้าใจของคุณ แอปไม่ได้ตรวจหรือให้คะแนน ตรวจเทียบเฉลยและตัวบทด้วย",
          "This is your interpretation; the app does not grade or verify it. Compare it with the explanation and legal text.",
          "这是你的理解，应用不评分或核验。请与解析及条文对照。",
        )}
      </p>
      <Link href={`/section/?n=${section}`}>
        {tr(
          lang,
          "เปิดตัวบทและบันทึก",
          "Open the law and notes",
          "打开条文与笔记",
        )}{" "}
        →
      </Link>
    </details>
  );
}
