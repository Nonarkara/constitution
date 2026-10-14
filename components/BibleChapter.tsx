"use client";
import Link from "next/link";
import Image from "next/image";
import type { BibleChapter, Block } from "@/lib/bible";
import { LawText, LawRef, Peek } from "./LawRef";
import { useStudy } from "./Provider";
import { tr, sectionLabel, type Lang } from "@/lib/i18n";
import { useState } from "react";

type Pair = { th: string; en: string };
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
      <h1>{text(chapter.title, lang)}</h1>
      <p className="bible-lede">
        <LawText text={text(chapter.lede, lang)} lang={l} />
      </p>
      {lang === "zh" && <p className="micro">本指南提供泰文与英文版，此处显示英文版。</p>}
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
          <span className="mono bible-label">{tr(lang, "แหล่งอ้างอิง", "SOURCES", "SOURCES")}</span>
          <ul className="micro">
            {chapter.sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <p className="micro">
        {tr(
          lang,
          "คู่มือนี้เป็นสื่อการเรียน ไม่ใช่คำแนะนำทางกฎหมาย ตัวบทภาษาไทยเป็นหลัก ข้อวิจารณ์เป็นความเห็นของผู้ที่ระบุชื่อ ไม่ใช่ข้อสรุปของแอป",
          "A study guide, not legal advice. The Thai text is the law. Critiques belong to the people named, not to this app.",
          "A study guide, not legal advice. The Thai text is the law. Critiques belong to the people named, not to this app.",
        )}
      </p>
      <p className="page-back">
        <Link href="/bible/">{tr(lang, "← กลับไปเรียน", "← Back to Learn", "← 返回学习")}</Link>
      </p>
    </article>
  );
}

export function BibleIndex({ chapters }: { chapters: { slug: string; order: number; title: Pair; lede: Pair }[] }) {
  const { lang } = useStudy();
  return (
    <>
      <h1>{tr(lang, "คัมภีร์รัฐธรรมนูญ", "The study guide", "学习指南")}</h1>
      <p>
        {tr(
          lang,
          "อ่านรัฐธรรมนูญเป็นระบบ ไม่ใช่รายการให้ท่องจำ ทุกกฎมีเหตุผล ทุกตัวเลขมีเรื่องเล่า แตะเลขมาตราที่ไหนก็ได้เพื่อเปิดตัวบท",
          "Read the constitution as a system, not a list to memorise. Every rule has a reason and every number has a story. Point at any section number to open the law.",
          "把宪法当作一个系统来读，而不是背诵清单。本指南提供泰文与英文版。",
        )}
      </p>
      <div className="chapter-route">
        {chapters.map((c) => (
          <article className="chapter-row" key={c.slug}>
            <div className="route-number mono">{String(c.order).padStart(2, "0")}</div>
            <div className="chapter-info">
              <h3>{text(c.title, lang)}</h3>
              <span className="micro">{text(c.lede, lang).slice(0, 140)}…</span>
            </div>
            <div className="chapter-actions">
              <Link href={`/bible/${c.slug}/`}>{tr(lang, "อ่าน", "Read", "阅读")} →</Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
