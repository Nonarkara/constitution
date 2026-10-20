"use client";
import Link from "next/link";
import Image from "next/image";
import type { BibleChapter, Block } from "@/lib/bible";
import { LawText, LawRef, Peek } from "./LawRef";
import { useStudy } from "./Provider";
import { tr, sectionLabel, type Lang } from "@/lib/i18n";
import { useState } from "react";
import { guidePaths } from "@/lib/guide-path";
import { StudyArt } from "./StudyArt";
import { PageAction } from "./PageAction";

type Pair = { th: string; en: string };
function GuideEntry({ slug }: { slug: string }) {
  const { lang } = useStudy();
  const path = guidePaths[slug];
  if (!path) return null;
  return <section className="source-card guide-entry" aria-label={tr(lang,"เริ่มจากใจความนี้","Start with this idea","从这个概念开始")}>
    <h2>{tr(lang,"หนึ่งเรื่องก่อน","One idea first","先懂一个概念")}</h2>
    <p>{path.idea[lang]}</p>
    <p className="micro">{tr(lang,"ลองตอบก่อนเปิดเหตุผล แล้วตรวจตัวบท","Try answering before opening the reasoning, then check the rule.","先回答，再展开理由，最后核对条文。")}</p>
    <details><summary>{path.question[lang]}</summary><p>{path.answer[lang]}</p></details>
    {path.steps.map((step, i) => <details key={i}>
      <summary>{step.question[lang]}</summary>
      <p>{step.answer[lang]}</p>
      {step.sections.length > 0 && <p>{step.sections.map(n => <Link className="citation" key={n} href={`/section/?n=${n}`}>{sectionLabel(lang, n)} →</Link>)}</p>}
    </details>)}
    <p>{path.sections.map(n => <Link className="citation" key={n} href={`/section/?n=${n}`}>{sectionLabel(lang,n)} →</Link>)}</p>
    <p>{path.chapters.map(c => <Link className="citation" key={c} href={`/practice/?check=${c}`}>{tr(lang,`ฝึก 5 ข้อ · หมวด ${c}`,`Try five · Chapter ${c}`,`练五题 · 第${c}章`)} →</Link>)}</p>
  </section>;
}
// The guide is written in Thai and English; Chinese readers get the English edition.
const bookLang = (lang: Lang): "th" | "en" => (lang === "th" ? "th" : "en");
const text = (p: Pair | undefined, lang: Lang) => (p ? p[bookLang(lang)] : "");

const LABELS: Record<string, Record<"th" | "en", string>> = {
  logic: { th: "ทำไมจึงเป็นเช่นนี้", en: "WHY IT WORKS" },
  case: { th: "คดีและเหตุการณ์จริง", en: "REAL CASE" },
  mnemonic: { th: "ทางลัดช่วยจำ", en: "MEMORY AID" },
  critique: { th: "ข้อวิจารณ์", en: "CRITIQUE" },
  numbers: { th: "ตัวเลขที่ต้องรู้", en: "NUMBERS" },
  check: { th: "ทดสอบตัวเอง", en: "CHECK YOURSELF" },
  story: { th: "เรื่องเล่า", en: "STORY" },
};

/** Paragraphs separated by blank lines; lines starting "- " become a list. */
function Prose({ value, lang }: { value: string; lang: "th" | "en" }) {
  return (
    <>
      {value.split(/\n{2,}/).map((para, i) => {
        const lines = para.split("\n");
        if (lines.every((l) => l.startsWith("- ")))
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>
                  <LawText text={l.slice(2)} lang={lang} />
                </li>
              ))}
            </ul>
          );
        return (
          <p key={i}>
            <LawText text={para} lang={lang} />
          </p>
        );
      })}
    </>
  );
}

function SectionLinks({ sections, lang }: { sections?: number[]; lang: "th" | "en" }) {
  const [peek, setPeek] = useState<number | null>(null);
  if (!sections?.length) return null;
  return (
    <span className="micro">
      {sections.map((n, i) => (
        <span key={n}>
          {i > 0 && " · "}
          <LawRef n={n} label={sectionLabel(lang, n)} lang={lang} onOpen={() => setPeek(n)} />
        </span>
      ))}
      {peek && <Peek n={peek} lang={lang} onClose={() => setPeek(null)} />}
    </span>
  );
}

