"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  sections,
  chapters,
  searchSections,
  chineseSummary,
  readingText,
  sectionBody,
  englishIsStudyTranslation,
} from "@/lib/corpus";
import { useStudy } from "./Provider";
import { tr, labels, sectionLabel, type Lang } from "@/lib/i18n";
import { Recording } from "./Recording";
import { Speech } from "./Speech";
import { VoiceSearch } from "./VoiceSearch";
import { Ask } from "./Ask";
import cases from "@/data/cases.json";
import { Connections } from "./DotsMap";
const senateAudio =
  "https://www.senate.go.th/view/1/รายละเอียดข่าว/13564/TH-TH";
export function Reader() {
  const { lang, noteRead } = useStudy();
  const params = useSearchParams();
  const [query, setQuery] = useState(""),
    [number, setNumber] = useState<number | null>(null),
    [compare, setCompare] = useState(true);
  useEffect(() => {
    const n = Number(params.get("n"));
    setNumber(n >= 1 && n <= 279 ? n : null);
  }, [params]);
  // Opening one section on its own page and staying a moment counts as reading it.
  useEffect(() => {
    if (!number) return;
    const t = window.setTimeout(() => noteRead(number), 4000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [number]);
  const open = (n: number) => {
    window.history.pushState({}, "", `/section/?n=${n}`);
    setNumber(n);
    setQuery("");
    document.getElementById("reader-title")?.focus();
  };
  const results = searchSections(query);
  const section = sections.find((s) => s.number === number);
  const cited = section
    ? cases.filter((item) => item.sections.includes(section.number))
    : [];
  return (
    <>
      <span className="page-kicker mono">
        {tr(lang, "ห้องอ่าน · 03", "The reading room · 03", "阅读室 · 03")}
      </span>
      <h1 id="reader-title" tabIndex={-1}>
        {tr(
          lang,
          "เปิดมาตรา\nหาคำตอบ",
          "Find the section.\nRead the source.",
          "查找条文，\n回到原文。",
        )}
      </h1>
      <form
        className="search-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (results[0]) open(results[0].number);
        }}
      >
        <label htmlFor="search">
          {tr(
            lang,
            "คำค้นหรือเลขมาตรา",
            "Keyword or section number",
            "关键词或条文编号",
          )}
        </label>
        <div className="search-controls">
          <input
            id="search"
            type="search"
            placeholder={tr(
              lang,
              "เช่น สิทธิ, 27, นายกรัฐมนตรี",
              "Try rights, 27, Prime Minister",
              "例如：权利、27、总理",
            )}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">
            ↗ <span className="sr-only">{labels.search[lang]}</span>
          </button>
          <VoiceSearch lang={lang} onText={setQuery} />
        </div>
      </form>
      {query.trim() ? (
        <section aria-live="polite">
          <p className="micro">
            {tr(
              lang,
              `พบ ${results.length} มาตรา • เรียงตามคำตรงกัน ไม่ใช่ความถี่ข้อสอบ`,
              `${results.length} sections · Ranked by text relevance, not exam frequency`,
              `${results.length}条 · 按文本相关度排序，并非考试频率`,
            )}
          </p>
          <div className="results">
            {results.map((s) => (
              <button key={s.number} onClick={() => open(s.number)}>
                <span className="mono">{s.number}</span>
                <span>{readingText(s.number, lang).slice(0, 140)}…</span>
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
          {!results.length && (
            <p>
              {tr(
                lang,
                "ลองคำที่สั้นลง หรือใส่เลข 1–279",
                "Try a shorter phrase or a number from 1–279.",
                "请尝试短关键词或1至279的编号。",
              )}
            </p>
          )}
          {!results.length && <Ask initial={query} />}
        </section>
      ) : section ? (
        <section className="legal-reader">
          <div className="section-heading">
            <div>
              <span className="micro">
                {
                  chapters.find((c) => c.number === section.chapter)?.title[
                    lang
                  ]
                }
              </span>
              <h2>{sectionLabel(lang, section.number)}</h2>
            </div>
            <label className="micro">
              <input
                type="checkbox"
                checked={compare}
                onChange={(e) => setCompare(e.target.checked)}
              />
              {tr(lang, "เทียบ 3 ภาษา", "Compare 3 languages", "三语对照")}
            </label>
          </div>
          {section.amended && (
            <div className="notice">
              {tr(
                lang,
                "มาตรานี้แก้ไขใน พ.ศ. 2564 ข้อความไทยเป็นฉบับแก้ไข คำแปลอังกฤษและจีนจัดทำเพื่อศึกษา และมีฉบับอังกฤษเดิมให้เทียบด้านล่าง",
                "Amended in 2021. Thai reflects the amendment. English and Chinese are study translations; the historical English version remains available below.",
                "本条于2021年修订。泰文为修订文本，英文与中文为学习译文，下方另保留原英文译文供对照。",
              )}
            </div>
          )}
          {section.chapter === 17 && (
            <p className="notice">
              {tr(
                lang,
                "บทเฉพาะกาลมีเงื่อนไขเวลาและบางช่วงสิ้นสุดแล้ว อย่าสรุปว่าทุกอำนาจยังใช้ได้ในปัจจุบัน",
                "Transitory provisions contain time limits, some of which have ended. Do not assume every power is still in operation.",
                "过渡条款包含期限，其中部分期限已结束。不能认为所有权力至今仍然有效。",
              )}
            </p>
          )}
          <div className={compare ? "parallel-text" : "single-text"}>
            {(compare ? (["th", "en", "zh"] as Lang[]) : [lang]).map((l) => (
              <article key={l} lang={l}>
                <div className="language-label mono">
                  {l === "th"
                    ? tr(lang, "ไทย · ต้นฉบับ", "Thai · original", "泰文 · 原文")
                    : l === "en"
                      ? englishIsStudyTranslation(section.number)
                        ? tr(lang, "อังกฤษ · คำแปลเพื่อศึกษา", "English · study translation", "英文 · 学习译文")
                        : tr(lang, "อังกฤษ · คำแปลทางการ", "English · government translation", "英文 · 政府译文")
                      : tr(lang, "จีน · คำแปลเพื่อศึกษา", "Chinese · study translation", "中文 · 学习译文")}
                </div>
                <p className="law-text">{sectionBody(section.number, l)}</p>
                {/* Three columns of players read as noise; side by side, each folds away. */}
                <details className="column-audio" open={!compare}>
                  <summary>{tr(lang, "ฟังภาษานี้", "Listen in this language", "收听本语言")}</summary>
                  <Recording section={section.number} lang={l} />
                  <details className="device-speech">
                    <summary>
                      {tr(
                        l,
                        "ใช้เสียงจากอุปกรณ์",
                        "Use device voice",
                        "使用设备语音",
                      )}
                    </summary>
                    <Speech lang={l} text={readingText(section.number, l)} />
                  </details>
                </details>
                {l === "zh" ? (
                  <p className="micro">
                    完整学习译文，并非官方或经认证的法律译文。请以泰文原文为准。
                  </p>
                ) : (
                  <a
                    className="micro source-link"
                    target="_blank"
                    rel="noreferrer"
                    href={`${(l === "en" && englishIsStudyTranslation(section.number) ? section.source.th : section.source[l]).url}#page=${(l === "en" && englishIsStudyTranslation(section.number) ? section.source.th : section.source[l]).pages[0]}`}
                  >
                    {tr(lang, "เปิด PDF ต้นฉบับ หน้า", "Source PDF, page", "原始PDF，页")}{" "}
                    {(l === "en" && englishIsStudyTranslation(section.number)
                      ? section.source.th
                      : section.source[l]
                    ).pages.join(", ")}{" "}
                    ↗
                  </a>
                )}
                {l === "zh" && (
                  <>
                    <a
                      className="micro source-link"
                      href={`${section.source.th.url}#page=${section.source.th.pages[0]}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {tr(
                        lang,
                        `PDF ภาษาไทย หน้า ${section.source.th.pages.join(", ")}`,
                        `Thai PDF, page ${section.source.th.pages.join(", ")}`,
                        `泰文原文 PDF，第${section.source.th.pages.join(", ")}页`,
                      )}{" "}
                      ↗
                    </a>
                  </>
                )}
                {l === "zh" && (
                  <details>
                    <summary>
                      {tr(lang, "ดูบทสรุปสั้น", "Short study summary", "查看简明学习摘要")}
                    </summary>
                    <p>{chineseSummary(section.number)}</p>
                  </details>
                )}
                {l === "en" && englishIsStudyTranslation(section.number) && (
                  <details>
                    <summary>
                      {tr(
                        lang,
                        "เทียบกับคำแปลทางการ",
                        "Compare the government translation",
                        "对照政府译文",
                      )}
                    </summary>
                    <p className="micro">
                      {tr(
                        lang,
                        "คำแปลเพื่อเรียนยึดตัวบทภาษาไทย คำแปลภาษาอังกฤษทางการอยู่ด้านล่างเพื่อเทียบ",
                        "Study wording follows the Thai text. The government English is below for comparison.",
                        "学习译文以泰文为准。下方保留政府英文译文供对照。",
                      )}
                    </p>
                    <p className="law-text">{section.en}</p>
                  </details>
                )}
              </article>
            ))}
          </div>
          {cited.map((item) => (
            <div className="reading-excerpt" key={item.id}>
              <p>{item.story[lang]}</p>
              <p>{item.why[lang]}</p>
            </div>
          ))}
          <Connections n={section.number} />
          <p className="micro">
            <a href={senateAudio} target="_blank" rel="noreferrer">
              {tr(
                lang,
                "เสียงอ่านชุดของวุฒิสภา เปิดที่เว็บวุฒิสภา",
                "The Senate’s own recordings open on the Senate site",
                "参议院的录音在参议院网站上打开",
              )}{" "}
              ↗
            </a>
          </p>
          <div className="reader-navigation">
            <button
              disabled={section.number === 1}
              onClick={() => open(section.number - 1)}
            >
              ← {tr(lang, "ก่อนหน้า", "Previous", "上一条")}
            </button>
            <Link href="/review/">
              {tr(lang, "ลองฝึกตอบ", "Try practice", "尝试练习")} ↗
            </Link>
            <button
              disabled={section.number === 279}
              onClick={() => open(section.number + 1)}
            >
              {tr(lang, "ถัดไป", "Next", "下一条")} →
            </button>
          </div>
          <Ask sections={[section.number]} key={section.number} />
        </section>
      ) : (
        <>
          <p>
            {tr(
              lang,
              "ค้นจากข้อความไทย อังกฤษ หรือจีน หรือเลือกหมวดด้านล่างเพื่อเริ่มอ่าน",
              "Search the full Thai, English and Chinese text, or choose a chapter below.",
              "可搜索完整泰文、英文与中文文本，也可从下方选择章节。",
            )}
          </p>
          <div className="index-list">
            {chapters.map((c) => (
              <button key={c.number} onClick={() => open(c.start)}>
                <span className="mono">
                  {c.number === 17 ? "T" : String(c.number).padStart(2, "0")}
                </span>
                <span>
                  {c.title[lang]}
                  <small>
                    {sectionLabel(
                      lang,
                      c.start === c.end ? c.start : `${c.start}–${c.end}`,
                    )}
                  </small>
                </span>
                <span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
