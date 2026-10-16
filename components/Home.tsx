"use client";
import Image from "next/image";
import { useMemo } from "react";
import Link from "next/link";
import { questionIndex } from "@/lib/outline";
import { dueQuestions } from "@/lib/learning";
import { continueTarget, missCount, weakSection } from "@/lib/continue";
import { GUIDE } from "@/lib/nav";
import { useStudy } from "./Provider";
import { tr } from "@/lib/i18n";

export function Home() {
  const { lang, progress, read } = useStudy();
  const plan = useMemo(() => {
    const last = Object.entries(read).sort((a, b) => b[1] - a[1])[0];
    const due = dueQuestions(questionIndex, progress, Date.now()).length;
    const weak = weakSection(questionIndex, progress);
    const target = continueTarget({
      due,
      weak,
      lastSection: last ? Number(last[0]) : null,
    });
    const misses = target.section ? missCount(questionIndex, progress, target.section) : 0;
    return { target, due, misses, lastSection: last ? Number(last[0]) : null };
  }, [progress, read]);
  const { target } = plan;
  const guide = GUIDE.find((item) => target.href.endsWith(`/${item.slug}/`));
  const guideIndex = guide ? GUIDE.indexOf(guide) + 1 : 1;
  const missed =
    plan.misses === 1
      ? tr(lang, "พลาด 1 ครั้ง", "missed once", "错过1次")
      : plan.misses === 2
        ? tr(lang, "พลาด 2 ครั้ง", "missed twice", "错过2次")
        : tr(lang, `พลาด ${plan.misses} ครั้ง`, `missed ${plan.misses} times`, `错过${plan.misses}次`);
  const label =
    target.kind === "review"
      ? tr(lang, "ต่อ: ทบทวนข้อที่ถึงเวลา", "Continue: the reviews that are due", "继续：到期的复习")
      : target.kind === "drill"
        ? tr(lang, `ต่อ: มาตรา ${target.section}`, `Continue: section ${target.section}`, `继续：第${target.section}条`)
        : tr(
            lang,
            `ต่อ: บทที่ ${guideIndex} · ${guide?.title.th ?? "ประวัติ"}`,
            `Continue: Chapter ${guideIndex} · ${guide?.title.en ?? "History"}`,
            `继续：第${guideIndex}章 · ${guide?.title.zh ?? "历史"}`,
          );
  const reason =
    target.kind === "review"
      ? tr(lang, `มีข้อทบทวนถึงเวลา ${plan.due} ข้อ`, `${plan.due} reviews are due`, `有${plan.due}道复习到期`)
      : target.kind === "drill"
        ? tr(lang, `ฝึก ม.${target.section} ${missed}`, `Drill s.${target.section}, ${missed}`, `练习第${target.section}条，${missed}`)
        : plan.lastSection
          ? tr(
              lang,
              `ยังไม่มีข้อถึงเวลาทบทวน บทถัดไปในคู่มืออยู่หลังมาตรา ${plan.lastSection}`,
              `Nothing is due. The next chapter of the guide follows section ${plan.lastSection}.`,
              `没有到期的复习。指南的下一章接在第${plan.lastSection}条之后。`,
            )
          : tr(lang, "ยังไม่มีข้อถึงเวลาทบทวน จึงเริ่มที่คู่มือ", "Nothing due yet, so start the guide", "还没有到期的复习，所以从指南开始");
  return (
    <section className="hero">
      <figure className="hero-art" aria-hidden="true">
        <Image
          src="/illustrations/reading-pastel.webp"
          alt=""
          width={720}
          height={720}
          priority
          sizes="(max-width: 720px) 100vw, 46vw"
        />
      </figure>
      <div className="hero-copy">
        <h1>{tr(lang, "ค่อย ๆ อ่าน\nค่อย ๆ เข้าใจ", "One section.\nOne small step.", "一条一条读，\n一点一点懂。")}</h1>
        <p>
          {tr(
            lang,
            "เริ่มจากขั้นถัดไปที่สมุดเลือกให้ จากข้อที่ถึงเวลาทบทวน ข้อที่ยังพลาด หรือบทถัดไปในคู่มือ",
            "Start from the step this notebook chooses: a review that is due, a section you miss, or the next chapter of the guide.",
            "从这本笔记选定的下一步开始：到期的复习、你还错过的条文，或指南的下一章。",
          )}
        </p>
        <Link className="primary hero-cta" href={target.href}>
          <span>{label}</span>
          <span aria-hidden="true">→</span>
        </Link>
        <p className="micro">{reason}</p>
      </div>
    </section>
  );
}
