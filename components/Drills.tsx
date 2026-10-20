"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { makeDrill, drillNames, drillId, DRILL_COUNT } from "@/lib/drills";
import { prioritizedReview } from "@/lib/review-queue";
import { useStudy } from "./Provider";
import { tr } from "@/lib/i18n";
import { StudyArt } from "./StudyArt";
const Quiz = dynamic(() => import("./Quiz").then((m) => m.Quiz));
export function Drills() {
  const { lang, progress, ready } = useStudy();
  const [active, setActive] = useState<number[] | null>(null);
  if (active)
    return (
      <Quiz supplied={active.map(makeDrill)} onExit={() => setActive(null)} />
    );
  const records = Array.from({ length: DRILL_COUNT }, (_, i) => ({
    id: drillId(i),
    i,
  }));
  const due = records.filter(
    (q) => progress.questions[q.id]?.due <= Date.now(),
  );
  return (
    <section>
      <div className="intro-copy">
        <StudyArt scene="drills" />
        <div className="intro-text">
          <h1>
            {tr(
              lang,
              "กฎเดิม เปลี่ยนเงื่อนไข",
              "Same rule, different conditions",
              "规则不变，条件改变",
          )}
          </h1>
          <p>
            {tr(
              lang,
              "รวม 4,700 แบบฝึก: โจทย์เขียนเอง 470 ข้อ และโจทย์เปลี่ยนตัวเลข 4,230 ข้อ เลือกแค่ 5 ข้อต่อรอบ โจทย์สร้างจากสูตรมีป้ายแยก ไม่ใช่ข้อสอบจริงหรือเรื่องเล่าใหม่ 4,230 เรื่อง",
              "4,700 exercises: 470 authored questions plus 4,230 parameter-generated drills. Try five at a time. Generated numerical cases are labelled; they are not official exam questions or 4,230 newly authored stories.",
              "共4,700道练习：470道原创题与4,230道参数生成题。每轮五题。生成的数字情境单独标明，不是官方真题，也不是4,230个新编故事。",
          )}
          </p>
        </div>
      </div>
      <p className="notice">
        {tr(
          lang,
          "ตัวเลขสมาชิกเป็นสมมติ เช็กเฉพาะเกณฑ์ที่ถาม ไม่สรุปว่าขั้นตอนทั้งกฎหมายจบแล้ว ความก้าวหน้าของโจทย์ชุดนี้แยกจากเกณฑ์ผ่านหมวดเดิม",
          "Membership numbers are fictional. Check the gate asked about, not completion of the entire legal process. Drill progress does not enlarge your existing chapter mastery requirement.",
          "成员人数是假设值，只检查题目所问门槛，不代表整个法律程序完成。这组进度不会提高原有章节掌握要求。",
        )}
      </p>
      {/* One thing to do. Ten equal family buttons used to sit here, and the
          only review button was disabled whenever nothing was due — so on a
          fresh account the page had nothing to press at all. */}
      <div className="action-panel">
        <span className="mono action-panel-kicker">
          {tr(lang, "เริ่มที่นี่", "Start here", "从这里开始")}
        </span>
        {due.length ? (
          <button
            className="primary action-panel-cta"
            disabled={!ready}
            onClick={() =>
              setActive(
                prioritizedReview(due, progress, Date.now(), 5).map((q) => q.i),
              )
            }
          >
            {tr(
              lang,
              `ทบทวนโจทย์ถึงเวลา ${due.length} ข้อ`,
              `Review ${due.length} due drills`,
              `复习${due.length}道到期题`,
            )}{" "}
            →
          </button>
        ) : (
          <button
            className="primary action-panel-cta"
            disabled={!ready}
            onClick={() => {
              const own = records.slice(0, 423);
              setActive(
                prioritizedReview(own, progress, Date.now(), 5).map((q) => q.i),
              );
            }}
          >
            {tr(lang, "ลองห้าข้อ", "Try five", "试五题")} →
          </button>
        )}
        <p className="micro action-panel-reason">
          {due.length
            ? tr(
                lang,
                "ห้าข้อแรกเป็นโจทย์ที่พลาดมากที่สุดก่อน แล้วค่อยไปหมวดอื่น",
                "The five you missed most come first; the rest wait their turn.",
                "先做错得最多的五题，其余的按顺序来。",
              )
            : tr(
                lang,
                "ยังไม่มีโจทย์ถึงเวลาทบทวน เริ่มจากห้าข้อแรกของชุดแรก แล้วค่อยเลือกชุดอื่นด้านล่าง",
                "Nothing is due for review yet. Start with the first five of the first set, then pick another set below.",
                "还没有到期的复习题。先做第一组的前五题，再从下面选其他组。",
              )}
        </p>
      </div>
      <h2 className="hub-others-title">
        {tr(lang, "หรือเลือกชุดอื่น", "Or pick another set", "或选择其他组")}
      </h2>
      <nav className="hub-list">
        {drillNames.map((name, f) => (
          <button
            key={f}
            disabled={!ready}
            onClick={() => {
              const own = records.slice(f * 423, (f + 1) * 423);
              setActive(
                prioritizedReview(own, progress, Date.now(), 5).map((q) => q.i),
              );
            }}
          >
            <strong>{name[lang]}</strong>
            <span className="micro">
              423 {tr(lang, "เงื่อนไขตัวเลข", "numerical cases", "数字情境")} ·{" "}
              {tr(lang, "ลอง 5 ข้อ", "Try five", "试五题")}
            </span>
          </button>
        ))}
      </nav>
      <p>
        <Link href="/bible/">
          {tr(
            lang,
            "กลับไปเข้าใจเรื่องก่อน",
            "Understand the idea first",
            "先理解概念",
          )}{" "}
          →
        </Link>{" "}
        ·{" "}
        <Link href="/exam/">
          {tr(lang, "30 ชุดข้อสอบฝึก", "30 study exam papers", "30套练习卷")} →
        </Link>
      </p>
    </section>
  );
}
