"use client";
import { ReflectionSummary } from "./ReflectionSummary";
import { useState } from "react";
import Link from "next/link";
import { chapters, readingText, sections } from "@/lib/corpus";
import { anchor } from "@/lib/marks";
import { useStudy } from "./Provider";
import { tr, sectionLabel } from "@/lib/i18n";

const where = (n: number) => `/read/?c=${sections[n - 1].chapter}#s-${n}`;

// Everything the learner marked, in constitution order, so their own notebook becomes a study tool.
export function Notes() {
  const { lang, marks, annotations } = useStudy();
  const [chapter, setChapter] = useState(0);
  const inChapter = (n: number) => !chapter || sections[n - 1].chapter === chapter;
  const highlights = marks.marks
    .filter((m) => inChapter(m.section))
    .sort((a, b) => a.section - b.section || a.start - b.start);
  const bookmarks = marks.bookmarks.filter(inChapter);
  const sectionNotes = Object.values(annotations)
    .filter((a) => inChapter(a.section))
    .sort((a, b) => a.section - b.section);
  const empty = !highlights.length && !bookmarks.length && !sectionNotes.length;
  return (
    <>
      <span className="page-kicker mono">YOUR NOTES · 04</span>
      <h1>{tr(lang, "บันทึกของคุณ", "Your notes", "你的笔记")}</h1>
      <p>
        {tr(
          lang,
          `ไฮไลต์ ${marks.marks.length} จุด · คั่นหน้า ${marks.bookmarks.length} มาตรา · เก็บไว้ในเครื่องนี้ สำรองได้ที่หน้าอุปกรณ์`,
          `${marks.marks.length} highlights · ${marks.bookmarks.length} bookmarks · Kept on this device; back them up from Your device.`,
          `${marks.marks.length}处标记 · ${marks.bookmarks.length}条收藏 · 保存在本设备，可在“设备设置”中备份。`,
        )}
      </p>
      <ReflectionSummary/>
      <label className="micro" htmlFor="notes-chapter">
        {tr(lang, "กรองตามหมวด", "Filter by chapter", "按章节筛选")}
      </label>
      <select
        id="notes-chapter"
        className="notes-filter"
        value={chapter}
        onChange={(e) => setChapter(Number(e.target.value))}
      >
        <option value={0}>{tr(lang, "ทุกหมวด", "All chapters", "全部章节")}</option>
        {chapters.map((c) => (
          <option key={c.number} value={c.number}>
            {c.number === 17 ? "T" : c.number} · {c.title[lang]}
          </option>
        ))}
      </select>

      {empty && (
        <div className="note">
          <strong>{tr(lang, "ยังไม่มีบันทึกมาตรา", "No section notes yet", "尚无法条笔记")}</strong>
          <p>
            {tr(
              lang,
              "เปิดหน้าอ่านทั้งฉบับ ลากเลือกข้อความที่อยากจำ แล้วกดไฮไลต์",
              "Open the whole text, select words worth remembering and press Highlight.",
              "打开全文阅读，选中想记住的文字，然后点“标记”。",
            )}
          </p>
          <Link className="button primary" href="/read/">
            {tr(lang, "อ่านทั้งฉบับ", "Read the whole text", "阅读全文")} →
          </Link>
        </div>
      )}

      {bookmarks.length > 0 && (
        <section>
          <h2>{tr(lang, "คั่นหน้า", "Bookmarks", "收藏")}</h2>
          <div>
            {bookmarks.map((n) => (
              <Link className="citation" key={n} href={where(n)}>
                {sectionLabel(lang, n)} ↗
              </Link>
            ))}
          </div>
        </section>
      )}

      {highlights.length > 0 && (
        <section>
          <h2>{tr(lang, "ไฮไลต์และโน้ต", "Highlights and notes", "标记与笔记")}</h2>
          {highlights.map((m) => {
            const detached = anchor(readingText(m.section, m.lang), m) === null;
            return (
              <article className="reading-excerpt" key={m.id}>
                <Link href={where(m.section)}>
                  {sectionLabel(lang, m.section)} · {m.lang.toUpperCase()} ↗
                </Link>
                <blockquote lang={m.lang}>{m.quote}</blockquote>
                {m.note && <p className="notes-note">{m.note}</p>}
                {detached && (
                  <p className="micro">
                    {tr(
                      lang,
                      "ตัวบทช่วงนี้ถูกแก้ไขแล้ว ไฮไลต์จึงไม่ได้ปรากฏในหน้าอ่าน",
                      "The text here was corrected, so this highlight no longer appears on the page.",
                      "此处条文已更正，该标记不再显示在阅读页中。",
                    )}
                  </p>
                )}
              </article>
            );
          })}
        </section>
      )}

      {sectionNotes.length > 0 && (
        <section>
          <h2>{tr(lang, "โน้ตจากสมุดสองหน้า", "From the double-page notebook", "双页笔记中的记录")}</h2>
          {sectionNotes.map((a) => (
            <article className="reading-excerpt" key={a.section}>
              <Link href={where(a.section)}>{sectionLabel(lang, a.section)} ↗</Link>
              {a.note ? <p className="notes-note">{a.note}</p> : <p className="micro">{tr(lang, "ไฮไลต์ทั้งมาตรา", "Whole section highlighted", "整条已标记")}</p>}
            </article>
          ))}
        </section>
      )}
    </>
  );
}
