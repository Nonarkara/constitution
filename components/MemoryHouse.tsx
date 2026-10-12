"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { palace } from "@/lib/palace";
import { chapters, questionIndex } from "@/lib/outline";
import { lessonQueue } from "@/lib/learning";
import { toggleBookmark } from "@/lib/marks";
import { sectionLabel, tr } from "@/lib/i18n";
import { useStudy } from "./Provider";
import { PalacePicture } from "./MemoryCue";
const Quiz = dynamic(() => import("./Quiz").then((m) => m.Quiz));
export function MemoryHouse() {
  const { lang, marks, saveMarks, progress, ready } = useStudy();
  const [selected, setSelected] = useState(1),
    [show, setShow] = useState(true),
    [exercise, setExercise] = useState<string[] | null>(null);
  useEffect(() => {
    const sync = () => {
      const n = Number(location.hash.replace("#room-", ""));
      if (palace.some((p) => p.chapter === n)) setSelected(n);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const detail = useRef<HTMLElement>(null);
  useEffect(() => {
    if (location.hash === `#room-${selected}`) {
      detail.current?.scrollIntoView({ block: "start", behavior: "auto" });
      detail.current
        ?.querySelector<HTMLHeadingElement>("h2")
        ?.focus({ preventScroll: true });
    }
  }, [selected, exercise]);
  const p = palace.find((p) => p.chapter === selected)!;
  if (exercise) return <Quiz ids={exercise} onExit={() => setExercise(null)} />;
  return (
    <section className="memory-house">
      <h1>
        {tr(
          lang,
          "เดินบ้านเดียว จำได้หลายเรื่อง",
          "One house. Many things to remember.",
          "一座屋，记住许多事。",
        )}
      </h1>
      <p>
        {tr(
          lang,
          "16 ห้องแทน 16 หมวด มองภาพ นึกกฎ แล้วลองเรียกคำตอบกลับมา เรื่องและมุกเป็นเครื่องช่วยจำ ตัวบทเป็นแหล่งตัดสิน",
          "Sixteen rooms for sixteen chapters. See the picture, recall the rule, then try a question. Stories and jokes are cues; the text decides the law.",
          "十六个房间对应十六章。看图、回想规则，再试着作答。故事与笑话是线索，条文才是法律依据。",
        )}
      </p>
      <nav
        id="memory-rooms"
        className="palace-index"
        aria-label={tr(lang, "เลือกห้อง", "Choose a room", "选择房间")}
      >
        {palace.map((room) => (
          <button
            key={room.chapter}
            aria-pressed={selected === room.chapter}
            onClick={() => {
              setSelected(room.chapter);
              setShow(true);
              history.replaceState(null, "", `#room-${room.chapter}`);
              detail.current?.scrollIntoView({
                block: "start",
                behavior: "auto",
              });
              detail.current
                ?.querySelector<HTMLHeadingElement>("h2")
                ?.focus({ preventScroll: true });
            }}
          >
            <PalacePicture chapter={room.chapter} small />
            <span>
              {room.chapter}.{" "}
              {chapters.find((c) => c.number === room.chapter)?.title[lang]}
            </span>
          </button>
        ))}
      </nav>
      <article ref={detail} className="palace-room" id={`room-${selected}`}>
        <p>
          <a href="#memory-rooms">
            {tr(lang, "เลือกห้องอื่น", "Choose another room", "选择其他房间")} ↑
          </a>
        </p>
        <h2 tabIndex={-1}>
          {chapters.find((c) => c.number === selected)?.title[lang]}
        </h2>
        <figure>
          <PalacePicture chapter={selected} />
          <figcaption>
            <strong className="palace-number">{p.number}</strong>
            <p>{p.joke[lang]}</p>
          </figcaption>
        </figure>
        <p>
          <strong>{p.check[lang]}</strong>
        </p>
        <button aria-expanded={show} onClick={() => setShow((v) => !v)}>
          {show
            ? tr(
                lang,
                "ซ่อนความหมายแล้วลองจำ",
                "Hide the meaning and recall",
                "隐藏含义，试着回忆",
              )
            : tr(lang, "เปิดความหมาย", "Reveal the meaning", "显示含义")}
        </button>
        {show && <p className="notice">{p.meaning[lang]}</p>}
        <div className="civic-law-list">
          {p.sections.map((n) => (
            <div key={n}>
              <Link href={`/section/?n=${n}`}>{sectionLabel(lang, n)} →</Link>
              <button
                disabled={!ready}
                aria-pressed={marks.bookmarks.includes(n)}
                onClick={() => saveMarks(toggleBookmark(marks, n))}
              >
                {marks.bookmarks.includes(n)
                  ? tr(lang, "คั่นไว้แล้ว", "Bookmarked", "已收藏")
                  : tr(lang, "เก็บไว้ทบทวน", "Save for review", "收藏以便复习")}
              </button>
            </div>
          ))}
        </div>
        <button
          className="primary"
          disabled={!ready}
          onClick={() =>
            setExercise(
              (lessonQueue(questionIndex, progress, selected, Date.now(), 5)
                .length
                ? lessonQueue(questionIndex, progress, selected, Date.now(), 5)
                : questionIndex
                    .filter((q) => q.chapter === selected)
                    .slice(0, 5)
              ).map((q) => q.id),
            )
          }
        >
          {tr(
            lang,
            "ลองเรียกคืน 5 ข้อหรือน้อยกว่า",
            "Try up to five recall questions",
            "尝试最多五道回忆题",
          )}{" "}
          →
        </button>
        <p className="micro">
          {tr(
            lang,
            "จำนวนบนภาพที่มี § คือเลขมาตรา ไม่ใช่จำนวนคนหรือปี ภาพอาจไม่วาดวัตถุครบตามตัวเลข ใช้คำอธิบายกำกับเสมอ วิธีช่วยจำนี้ยังไม่ได้พิสูจน์ผลกับผู้ใช้แอป",
            "A § label is a section number, not a count of people or years. Artwork need not contain every counted object; use the caption. This app’s memory cues have not yet been evaluated with learners.",
            "带§的是条号，不是人数或年数。图画未必画出所有计数对象，请以说明为准。这些记忆线索尚未对本应用学习者进行效果评估。",
          )}
        </p>
      </article>
      <p>
        <Link href="/civic/">
          {tr(lang, "ลองตรวจคำสัญญา", "Try checking a promise", "试着核查承诺")}{" "}
          →
        </Link>{" "}
        ·{" "}
        <Link href="/notes/">
          {tr(
            lang,
            "สิ่งที่คั่นไว้และรู้แล้ว",
            "Your bookmarks and progress",
            "收藏与学习进度",
          )}{" "}
          →
        </Link>
      </p>
      <aside>
        <h2>
          {tr(
            lang,
            "ห้องเก็บของ: บทเฉพาะกาล",
            "The attic: transitory provisions",
            "阁楼：过渡条款",
          )}
        </h2>
        <p>
          {tr(
            lang,
            "เก็บบทเฉพาะกาลไว้แยกต่างหาก กฎบางข้อผูกกับช่วงเวลาในอดีต อย่าเอาตัวเลขหรืออำนาจที่หมดช่วงใช้มาแทนกฎปัจจุบัน",
            "Keep transitory provisions in a separate attic. Some rules concern past periods; do not substitute expired numbers or powers for current rules.",
            "将过渡条款放在单独的阁楼。有些规则针对过去阶段，不要用已届满的数字或权力代替现行规则。",
          )}
        </p>
        <Link href="/section/?n=269">
          {tr(
            lang,
            "อ่านบทเฉพาะกาลพร้อมบริบท",
            "Read the transitory provisions with context",
            "结合背景阅读过渡条款",
          )}{" "}
          →
        </Link>
      </aside>
    </section>
  );
}
