"use client";
import { useState } from "react";
import { useStudy } from "./Provider";
import { SideQuestionCard } from "./SideQuestion";
import { sideQuestions } from "@/lib/side";
import { fisherYates } from "@/lib/shuffle";
import { tr } from "@/lib/i18n";

// All the exam topics met along the way, one after another, for a night of cramming.
export function AlongTheWay() {
  const { lang } = useStudy();
  const [order, setOrder] = useState(() => fisherYates(sideQuestions.map((_, i) => i)));
  const [at, setAt] = useState(0);
  const q = sideQuestions[order[at]];
  const inLaw = sideQuestions.filter((x) => x.sections.length).length;
  return (
    <>
      <h1>{tr(lang, "แนวข้อสอบนายอำเภอและท้องถิ่น", "District-chief and local exam topics", "县长与地方考试题型")}</h1>
      <p>
        {tr(
          lang,
          `${sideQuestions.length} ข้อจากหัวข้อที่ออกสอบนายอำเภอ ปี 2568 ${inLaw} ข้อโยงกับมาตราในรัฐธรรมนูญ ที่เหลือเป็นความรู้รอบตัว แนวคิดบริหาร และเรื่องปัจจุบัน ข้อเหล่านี้โผล่มาระหว่างบทเรียนด้วย ข้อที่เป็นตัวเลขหรือข่าวมีที่มาและวันที่กำกับไว้ ตรวจกับแหล่งล่าสุดก่อนสอบ`,
          `${sideQuestions.length} questions from the topics of the 2025 district-chief exam. ${inLaw} tie to a section of the constitution; the rest are general knowledge, management ideas and current affairs. They also turn up inside the lessons. Figures and news carry a source and date; check the latest before the exam.`,
          `${sideQuestions.length}道题，来自2025年县长考试的出题范围。其中${inLaw}道与宪法条文相关，其余为常识、管理理论与时事。它们也会出现在课程中。数字和时事都注明来源与日期，考前请核对最新资料。`,
        )}
      </p>
      {q ? (
        <>
          <p className="micro">
            {at + 1} / {sideQuestions.length}
          </p>
          <SideQuestionCard
            key={q.id}
            q={q}
            onDone={() => setAt((n) => n + 1)}
            doneLabel={tr(lang, "ข้อต่อไป", "Next question", "下一题")}
          />
        </>
      ) : (
        <button
          className="primary"
          onClick={() => {
            setOrder(fisherYates(sideQuestions.map((_, i) => i)));
            setAt(0);
          }}
        >
          {tr(lang, "ครบทุกข้อแล้ว เริ่มใหม่อีกรอบ", "That's all of them. Start again", "全部完成，再来一轮")} →
        </button>
      )}
    </>
  );
}
