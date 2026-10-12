"use client";
import { InstitutionMap } from "./InstitutionMap";
import { StudyArt } from "./StudyArt";
import { useState } from "react";
import Link from "next/link";
import { chapters } from "@/lib/corpus";
import { chapterMastery } from "@/lib/learning";
import questions from "@/data/questions.json";
import { Quiz } from "./Quiz";
import { useStudy } from "./Provider";
import { tr, labels, sectionLabel } from "@/lib/i18n";
export function Learn() {
  const { lang, progress, ready } = useStudy();
  const [chapter, setChapter] = useState<number | null>(null);
  const mastered = chapters.filter(
    (c) =>
      c.number !== 17 && chapterMastery(questions, progress, c.number).mastered,
  ).length;
  const next =
    chapters.find(
      (c) => !chapterMastery(questions, progress, c.number).mastered,
    ) ?? chapters[0];
  if (chapter !== null)
    return (
      <>
        <button className="text-button" onClick={() => setChapter(null)}>
          ← {labels.learn[lang]}
        </button>
        <Quiz chapter={chapter} onExit={() => setChapter(null)} />
      </>
    );
  return (
    <>
      <div className="page-kicker mono">YOUR LEARNING PATH · 01</div>
      <section className="intro">
        <div className="intro-index mono" aria-hidden="true">
          ๑
        </div>
        <div className="intro-copy">
          <StudyArt scene="reading" />
          <h1>
            {tr(
              lang,
              "ค่อย ๆ อ่าน\nค่อย ๆ เข้าใจ",
              "One section.\nOne small step.",
              "一条一条读，\n一点一点懂。",
            )}
          </h1>
          <p>
            {tr(
              lang,
              "รัฐธรรมนูญไม่ต้องจำทั้งหมดในวันเดียว เริ่มจากเรื่องใกล้ตัว แล้วลองตอบด้วยความเข้าใจ",
              "You don’t have to learn it all today. Start with one idea, then put it into practice.",
              "不必一天记住全部。先读懂一个概念，再用练习检验理解。",
            )}
          </p>
          <button
            className="primary"
            disabled={!ready}
            onClick={() => setChapter(next.number)}
          >
            {tr(
              lang,
              "เริ่มบทเรียนสั้น ๆ",
              "Start a short lesson",
              "开始一节短课",
            )}{" "}
            <span aria-hidden="true">→</span>
          </button>
          <p className="micro">
            {tr(
              lang,
              "เริ่มจากโจทย์ในชีวิตจริง • แล้วอ่านกฎหมาย • ไม่จำกัดเวลา",
              "A real-life puzzle first · then the law · No timer",
              "先做生活题 · 再读法条 · 不限时",
            )}
          </p>
        </div>
      </section>
      <div className="section-heading">
        <div>
          <span className="mono">2560 / 2017</span>
          <h2>
            {tr(
              lang,
              "เส้นทางทั้ง 16 หมวด",
              "Your chapter map",
              "十六章学习地图",
            )}
          </h2>
        </div>
        <span className="micro">
          {mastered} / {chapters.filter((c) => c.number !== 17).length}{" "}
          {tr(lang, "หมวดผ่านเกณฑ์", "chapters mastered", "章已达标")}
        </span>
      </div>
      <div className="chapter-route">
        {chapters.map((c) => {
          const m = chapterMastery(questions, progress, c.number);
          return (
            <article
              className={"chapter-row " + (m.mastered ? "mastered" : "")}
              key={c.number}
            >
              <div className="route-number mono">
                {c.number === 17 ? "T" : String(c.number).padStart(2, "0")}
              </div>
              <div className="chapter-info">
                <span className="micro">
                  {c.number === 17
                    ? tr(
                        lang,
                        "บทเฉพาะกาล",
                        "Transitory provisions",
                        "过渡条款",
                      )
                    : lang === "zh"
                      ? `第${c.number}章`
                      : labels.chapter[lang] + " " + c.number}{" "}
                  ·{" "}
                  {sectionLabel(
                    lang,
                    c.start === c.end ? c.start : `${c.start}–${c.end}`,
                  )}
                </span>
                <h3>{c.title[lang]}</h3>
                <div className="mastery-line" aria-label={`${m.percent}%`}>
                  <span style={{ transform: `scaleX(${m.percent / 100})` }} />
                </div>
                <span className="micro">
                  {m.mastered
                    ? tr(
                        lang,
                        "ผ่านเกณฑ์ 80% แล้ว",
                        "80% mastery reached",
                        "已达到80%掌握标准",
                      )
                    : tr(
                        lang,
                        `ตอบถูก ${m.correct}/${m.total} ข้อ`,
                        `${m.correct}/${m.total} correct`,
                        `${m.correct}/${m.total}题答对`,
                      )}
                </span>
              </div>
              <div className="chapter-actions">
                <button disabled={!ready} onClick={() => setChapter(c.number)}>
                  {tr(lang, "ฝึกตอบ", "Practice", "练习")} ↗
                </button>
                <Link href={`/section/?n=${c.start}`}>
                  {tr(lang, "อ่าน", "Read", "阅读")}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      <div className="note" style={{ margin: "24px 0" }}>
        <strong>
          {tr(
            lang,
            "ต้องการตัวช่วยจำและอัลกอริทึมการคิด?",
            "Need memory aids and algorithmic formulas?",
            "需要助记口诀与逻辑判定公式？",
          )}
        </strong>
        <p>
          {tr(
            lang,
            "เรียนรู้ผ่านแผนภาพปิรามิดลำดับศักดิ์กฎหมาย, ขั้นตอน 3 วาระแก้ รธน., ตราชั่งความได้สัดส่วน ม.26 และตัวเลขสำคัญใน รธน.",
            "Explore legal hierarchy pyramids, 3-reading amendment flows, proportionality scales, and vital numbers.",
            "探索法律位阶金字塔、修宪三读流程、比例原则天平与高频关键数字速查表。",
          )}
        </p>
        <Link href="/cheatsheet/">
          {tr(lang, "เปิดหน้าสรุปสูตร & แผนภาพ", "Open Cheat Sheets & Diagrams", "打开速查表与图解")} ↗
        </Link>
      </div>
      <InstitutionMap />
      <div className="note">
        <strong>
          {tr(
            lang,
            "ผ่านเกณฑ์ ≠ จำได้ตลอดไป",
            "Mastery still needs review",
            "掌握后也需要复习",
          )}
        </strong>
        <p>
          {tr(
            lang,
            "ตอบถูกอย่างน้อย 80% ของข้อฝึกในหมวดนั้นเพื่อผ่านเกณฑ์ ทุกหมวดเปิดให้อ่านได้เสมอ ข้อที่พลาดจะกลับมาให้ลองใหม่",
            "Answer at least 80% of the chapter’s distinct questions correctly. Every chapter stays open. Missed questions return for another try.",
            "答对本章至少80%的不同题目即可达标。所有章节始终开放，错题会再次出现。",
          )}
        </p>
      </div>
    </>
  );
}
