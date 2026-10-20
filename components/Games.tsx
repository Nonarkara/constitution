"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import facts from "@/data/facts.json";
import { chapters, readingText, sections } from "@/lib/corpus";
import { useStudy } from "./Provider";
import { tr, sectionLabel, type Lang } from "@/lib/i18n";
import { StudyArt } from "./StudyArt";

type Fact = (typeof facts)[number];
const shuffle = <T,>(list: T[]) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Six facts whose answers differ in this language, so every pairing has one right match. */
function dealFacts(lang: Lang): Fact[] {
  const out: Fact[] = [];
  for (const f of shuffle(facts)) if (out.length < 6 && !out.some((o) => o.value[lang] === f.value[lang])) out.push(f);
  return out;
}

function NumberMatch() {
  const { lang } = useStudy();
  const [deck, setDeck] = useState<{ left: Fact[]; right: Fact[] } | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [misses, setMisses] = useState(0);
  const [message, setMessage] = useState("");
  const deal = () => {
    const d = dealFacts(lang);
    setDeck({ left: d, right: shuffle(d) });
    setMatched([]);
    setMisses(0);
    setPicked(null);
    setMessage("");
  };
  if (!deck)
    return (
      <button className="primary" onClick={deal}>
        {tr(lang, "เริ่มจับคู่ตัวเลข", "Start number match", "开始数字配对")} →
      </button>
    );
  const choose = (f: Fact) => {
    if (!picked || matched.includes(f.id)) return;
    if (f.id === picked) {
      setMatched([...matched, f.id]);
      setMessage(`${sectionLabel(lang, f.section)} · ${f.label[lang]}: ${f.value[lang]}`);
    } else {
      setMisses(misses + 1);
      setMessage(tr(lang, "ยังไม่ใช่ ลองคู่อื่น", "Not that one. Try another.", "不对，再试一次。"));
    }
    setPicked(null);
  };
  const finished = matched.length === deck.left.length;
  return (
    <div>
      <p className="micro">
        {tr(lang, "แตะเรื่องทางซ้าย แล้วแตะตัวเลขที่คู่กัน", "Tap a subject on the left, then its number.", "先点左边的事项，再点对应的数字。")} ·{" "}
        {tr(lang, `พลาด ${misses}`, `${misses} misses`, `错${misses}次`)}
      </p>
      <div className="match-grid">
        <div>
          {deck.left.map((f) => (
            <button
              key={f.id}
              className={"match-card" + (picked === f.id ? " picked" : "") + (matched.includes(f.id) ? " matched" : "")}
              disabled={matched.includes(f.id)}
              aria-pressed={picked === f.id}
              onClick={() => setPicked(f.id)}
            >
              {f.label[lang]}
            </button>
          ))}
        </div>
        <div>
          {deck.right.map((f) => (
            <button
              key={f.id}
              className={"match-card" + (matched.includes(f.id) ? " matched" : "")}
              disabled={matched.includes(f.id) || !picked}
              onClick={() => choose(f)}
            >
              {f.value[lang]}
            </button>
          ))}
        </div>
      </div>
      <p role="status" className="micro">
        {message}
      </p>
      {finished && (
        <div style={{ marginTop: "14px" }}>
          <p className="micro" style={{ color: "var(--ok)", fontWeight: 600 }}>
            ✓ {tr(lang, `จับคู่สำเร็จครบ 6 ข้อ! (พลาด ${misses} ครั้ง)`, `All 6 matched! (${misses} misses)`, `全部6项配对成功！（失误${misses}次）`)}
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
            <button className="primary" onClick={deal}>
              {tr(lang, "อีกชุด", "Another round", "再来一组")} →
            </button>
            <Link href="/cheatsheet/" className="button">
              {tr(lang, "ดูสรุปตัวเลข รธน.", "View constitutional numbers cheat sheet", "查看宪法数字速查")} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

const ROUND = 60;
function SectionSprint() {
  const { lang } = useStudy();
  const [ends, setEnds] = useState(0);
  const [now, setNow] = useState(0);
  const [score, setScore] = useState({ right: 0, tried: 0 });
  const [card, setCard] = useState<{ n: number; options: number[] } | null>(null);
  const [last, setLast] = useState("");
  useEffect(() => {
    if (!ends) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [ends]);
  const nextCard = () => {
    const pool = sections.filter((s) => s.th.length > 120);
    const s = pool[Math.floor(Math.random() * pool.length)];
    const near = shuffle(
      Array.from({ length: 9 }, (_, i) =>
        Math.min(279, Math.max(1, s.number - 4 + i)),
      ).filter((n, i, a) => n !== s.number && a.indexOf(n) === i),
    ).slice(0, 3);
    setCard({ n: s.number, options: shuffle([s.number, ...near]) });
  };
  const start = () => {
    setScore({ right: 0, tried: 0 });
    setLast("");
    setNow(Date.now());
    setEnds(Date.now() + ROUND * 1000);
    nextCard();
  };
  const left = Math.max(0, Math.ceil((ends - now) / 1000));
  if (!ends || !card)
    return (
      <button className="button" onClick={start}>
        {tr(lang, "เริ่มแข่ง 60 วินาที", "Start the 60-second sprint", "开始60秒挑战")} →
      </button>
    );
  if (left === 0) {
    const pct = score.tried > 0 ? Math.round((score.right / score.tried) * 100) : 0;
    return (
      <div className="sprint-complete-card" style={{ padding: "16px 0" }}>
        <p className="mono font-bold" style={{ fontSize: "var(--body)", margin: "0 0 6px" }}>
          {tr(
            lang,
            `ได้ ${score.right} จาก ${score.tried} ข้อ (${pct}%)`,
            `${score.right} right out of ${score.tried} (${pct}%)`,
            `${score.tried}题中答对${score.right}题（${pct}%）`,
          )}
        </p>
        <p className="micro" style={{ color: "var(--muted)", margin: "0 0 16px" }}>
          {pct >= 70
            ? tr(lang, "ยอดเยี่ยม! ความจำตำแหน่งมาตราแม่นยำมาก", "Great speed and accuracy!", "反应迅速且条文定位精准！")
            : tr(lang, "ฝึกสปรินต์บ่อย ๆ ช่วยให้เปิดข้อสอบจริงแล้วจำตำแหน่งหมวดได้ทันที", "Regular sprints build rapid section recall for real exams.", "经常速练能帮你迅速在真实考卷中回忆起所属章节。")}
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="button" onClick={start}>
            {tr(lang, "เล่นอีกครั้ง", "Play again", "再玩一次")} →
          </button>
          <Link href="/practice/" className="button">
            {tr(lang, "ไปฝึกตอบแบบเลือกหมวด", "Practise by chapter", "按章节练习")} →
          </Link>
          <Link href="/drills/" className="button">
            {tr(lang, "เจาะตัวเลข 4,230 ข้อ", "4,230 number drills", "4,230道数字速练")} →
          </Link>
        </div>
      </div>
    );
  }
  const text = readingText(card.n, lang).replace(/^第\d+条\s*/, "");
  return (
    <div>
      <p className="mono">
        {left}s · {score.right}/{score.tried}
      </p>
      <p className="micro">
        {tr(lang, "ข้อความนี้มาจากมาตราใด", "Which section says this?", "这段话出自哪一条？")} ·{" "}
        {chapters.find((c) => c.number === sections[card.n - 1].chapter)?.title[lang]}
      </p>
      <blockquote className="sprint-text" lang={lang}>
        {text.slice(0, 180)}…
      </blockquote>
      <div className="sprint-options-grid">
        {card.options.map((n) => (
          <button
            key={n}
            className="sprint-option-btn"
            onClick={() => {
              const ok = n === card.n;
              setScore({ right: score.right + (ok ? 1 : 0), tried: score.tried + 1 });
              setLast(
                ok
                  ? tr(lang, "ถูก", "Right", "对")
                  : `${tr(lang, "คำตอบคือ", "It was", "答案是")} ${sectionLabel(lang, card.n)}`,
              );
              nextCard();
            }}
          >
            {sectionLabel(lang, n)}
          </button>
        ))}
      </div>
      <p role="status" className="micro">
        {last}
      </p>
    </div>
  );
}

export function Games() {
  const { lang } = useStudy();
  return (
    <>
      <div className="intro-copy">
        <StudyArt scene="games" />
        <div className="intro-text">
          <h1>{tr(lang, "เกม", "Games", "游戏")}</h1>
          <p>
            {tr(
              lang,
              "สองเกมสั้น ๆ สำหรับวันที่อยากเล่นมากกว่าอ่าน ทุกตัวเลขพิสูจน์ได้จากตัวบท",
              "Two short games for days when playing beats reading. Every number is checked against the text.",
              "两个小游戏，适合想玩不想读的日子。每个数字都与条文核对过。",
            )}
          </p>
        </div>
      </div>
      <section className="game-block">
        <h2>{tr(lang, "จับคู่ตัวเลข", "Number match", "数字配对")}</h2>
        <NumberMatch />
      </section>
      <section className="game-block">
        <h2>{tr(lang, "มาตราไหนนะ", "Section sprint", "哪一条？")}</h2>
        <SectionSprint />
      </section>
      <p className="micro">
        <Link href="/practice/">← {tr(lang, "กลับไปฝึกตอบ", "Back to practice", "返回练习")}</Link>
      </p>
    </>
  );
}
