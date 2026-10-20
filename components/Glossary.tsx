"use client";
import { useState } from "react";
import glossary from "@/data/glossary.json";
import { LawRef, Peek } from "./LawRef";
import { useStudy } from "./Provider";
import { tr, sectionLabel } from "@/lib/i18n";
import { StudyArt } from "./StudyArt";
import { ActionPanel } from "./PageAction";

// Terms the reader meets in the text, in plain words, each tied to where the law uses it.
export function Glossary() {
  const { lang } = useStudy();
  const [query, setQuery] = useState("");
  const [peek, setPeek] = useState<number | null>(null);
  const q = query.trim().toLowerCase();
  const terms = [...glossary]
    .filter((t) => !q || [t.term.th, t.term.en, t.term.zh, t.def[lang]].some((s) => s.toLowerCase().includes(q)))
    .sort((a, b) => a.term[lang].localeCompare(b.term[lang], lang === "zh" ? "zh" : lang));
  return (
    <>
      <div className="intro-copy">
        <StudyArt scene="glossary" />
        <div className="intro-text">
          <h1>{tr(lang, "อภิธานศัพท์", "Glossary", "术语表")}</h1>
          <p>
            {tr(
              lang,
              `${glossary.length} คำที่เจอบ่อยในตัวบท อธิบายด้วยภาษาง่าย คำเหล่านี้ขีดเส้นประไว้ในหน้าอ่านทั้งฉบับ แตะเพื่อดูความหมาย`,
              `${glossary.length} terms from the text in plain words. They are dotted-underlined in the whole-text reader; tap one to see its meaning.`,
              `${glossary.length}个条文常用术语的白话解释。在全文阅读页中这些词带虚线下划线，点击即可查看。`,
          )}
          </p>
        </div>
      </div>
      <ActionPanel kicker={tr(lang, "ค้นหา", "Find", "查找")}>
        <label className="lookup-label" htmlFor="glossary-filter">
          {tr(lang, "ค้นคำ", "Find a term", "查找术语")}
        </label>
        <input
          id="glossary-filter"
          className="lookup-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <p className="micro action-panel-reason">
          {q
            ? tr(
                lang,
                `เหลือ ${terms.length} คำจาก ${glossary.length} คำ`,
                `${terms.length} of ${glossary.length} terms match`,
                `${terms.length}/${glossary.length} 个术语匹配`,
              )
            : tr(
                lang,
                `ทั้ง ${glossary.length} คำ — แตะคำในหน้าอ่านเพื่อดูความหมาย`,
                `All ${glossary.length} terms. Terms are dotted-underlined in the reader; tap one there.`,
                `全部 ${glossary.length} 个术语。阅读页中这些词带虚线下划线，可在那里点击查看。`,
              )}
        </p>
      </ActionPanel>
      <dl className="glossary-list">
        {terms.map((t) => (
          <div key={t.id}>
            <dt>
              {t.term[lang]}
              {lang !== "th" && <span className="micro" lang="th"> · {t.term.th}</span>}
            </dt>
            <dd>
              <p>{t.def[lang]}</p>
              <p className="micro">
                {t.sections.map((n, i) => (
                  <span key={n}>
                    {i > 0 && " · "}
                    <LawRef n={n} label={sectionLabel(lang, n)} lang={lang} onOpen={() => setPeek(n)} />
                  </span>
                ))}
              </p>
            </dd>
          </div>
        ))}
      </dl>
      {!terms.length && <p>{tr(lang, "ไม่พบคำนี้", "No matching term.", "没有匹配的术语。")}</p>}
      {peek && <Peek n={peek} lang={lang} onClose={() => setPeek(null)} />}
    </>
  );
}
