"use client";
import { useState } from "react";
import cases from "@/data/cases.json";
import { Puzzle, type Case } from "./Puzzle";
import { Ask } from "./Ask";
import { useStudy } from "./Provider";
import { tr, labels, sectionLabel } from "@/lib/i18n";
export function Rights() {
  const { lang } = useStudy();
  const [open, setOpen] = useState<Case | null>(null);
  if (open)
    return (
      <>
        <button className="text-button" onClick={() => setOpen(null)}>
          ← {labels.rights[lang]}
        </button>
        <Puzzle
          item={open}
          onDone={() => setOpen(null)}
          doneLabel={tr(lang, "กลับไปที่ชั้นหนังสือ", "Back to the shelf", "回到书架")}
        />
      </>
    );
  return (
    <>
      <div className="page-kicker mono">YOUR RIGHTS · 02</div>
      <h1>
        {tr(
          lang,
          "กฎหมายสูงสุด\nในเรื่องธรรมดา",
          "The supreme law,\nin ordinary life",
          "最高法律，\n在日常生活里",
        )}
      </h1>
      <p>
        {tr(
          lang,
          "โทรศัพท์ บ้าน ใบอนุญาต น้ำท่วมซอย แต่ละโจทย์ให้คุณเดาก่อน แล้วค่อยเปิดตัวบทที่ตอบมัน",
          "Your phone, your home, a stalled permit, a flooded street. Each puzzle asks you to guess first, then opens the section that answers it.",
          "手机、住所、卡住的许可证、积水的街道。每道题都先请你猜，再打开回答它的条文。",
        )}
      </p>
      <div className="chapter-route">
        {cases.map((c) => (
          <article className="chapter-row" key={c.id}>
            <div className="route-number mono">
              {c.chapter === 17 ? "T" : String(c.chapter).padStart(2, "0")}
            </div>
            <div className="chapter-info">
              <span className="micro">
                {c.sections.map((n) => sectionLabel(lang, n)).join(" · ")}
              </span>
              <h3>{c.prompt[lang]}</h3>
            </div>
            <div className="chapter-actions">
              <button onClick={() => setOpen(c)}>
                {tr(lang, "ลองเดา", "Try it", "试一试")} ↗
              </button>
            </div>
          </article>
        ))}
      </div>
      <Ask />
    </>
  );
}
