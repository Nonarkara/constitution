"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { chapters, readingText as fullText, sections } from "@/lib/corpus";
import glossaryData from "@/data/glossary.json";
import { addMark, removeMark, segments, setNote, toggleBookmark, type Mark } from "@/lib/marks";
import { readingTokens, type Term, type Token } from "@/lib/reading";
import { useStudy } from "./Provider";
import { useReadOnScreen } from "./useReadOnScreen";
import { LawRef } from "./LawRef";
import { tr, labels, sectionLabel, type Lang } from "@/lib/i18n";

const glossary = glossaryData as Term[];
// The Chinese study text repeats its own "第N条" label; the section heading already shows it.
const readingText = (n: number, lang: Lang) => fullText(n, lang).replace(/^第\d+条\s*/, "");
type Pending = { section: number; start: number; end: number };
type Sheet =
  | { kind: "mark"; id: string }
  | { kind: "xref"; section: number }
  | { kind: "term"; id: string }
  | null;

/** Character offset of a DOM point inside a paragraph whose text equals the legal text. */
function offsetIn(root: Node, node: Node, offset: number) {
  const range = document.createRange();
  range.selectNodeContents(root);
  range.setEnd(node, offset);
  return range.toString().length;
}

const chapterLabel = (lang: Lang, n: number) =>
  n === 17
    ? tr(lang, "บทเฉพาะกาล", "Transitory provisions", "过渡条款")
    : lang === "zh"
      ? `第${n}章`
      : `${labels.chapter[lang]} ${n}`;

