"use client";
import { useEffect, useState } from "react";
import cases from "@/data/cases.json";
import { groupedRights } from "@/lib/rights";
import { Puzzle, type Case } from "./Puzzle";
import dynamic from "next/dynamic";
const Ask = dynamic(() => import("./Ask").then((m) => m.Ask));
import { useStudy } from "./Provider";
import { tr, labels, sectionLabel } from "@/lib/i18n";
import { StudyArt } from "./StudyArt";
export function Rights() {
  const { lang } = useStudy();
  const [open, setOpen] = useState<Case | null>(null);
  const groups = groupedRights(cases);
  // /rights/?case=<id> opens one puzzle directly, for links from the dots map.
  useEffect(() => {
    const id = new URLSearchParams(location.search).get("case");
    const found = (cases as Case[]).find((c) => c.id === id);
    if (found) setOpen(found);
  }, []);
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
      <div className="intro-copy">
        <StudyArt scene="rights" />
        <div className="intro-text">
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
        </div>
      </div>
      <div className="action-panel">
        <span className="mono action-panel-kicker">
          {tr(lang, "เริ่มที่นี่", "Start here", "从这里开始")}
        </span>
        <button
          className="primary action-panel-cta"
          onClick={() => setOpen(groups[0]?.items[0]?.item ?? null)}
        >
          {tr(lang, "ลองเดาเรื่องแรก", "Try the first one", "先试第一题")} →
        </button>
        <p className="micro action-panel-reason">
          {tr(
            lang,
            "เดาก่อนเสมอ แล้วค่อยเปิดตัวบทที่ตอบ — ทั้ง 15 เรื่องอยู่ใต้บรรทัดนี้",
            "Always guess first, then open the section that answers it. All fifteen situations are below.",
            "先猜，再打开回答它的条文。十五个情境都在下面。",
          )}
        </p>
      </div>
      {groups.map((group) => (
        <section key={group.id}>
          <h2>{group.title[lang]}</h2>
          <div className="chapter-route">
            {group.items.map(({ n, item }) => (
              <article className="chapter-row" key={item.id}>
                <div className="route-number mono">{String(n).padStart(2, "0")}</div>
                <div className="chapter-info">
                  <span className="micro">
                    {item.sections.map((section) => sectionLabel(lang, section)).join(" · ")}
                  </span>
                  <h3>{item.prompt[lang]}</h3>
                </div>
                <div className="chapter-actions">
                  <button onClick={() => setOpen(item)}>
                    {tr(lang, "ลองเดา", "Try it", "试一试")} →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
      <Ask />
    </>
  );
}
