"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { chapters } from "@/lib/outline";
import {
  cases,
  citedBy,
  clusters,
  lead,
  mostCited,
  neighbours,
  nextDots,
  threadLines,
  type Reason,
} from "@/lib/dots";
import { stateOf, type SectionState, type Signals } from "@/lib/knowledge";
import { sectionLabel, tr, type Lang } from "@/lib/i18n";
import { useStudy } from "./Provider";

const chapterOf = (n: number) => chapters.find((c) => n >= c.start && n <= c.end)!;
const chapterMark = (c: number) => (c === 17 ? "T" : String(c).padStart(2, "0"));
const readHref = (n: number) => `/read/?c=${chapterOf(n).number}#s-${n}`;

// ---------- The map: one subway line per chapter, one station per section ----------

const PITCH = 13,
  ROW = 30,
  TOP = 22;
type Layout = { pos: { x: number; y: number }[]; rows: { c: number; y: number; x1: number; x2: number; first: boolean }[]; height: number; gutter: number };
function layout(width: number): Layout {
  const gutter = width < 600 ? 34 : 190;
  const perLine = Math.max(8, Math.floor((width - gutter - 16) / PITCH));
  const pos: Layout["pos"] = [],
    rows: Layout["rows"] = [];
  let y = TOP;
  for (const c of chapters) {
    const count = c.end - c.start + 1;
    const lines = Math.ceil(count / perLine);
    for (let line = 0; line < lines; line++) {
      const onLine = Math.min(perLine, count - line * perLine);
      rows.push({ c: c.number, y: y + line * ROW, x1: gutter + 6, x2: gutter + 6 + (onLine - 1) * PITCH, first: line === 0 });
    }
    for (let i = 0; i < count; i++)
      pos[c.start + i] = { x: gutter + 6 + (i % perLine) * PITCH, y: y + Math.floor(i / perLine) * ROW };
    y += lines * ROW;
  }
  return { pos, rows, height: y, gutter };
}
// A gentle curve, bowed above the line when both stations share a row.
function arc(p: { x: number; y: number }, q: { x: number; y: number }) {
  const mx = (p.x + q.x) / 2,
    my = (p.y + q.y) / 2;
  const [cx, cy] = p.y === q.y ? [mx, my - Math.min(26, Math.abs(q.x - p.x) / 3 + 6)] : [mx + (q.y - p.y) * 0.3, my];
  return `M${p.x} ${p.y}Q${cx} ${cy} ${q.x} ${q.y}`;
}
const fromText = (reasons: Reason[]) => reasons.some((r) => r.kind === "cites" || r.kind === "cited-by");

function Station({ x, y, state, marked, next, selected }: { x: number; y: number; state: SectionState; marked: boolean; next: boolean; selected: boolean }) {
  const r = { unseen: 2.3, read: 3, practising: 3.4, due: 3.4, known: 4.2 }[state];
  return (
    <>
      {selected && <circle cx={x} cy={y} r={8.5} fill="none" stroke="var(--ink)" strokeWidth={2} />}
      {next && <circle cx={x} cy={y} r={6.5} fill="none" stroke="var(--accent-deep)" strokeWidth={1.2} strokeDasharray="2 2" />}
      {state === "due" && <circle cx={x} cy={y} r={6} fill="none" stroke="var(--accent)" strokeWidth={2} />}
      {marked ? (
        <circle cx={x} cy={y} r={Math.max(r, 4)} fill="var(--accent)" stroke="var(--accent-deep)" strokeWidth={1} />
      ) : state === "unseen" ? (
        <circle cx={x} cy={y} r={r} fill="var(--paper)" stroke="var(--edge)" strokeWidth={1} />
      ) : (
        <circle cx={x} cy={y} r={r} fill={state === "read" ? "var(--muted)" : "var(--ink)"} />
      )}
    </>
  );
}

