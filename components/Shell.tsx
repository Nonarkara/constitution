"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { useStudy } from "./Provider";
import { labels, tr, type Lang } from "@/lib/i18n";
import { SWATCH, THEMES, THEME_NAME } from "@/lib/theme";
import { useTheme } from "@/lib/use-theme";
import { questionIndex } from "@/lib/outline";
import { dueQuestions } from "@/lib/learning";
import { knowSummary, sectionSignals } from "@/lib/knowledge";
import { DOORS, backFor, crumbsFor, doorFor, nextFor } from "@/lib/nav";
function useNavContext() {
  const path = usePathname() || "/";
  const params = useSearchParams();
  const section = Number(params.get("n")) || undefined;
  return { path, section };
}

function PageChrome() {
  const { lang } = useStudy();
  const { path, section } = useNavContext();
  const crumbs = crumbsFor(path, { section });
  const back = backFor(path, { section });
  return (
    <>
      {crumbs.length > 0 && (
        <nav className="crumbs" aria-label={tr(lang, "ตำแหน่งในสมุด", "Where you are", "你在这里")}>
          <ol>
            {crumbs.map((crumb, index) => (
              <li key={`${crumb.href}-${index}`}>
                {index === crumbs.length - 1 ? (
                  <span>{crumb.label[lang]}</span>
                ) : (
                  <Link href={crumb.href}>{crumb.label[lang]}</Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      {back && (
        <p className="page-back">
          <Link href={back.href}>{back.label[lang]}</Link>
        </p>
      )}
    </>
  );
}

function PageNext() {
  const { lang } = useStudy();
  const { path, section } = useNavContext();
  const next = nextFor(path, { section });
  if (!next) return null;
  return (
    <p className="page-next">
      <Link href={next.href}>{next.label[lang]}</Link>
    </p>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { lang, setLang, progress, storageError, ready, online, marks, annotations, read, large, setLarge } = useStudy();
  const path = usePathname() || "/";
  const door = doorFor(path);
  const theme = useTheme();
  // What she knows, not points: counted from her own reading, marks and answers.
  const known = useMemo(() => {
    const now = Date.now();
    return {
      ...knowSummary(sectionSignals({ progress, marks, annotations, read, questions: questionIndex, now })),
      due: dueQuestions(questionIndex, progress, now).length,
    };
  }, [progress, marks, annotations, read]);
  return (
    <>
      <a className="skip" href="#content">
        {tr(lang, "ข้ามไปเนื้อหา", "Skip to content", "跳转到正文")}
      </a>
      <header className="header">
        <Link href="/" className="brand">
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
        <div className="themes" role="group" aria-label={tr(lang, "ขนาดตัวอักษรและสีหน้าจอ", "Text size and screen colours", "字号与屏幕配色")}>
          <button
            type="button"
            aria-pressed={large}
            aria-label={tr(lang, "ขนาดตัวอักษร", "Text size", "字号")}
            title={tr(lang, "ขนาดตัวอักษร", "Text size", "字号")}
            onClick={() => setLarge(!large)}
          >
            {tr(lang, "ขนาด", "Size", "字号")}
          </button>
          {THEMES.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={theme.shown === t}
              aria-label={tr(
                lang,
                `สีหน้าจอ ${THEME_NAME[t].th}`,
                `Theme: ${THEME_NAME[t].en}`,
                `配色：${THEME_NAME[t].zh}`,
              )}
              title={THEME_NAME[t][lang]}
              style={{ background: SWATCH[t].paper, color: SWATCH[t].ink }}
              onClick={() => theme.choose(t)}
            >
              {THEME_NAME[t][lang]}
            </button>
          ))}
        </div>
        <Link className="header-settings" href="/settings/">
          {labels.settings[lang]}
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
        </div>
      </header>
      <div className="app-grid">
        <aside className="sidebar">
          <nav aria-label={tr(lang, "เมนูหลัก", "Main navigation", "主导航")}>
            {DOORS.map((item) => (
              <Link
                aria-current={door === item.id ? "page" : undefined}
                className={door === item.id ? "nav-active" : ""}
                key={item.id}
                href={item.href}
              >
                {item.label[lang]}
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
            <nav className="study-strip micro" aria-label={labels.notes[lang]}>
              <Link href="/notes/">
                {labels.notes[lang]}
                {" · "}
                <b>{known.met}/279</b> {tr(lang, "มาตรา", "sections", "条")}
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
          <Suspense fallback={null}>
            <PageChrome />
          </Suspense>
          {children}
          <Suspense fallback={null}>
            <PageNext />
          </Suspense>
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
