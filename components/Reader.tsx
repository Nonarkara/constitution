"use client";
import { StudyArt } from "./StudyArt";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { sections, chapters, searchSections, chineseText } from "@/lib/corpus";
import { useStudy } from "./Provider";
import { tr, labels, sectionLabel, type Lang } from "@/lib/i18n";
import { Speech } from "./Speech";
import { VoiceSearch } from "./VoiceSearch";
import audio from "@/data/audio.json";
import { LawFlow } from "./LawFlow";
const senateAudio =
  "https://www.senate.go.th/view/1/รายละเอียดข่าว/13564/TH-TH";
export function Reader() {
  const { lang } = useStudy();
  const params = useSearchParams();
  const [query, setQuery] = useState(""),
    [number, setNumber] = useState<number | null>(null),
    [compare, setCompare] = useState(true);
  useEffect(() => {
    const n = Number(params.get("n"));
    setNumber(n >= 1 && n <= 279 ? n : null);
  }, [params]);
  const open = (n: number) => {
    window.history.pushState({}, "", `/section/?n=${n}`);
    setNumber(n);
    setQuery("");
    document.getElementById("reader-title")?.focus();
  };
  const results = searchSections(query);
  const track = audio.find(
    (a) => number !== null && number >= a.from && number <= a.to,
  );
  const section = sections.find((s) => s.number === number);
  return (
    <>
      <span className="page-kicker mono">THE READING ROOM · 02</span>
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
                <span>
                  {(lang === "zh" ? chineseText(s.number) : s[lang]).slice(
                    0,
                    140,
                  )}
                  …
                </span>
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
                "มาตรานี้แก้ไขใน พ.ศ. 2564 ข้อความไทยด้านล่างเป็นฉบับแก้ไข ส่วนภาษาอังกฤษเป็นฉบับเดิม พ.ศ. 2560",
                "Amended in 2021. Thai below reflects the amendment. The English column is the historical 2017 version.",
                "本条于2021年修订。下方泰文为修订文本，英文栏为2017年旧译文。",
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
                    ? "ไทย · ต้นฉบับ"
                    : l === "en"
                      ? section.amended
                        ? "EN · HISTORICAL 2017"
                        : "EN · GOVERNMENT TRANSLATION"
                      : "中文 · 学习摘要"}
                </div>
                <p className="law-text">
                  {l === "zh" ? chineseText(section.number) : section[l]}
                </p>
                <Speech
                  lang={l}
                  text={
                    l === "zh"
                      ? chineseText(section.number)
                      : l === "en" && section.amended
                        ? "Historical 2017 text, replaced in 2021. " +
                          section.en
                        : section[l]
                  }
                />
                {l === "zh" ? (
                  <p className="micro">
                    非官方学习摘要，并非完整法律译文。以泰文原文为准。
                  </p>
                ) : (
                  <a
                    className="micro source-link"
                    target="_blank"
                    rel="noreferrer"
                    href={`${section.source[l].url}#page=${section.source[l].pages[0]}`}
                  >
                    {tr(
                      lang,
                      "เปิด PDF ต้นฉบับ หน้า",
                      "Source PDF, page",
                      "原始PDF，页",
                    )}{" "}
                    {section.source[l].pages.join(", ")} ↗
                  </a>
                )}
              </article>
            ))}
          </div>
          <div className="audio-note">
            <StudyArt scene="listening" compact />
            <strong>
              {tr(
                lang,
                "เสียงอ่านของวุฒิสภา",
                "Official Senate recordings",
                "参议院官方录音",
              )}
            </strong>
            <p className="micro">
              {tr(
                lang,
                "29 ตอนในภาษาไทยจากวุฒิสภา ยังไม่ได้ยืนยันฉบับของเสียงอ่าน ตรวจมาตราแก้ไข 83, 86 และ 91 กับข้อความไทยปัจจุบัน",
                "29 Thai audio episodes from the Senate, the recording edition has not been independently verified. Check amended sections 83, 86 and 91 against the current Thai text.",
                "参议院提供29集泰文录音，录音版本尚未独立核实。第83、86、91条请对照现行泰文修订文本。",
              )}
            </p>
            <details className="audio-player">
              <summary>
                {tr(
                  lang,
                  `เปิดเสียงอ่าน ${track?.title ?? ""}`,
                  `Play sections ${track?.from}–${track?.to}`,
                  `播放第${track?.from}至${track?.to}条录音`,
                )}
              </summary>
              {track && (
                <iframe
                  key={track.id}
                  src={track.url}
                  title={track.title}
                  loading="lazy"
                  allow="autoplay"
                  width="100%"
                  height="110"
                />
              )}
              <p className="micro">
                {tr(
                  lang,
                  "เสียงภาษาไทยจาก Google Drive ของวุฒิสภา ต้องใช้อินเทอร์เน็ต",
                  "Thai audio hosted on the Senate’s Google Drive. Requires internet.",
                  "泰文录音托管于参议院Google Drive，需要网络。",
                )}
              </p>
            </details>
            <a
              className="button"
              target="_blank"
              rel="noreferrer"
              href={senateAudio}
            >
              {tr(
                lang,
                "เลือกตอนและฟัง",
                "Choose an episode and listen",
                "选择一集收听",
              )}{" "}
              ↗
            </a>
          </div>
          {[133, 134, 136, 145, 256].includes(section.number) && (
            <LawFlow amendment={section.number === 256} />
          )}
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
        </section>
      ) : (
        <>
          <p>
            {tr(
              lang,
              "ค้นจากข้อความไทย อังกฤษ หรือสรุปภาษาจีน หรือเลือกหมวดด้านล่างเพื่อเริ่มอ่าน",
              "Search Thai, English, or Chinese study summaries, or choose a chapter below.",
              "可搜索泰文、英文和中文学习摘要，也可从下方选择章节。",
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
