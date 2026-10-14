"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useStudy } from "./Provider";
import { useReadOnScreen } from "./useReadOnScreen";
import {
  sections,
  chapters,
  readingText,
  sectionBody,
  chineseText,
  englishText,
  englishIsStudyTranslation,
} from "@/lib/corpus";
import { tr, sectionLabel, type Lang } from "@/lib/i18n";
import {
  updateSectionAnnotation,
  type HighlightColor,
} from "@/lib/annotations";
import { StudyArt } from "./StudyArt";

export function DoublePageReader() {
  const { lang, annotations, saveAnnotations } = useStudy();

  // Spread starts at section number for the left page (1, 3, 5, ...)
  const [leftSecNum, setLeftSecNum] = useState<number>(1);
  const [activeHighlight, setActiveHighlight] = useState<HighlightColor>("amber");
  const [viewCompare, setViewCompare] = useState<boolean>(false);
  const [jumpInput, setJumpInput] = useState<string>("");
  const [savedNoteStatus, setSavedNoteStatus] = useState<Record<number, boolean>>({});
  useReadOnScreen(leftSecNum);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const target = Number(params.get("jump") || params.get("sec"));
    if (target >= 1 && target <= 279) {
      const start = target % 2 === 0 ? target - 1 : target;
      setLeftSecNum(start);
    }
  }, []);

  const rightSecNum = leftSecNum + 1 <= 279 ? leftSecNum + 1 : null;
  const leftSection = sections.find((s) => s.number === leftSecNum);
  const rightSection = rightSecNum ? sections.find((s) => s.number === rightSecNum) : null;

  const currentChapter = chapters.find(
    (c) => leftSecNum >= c.start && leftSecNum <= c.end,
  );

  const totalAnnotated = Object.keys(annotations).length;

  const prevSpread = () => {
    if (leftSecNum > 1) {
      setLeftSecNum(Math.max(1, leftSecNum - 2));
    }
  };

  const nextSpread = () => {
    if (leftSecNum + 2 <= 279) {
      setLeftSecNum(leftSecNum + 2);
    }
  };

  const jumpTo = (num: number) => {
    if (num >= 1 && num <= 279) {
      // If even, start spread from num - 1 so num is on the right page
      const start = num % 2 === 0 ? num - 1 : num;
      setLeftSecNum(start);
      setJumpInput("");
    }
  };

  const handleHighlightToggle = (secNum: number) => {
    const cur = annotations[secNum]?.highlight;
    const nextColor = cur === activeHighlight ? null : activeHighlight;
    const updated = updateSectionAnnotation(annotations, secNum, {
      highlight: nextColor,
    });
    saveAnnotations(updated);
  };

  const handleNoteChange = (secNum: number, text: string) => {
    const updated = updateSectionAnnotation(annotations, secNum, {
      note: text,
    });
    saveAnnotations(updated);
    setSavedNoteStatus((prev) => ({ ...prev, [secNum]: true }));
    setTimeout(() => {
      setSavedNoteStatus((prev) => ({ ...prev, [secNum]: false }));
    }, 1800);
  };

  const highlightClass = (secNum: number) => {
    const h = annotations[secNum]?.highlight;
    if (!h) return "";
    return ` highlighted highlight-${h}`;
  };

  return (
    <div className="notebook-container">

      <header className="notebook-header">
        <div className="intro-copy">
          <StudyArt scene="reading" compact />
          <h1>
            {tr(
              lang,
              "สมุดสองหน้า\nทีละสองมาตรา",
              "Two pages,\ntwo sections at a time.",
              "双页笔记本，\n每次两条。",
            )}
          </h1>
          <p>
            {tr(
              lang,
              "อ่านทั้ง 279 มาตราเหมือนสมุดเปิดบนโต๊ะ ระบายสีทั้งมาตราตามความหมาย แล้วจดโน้ตที่ขอบ โน้ตจะกลับมาในการ์ดความจำและรอบทบทวน",
              "Read all 279 sections like a book open on the desk. Colour a whole section by what it means and write in the margin; your notes return in flashcards and review.",
              "像摊开在桌上的书一样阅读全部279条。按含义给整条上色，在页边写笔记；笔记会出现在闪卡和复习中。",
            )}
          </p>
        </div>
      </header>

      {/* Toolbar */}
      <section
        className="notebook-controls"
        aria-label={tr(lang, "ควบคุมสมุด", "Notebook controls", "笔记本控制")}
      >
        <div className="spread-navigation">
          <button onClick={prevSpread} disabled={leftSecNum <= 1}>
            ← {tr(lang, "คู่หน้าก่อนหน้า", "Previous Spread", "上一对页")}
          </button>
          <span className="mono spread-indicator">
            {tr(
              lang,
              `มาตรา ${leftSecNum}${rightSecNum ? `–${rightSecNum}` : ""} จาก 279`,
              `Sec ${leftSecNum}${rightSecNum ? `–${rightSecNum}` : ""} of 279`,
              `第${leftSecNum}${rightSecNum ? `至${rightSecNum}` : ""}条 / 共279条`,
            )}
          </span>
          <button onClick={nextSpread} disabled={leftSecNum >= 279}>
            {tr(lang, "อีกสองมาตรา", "Two more sections", "再翻两条")} →
          </button>
        </div>

        {/* Highlighter Tool Palette */}
        <div className="highlighter-palette" aria-label={tr(lang, "สีไฮไลต์", "Highlight colour", "高亮颜色")}>
          <span className="micro font-bold">
            {tr(lang, "สีไฮไลต์:", "Highlighter:", "高亮颜色:")}
          </span>
          {(
            [
              ["amber", tr(lang, "อำพันสำคัญ", "Amber (Key)", "琥珀核心")],
              ["mint", tr(lang, "มิ้นต์สิทธิ", "Mint (Rights)", "薄荷权利")],
              ["coral", tr(lang, "คอรัลยกเว้น", "Coral (Exception)", "珊瑚例外")],
              ["sky", tr(lang, "สกายองค์กร", "Sky (Institutions)", "天蓝机构")],
            ] as const
          ).map(([color, labelText]) => (
            <button
              key={color}
              className={`color-pill pill-${color} ${activeHighlight === color ? "active" : ""}`}
              onClick={() => setActiveHighlight(color)}
              aria-pressed={activeHighlight === color}
            >
              <span className="color-dot" />
              <span>{labelText}</span>
            </button>
          ))}
        </div>

        {/* Quick Chapter Selector & Jump */}
        <div className="jump-controls">
          <select
            value={currentChapter?.number ?? 1}
            onChange={(e) => {
              const ch = chapters.find((c) => c.number === Number(e.target.value));
              if (ch) jumpTo(ch.start);
            }}
            aria-label={tr(lang, "กระโดดไปหมวด", "Jump to a chapter", "跳到章节")}
          >
            {chapters.map((c) => (
              <option key={c.number} value={c.number}>
                {tr(
                  lang,
                  `${c.number === 17 ? "บทเฉพาะกาล" : `หมวด ${c.number}`} · ${c.title.th} · ม.${c.start}–${c.end}`,
                  `${c.number === 17 ? "Transitory" : `Chapter ${c.number}`} · ${c.title.en} · ss. ${c.start}–${c.end}`,
                  `${c.number === 17 ? "过渡" : `第${c.number}章`} · ${c.title.zh} · 第${c.start}–${c.end}条`,
                )}
              </option>
            ))}
          </select>

          <form
            className="direct-jump-form"
            onSubmit={(e) => {
              e.preventDefault();
              const n = Number(jumpInput);
              if (n >= 1 && n <= 279) jumpTo(n);
            }}
          >
            <input
              type="number"
              min="1"
              max="279"
              placeholder={tr(lang, "เลขมาตรา (1–279)", "Sec # (1–279)", "条文编号")}
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              className="jump-input"
            />
            <button type="submit">
              {tr(lang, "ไป", "Go", "跳转")}
            </button>
          </form>

          <label className="compare-toggle micro">
            <input
              type="checkbox"
              checked={viewCompare}
              onChange={(e) => setViewCompare(e.target.checked)}
            />
            {tr(lang, "เปิดเทียบ 3 ภาษา", "Compare 3 Languages", "三语对照")}
          </label>
        </div>
      </section>

      {/* User Stats Banner */}
      {totalAnnotated > 0 && (
        <div className="annotation-banner micro">
          <span>
            {tr(
              lang,
              `คุณได้ไฮไลต์หรือจดโน้ตไว้แล้ว ${totalAnnotated} มาตรา`,
              `You have highlighted or annotated ${totalAnnotated} sections.`,
              `您已在${totalAnnotated}条法条中记录高亮或个人笔记。`,
            )}
          </span>
          <Link href="/flashcards/" className="link-underlined">
            {tr(lang, "ทบทวนการ์ดความจำจากบันทึกของคุณ →", "Review as Flashcards →", "以闪卡形式复习 →")}
          </Link>
        </div>
      )}

      {/* THE TWO-PAGE OPEN SPREAD */}
      <main
        className="open-spread-book"
        aria-label={tr(lang, "สมุดรัฐธรรมนูญเปิดสองหน้า", "Open constitution spread", "打开的宪法对页")}
      >
        {/* Book Spine Center Marker */}
        <div className="book-spine" aria-hidden="true">
          <div className="spine-crease" />
        </div>

        {/* LEFT PAGE */}
        {leftSection && (
          <article className={`book-page page-left ${highlightClass(leftSection.number)}`} data-read={leftSection.number}>
            <header className="page-header">
              <span className="page-chapter-label micro">
                {chapters.find((c) => c.number === leftSection.chapter)?.title[lang]}
              </span>
              <span className="mono page-num">{leftSection.number}</span>
            </header>

            <div className="page-content">
              <div className="section-title-row">
                <h2>{sectionLabel(lang, leftSection.number)}</h2>
                <button
                  className="mini-highlight-btn"
                  onClick={() => handleHighlightToggle(leftSection.number)}
                  aria-pressed={Boolean(annotations[leftSection.number]?.highlight)}
                  aria-label={tr(lang, "สลับไฮไลต์", "Toggle highlight", "切换高亮")}
                >
                  {annotations[leftSection.number]?.highlight
                    ? tr(lang, "ลบไฮไลต์", "Remove Highlight", "取消高亮")
                    : tr(lang, "ไฮไลต์", "Highlight", "高亮此条")}
                </button>
              </div>

              {leftSection.amended && (
                <div className="notice micro">
                  {tr(
                    lang,
                    "มาตรานี้แก้ไขเพิ่มเติม พ.ศ. 2564 (ส.ส. 400 เขต + 100 บัญชีรายชื่อ)",
                    "Amended in 2021 (400 constituency + 100 party-list MPs)",
                    "本条于2021年修订（众议院400选区席位 + 100名单席位）",
                  )}
                </div>
              )}

              {/* Legal Text */}
              <p className="law-text" lang="th">
                {leftSection.th}
              </p>

              {/* Optional Trilingual View */}
              {viewCompare && (
                <div className="compare-box">
                  <div className="compare-block" lang="en">
                    <span className="mono micro">
                      {tr(lang, "อังกฤษ", "English", "英文")}
                    </span>
                    <p>{readingText(leftSection.number, "en")}</p>
                  </div>
                  <div className="compare-block" lang="zh">
                    <span className="mono micro">
                      {tr(lang, "จีน · คำแปลเพื่อเรียน", "Chinese · study translation", "中文 · 学习译文")}
                    </span>
                    <p>{sectionBody(leftSection.number, "zh")}</p>
                  </div>
                </div>
              )}

              {/* Personal Margin Annotation */}
              <div className="margin-note-box">
                <div className="note-box-head">
                  <label htmlFor={`note-${leftSection.number}`} className="micro font-bold">
                    {tr(lang, "บันทึกช่วยจำริมขอบ", "Margin note", "边注")}
                  </label>
                  {savedNoteStatus[leftSection.number] && (
                    <span className="micro text-saved mono">✓ {tr(lang, "บันทึกแล้ว", "Saved", "已保存")}</span>
                  )}
                </div>
                <textarea
                  id={`note-${leftSection.number}`}
                  value={annotations[leftSection.number]?.note ?? ""}
                  placeholder={tr(
                    lang,
                    "พิมพ์บันทึกย่อ, คีย์เวิร์ด, หรือสูตรช่วยจำของคุณที่นี่...",
                    "Type personal notes, key concepts, or mnemonics here...",
                    "在此输入个人笔记、要点或助记口诀...",
                  )}
                  onChange={(e) => handleNoteChange(leftSection.number, e.target.value)}
                  rows={3}
                />
              </div>

              <div className="page-actions-row">
                <Link className="citation" href={`/section/?n=${leftSection.number}`}>
                  {tr(lang, "ฟังเสียงอ่าน & ดูคำอธิบาย", "Listen & Details", "收听朗读与详查")} →
                </Link>
                <Link className="citation" href={`/flashcards/?sec=${leftSection.number}`}>
                  {tr(lang, "เปิดเป็นการ์ดความจำ", "Open Flashcard", "生成记忆卡")} →
                </Link>
              </div>
            </div>

            <footer className="page-footer">
              <span className="mono">{leftSection.number}</span>
            </footer>
          </article>
        )}

        {/* RIGHT PAGE */}
        {rightSection ? (
          <article className={`book-page page-right ${highlightClass(rightSection.number)}`} data-read={rightSection.number}>
            <header className="page-header">
              <span className="page-chapter-label micro">
                {chapters.find((c) => c.number === rightSection.chapter)?.title[lang]}
              </span>
              <span className="mono page-num">{rightSection.number}</span>
            </header>

            <div className="page-content">
              <div className="section-title-row">
                <h2>{sectionLabel(lang, rightSection.number)}</h2>
                <button
                  className="mini-highlight-btn"
                  onClick={() => handleHighlightToggle(rightSection.number)}
                  aria-pressed={Boolean(annotations[rightSection.number]?.highlight)}
                  aria-label={tr(lang, "สลับไฮไลต์", "Toggle highlight", "切换高亮")}
                >
                  {annotations[rightSection.number]?.highlight
                    ? tr(lang, "ลบไฮไลต์", "Remove Highlight", "取消高亮")
                    : tr(lang, "ไฮไลต์", "Highlight", "高亮此条")}
                </button>
              </div>

              {rightSection.amended && (
                <div className="notice micro">
                  {tr(
                    lang,
                    "มาตรานี้แก้ไขเพิ่มเติม พ.ศ. 2564",
                    "Amended in 2021",
                    "本条于2021年修订",
                  )}
                </div>
              )}

              {/* Legal Text */}
              <p className="law-text" lang="th">
                {rightSection.th}
              </p>

              {/* Optional Trilingual View */}
              {viewCompare && (
                <div className="compare-box">
                  <div className="compare-block" lang="en">
                    <span className="mono micro">
                      {tr(lang, "อังกฤษ", "English", "英文")}
                    </span>
                    <p>{readingText(rightSection.number, "en")}</p>
                  </div>
                  <div className="compare-block" lang="zh">
                    <span className="mono micro">
                      {tr(lang, "จีน · คำแปลเพื่อเรียน", "Chinese · study translation", "中文 · 学习译文")}
                    </span>
                    <p>{sectionBody(rightSection.number, "zh")}</p>
                  </div>
                </div>
              )}

              {/* Personal Margin Annotation */}
              <div className="margin-note-box">
                <div className="note-box-head">
                  <label htmlFor={`note-${rightSection.number}`} className="micro font-bold">
                    {tr(lang, "บันทึกช่วยจำริมขอบ", "Margin note", "边注")}
                  </label>
                  {savedNoteStatus[rightSection.number] && (
                    <span className="micro text-saved mono">✓ {tr(lang, "บันทึกแล้ว", "Saved", "已保存")}</span>
                  )}
                </div>
                <textarea
                  id={`note-${rightSection.number}`}
                  value={annotations[rightSection.number]?.note ?? ""}
                  placeholder={tr(
                    lang,
                    "พิมพ์บันทึกย่อ, คีย์เวิร์ด, หรือสูตรช่วยจำของคุณที่นี่...",
                    "Type personal notes, key concepts, or mnemonics here...",
                    "在此输入个人笔记、要点或助记口诀...",
                  )}
                  onChange={(e) => handleNoteChange(rightSection.number, e.target.value)}
                  rows={3}
                />
              </div>

              <div className="page-actions-row">
                <Link className="citation" href={`/section/?n=${rightSection.number}`}>
                  {tr(lang, "ฟังเสียงอ่าน & ดูคำอธิบาย", "Listen & Details", "收听朗读与详查")} →
                </Link>
                <Link className="citation" href={`/flashcards/?sec=${rightSection.number}`}>
                  {tr(lang, "เปิดเป็นการ์ดความจำ", "Open Flashcard", "生成记忆卡")} →
                </Link>
              </div>
            </div>

            <footer className="page-footer">
              <span className="mono">{rightSection.number}</span>
            </footer>
          </article>
        ) : (
          /* Empty End Page if on section 279 */
          <article className="book-page page-right page-end">
            <div className="page-content text-center">
              <h3>{tr(lang, "จบบริบูรณ์ ๒๗๙ มาตรา", "End of the Constitution (Sec 279)", "第279条 全文终")}</h3>
              <p className="micro">
                {tr(
                  lang,
                  "คุณอ่านมาถึงมาตราสุดท้ายแล้ว ขอให้พร้อมสำหรับการสอบและการเป็นพลเมืองที่รู้สิทธิของตนเอง",
                  "You have reached the final section. May this preparation serve you well in exams and civic life.",
                  "您已阅读至最后一条。愿这段宪法学习助力您的备考与法治素养。",
                )}
              </p>
              <Link href="/flashcards/" className="primary inline-block">
                {tr(lang, "เปิดการ์ดความจำเพื่อทบทวน", "Start Flashcards Review", "开始闪卡总复习")} →
              </Link>
            </div>
          </article>
        )}
      </main>

      {/* Floating Bottom Navigator for Tablet / Mobile */}
      <footer className="spread-bottom-nav">
        <button onClick={prevSpread} disabled={leftSecNum <= 1}>
          ← {tr(lang, "ก่อนหน้า", "Prev", "上一页")}
        </button>
        <span className="mono">
          {leftSecNum} {rightSecNum ? `& ${rightSecNum}` : ""} / 279
        </span>
        <button onClick={nextSpread} disabled={leftSecNum >= 279}>
          {tr(lang, "อีกสองมาตรา", "Two more sections", "再翻两条")} →
        </button>
      </footer>
    </div>
  );
}