export function DotsMap({
  signals,
  mine,
  next,
  selected,
  onSelect,
}: {
  signals: Signals[];
  mine: number[];
  next: { n: number; via: number[] }[];
  selected: number;
  onSelect: (n: number) => void;
}) {
  const { lang } = useStudy();
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const watch = new ResizeObserver(([e]) => setWidth(Math.floor(e.contentRect.width)));
    watch.observe(el);
    return () => watch.disconnect();
  }, []);
  const map = useMemo(() => (width ? layout(width) : null), [width]);
  const mineSet = useMemo(() => new Set(mine), [mine]);
  const nextSet = useMemo(() => new Set(next.map((d) => d.n)), [next]);
  // Her own links: every pair of her sections the law or the index connects.
  const myLinks = useMemo(() => {
    const out: { a: number; b: number; text: boolean }[] = [];
    for (const a of mine)
      for (const nb of neighbours(a)) if (nb.n > a && mineSet.has(nb.n)) out.push({ a, b: nb.n, text: fromText(nb.reasons) });
    return out;
  }, [mine, mineSet]);
  const selectedLinks = useMemo(() => (selected ? neighbours(selected) : []), [selected]);
  const pick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!map) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left,
      y = e.clientY - rect.top;
    let best = 0,
      dist = Infinity;
    for (let n = 1; n <= 279; n++) {
      const d = Math.hypot(map.pos[n].x - x, map.pos[n].y - y);
      if (d < dist) (dist = d), (best = n);
    }
    if (dist <= PITCH * 1.2) onSelect(best);
  };
  return (
    <figure className="dots-map" ref={box}>
      {map && (
        <svg
          width={width}
          height={map.height}
          onClick={pick}
          role="img"
          aria-label={tr(
            lang,
            `แผนที่ 279 มาตรา จุดของคุณ ${mine.length} จุด เส้นบาง ๆ คือมาตราที่${sectionLabel(lang, selected)}เชื่อมถึง`,
            `Map of all 279 sections: ${mine.length} of your dots; thin lines show what ${sectionLabel(lang, selected)} connects to.`,
            `279条全图：你的点 ${mine.length} 个；细线显示${sectionLabel(lang, selected)}所连接的条文。`,
          )}
        >
          {map.rows.map((r) => (
            <g key={`${r.c}-${r.y}`}>
              <line x1={r.x1} x2={r.x2} y1={r.y} y2={r.y} stroke="var(--line)" strokeWidth={2} />
              {r.first && (
                <text x={0} y={r.y + 4} className="dots-label">
                  {chapterMark(r.c)}
                  {map.gutter > 60 && ` ${chapters.find((c) => c.number === r.c)!.title[lang].slice(0, 18)}`}
                </text>
              )}
            </g>
          ))}
          {/* The selected section's own wiring: every section it connects to. */}
          <g fill="none" stroke="var(--edge)" strokeWidth={1}>
            {selectedLinks.map((nb) => (
              <path key={`s${nb.n}`} d={arc(map.pos[selected], map.pos[nb.n])} strokeDasharray={fromText(nb.reasons) ? undefined : "2 3"} />
            ))}
          </g>
          <g fill="none" stroke="var(--accent-deep)" strokeWidth={1.2} strokeDasharray="3 3">
            {next.flatMap((d) => d.via.map((v) => <path key={`n${d.n}-${v}`} d={arc(map.pos[v], map.pos[d.n])} />))}
          </g>
          <g fill="none" stroke="var(--ink)">
            {myLinks.map((l) => (
              <path key={`m${l.a}-${l.b}`} d={arc(map.pos[l.a], map.pos[l.b])} strokeWidth={1.8} strokeDasharray={l.text ? undefined : "5 3"} />
            ))}
          </g>
          {signals.map((s) => (
            <Station
              key={s.n}
              x={map.pos[s.n].x}
              y={map.pos[s.n].y}
              state={stateOf(s)}
              marked={s.marked}
              next={nextSet.has(s.n)}
              selected={selected === s.n}
            />
          ))}
        </svg>
      )}
      <figcaption className="dots-legend micro">
        <span><i className="dot unseen" />{tr(lang, "ยังไม่เปิด", "not yet met", "未接触")}</span>
        <span><i className="dot read" />{tr(lang, "อ่านแล้ว", "read", "已读")}</span>
        <span><i className="dot practising" />{tr(lang, "กำลังฝึก", "practising", "练习中")}</span>
        <span><i className="dot known" />{tr(lang, "มั่นใจ", "confident", "已掌握")}</span>
        <span><i className="dot due" />{tr(lang, "รอทบทวน", "due", "待复习")}</span>
        <span><i className="dot mine" />{tr(lang, "จุดที่คุณจด", "your marks", "你的标记")}</span>
        <span><i className="dot next" />{tr(lang, "จุดที่ยังไม่อ่าน", "unread dot", "还没读的点")}</span>
        <span><i className="stroke solid" />{tr(lang, "ตัวบทเขียนถึงกัน", "the text cites", "条文互引")}</span>
        <span><i className="stroke dashed" />{tr(lang, "ดัชนีจัดไว้ด้วยกัน", "grouped by our index", "索引归类")}</span>
      </figcaption>
    </figure>
  );
}

