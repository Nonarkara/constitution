"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { makeDrill, drillNames, drillId, DRILL_COUNT } from "@/lib/drills";
import { prioritizedReview } from "@/lib/review-queue";
import { useStudy } from "./Provider";
import { tr } from "@/lib/i18n";
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
      <p className="notice">
        {tr(
          lang,
          "ตัวเลขสมาชิกเป็นสมมติ เช็กเฉพาะเกณฑ์ที่ถาม ไม่สรุปว่าขั้นตอนทั้งกฎหมายจบแล้ว ความก้าวหน้าของโจทย์ชุดนี้แยกจากเกณฑ์ผ่านหมวดเดิม",
          "Membership numbers are fictional. Check the gate asked about, not completion of the entire legal process. Drill progress does not enlarge your existing chapter mastery requirement.",
          "成员人数是假设值，只检查题目所问门槛，不代表整个法律程序完成。这组进度不会提高原有章节掌握要求。",
        )}
      </p>
      <button
        disabled={!ready || !due.length}
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
        <Link href="/learn/">
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
