"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStudy } from "./Provider";
import { energyRemaining } from "@/lib/learning";
import { useEffect, useState } from "react";
import { labels, tr, type Lang } from "@/lib/i18n";
export function Shell({ children }: { children: React.ReactNode }) {
  const { lang, setLang, progress, storageError } = useStudy();
  const path = usePathname();
  const [now, setNow] = useState(0);
  useEffect(() => setNow(Date.now()), [progress]);
  const nav = [
    ["/learn/", labels.learn],
    ["/section/", labels.search],
    ["/review/", labels.review],
    ["/sources/", labels.sources],
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
        <div className="languages" aria-label="Language">
          {(["th", "en", "zh"] as Lang[]).map((l) => (
            <button
              key={l}
              lang={l}
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
            {nav.map(([href, title], i) => (
              <Link
                aria-current={path === href ? "page" : undefined}
                className={path === href ? "nav-active" : ""}
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
            <span className="mono">TIKKY'S NOTEBOOK</span>
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
          <div className="study-strip micro">
            <span>{progress.xp} XP</span>
            <span>
              {progress.streak}{" "}
              {tr(lang, "วันต่อเนื่อง", "day streak", "天连续学习")}
            </span>
            <span>
              {energyRemaining(progress, now)}/12{" "}
              {tr(lang, "พลังวันนี้", "daily energy", "今日精力")}
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
        <aside className="margin">
          <span className="mono">STUDY RECORD</span>
          <div className="stat">
            <strong className="mono">{progress.xp}</strong>
            <span>{tr(lang, "แต้มฝึกฝน", "Practice XP", "练习积分")}</span>
          </div>
          <div className="stat">
            <strong className="mono">{progress.streak}</strong>
            <span>
              {tr(lang, "วันต่อเนื่อง", "Day streak", "连续学习天数")}
            </span>
          </div>
          <div className="stat">
            <strong className="mono">{energyRemaining(progress, now)}</strong>
            <span>
              {tr(
                lang,
                "พลังวันนี้ • ยังเรียนต่อได้เสมอ",
                "Daily energy · You can always keep studying",
                "今日精力 · 仍可继续学习",
              )}
            </span>
          </div>
          <p className="micro">
            {tr(
              lang,
              "ความก้าวหน้าอยู่บนเครื่องนี้ เริ่มใหม่ได้เสมอ ไม่ต้องรีบ",
              "Progress lives on this device. You can always start again. Take your time.",
              "进度保存在此设备上。随时可以重新开始，慢慢来。",
            )}
          </p>
          <div className="margin-rule" />
          <p>
            {tr(
              lang,
              "อ่าน → ลองตอบ → กลับมาทบทวน",
              "Read → Recall → Return",
              "阅读 → 回忆 → 复习",
            )}
          </p>
          <p className="micro">
            {tr(
              lang,
              "ไม่ใช่ข้อสอบจริง ทุกคำตอบมีมาตราให้กลับไปอ่าน",
              "Original practice questions. Each answer points back to the law.",
              "原创练习题，每题均附相关法条。",
            )}
          </p>
        </aside>
      </div>
      <footer>
        <span>THAILAND · CONSTITUTION 2017</span>
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
