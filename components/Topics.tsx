"use client";
import { useState } from "react";
import topics from "@/data/topics.json";
import { LawRef, Peek } from "./LawRef";
import { useStudy } from "./Provider";
import { tr, sectionLabel } from "@/lib/i18n";

// A back-of-book index in everyday words: look up "tax" or "protest", land on the sections.
export function Topics() {
  const { lang } = useStudy();
  const [query, setQuery] = useState("");
  const [peek, setPeek] = useState<number | null>(null);
  const q = query.trim().toLowerCase();
  const list = topics
    .filter((t) => !q || [t.topic.th, t.topic.en, t.topic.zh].some((s) => s.toLowerCase().includes(q)))
    .sort((a, b) => a.topic[lang].localeCompare(b.topic[lang], lang === "zh" ? "zh" : lang));
  return (
    <>
      <span className="page-kicker mono">SUBJECT INDEX · 05</span>
      <h1>{tr(lang, "ดัชนีเรื่อง", "Subject index", "主题索引")}</h1>
      <p>
        {tr(
          lang,
          `${topics.length} เรื่องในชีวิต จับคู่กับมาตราที่พูดถึงเรื่องนั้นจริง ๆ ชี้ที่เลขมาตราเพื่ออ่านตัวบท`,
          `${topics.length} everyday topics, each matched to the sections that genuinely address it. Point at a section number to read it.`,
          `${topics.length}个生活话题，各自对应真正涉及该话题的条文。指向条文编号即可阅读。`,
        )}
      </p>
      <label className="micro" htmlFor="topic-filter">
        {tr(lang, "ค้นเรื่อง", "Find a topic", "查找话题")}
      </label>
      <input id="topic-filter" className="filter-input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul className="topic-list">
        {list.map((t) => (
          <li key={t.id}>
            <span className="topic-name">{t.topic[lang]}</span>
            <span className="micro">
              {t.sections.map((n, i) => (
                <span key={n}>
                  {i > 0 && ", "}
                  <LawRef n={n} label={i === 0 ? sectionLabel(lang, n) : String(n)} lang={lang} onOpen={() => setPeek(n)} />
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
      {!list.length && <p>{tr(lang, "ไม่พบเรื่องนี้ ลองค้นในหน้าค้นมาตรา", "Nothing here. Try full-text search.", "没有结果，可尝试全文搜索。")}</p>}
      {peek && <Peek n={peek} lang={lang} onClose={() => setPeek(null)} />}
    </>
  );
}