// ---------- Dig deeper: everything about one section, every item a door to the next ----------

function reasonText(r: Reason, other: number, lang: Lang) {
  const o = sectionLabel(lang, other);
  switch (r.kind) {
    case "cites":
      return tr(lang, `ตัวบทมาตรานี้เขียนถึง ${o}`, `This section's text names ${o}`, `本条条文提到${o}`);
    case "cited-by":
      return tr(lang, `ตัวบท${o} เขียนถึงมาตรานี้`, `The text of ${o} names this section`, `${o}的条文提到本条`);
    case "topic":
      return tr(lang, `เรื่องเดียวกัน: ${r.label.th}`, `Same subject: ${r.label.en}`, `同一主题：${r.label.zh}`);
    case "term":
      return tr(lang, `คำเดียวกัน: ${r.label.th}`, `Same term: ${r.label.en}`, `同一术语：${r.label.zh}`);
    case "question":
      return tr(lang, "ข้อฝึกข้อหนึ่งถามคู่กัน", "One practice question asks about both", "有一道练习题同时考两条");
  }
}
const sourceTag = (r: Reason, lang: Lang) =>
  r.kind === "cites" || r.kind === "cited-by" ? tr(lang, "ตัวบท", "text", "条文") : tr(lang, "ดัชนี", "index", "索引");

function stateText(s: Signals, lang: Lang) {
  const parts: string[] = [];
  const state = stateOf(s);
  parts.push(
    {
      unseen: tr(lang, "ยังไม่ได้เปิด", "Not met yet", "尚未接触"),
      read: tr(lang, "อ่านแล้ว", "Read", "已读"),
      practising: tr(lang, "กำลังฝึก", "Practising", "练习中"),
      known: tr(lang, "มั่นใจแล้ว", "Confident", "已掌握"),
      due: tr(lang, "ถึงเวลาทบทวน", "Due for review", "该复习了"),
    }[state],
  );
  if (s.total) parts.push(tr(lang, `ตอบถูก ${s.correct}/${s.total} ข้อ`, `${s.correct}/${s.total} questions right`, `答对 ${s.correct}/${s.total} 题`));
  if (s.notes) parts.push(tr(lang, `โน้ต ${s.notes}`, `${s.notes} notes`, `${s.notes} 条笔记`));
  return parts.join(" · ");
}

