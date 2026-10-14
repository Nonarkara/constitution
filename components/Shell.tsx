"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStudy } from "./Provider";
import { labels, tr, type Lang } from "@/lib/i18n";
import { SWATCH, THEMES, THEME_NAME } from "@/lib/theme";
import { useTheme } from "@/lib/use-theme";
import { useMemo } from "react";
import { questionIndex } from "@/lib/outline";
import { dueQuestions } from "@/lib/learning";
import { knowSummary, sectionSignals } from "@/lib/knowledge";
export function Shell({ children }: { children: React.ReactNode }) {
  const { lang, setLang, progress, storageError, ready, online, marks, annotations, read } = useStudy();
  const path = usePathname();
  const theme = useTheme();
  // What she knows, not points: counted from her own reading, marks and answers.
  const known = useMemo(() => {
    const now = Date.now();
    return {
      ...knowSummary(sectionSignals({ progress, marks, annotations, read, questions: questionIndex, now })),
      due: dueQuestions(questionIndex, progress, now).length,
    };
  }, [progress, marks, annotations, read]);
  // Five destinations; every other page belongs to one of them for the active state.
  const nav = [
    ["/learn/", labels.learn, ["/", "/learn/"]],
    ["/read/", labels.read, ["/read/", "/section/", "/notebook/"]],
    ["/practice/", labels.practice, ["/practice/", "/review/", "/exam/", "/drills/", "/flashcards/", "/games/", "/cram/"]],
    ["/notes/", labels.notes, ["/notes/"]],
    ["/library/", labels.library, ["/library/", "/amend/", "/news/", "/research/", "/bible/", "/rights/", "/cheatsheet/", "/topics/", "/glossary/", "/sources/", "/settings/", "/polls/", "/memory/", "/civic/"]],
  ] as const;
  return (
    <>
      <a className="skip" href="#content">
        {tr(lang, "ข้ามไปเนื้อหา", "Skip to content", "跳转到正文")}
      </a>
      <header className="header">
        <Link href="/learn/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            ๒๕๖๐
          </span>
          <span>
            {labels.title[lang]}
            <small>
              {tr(
                lang,
                "อ่านให้เข้าใจ • จำให้ใช้ได้",
                "Read. Recall. Understand.",
                "读懂，记牢，会用。",
              )}
            </small>
          </span>
        </Link>
        <div className="header-controls">
        <div className="themes" role="group" aria-label={tr(lang, "สีหน้าจอ", "Screen colours", "屏幕配色")}>
          {/* Each swatch is the theme itself: its paper, its ink. */}
          {THEMES.map((t) => (
            <button
              key={t}
              aria-pressed={theme.shown === t}
              aria-label={THEME_NAME[t][lang]}
              title={THEME_NAME[t][lang]}
              style={{ background: SWATCH[t].paper, color: SWATCH[t].ink }}
              onClick={() => theme.choose(t)}
            >
              <span aria-hidden="true">{{ th: "ก", en: "A", zh: "文" }[lang]}</span>
            </button>
          ))}
        </div>
        <div className="languages" aria-label={tr(lang, "ภาษา", "Language", "语言")}>
          {(["th", "en", "zh"] as Lang[]).map((l) => (
            <button
              key={l}
              lang={l}
              disabled={!ready}
              aria-pressed={lang === l}
              onClick={() => setLang(l)}
            >
              {{ th: "ไทย", en: "EN", zh: "中文" }[l]}
            </button>
          ))}
        </div>
        </div>
      </header>
      <div className="app-grid">
        <aside className="sidebar">
          <nav aria-label={tr(lang, "เมนูหลัก", "Main navigation", "主导航")}>
            {nav.map(([href, title, match]) => (
              <Link
                aria-current={(match as readonly string[]).includes(path) ? "page" : undefined}
                className={(match as readonly string[]).includes(path) ? "nav-active" : ""}
                key={href}
                href={href}
              >
                {title[lang]}
              </Link>
            ))}
          </nav>
          <div className="sidebar-note">
            <span className="mono">
              {tr(lang, "สมุดของติ๊กกี้", "Tikky's notebook", "Tikky 的笔记本")}
            </span>
            <p>
              {tr(
                lang,
                "วันละนิด ก็ไปได้ไกล",
                "A little every day adds up.",
                "每天学一点，慢慢走得远。",
              )}
            </p>
            <p className="micro">
              {tr(
                lang,
                "สำหรับติ๊กกี้ และทุกคนที่กำลังเตรียมสอบ",
                "For Tikky, and everyone preparing for the exam.",
                "送给 Tikky，也送给每一位备考者。",
              )}
            </p>
          </div>
          <Link className="device-link" href="/settings/">
            {labels.settings[lang]} →
          </Link>
        </aside>
        <main id="content">
          {!online && (
            <p className="notice" role="status">
              {tr(
                lang,
                "คุณกำลังออฟไลน์ หน้าที่บันทึกไว้ยังเปิดได้",
                "You are offline. Pages saved on this device still open.",
                "当前离线。已保存在这台设备上的页面仍可打开。",
              )}
            </p>
          )}
          {ready && (
            <nav className="study-strip micro" aria-label={tr(lang, "สิ่งที่คุณรู้แล้ว", "What you know", "你已掌握的")}>
              <Link href="/notes/">
                <b>{known.met}/279</b> {tr(lang, "มาตราที่รู้จักแล้ว", "sections met", "条已接触")}
              </Link>
              <Link href="/notes/">
                <b>{known.marked}</b> {tr(lang, "มาตราที่จดไว้", "marked", "条已标记")}
              </Link>
              <Link href="/notes/">
                <b>{known.known}</b> {tr(lang, "มาตราที่มั่นใจ", "confident", "条已掌握")}
              </Link>
              <Link href="/review/" className={known.due ? "due" : undefined}>
                <b>{known.due}</b> {tr(lang, "ข้อรอทบทวน", "due for review", "题待复习")}
              </Link>
            </nav>
          )}
          {storageError && (
            <p role="alert" className="notice">
              {tr(
                lang,
                "อุปกรณ์นี้บันทึกความก้าวหน้าไม่ได้ ขณะนี้ยังเรียนได้ตามปกติ",
                "This device cannot save progress. You can still study.",
                "此设备无法保存进度，仍可继续学习。",
              )}
            </p>
          )}
          {children}
        </main>
      </div>
      <footer>
        <Link href="/research/">Dr. Non Arkaraprasertkul · {tr(lang, "ที่มาของสมุด", "About this notebook", "关于这本笔记")}</Link>
        <span>
          {tr(lang, "ประเทศไทย · รัฐธรรมนูญ 2560", "Thailand · Constitution 2017", "泰国 · 2017年宪法")}
        </span>
        <Link href="/sources/">
          {tr(
            lang,
            "ตรวจสอบกับต้นฉบับเสมอ",
            "Check against the original law",
            "请以泰文原文为准",
          )}
        </Link>
      </footer>
    </>
  );
}
