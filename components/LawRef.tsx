"use client";
import { useState } from "react";
import Link from "next/link";
import { readingText, sections } from "@/lib/corpus";
import { readingTokens } from "@/lib/reading";
import { tr, sectionLabel, type Lang } from "@/lib/i18n";

const excerpt = (n: number, lang: Lang) => {
  const text = readingText(n, lang).replace(/^第\d+条\s*/, "");
  return text.length > 280 ? text.slice(0, 280) + "…" : text;
};

/**
 * A section number inside prose. Hovering (or keyboard focus) shows the section;
 * a tap calls onOpen, so pages decide whether that is a peek sheet or navigation.
 */
export function LawRef({ n, label, lang, onOpen }: { n: number; label: string; lang: Lang; onOpen: () => void }) {
  return (
    <span className="law-ref">
      <button
        className="inline-ref"
        aria-describedby={`ref-${n}`}
        onClick={(e) => {
          e.stopPropagation();
          if (!document.getSelection()?.isCollapsed) return;
          onOpen();
        }}
      >
        {label}
      </button>
      <span className="ref-card" role="tooltip" id={`ref-${n}`} lang={lang}>
        <strong>{sectionLabel(lang, n)}</strong> {excerpt(n, lang)}
      </span>
    </span>
  );
}

/** Explanatory prose whose มาตรา / Section / 第N条 references open the law they cite. */
export function LawText({ text, lang }: { text: string; lang: Lang }) {
  const [open, setOpen] = useState<number | null>(null);
  const tokens = readingTokens(text, lang, 0, []);
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const t of tokens) {
    if (t.kind !== "xref") continue;
    if (t.start > cursor) parts.push(text.slice(cursor, t.start));
    parts.push(<LawRef key={t.start} n={t.section} label={text.slice(t.start, t.end)} lang={lang} onOpen={() => setOpen(t.section)} />);
    cursor = t.end;
  }
  parts.push(text.slice(cursor));
  return (
    <>
      {parts}
      {open && <Peek n={open} lang={lang} onClose={() => setOpen(null)} />}
    </>
  );
}

export function Peek({ n, lang, onClose }: { n: number; lang: Lang; onClose: () => void }) {
  return (
    <span className="sheet" role="dialog" aria-label={sectionLabel(lang, n)} style={{ display: "block" }}>
      <span className="mono">{tr(lang, "ดูมาตรา", "PEEK", "查看条文")}</span>
      <strong className="sheet-title">{sectionLabel(lang, n)}</strong>
      <span className="sheet-text" lang={lang} style={{ display: "block" }}>
        {readingText(n, lang).replace(/^第\d+条\s*/, "")}
      </span>
      <span className="sheet-actions">
        <Link className="button primary" href={`/read/?c=${sections[n - 1].chapter}#s-${n}`}>
          {tr(lang, "อ่านในหมวด", "Read in its chapter", "在章节中阅读")} →
        </Link>
        <button onClick={onClose}>{tr(lang, "ปิด", "Close", "关闭")}</button>
      </span>
    </span>
  );
}