export function DigPanel({ n, signals, onGo }: { n: number; signals: Signals[]; onGo: (n: number) => void }) {
  const { lang, marks, annotations } = useStudy();
  const [all, setAll] = useState(false);
  useEffect(() => setAll(false), [n]);
  const s = signals[n - 1];
  const chapter = chapterOf(n);
  const near = neighbours(n);
  const shown = all ? near : near.slice(0, 8);
  const myMarks = marks.marks.filter((m) => m.section === n);
  const note = annotations[n]?.note;
  const myCases = cases.filter((c) => c.sections.includes(n));
  const times = citedBy(n);
  return (
    <section className="dig" aria-live="polite" aria-labelledby="dig-title">
      <div className="dig-head">
        <button disabled={n <= 1} onClick={() => onGo(n - 1)} aria-label={sectionLabel(lang, n - 1)}>←</button>
        <div>
          <span className="micro">
            {chapter.number === 17 ? tr(lang, "บทเฉพาะกาล", "Transitory provisions", "过渡条款") : tr(lang, `หมวด ${chapter.number}`, `Chapter ${chapter.number}`, `第${chapter.number}章`)} · {chapter.title[lang]}
          </span>
          <h2 id="dig-title">{sectionLabel(lang, n)}</h2>
        </div>
        <button disabled={n >= 279} onClick={() => onGo(n + 1)} aria-label={sectionLabel(lang, n + 1)}>→</button>
      </div>
      <p className="micro">{stateText(s, lang)}{times > 0 && tr(lang, ` · มาตราอื่นเขียนถึง ${times} ครั้ง`, ` · named by ${times} other sections`, ` · 被其他条文提到 ${times} 次`)}</p>
      <blockquote lang="th" className="dig-lead">{lead(n)}</blockquote>
      <div className="dig-actions">
        <Link className="button" href={readHref(n)}>{tr(lang, "อ่านเต็มในหมวด", "Read it in its chapter", "在章节中阅读")} →</Link>
        <Link className="button" href={`/section/?n=${n}`}>{tr(lang, "ฟังและเทียบ 3 ภาษา", "Listen and compare", "朗读与三语对照")} →</Link>
        {s.total > 0 && <Link className="button" href={`/flashcards/?sec=${n}`}>{tr(lang, `ฝึก ${s.total} ข้อ`, `Practise ${s.total}`, `练习 ${s.total} 题`)} →</Link>}
      </div>

      {(myMarks.length > 0 || note) && (
        <div className="dig-block">
          <h3>{tr(lang, "ที่คุณจดไว้", "What you marked", "你的标记")}</h3>
          {myMarks.map((m) => (
            <div key={m.id} className="dig-mark">
              <blockquote lang={m.lang}>{m.quote}</blockquote>
              {m.note && <p className="notes-note">{m.note}</p>}
            </div>
          ))}
          {note && <p className="notes-note">{note}</p>}
        </div>
      )}

      <div className="dig-block">
        <h3>{tr(lang, `เชื่อมกับอีก ${near.length} มาตรา`, `Connected to ${near.length} sections`, `与 ${near.length} 条相连`)}</h3>
        {near.length === 0 ? (
          <p className="micro">{tr(lang, "มาตรานี้ไม่ได้เขียนถึงหรือถูกจัดคู่กับมาตราอื่น", "No other section names it or is grouped with it.", "没有其他条文提到本条，也没有与之归为一类。")}</p>
        ) : (
          <ul className="dig-links">
            {shown.map((nb) => (
              <li key={nb.n}>
                <button className="dig-go" onClick={() => onGo(nb.n)}>
                  <i className={`dot ${signals[nb.n - 1].marked ? "mine" : stateOf(signals[nb.n - 1])}`} aria-hidden="true" />
                  {sectionLabel(lang, nb.n)}
                </button>
                <span>
                  {nb.reasons.slice(0, 2).map((r, i) => (
                    <span key={i} className="dig-reason">
                      <span className="mono">{sourceTag(r, lang)}</span> {reasonText(r, nb.n, lang)}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        )}
        {near.length > 8 && !all && (
          <button className="text-button" onClick={() => setAll(true)}>
            {tr(lang, `ดูอีก ${near.length - 8} มาตรา`, `Show ${near.length - 8} more`, `再显示 ${near.length - 8} 条`)}
          </button>
        )}
      </div>

      {myCases.length > 0 && (
        <div className="dig-block">
          <h3>{tr(lang, "โจทย์ชีวิตจริงที่ใช้มาตรานี้", "Real-life puzzles that use it", "用到本条的生活题")}</h3>
          {myCases.map((c) => (
            <Link key={c.id} className="dig-case" href={`/rights/?case=${c.id}`}>
              {c.prompt[lang]} →
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

// ---------- The written thread: what connects, in plain words ----------

function lineText(a: number, b: number, r: Reason, lang: Lang, go: (n: number) => void) {
  const A = <button className="inline-go" onClick={() => go(a)}>{sectionLabel(lang, a)}</button>;
  const B = <button className="inline-go" onClick={() => go(b)}>{sectionLabel(lang, b)}</button>;
  switch (r.kind) {
    case "cites":
    case "cited-by": {
      const [from, to] = r.kind === "cites" ? [A, B] : [B, A];
      return lang === "th" ? <>ตัวบท{from} เขียนถึง {to} โดยตรง</> : lang === "en" ? <>The text of {from} names {to} itself.</> : <>{from}的条文直接提到{to}。</>;
    }
    case "topic":
      return lang === "th" ? <>{A} กับ {B} อยู่ในเรื่อง “{r.label.th}”</> : lang === "en" ? <>{A} and {B} sit under “{r.label.en}”.</> : <>{A}与{B}同属“{r.label.zh}”。</>;
    case "term":
      return lang === "th" ? <>{A} กับ {B} เกี่ยวกับคำว่า “{r.label.th}”</> : lang === "en" ? <>{A} and {B} share the term “{r.label.en}”.</> : <>{A}与{B}都涉及“{r.label.zh}”。</>;
    case "question":
      return lang === "th" ? <>มีข้อฝึกที่ถาม {A} กับ {B} คู่กัน</> : lang === "en" ? <>One practice question asks about {A} and {B} together.</> : <>有一道练习题同时考{A}和{B}。</>;
  }
}

export function Thread({ mine, next, onGo }: { mine: number[]; next: { n: number; via: number[] }[]; onGo: (n: number) => void }) {
  const { lang } = useStudy();
  const groups = clusters(mine);
  const joined = new Set(groups.flat());
  const single = mine.filter((n) => !joined.has(n));
  const go = (n: number) => onGo(n);
  const L = (n: number) => (
    <button key={n} className="inline-go" onClick={() => go(n)}>
      {sectionLabel(lang, n)}
    </button>
  );
  if (!mine.length)
    return (
      <section className="thread">
        <h2>{tr(lang, "เริ่มจากศูนย์กลางของรัฐธรรมนูญ", "Start where the constitution meets itself", "从宪法的交汇点开始")}</h2>
        <p>
          {tr(
            lang,
            "ยังไม่มีจุดของคุณ เส้นจาง ๆ บนแผนที่คือที่ตัวบทเขียนถึงมาตราอื่นเอง มาตราเหล่านี้ถูกเขียนถึงบ่อยที่สุด อ่านสักมาตราแล้วไฮไลต์ จุดแรกของคุณจะขึ้นที่นี่",
            "No dots of your own yet. The faint lines on the map are places where the text names another section. These are named most often. Read one and highlight something; your first dot appears here.",
            "你还没有自己的点。图上的淡线是条文点名其他条文的地方。下面这些条文被提到得最多。读一条并标记，你的第一个点就会出现在这里。",
          )}
        </p>
        <ul className="thread-list">
          {mostCited(6).map(({ n, times }) => (
            <li key={n}>
              {L(n)} <span className="micro">{tr(lang, `ถูกเขียนถึง ${times} ครั้ง`, `named ${times} times`, `被提到 ${times} 次`)} · {lead(n).slice(0, 48)}…</span>
            </li>
          ))}
        </ul>
      </section>
    );
  return (
    <section className="thread">
      <h2>{tr(lang, "เส้นที่เชื่อมจุดของคุณ", "What connects your dots", "连接你的点的线")}</h2>
      {groups.length === 0 && (
        <p>{tr(lang, "จุดของคุณยังไม่ต่อกัน ลองอ่านจุดถัดไปด้านล่าง เส้นแรกจะปรากฏ", "Your dots do not connect yet. Read one of the next dots below and the first line appears.", "你的点还没有连起来。读一读下面的“下一个点”，第一条线就会出现。")}</p>
      )}
      {groups.slice(0, 5).map((g) => {
        const spans = [...new Set(g.map((n) => chapterOf(n).number))];
        return (
          <article key={g.join("-")} className="thread-group">
            <h3>
              {tr(lang, `${g.length} จุดต่อกันเป็นเส้นเดียว`, `${g.length} of your dots form one line`, `${g.length} 个点连成一条线`)}
              {spans.length > 1 &&
                tr(
                  lang,
                  ` ข้าม ${spans.map((c) => (c === 17 ? "บทเฉพาะกาล" : `หมวด ${c}`)).join(" → ")}`,
                  `, across ${spans.map((c) => (c === 17 ? "transitory provisions" : `chapter ${c}`)).join(" → ")}`,
                  `，跨越${spans.map((c) => (c === 17 ? "过渡条款" : `第${c}章`)).join(" → ")}`,
                )}
            </h3>
            <p className="thread-members">{g.map((n, i) => <span key={n}>{i > 0 && " · "}{L(n)}</span>)}</p>
            <ul className="thread-list">
              {threadLines(g).map((l) => (
                <li key={`${l.a}-${l.b}`}>{lineText(l.a, l.b, l.reason, lang, go)}</li>
              ))}
            </ul>
          </article>
        );
      })}
      {single.length > 0 && (
        <p className="micro">
          {tr(lang, "ยังเป็นจุดเดี่ยว: ", "Still on their own: ", "仍是孤立的点：")}
          {single.map((n, i) => <span key={n}>{i > 0 && " · "}{L(n)}</span>)}
        </p>
      )}
      {next.length > 0 && (
        <>
          <h3>{tr(lang, "จุดที่ควรอ่านต่อ", "Dots still to read", "还可以读这些点")}</h3>
          <ul className="thread-list">
            {next.map((d) => (
              <li key={d.n}>
                {L(d.n)}{" "}
                <span className="micro">
                  {tr(lang, "เชื่อมกับจุดของคุณ ", "links to your ", "连接你的 ")}
                  {d.via.map((v, i) => <span key={v}>{i > 0 && ", "}{sectionLabel(lang, v)}</span>)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

// ---------- On a section page: where to dig next ----------

export function Connections({ n }: { n: number }) {
  const { lang } = useStudy();
  const near = neighbours(n).slice(0, 6);
  if (!near.length) return null;
  return (
    <section className="connections">
      <h2>{tr(lang, "มาตรานี้เชื่อมกับ", "This section connects to", "本条连接到")}</h2>
      <ul className="dig-links">
        {near.map((nb) => (
          <li key={nb.n}>
            <Link className="dig-go" href={`/section/?n=${nb.n}`}>
              {sectionLabel(lang, nb.n)}
            </Link>
            <span>
              {nb.reasons.slice(0, 2).map((r, i) => (
                <span key={i} className="dig-reason">
                  <span className="mono">{sourceTag(r, lang)}</span> {reasonText(r, nb.n, lang)}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
      <Link href={`/notes/#dot-${n}`}>
        {tr(lang, "ดูบนแผนที่ของคุณ", "See it on your map", "在你的地图上查看")} →
      </Link>
    </section>
  );
}
