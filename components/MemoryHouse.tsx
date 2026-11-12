"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { palace } from "@/lib/palace";
import { rulesInChapter } from "@/lib/rules";
import { chapters, questionIndex } from "@/lib/outline";
import { lessonQueue } from "@/lib/learning";
import { toggleBookmark } from "@/lib/marks";
import { sectionLabel, tr } from "@/lib/i18n";
import { useStudy } from "./Provider";
import { PalacePicture } from "./MemoryCue";
const Quiz = dynamic(() => import("./Quiz").then((m) => m.Quiz));

/**
 * The numbers a room holds.
 *
 * The room is a place; the numbers in it are the objects a learner has to
 * pick up. Before this, a room carried a § label and a joke, and the
 * numbers the exam asks about lived on a separate sheet with no picture and
 * no handle — so the house taught no number at all. Each entry here names
 * the number, the rule it decides, and the image that carries it.
 */
function RuleShelf({ chapter }: { chapter: number }) {
  const { lang } = useStudy();
  const held = rulesInChapter(chapter).filter((r) => r.number);
  if (!held.length) return null;
  const title = tr(
    lang,
    `ตัวเลขในห้องนี้ (${held.length})`,
    `The numbers in this room (${held.length})`,
    `本房间的数字（${held.length}）`,
  );
  // A room with a dozen numbers would push the sections off the screen, so a
  // long shelf stays closed until asked. Each row is the number and what it
  // decides; the handle for it is on the cram sheet.
  const rows = (
    <ul>
      {held.map((rule) => (
        <li key={rule.id}>
          <span className="palace-shelf-number">{rule.number?.[lang]}</span>
          <span>{rule.label[lang]}</span>
        </li>
      ))}
    </ul>
  );
  return held.length > 8 ? (
    <details className="palace-shelf">
      <summary>{title}</summary>
      {rows}
    </details>
  ) : (
    <section className="palace-shelf" aria-label={title}>
      <h3>{title}</h3>
      {rows}
    </section>
  );
}

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
  const chapter = chapters.find((c) => c.number === selected);
  if (exercise) return <Quiz ids={exercise} onExit={() => setExercise(null)} />;
  return (
    <section className="memory-house">
      <h1>
        {tr(
          lang,
          "บ้านความจำ",
          "Memory house",
          "记忆屋",
        )}
      </h1>
      <details className="memory-method"><summary>{tr(lang,"วิธีใช้บ้าน 16 ห้อง","How to use the sixteen rooms","十六个房间怎么用")}</summary>      <p>
        {tr(
          lang,
          "16 ห้องสำหรับ 16 หมวด มองภาพ นึกกฎ แล้วลองเรียกคำตอบกลับมา แต่ละห้องยังมีตัวเลขที่ต้องจำอยู่ในนั้น เรื่องและมุกเป็นเครื่องช่วยจำ ตัวบทเป็นแหล่งตัดสิน",
          "Sixteen rooms for the sixteen numbered chapters. See the picture, recall the rule, then try a question — and each room holds the numbers you must remember in it. Stories and jokes are cues; the text decides the law.",
          "十六个房间，对应宪法的十六个编号章节。看图、回想规则，再试着作答——每个房间还放着你必须记住的数字。故事与笑话是线索，条文才是法律依据。",
        )}
      </p>
</details>
      <article ref={detail} className="palace-room" id={`room-detail-${selected}`}>
        <div className="room-heading">
          <h2 tabIndex={-1}>{chapters.find((c) => c.number === selected)?.title[lang]}</h2>
          <a href="#memory-rooms">{tr(lang,"เลือกห้องอื่น","Choose another room","选择其他房间")} ↑</a>
        </div>
        {/* The room's extent, in sections. The news desk points at this room
            with the section numbers of a subject that lie inside this
            chapter, and a reader who follows the link can only check that
            claim if the room says how far it reaches. */}
        <p className="micro palace-extent">
          {chapter
            ? tr(
                lang,
                chapter.start === chapter.end
                  ? `บทนี้คือมาตรา ${chapter.start}`
                  : `บทนี้คือมาตรา ${chapter.start}–${chapter.end}`,
                chapter.start === chapter.end
                  ? `This chapter is section ${chapter.start}`
                  : `This chapter is sections ${chapter.start}–${chapter.end}`,
                chapter.start === chapter.end
                  ? `本章为第${chapter.start}条`
                  : `本章为第${chapter.start}–${chapter.end}条`,
              )
            : null}
        </p>
        <figure>
          <PalacePicture chapter={selected} />
          <figcaption>
            <strong className="palace-number">{p.number}</strong>
            <p>{p.joke[lang]}</p>
          </figcaption>
        </figure>
          <button
            className="primary action-panel-cta"
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
              "ลองตอบไม่เกิน 5 ข้อ",
              "Try up to five recall questions",
              "尝试最多五道回忆题",
            )}
            <span aria-hidden="true">→</span>
          </button>
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
        <RuleShelf chapter={selected} />
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
        <p className="micro">
          {tr(
            lang,
            "เลข § บนภาพคือเลขมาตรา ส่วนตัวเลขในชั้นข้างล่างคือจำนวนจริง ภาพอาจไม่วาดวัตถุครบตามตัวเลข ใช้คำอธิบายกำกับเสมอ วิธีช่วยจำนี้ยังไม่ได้พิสูจน์ผลกับผู้ใช้แอป",
            "The § on the picture is a section number; the numbers on the shelf below are real counts. Artwork need not contain every counted object; use the caption. This app’s memory cues have not yet been evaluated with learners.",
            "图上的§是条号，下方架子上的数字才是真实计数。图画未必画出所有计数对象，请以说明为准。这些记忆线索尚未对本应用学习者进行效果评估。",
          )}
        </p>
      </article>

      <nav
        id="memory-rooms"
        className="palace-index"
        aria-label={tr(lang, "เลือกห้อง", "Choose a room", "选择房间")}
      >
        {palace.map((room) => (
          <button
            key={room.chapter}
            /* Every room has its anchor in the served page, not only the one
               that happens to be open when the page is first painted. A link
               from the news desk into room 12 must land on something: in a
               static export the fragment is resolved against the document
               that was served, so the room that is not open yet still needs
               an id to aim at. */
            id={`room-${room.chapter}`}
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
        <RuleShelf chapter={17} />
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
