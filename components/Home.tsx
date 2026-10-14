"use client";
import Image from "next/image";
import { useMemo } from "react";
import Link from "next/link";
import { questionIndex } from "@/lib/outline";
import { dueQuestions } from "@/lib/learning";
import { continueTarget, weakSection } from "@/lib/continue";
import { GUIDE } from "@/lib/nav";
import { useStudy } from "./Provider";
import { tr } from "@/lib/i18n";

export function Home() {
  const { lang, progress, read } = useStudy();
  const target = useMemo(() => {
    const last = Object.entries(read).sort((a, b) => b[1] - a[1])[0];
    return continueTarget({
      due: dueQuestions(questionIndex, progress, Date.now()).length,
      weak: weakSection(questionIndex, progress),
      lastSection: last ? Number(last[0]) : null,
    });
  }, [progress, read]);
  const guide = GUIDE.find((item) => target.href.endsWith(`/${item.slug}/`));
  const label =
    target.kind === "review"
      ? tr(lang, "ต่อไป: ทบทวนข้อที่ถึงเวลา", "Next: review what's due", "下一步：复习到期的题")
      : target.kind === "drill"
        ? tr(
            lang,
            `ต่อไป: ฝึกมาตรา ${target.section}`,
            `Next: drill section ${target.section}`,
            `下一步：练习第${target.section}条`,
          )
        : tr(
            lang,
            `ต่อไป: ${guide?.label.th ?? "เรียน"}`,
            `Next: ${guide?.label.en ?? "the study guide"}`,
            `下一步：${guide?.label.zh ?? "学习指南"}`,
          );
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
      </div>
    </section>
  );
}
