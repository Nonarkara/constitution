"use client";
import { useState } from "react";
import Link from "next/link";
import facts from "@/data/facts.json";
import cram from "@/data/cram.json";
import { LawRef, LawText, Peek } from "./LawRef";
import { useStudy } from "./Provider";
import { tr, sectionLabel, type Lang } from "@/lib/i18n";

type Row = { id: string; section: number; label: Record<Lang, string>; value: Record<Lang, string>; source?: string; note?: Record<Lang, string> };

const SourceTag = ({ source, note }: { source?: string; note?: Record<Lang, string> }) => {
  if (!source || source === "constitution") return null;
  const { lang } = useStudy();
  const text = note?.[lang] ?? (source === "oaccp" ? "Organic Act" : source);
  return <a href="https://www.senate.go.th/assets/portals/93/fileups/257/files/rk/47_62/2561/217.pdf" target="_blank" rel="noreferrer" className="cram-source-tag" title={tr(lang,"มาจากกฎหมายประกอบรัฐธรรมนูญ ตรวจฉบับเต็ม","From the Organic Act; check the full Act","来自组织法，请核对全文")}>· {text} ↗</a>;
};

// Everything an exam asks as a number, on one page. Covering the answers turns
// reading into recall, which is what actually sticks the night before.
export function Cram() {
  const { lang } = useStudy();
  const [covered, setCovered] = useState(false);
  const [shown, setShown] = useState<Set<string>>(new Set());
  const [peek, setPeek] = useState<number | null>(null);
  const reveal = (id: string) => setShown(new Set(shown).add(id));

  const table = (title: string, rows: Row[]) => (
    <section className="cram-group">
      <h2>{title}</h2>
      <dl className="cram-list">
        {rows.map((r) => (
          <div key={r.id}>
            <dt>
              {r.label[lang]}{" "}
              <span className="micro">
                <LawRef n={r.section} label={sectionLabel(lang, r.section)} lang={lang} onOpen={() => setPeek(r.section)} />
                <SourceTag source={r.source} note={r.note} />
              </span>
            </dt>
            <dd>
              {covered && !shown.has(r.id) ? (
                <button className="cram-cover" onClick={() => reveal(r.id)}>
                  {tr(lang, "นึกก่อน แล้วแตะ", "Recall, then tap", "先回忆，再点开")}
                </button>
              ) : (
                <strong>{r.value[lang]}</strong>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );

  return (
    <>
      <span className="page-kicker mono">{tr(lang,"คืนก่อนสอบ","The night before","考前一晚")}</span>
      <h1>{tr(lang, "สรุปก่อนเข้าห้องสอบ", "The night before", "考前一页通")}</h1>
      <p>
        {tr(
          lang,
          "ตัวเลข ระยะเวลา คะแนนเสียง และกับดักที่ต้องแม่น ทุกบรรทัดตรวจกับตัวบทแล้ว ชี้ที่เลขมาตราเพื่อเปิดอ่าน",
          "The numbers, time limits, majorities and traps to get exactly right. Every line is checked against the text; point at a section to read it.",
          "必须记准的数字、期限、表决门槛与陷阱。每一行都已与条文核对，指向条文编号即可阅读。",
        )}
      </p>
      <div className="cram-tools">
        <button
          className={covered ? "" : "primary"}
          aria-pressed={covered}
          onClick={() => {
            setCovered(!covered);
            setShown(new Set());
          }}
        >
          {covered
            ? tr(lang, "เปิดคำตอบทั้งหมด", "Show all answers", "显示全部答案")
            : tr(lang, "ปิดคำตอบ แล้วทดสอบตัวเอง", "Cover the answers and test yourself", "遮住答案，自我测验")}
        </button>
        <button onClick={() => window.print()}>{tr(lang, "พิมพ์", "Print", "打印")}</button>
      </div>
      {covered && (
        <p className="micro" role="status">
          {tr(lang, `เปิดดูแล้ว ${shown.size} ข้อ`, `${shown.size} revealed`, `已翻开${shown.size}项`)}
        </p>
      )}
      {table(tr(lang, "คนและวาระ", "People, terms and ages", "人数、任期与年龄"), facts as Row[])}
      {table(tr(lang, "ระยะเวลา", "Time limits", "期限"), cram.time as Row[])}
      {table(tr(lang, "คะแนนเสียงและเกณฑ์", "Votes and thresholds", "表决与门槛"), cram.votes as Row[])}
      <section className="cram-group">
        <h2>{tr(lang, "กับดักที่พบบ่อย", "Common traps", "常见陷阱")}</h2>
        <ol className="cram-traps">
          {cram.traps.map((t) => (
            <li key={t.id}>
              <LawText text={t.text[lang]} lang={lang} />
              <SourceTag source={t.source} note={t.note} />
            </li>
          ))}
        </ol>
      </section>
      <p className="micro">
        <Link href="/bible/exam-method/">{tr(lang, "วิธีทำข้อสอบ", "How to answer exam questions", "答题方法")} ↗</Link> ·{" "}
        <Link href="/exam/">{tr(lang, "ข้อสอบจำลอง", "Mock exam", "模拟考试")} ↗</Link>
      </p>
      {peek && <Peek n={peek} lang={lang} onClose={() => setPeek(null)} />}
    </>
  );
}
