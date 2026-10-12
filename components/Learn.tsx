"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import Link from "next/link";
import { chapters, questionIndex as questions } from "@/lib/outline";
import { chapterMastery } from "@/lib/learning";
import dynamic from "next/dynamic";
const Quiz = dynamic(() => import("./Quiz").then((m) => m.Quiz));
import { useStudy } from "./Provider";
import { tr, labels, sectionLabel } from "@/lib/i18n";
import { sectionSignals, stateOf, type Signals } from "@/lib/knowledge";
import { cases, clusters } from "@/lib/dots";

// One small station per section, so each chapter row shows what is read, marked and known.
function Stations({ start, end, signals }: { start: number; end: number; signals: Signals[] }) {
  return (
    <span className="stations" aria-hidden="true">
      {signals.slice(start - 1, end).map((s) => (
        <i key={s.n} className={`dot ${s.marked ? "mine" : stateOf(s)}`} />
      ))}
    </span>
  );
}
export function Learn() {
  const { lang, progress, ready, marks, annotations, read } = useStudy();
  const signals = useMemo(
    () => sectionSignals({ progress, marks, annotations, read, questions, now: Date.now() }),
    [progress, marks, annotations, read],
  );
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
      {/* One dominant element: the drawing and the next step read as a single block. */}
      <div className="civic-shortcuts"><Link href="/civic/">{tr(lang,"ตรวจคำสัญญา","Check the promise","核查承诺")} →</Link><Link href="/amend/">{tr(lang, "ถ้าเราอยากแก้รัฐธรรมนูญ", "If we want to amend it", "如果我们想修宪")} →</Link><Link href="/news/">{tr(lang, "ข่าวสั้น", "Headlines", "新闻标题")} →</Link></div>
      <section className="hero">
        <figure className="hero-art" aria-hidden="true">
          <Image src="/illustrations/reading.webp" alt="" width={720} height={720} priority sizes="(max-width: 720px) 100vw, 46vw" />
        </figure>
        <div className="hero-copy">
          <h1>
            {tr(lang, "ค่อย ๆ อ่าน\nค่อย ๆ เข้าใจ", "One section.\nOne small step.", "一条一条读，\n一点一点懂。")}
          </h1>
          <p>
            {tr(
              lang,
              "รัฐธรรมนูญไม่ต้องจำทั้งหมดในวันเดียว เริ่มจากเรื่องใกล้ตัว แล้วลองตอบด้วยความเข้าใจ",
              "You don’t have to learn it all today. Start with one idea, then put it into practice.",
              "不必一天记住全部。先读懂一个概念，再用练习检验理解。",
            )}
          </p>
          <button className="primary hero-cta" disabled={!ready} onClick={() => setChapter(next.number)}>
            <span>
              <span className="hero-cta-label">
                {tr(lang, "บทเรียนต่อไป", "Next lesson", "下一课")} ·{" "}
                {next.number === 17 ? tr(lang, "บทเฉพาะกาล", "Transitory", "过渡条款") : `${labels.chapter[lang]} ${next.number}`}
              </span>
              <span className="hero-cta-title">{next.title[lang]}</span>
            </span>
            <span aria-hidden="true">→</span>
          </button>
          <p className="micro">
            {tr(
              lang,
              "โจทย์ชีวิตจริง 1 ข้อ • อ่านตัวบท • ฝึกตอบ 10 ข้อ • ไม่จับเวลา",
              "One real-life puzzle · the law · ten questions · no timer",
              "一道生活题 · 读法条 · 十道练习 · 不限时",
            )}
          </p>
        </div>
      </section>
      <WhereYouAre signals={signals} chapter={next.number} />
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
                <Stations start={c.start} end={c.end} signals={signals} />
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
                  {tr(lang, "ฝึกตอบ", "Practice", "练习")} →
                </button>
                <Link href={`/section/?n=${c.start}`}>
                  {tr(lang, "อ่าน", "Read", "阅读")}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
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

function WhereYouAre({ signals, chapter }: { signals: Signals[]; chapter: number }) {
  const { lang, read } = useStudy();
  const last = Object.entries(read).sort((a, b) => b[1] - a[1])[0];
  const lastN = last ? Number(last[0]) : 0;
  const mine = signals.filter((s) => s.marked || s.answered > 0).map((s) => s.n);
  const joined = clusters(mine).reduce((sum, g) => sum + g.length, 0);
  const chapterOf = (n: number) => chapters.find((h) => n >= h.start && n <= h.end)!.number;
  // A puzzle from the chapter she is on; every chapter has at least one.
  const puzzle = cases.find((c) => c.sections.some((n) => chapterOf(n) === chapter)) ?? cases[0];
  return (
    <section className="where" aria-label={tr(lang, "คุณอยู่ตรงไหน", "Where you are", "你现在的位置")}>
      <Link href="/notes/" className="where-item">
        <span className="micro">{tr(lang, "จุดของคุณ", "Your dots", "你的点")}</span>
        <strong>
          {mine.length
            ? tr(lang, `${mine.length} จุด · ${joined} จุดต่อกันแล้ว`, `${mine.length} dots · ${joined} already connected`, `${mine.length} 个点 · ${joined} 个已相连`)
            : tr(lang, "ยังไม่มีจุด ไฮไลต์สักประโยคเพื่อเริ่ม", "None yet. Highlight one sentence to start", "还没有。标记一句话开始")}
        </strong>
        <span className="micro">{tr(lang, "ดูว่าเชื่อมกันอย่างไร", "See how they connect", "看看如何相连")} →</span>
      </Link>
      <Link href={lastN ? `/read/?c=${chapterOf(Math.min(279, lastN + 1))}#s-${Math.min(279, lastN + 1)}` : "/read/"} className="where-item">
        <span className="micro">{tr(lang, "อ่านต่อ", "Keep reading", "继续阅读")}</span>
        <strong>
          {lastN
            ? tr(lang, `ล่าสุด ${sectionLabel(lang, lastN)} · ต่อที่ ${sectionLabel(lang, Math.min(279, lastN + 1))}`, `Last ${sectionLabel(lang, lastN)} · next ${sectionLabel(lang, Math.min(279, lastN + 1))}`, `上次${sectionLabel(lang, lastN)} · 接着读${sectionLabel(lang, Math.min(279, lastN + 1))}`)
            : tr(lang, "เริ่มที่มาตรา 1", "Start at section 1", "从第1条开始")}
        </strong>
        <span className="micro">{tr(lang, "อ่านทั้งฉบับ", "The whole text", "阅读全文")} →</span>
      </Link>
      {puzzle && (
        <Link href={`/rights/?case=${puzzle.id}`} className="where-item">
          <span className="micro">{tr(lang, "โจทย์จากชีวิตจริง", "A real-life puzzle", "生活中的题")}</span>
          <strong>{puzzle.prompt[lang]}</strong>
          <span className="micro">{tr(lang, "ลองเดาก่อน", "Guess first", "先猜猜看")} →</span>
        </Link>
      )}
    </section>
  );
}
