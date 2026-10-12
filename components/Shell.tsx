"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStudy } from "./Provider";
import { labels, tr, type Lang } from "@/lib/i18n";
export function Shell({ children }: { children: React.ReactNode }) {
  const { lang, setLang, progress, storageError, ready, online } = useStudy();
  const path = usePathname();
  // Five destinations; every other page belongs to one of them for the active state.
  const nav = [
    ["/learn/", labels.learn, ["/", "/learn/"]],
    ["/read/", labels.read, ["/read/", "/section/", "/notebook/"]],
    ["/practice/", labels.practice, ["/practice/", "/review/", "/exam/", "/flashcards/", "/games/"]],
    ["/notes/", labels.notes, ["/notes/"]],
    ["/library/", labels.library, ["/library/", "/amend/", "/news/", "/research/", "/bible/", "/rights/", "/cheatsheet/", "/topics/", "/glossary/", "/palace/", "/sources/", "/settings/"]],
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
      </header>
      <div className="app-grid">
        <aside className="sidebar">
          <nav aria-label={tr(lang, "เมนูหลัก", "Main navigation", "主导航")}>
            {nav.map(([href, title, match], i) => (
              <Link
                aria-current={(match as readonly string[]).includes(path) ? "page" : undefined}
                className={(match as readonly string[]).includes(path) ? "nav-active" : ""}
                key={href}
                href={href}
              >
                <span className="mono">0{i + 1}</span>
                {title[lang]}
                <span aria-hidden="true">↗</span>
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
            {labels.settings[lang]} ↗
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
          <div className="study-strip micro">
            <span>{progress.xp} XP</span>
            <span>
              {progress.streak}{" "}
              {tr(lang, "วันต่อเนื่อง", "day streak", "天连续学习")}
            </span>
          </div>
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
