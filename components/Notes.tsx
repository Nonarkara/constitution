"use client";
import { ReflectionSummary } from "./ReflectionSummary";
import { useEffect, useMemo, useRef, useState } from "react";
import { DigPanel, DotsMap, Thread } from "./DotsMap";
import { questionIndex } from "@/lib/outline";
import { knowSummary, sectionSignals, stateOf } from "@/lib/knowledge";
import { mostCited, nextDots } from "@/lib/dots";
import Link from "next/link";
import { chapters, readingText, sections } from "@/lib/corpus";
import { anchor } from "@/lib/marks";
import { useStudy } from "./Provider";
import { tr, sectionLabel } from "@/lib/i18n";

const where = (n: number) => `/read/?c=${sections[n - 1].chapter}#s-${n}`;

// Everything the learner marked, in constitution order, so their own notebook becomes a study tool.
export function Notes() {
  const { lang, marks, annotations, progress, read, ready } = useStudy();
  const [chapter, setChapter] = useState(0);
  const signals = useMemo(
    () => sectionSignals({ progress, marks, annotations, read, questions: questionIndex, now: Date.now() }),
    [progress, marks, annotations, read],
  );
  // Her dots are what she chose to mark or practise; a passing read lights the map but not the thread.
  const mine = useMemo(() => signals.filter((s) => s.marked || s.answered > 0).map((s) => s.n), [signals]);
  const met = useMemo(() => signals.filter((s) => stateOf(s) !== "unseen").map((s) => s.n), [signals]);
  const next = useMemo(() => nextDots(mine, met), [mine, met]);
  const sum = knowSummary(signals);
  const [selected, setSelected] = useState(0);
  const dig = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ready) return; // choose only once her own marks have loaded
    const fromLink = Number(location.hash.match(/^#dot-(\d+)$/)?.[1]);
    const latest = [...marks.marks].sort((a, b) => b.createdAt - a.createdAt)[0]?.section;
    setSelected((current) => current || (fromLink >= 1 && fromLink <= 279 ? fromLink : latest ?? mine[mine.length - 1] ?? mostCited(1)[0].n));
  }, [mine, ready]);
  const go = (n: number) => {
    setSelected(n);
    history.replaceState(null, "", `#dot-${n}`);
    dig.current?.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
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
      <h1>{tr(lang, "ความก้าวหน้าของคุณ", "Your progress", "你的进度")}</h1>
      <p>
        {tr(
          lang,
          `รู้จักแล้ว ${sum.met} จาก 279 มาตรา จดไว้ ${sum.marked} มาตรา มั่นใจ ${sum.known} มาตรา จุดสีเหลืองคือที่คุณไฮไลต์หรือฝึก เส้นเข้มคือสิ่งที่เชื่อมจุดของคุณ แตะจุดไหนก็ได้เพื่อขุดต่อ`,
          `You have met ${sum.met} of 279 sections, marked ${sum.marked} and are confident in ${sum.known}. Amber dots are what you highlighted or practised; dark lines are what connects them. Tap any dot to dig further.`,
          `你已接触 279 条中的 ${sum.met} 条，标记了 ${sum.marked} 条，掌握了 ${sum.known} 条。琥珀色的点是你标记或练习过的；深色线把它们连起来。点任意一个点继续深挖。`,
        )}
      </p>
      <DotsMap signals={signals} mine={mine} next={next} selected={selected} onSelect={go} />
      <div className="dots-body">
        <div ref={dig}>{selected > 0 && <DigPanel n={selected} signals={signals} onGo={go} />}</div>
        <Thread mine={mine} next={next} onGo={go} />
      </div>
      <h2 className="notes-all">{tr(lang, "บันทึกทั้งหมดของคุณ", "Everything you wrote", "你写下的全部")}</h2>
      <p className="micro">
        {tr(
          lang,
          `ไฮไลต์ ${marks.marks.length} จุด · คั่นหน้า ${marks.bookmarks.length} มาตรา · เก็บไว้ในเครื่องนี้ สำรองได้ที่หน้าอุปกรณ์`,
          `${marks.marks.length} highlights · ${marks.bookmarks.length} bookmarks · Kept on this device; back them up from Your device.`,
          `${marks.marks.length}处标记 · ${marks.bookmarks.length}条收藏 · 保存在本设备，可在“设备设置”中备份。`,
        )}
      </p>
      <ReflectionSummary/>
      <p><Link href="/civic/">{tr(lang, "กลับไปฝึกตรวจคำสัญญาในบ้านความจำ", "Return to the promise-checking memory house", "返回核查承诺的记忆屋")} →</Link></p>
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
                {sectionLabel(lang, n)} →
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
                  {sectionLabel(lang, m.section)} · {m.lang.toUpperCase()} →
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
              <Link href={where(a.section)}>{sectionLabel(lang, a.section)} →</Link>
              {a.note ? <p className="notes-note">{a.note}</p> : <p className="micro">{tr(lang, "ไฮไลต์ทั้งมาตรา", "Whole section highlighted", "整条已标记")}</p>}
            </article>
          ))}
        </section>
      )}
    </>
  );
}