function BlockView({ block, lang, index }: { block: Block; lang: Lang; index: number }) {
  const l = bookLang(lang);
  const id = `b${index}`;
  if (block.kind === "image")
    return (
      <figure className="bible-figure">
        <Image src={`/bible/${block.file}`} alt={text(block.caption, lang)} width={1200} height={800} sizes="(max-width: 720px) 100vw, 760px" style={{ width: "100%", height: "auto" }} />
        <figcaption className="micro">
          {text(block.caption, lang)} · {block.credit} ·{" "}
          <a href={block.source} rel="noopener noreferrer" target="_blank">
            {block.license}
          </a>
        </figcaption>
      </figure>
    );
  const label = LABELS[block.kind]?.[l];
  const head = (
    <>
      {label && (
        <span className="mono bible-label">
          {label}
          {block.kind === "case" && block.year ? ` · ${block.year}` : ""}
        </span>
      )}
      {block.title && <h2 id={id}>{text(block.title, lang)}</h2>}
    </>
  );
  if (block.kind === "numbers")
    return (
      <section className="bible-block bible-numbers">
        {head}
        <table className="exam-table">
          <tbody>
            {block.rows.map((r, i) => (
              <tr key={i}>
                <td>
                  {r[l]} <SectionLinks sections={r.sections} lang={l} />
                </td>
                <td className="mono">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    );
  if (block.kind === "check")
    return (
      <section className="bible-block bible-check">
        {head}
        {block.items.map((item, i) => (
          <details key={i}>
            <summary>
              <LawText text={text(item.q, lang)} lang={l} />
            </summary>
            <p>
              <LawText text={text(item.a, lang)} lang={l} />
            </p>
            <SectionLinks sections={item.sections} lang={l} />
          </details>
        ))}
      </section>
    );
  return (
    <section className={`bible-block bible-${block.kind}`}>
      {head}
      <Prose value={text(block.body, lang)} lang={l} />
      {block.kind === "case" && block.ref && <p className="micro">{block.ref}</p>}
      {block.kind === "critique" && block.by && <p className="micro">— {block.by}</p>}
    </section>
  );
}

type Link_ = { slug: string; title: Pair } | null;
export function BibleChapterView({ chapter }: { chapter: BibleChapter; prev: Link_; next: Link_ }) {
  const { lang } = useStudy();
  const l = bookLang(lang);
  const titled = chapter.blocks.map((b, i) => ({ b, i })).filter(({ b }) => "title" in b && b.title);
  return (
    <article className="bible">
      <div className="intro-copy">
        <StudyArt scene="bible" />
        <div className="intro-text">
          <h1>{lang === "zh" ? guidePaths[chapter.slug]?.title.zh ?? text(chapter.title, lang) : text(chapter.title, lang)}</h1>
        </div>
      </div>
      <GuideEntry slug={chapter.slug} />
      {lang === "zh" && <p className="micro">上方三题为中文短课，条文与练习也提供中文。下方完整长篇指南目前只有泰文与英文，不是完整中文译本。</p>}
      <details className="guide-depth" open={lang !== "zh"} key={lang}>
      <summary>{tr(lang,"อ่านคู่มือเต็มและกรณีศึกษา","Read the full guide and case studies","阅读完整英文指南与案例")}</summary>
      <p className="bible-lede" lang={l}>
        <LawText text={text(chapter.lede, lang)} lang={l} />
      </p>
      {titled.length > 4 && (
        <details className="bible-toc">
          <summary>{tr(lang, "ในบทนี้", "In this chapter", "本章内容")}</summary>
          <ol>
            {titled.map(({ b, i }) => (
              <li key={i}>
                <a href={`#b${i}`}>{text((b as { title: Pair }).title, lang)}</a>
              </li>
            ))}
          </ol>
        </details>
      )}
      {chapter.blocks.map((b, i) => (
        <BlockView key={i} block={b} lang={lang} index={i} />
      ))}
      {chapter.sources?.length ? (
        <section className="bible-block">
          <span className="mono bible-label">{tr(lang, "แหล่งอ้างอิง", "SOURCES", "资料来源")}</span>
          <ul className="micro">
            {chapter.sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      ) : null}
      </details>
      <p className="micro">
        {tr(
          lang,
          "คู่มือนี้เป็นสื่อการเรียน ไม่ใช่คำแนะนำทางกฎหมาย ตัวบทภาษาไทยเป็นหลัก ข้อวิจารณ์เป็นความเห็นของผู้ที่ระบุชื่อ ไม่ใช่ข้อสรุปของแอป",
          "A study guide, not legal advice. The Thai text is the law. Critiques belong to the people named, not to this app.",
          "本指南用于学习，不提供法律意见。以泰文法律原文为准。批评属于署名者的观点，不代表本应用的结论。",
        )}
      </p>
    </article>
  );
}

export function BibleIndex({ chapters }: { chapters: { slug: string; order: number; title: Pair; lede: Pair }[] }) {
  const { lang } = useStudy();
  // The method chapter sits outside the 00–11 reading order, so the way in is
  // the lowest reading-order chapter, not simply the first row.
  const first =
    [...chapters].sort((a, b) => a.order - b.order).find((c) => c.order < 90) ??
    chapters[0];
  return (
    <>
      <div className="intro-copy">
        <StudyArt scene="bibleGuide" />
        <div className="intro-text">
          <h1>{tr(lang, "คัมภีร์รัฐธรรมนูญ", "The study guide", "学习指南")}</h1>
          <p>
            {tr(
              lang,
              "อ่านรัฐธรรมนูญเป็นระบบ ไม่ใช่รายการให้ท่องจำ ทุกกฎมีเหตุผล ทุกตัวเลขมีเรื่องเล่า แตะเลขมาตราที่ไหนก็ได้เพื่อเปิดตัวบท",
              "Read the constitution as a system, not a list to memorise. Every rule has a reason and every number has a story. Point at any section number to open the law.",
              "把宪法当作一个系统来读，而不是背诵清单。本指南提供泰文与英文版。",
          )}
          </p>
        </div>
      </div>
      <p className="notice">{tr(lang,"เลือกบทเดียว อ่านใจความ ลองสามข้อ แล้วไปฝึก ไม่ต้องอ่าน 13 บทให้จบก่อน คู่มือเต็มมีไทยและอังกฤษ ส่วนบทเรียนสั้นและแบบฝึกมีสามภาษา","Choose one chapter: read the idea, try three checks, then practise. You need not finish all 13 first. The full guide is Thai/English; the short lesson and exercises are trilingual.","先选一章：读概念、试三题、再练习，不必先读完13章。完整长篇指南为泰文与英文；短课和练习提供三种语言。")}</p>
      {/* One thing to do. Thirteen equal chapter rows used to be the only way
          in, so the page described itself instead of starting anything. */}
      <PageAction
        href={`/bible/${first.slug}/`}
        label={text(first.title, lang)}
        reason={tr(
          lang,
          "อ่านใจความบทเดียว แล้วลองสามข้อ ค่อยไปบทถัดไปเมื่อไหร่ที่พร้อม",
          "Read one chapter's idea, try three checks, and move on when you are ready.",
          "先读一章的要点，试三题，准备好再读下一章。",
        )}
        kicker={tr(lang, "เริ่มที่นี่", "Start here", "从这里开始")}
      />
      <h2 className="hub-others-title">
        {tr(lang, "หรือเลือกบทอื่น", "Or pick another chapter", "或选择其他章节")}
      </h2>
      <div className="chapter-route guide-route">
        {chapters.map((c) => (
          <article className="chapter-row" key={c.slug}>
            {/* The method chapter sits outside the 00–11 reading order, so it carries no number. */}
            <div className="route-number mono">{c.order < 90 ? String(c.order).padStart(2, "0") : ""}</div>
            <div className="chapter-info">
              <h3>
                <Link href={`/bible/${c.slug}/`}>{lang === "zh" ? guidePaths[c.slug]?.title.zh ?? text(c.title, lang) : text(c.title, lang)}</Link>
              </h3>
              <span className="micro">{guidePaths[c.slug]?.idea[lang] ?? text(c.lede, lang).slice(0, 140)}</span>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