// The whole constitution, one chapter per page, in the reader's language.
// Select words to highlight them; tap a highlight to write a note.
export function ReadAll() {
  const { lang, marks, saveMarks, ready } = useStudy();
  const params = useSearchParams();
  const router = useRouter();
  const chapterNumber = Math.min(17, Math.max(1, Number(params.get("c")) || 1));
  const chapter = chapters.find((c) => c.number === chapterNumber)!;
  const list = sections.filter((s) => s.chapter === chapterNumber);
  const [pending, setPending] = useState<Pending | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [draft, setDraft] = useState("");
  const sheetRef = useRef<HTMLDivElement>(null);
  useReadOnScreen(`${chapterNumber}-${lang}`);

  // Track a selection that sits inside one section's text.
  useEffect(() => {
    const onChange = () => {
      const sel = document.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) return setPending(null);
      const range = sel.getRangeAt(0);
      const host = (n: Node) =>
        (n.nodeType === 1 ? (n as Element) : n.parentElement)?.closest<HTMLElement>("[data-text]");
      const p = host(range.startContainer);
      if (!p || p !== host(range.endContainer)) return setPending(null);
      let start = offsetIn(p, range.startContainer, range.startOffset),
        end = offsetIn(p, range.endContainer, range.endOffset);
      const text = p.textContent ?? "";
      while (start < end && /\s/.test(text[start])) start++;
      while (end > start && /\s/.test(text[end - 1])) end--;
      setPending(end > start ? { section: Number(p.dataset.text), start, end } : null);
    };
    document.addEventListener("selectionchange", onChange);
    return () => document.removeEventListener("selectionchange", onChange);
  }, []);

  useEffect(() => {
    if (!sheet) return;
    sheetRef.current?.focus();
    const close = (e: KeyboardEvent) => e.key === "Escape" && setSheet(null);
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [sheet]);

  // Arriving from a link like /read/?c=3#s-36 lands on that section once text exists.
  useEffect(() => {
    if (!ready || !location.hash) return;
    document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }, [ready, chapterNumber]);

  const highlight = (withNote: boolean) => {
    if (!pending) return;
    const text = readingText(pending.section, lang);
    const id = `${pending.section}-${lang}-${Date.now().toString(36)}`;
    const next = addMark(marks, text, { id, section: pending.section, lang, start: pending.start, end: pending.end, createdAt: Date.now() });
    saveMarks(next);
    document.getSelection()?.removeAllRanges();
    setPending(null);
    if (withNote) {
      // An overlapping highlight is merged into this one and keeps its notes.
      setDraft(next.marks.find((m) => m.id === id)?.note ?? "");
      setSheet({ kind: "mark", id });
    }
  };

  const openMark = useCallback(
    (m: Mark) => {
      if (!document.getSelection()?.isCollapsed) return;
      setDraft(m.note ?? "");
      setSheet({ kind: "mark", id: m.id });
    },
    [],
  );

  const ownMarks = (n: number) => marks.marks.filter((m) => m.section === n && m.lang === lang);
  const activeMark = sheet?.kind === "mark" ? marks.marks.find((m) => m.id === sheet.id) : undefined;

  const go = (n: number) => {
    setSheet(null);
    router.push(`/read/?c=${n}`);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <span className="page-kicker">{chapterLabel(lang, chapterNumber)}</span>
      <div className="read-head">
        <h1>{chapter.title[lang]}</h1>
        <label className="micro" htmlFor="read-chapter">
          {tr(lang, "เลือกหมวด", "Chapter", "选择章节")}
        </label>
        <select id="read-chapter" value={chapterNumber} onChange={(e) => go(Number(e.target.value))}>
          {chapters.map((c) => (
            <option key={c.number} value={c.number}>
              {chapterLabel(lang, c.number)} · {c.title[lang]}
            </option>
          ))}
        </select>
        <p className="micro">
          {sectionLabel(lang, chapter.start === chapter.end ? chapter.start : `${chapter.start}–${chapter.end}`)} ·{" "}
          {tr(
            lang,
            "ลากเลือกข้อความเพื่อไฮไลต์ แตะไฮไลต์เพื่อจดโน้ต แตะเลขมาตราเพื่อเปิดดู",
            "Select words to highlight. Tap a highlight to add a note. Tap a section number to peek.",
            "选中文字即可标记，点标记写笔记，点条文编号可快速查看。",
          )}
        </p>
        {lang !== "th" && (
          <p className="micro">
            {tr(lang, "", "Study translation. The Thai text is the law.", "中文为学习译文，以泰文原文为准。")}
          </p>
        )}
      </div>

      {list.map((s) => {
        const text = readingText(s.number, lang);
        const tokens = readingTokens(text, lang, s.number, glossary);
        const bookmarked = marks.bookmarks.includes(s.number);
        return (
          <article className="read-section" id={`s-${s.number}`} key={s.number}>
            <div className="read-section-head">
              <h2>{sectionLabel(lang, s.number)}</h2>
              <button
                aria-pressed={bookmarked}
                onClick={() => saveMarks(toggleBookmark(marks, s.number))}
              >
                {bookmarked ? tr(lang, "คั่นแล้ว", "Bookmarked", "已收藏") : tr(lang, "คั่นหน้า", "Bookmark", "收藏")}
              </button>
              <Link href={`/section/?n=${s.number}`}>
                {tr(lang, "ฟังและเทียบภาษา", "Listen & compare", "朗读与对照")} →
              </Link>
            </div>
            <p className="read-text" lang={lang} data-text={s.number} data-read={s.number}>
              {segments(text, ownMarks(s.number)).map((seg) => {
                const inner = renderTokens(seg.text, seg.start, tokens, setSheet, lang);
                return seg.mark ? (
                  <mark
                    key={seg.start}
                    className={"hl" + (seg.mark.note ? " has-note" : "")}
                    onClick={() => openMark(seg.mark!)}
                  >
                    {inner}
                  </mark>
                ) : (
                  <span key={seg.start}>{inner}</span>
                );
              })}
            </p>
          </article>
        );
      })}

      <div className="reader-navigation">
        <button disabled={chapterNumber === 1} onClick={() => go(chapterNumber - 1)}>
          ← {tr(lang, "หมวดก่อน", "Previous chapter", "上一章")}
        </button>
        <Link href="/notes/">{tr(lang, "ดูว่าจุดของคุณเชื่อมกันอย่างไร", "See how your dots connect", "看看你的点如何相连")} →</Link>
        <button disabled={chapterNumber === 17} onClick={() => go(chapterNumber + 1)}>
          {chapters.find((item) => item.number === chapterNumber + 1)?.title[lang] ?? chapter.title[lang]} →
        </button>
      </div>

      {pending && !sheet && (
        <div className="read-toolbar" role="toolbar" aria-label={tr(lang, "ไฮไลต์", "Highlight", "标记")}>
          <button className="primary" onMouseDown={(e) => e.preventDefault()} onClick={() => highlight(false)}>
            {tr(lang, "ไฮไลต์", "Highlight", "标记")}
          </button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => highlight(true)}>
            {tr(lang, "ไฮไลต์ + โน้ต", "Highlight + note", "标记并写笔记")}
          </button>
        </div>
      )}

      {sheet && (
        <div className="sheet" role="dialog" aria-modal="false" tabIndex={-1} ref={sheetRef}>
          {sheet.kind === "mark" && activeMark && (
            <>
              <span className="mono">
                {sectionLabel(lang, activeMark.section)} · {tr(lang, "ไฮไลต์", "HIGHLIGHT", "标记")}
              </span>
              <blockquote lang={activeMark.lang}>{activeMark.quote}</blockquote>
              <label className="micro" htmlFor="mark-note">
                {tr(lang, "โน้ตของคุณ", "Your note", "你的笔记")}
              </label>
              <textarea id="mark-note" rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} />
              <div className="sheet-actions">
                <button
                  className="primary"
                  onClick={() => {
                    saveMarks(setNote(marks, activeMark.id, draft));
                    setSheet(null);
                  }}
                >
                  {tr(lang, "บันทึก", "Save", "保存")}
                </button>
                <button
                  onClick={() => {
                    saveMarks(removeMark(marks, activeMark.id));
                    setSheet(null);
                  }}
                >
                  {tr(lang, "ลบไฮไลต์", "Remove highlight", "删除标记")}
                </button>
                <button onClick={() => setSheet(null)}>{tr(lang, "ปิด", "Close", "关闭")}</button>
              </div>
            </>
          )}
          {sheet.kind === "xref" && (
            <>
              <span className="mono">{tr(lang, "ดูมาตรา", "PEEK", "查看条文")}</span>
              <h2>{sectionLabel(lang, sheet.section)}</h2>
              <p className="sheet-text" lang={lang}>
                {readingText(sheet.section, lang)}
              </p>
              <div className="sheet-actions">
                <button
                  className="primary"
                  onClick={() => {
                    const target = sections[sheet.section - 1];
                    setSheet(null);
                    router.push(`/read/?c=${target.chapter}#s-${target.number}`);
                    setTimeout(() => document.getElementById(`s-${target.number}`)?.scrollIntoView(), 50);
                  }}
                >
                  {tr(lang, "อ่านในหมวด", "Read in its chapter", "在章节中阅读")} →
                </button>
                <button onClick={() => setSheet(null)}>{tr(lang, "ปิด", "Close", "关闭")}</button>
              </div>
            </>
          )}
          {sheet.kind === "term" &&
            (() => {
              const t = glossary.find((g) => g.id === sheet.id);
              if (!t) return null;
              return (
                <>
                  <span className="mono">{tr(lang, "อภิธานศัพท์", "GLOSSARY", "术语")}</span>
                  <h2>{t.term[lang]}</h2>
                  {lang !== "th" && <p className="micro" lang="th">{t.term.th}</p>}
                  <p>{t.def[lang]}</p>
                  <p className="micro">
                    {t.sections.map((n) => (
                      <button key={n} className="inline-ref" onClick={() => setSheet({ kind: "xref", section: n })}>
                        {sectionLabel(lang, n)}
                      </button>
                    ))}
                  </p>
                  <div className="sheet-actions">
                    <button onClick={() => setSheet(null)}>{tr(lang, "ปิด", "Close", "关闭")}</button>
                  </div>
                </>
              );
            })()}
        </div>
      )}
    </>
  );
}

/** Render a run of text with the cross-references and terms that fall wholly inside it. */
function renderTokens(text: string, start: number, tokens: Token[], open: (s: Sheet) => void, lang: Lang) {
  const end = start + text.length;
  const parts: React.ReactNode[] = [];
  let cursor = start;
  for (const t of tokens) {
    if (t.start < cursor || t.end > end) continue;
    if (t.start > cursor) parts.push(text.slice(cursor - start, t.start - start));
    const label = text.slice(t.start - start, t.end - start);
    if (t.kind === "xref") {
      parts.push(<LawRef key={t.start} n={t.section} label={label} lang={lang} onOpen={() => open({ kind: "xref", section: t.section })} />);
      cursor = t.end;
      continue;
    }
    parts.push(
      <button
        key={t.start}
        className="inline-term"
        onClick={(e) => {
          e.stopPropagation();
          if (!document.getSelection()?.isCollapsed) return;
          open({ kind: "term", id: t.id });
        }}
      >
        {label}
      </button>,
    );
    cursor = t.end;
  }
  if (cursor < end) parts.push(text.slice(cursor - start));
  return parts;
}
