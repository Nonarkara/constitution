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
import { knowSummary, sectionSignals } from "@/lib/knowledge";

export function Home() {
  const { lang, progress, read, annotations, marks } = useStudy();
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

  const known = useMemo(() => {
    const now = Date.now();
    return knowSummary(sectionSignals({ progress, marks, annotations, read, questions: questionIndex, now }));
  }, [progress, marks, annotations, read]);

  const notesCount = useMemo(() => Object.keys(annotations).length, [annotations]);

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
    <div className="home-dashboard">
      <section className="hero">
        <div className="hero-copy">
          <span className="page-kicker mono">
            {tr(lang, "สมุดเรียนรัฐธรรมนูญ", "Constitutional Notebook", "宪法学习笔记")}
          </span>
          <h1>{tr(lang, "ค่อย ๆ อ่าน\nค่อย ๆ เข้าใจ", "One section.\nOne small step.", "一条一条读，\n一点一点懂。")}</h1>
          <p>
            {tr(
              lang,
              "เริ่มจากขั้นถัดไปที่สมุดเลือกให้ จากข้อที่ถึงเวลาทบทวน ข้อที่ยังพลาด หรือบทถัดไปในคู่มือ",
              "Start from the step this notebook chooses: a review that is due, a section you miss, or the next chapter of the guide.",
              "从这本笔记选定的下一步开始：到期的复习、你还错过的条文，或指南的下一章。",
            )}
          </p>
          <div className="hero-action-group">
            <Link className="primary hero-cta" href={target.href}>
              <span>{label}</span>
              <span aria-hidden="true">→</span>
            </Link>
            <p className="micro hero-reason">{reason}</p>
          </div>
        </div>
        <figure className="hero-art" aria-hidden="true">
          <Image
            src="/illustrations/reading-pastel.webp"
            alt=""
            width={720}
            height={720}
            priority
            sizes="(max-width: 720px) 110px, 260px"
          />
        </figure>
      </section>

      {/* Pulse Summary Bar */}
      <section className="home-pulse" aria-label={tr(lang, "สรุปการเรียนของคุณ", "Your study pulse", "学习概览")}>
        <div className="pulse-item">
          <span className="mono pulse-num">{known.met}<b>/279</b></span>
          <span className="pulse-label micro">{tr(lang, "มาตราที่อ่านแล้ว", "Sections read", "已读法条")}</span>
        </div>
        <div className="pulse-divider" aria-hidden="true" />
        <div className="pulse-item">
          <span className="mono pulse-num">{plan.due}</span>
          <span className="pulse-label micro">{tr(lang, "ข้อที่ถึงเวลาทบทวน", "Due for review", "到期复习")}</span>
        </div>
        <div className="pulse-divider" aria-hidden="true" />
        <div className="pulse-item">
          <span className="mono pulse-num">{notesCount}</span>
          <span className="pulse-label micro">{tr(lang, "มาตราที่มีบันทึก", "Annotated sections", "笔记条数")}</span>
        </div>
        <div className="pulse-divider" aria-hidden="true" />
        <div className="pulse-item">
          <Link href="/notebook/" className="pulse-link micro">
            {tr(lang, "เปิดสมุดคู่หน้า", "Open Notebook", "打开双页")} →
          </Link>
        </div>
      </section>

      {/* 4 Core Learning Pathways */}
      <section className="home-pathways" aria-label={tr(lang, "เส้นทางการเรียน", "Learning pathways", "学习路径")}>
        <div className="pathway-card">
          <div className="pathway-head">
            <span className="pathway-tag mono">{tr(lang, "อ่าน", "READ", "阅读")}</span>
            <span className="micro text-muted">279 {tr(lang, "มาตรา", "sections", "条")}</span>
          </div>
          <h3>
            <Link href="/notebook/">
              {tr(lang, "สมุดคู่หน้า 279 มาตรา", "Double-Page Notebook", "双页开本宪法全书")}
            </Link>
          </h3>
          <p className="micro">
            {tr(
              lang,
              "อ่านเปิดกางเหมือนหนังสือบนโต๊ะ ไฮไลต์ 4 สี จดโน้ตข้างตัวบท พร้อมเทียบภาษาไทย อังกฤษ และจีน",
              "Open like a book on the desk. 4-colour highlighters, margin notes and 3-language side-by-side text.",
              "像摊开在桌上的书一样阅读。4色高亮、条文边注及中英泰三语对照。",
            )}
          </p>
          <div className="pathway-actions micro">
            <Link href="/notebook/">{tr(lang, "เปิดสมุดคู่หน้า", "Spread View", "双页视图")} →</Link>
            <Link href="/read/" className="pulse-link">{tr(lang, "อ่านทีละมาตรา", "Single Section", "单条阅读")}</Link>
          </div>
        </div>

        <div className="pathway-card">
          <div className="pathway-head">
            <span className="pathway-tag mono">{tr(lang, "จำ", "RECALL", "记忆")}</span>
            <span className="micro text-muted">16 {tr(lang, "ห้อง", "rooms", "房间")}</span>
          </div>
          <h3>
            <Link href="/memory/">
              {tr(lang, "วังความจำ & การ์ดช่วยจำ", "Memory Palace & Flashcards", "记忆宫殿与闪卡")}
            </Link>
          </h3>
          <p className="micro">
            {tr(
              lang,
              "จำโครงสร้างด้วยภาพอาคาร 16 ห้อง พลิกการ์ดทวนความจำ และแผ่นสรุปตัวเลข 41 ค่าที่ออกสอบบ่อย",
              "16-room spatial memory palace, flip-to-recall flashcards, and a 41-number exam cram sheet.",
              "16间空间记忆宫殿、翻转闪卡和41个高频考点核心数字速记表。",
            )}
          </p>
          <div className="pathway-actions micro">
            <Link href="/memory/">{tr(lang, "เดินชมวังความจำ", "Memory Palace", "记忆宫殿")} →</Link>
            <Link href="/cram/" className="pulse-link">{tr(lang, "สูตรตัวเลข", "Cram Sheet", "数字速记")}</Link>
            <Link href="/flashcards/" className="pulse-link">{tr(lang, "การ์ด", "Cards", "闪卡")}</Link>
          </div>
        </div>

        <div className="pathway-card">
          <div className="pathway-head">
            <span className="pathway-tag mono">{tr(lang, "ฝึก", "DRILL", "练习")}</span>
            <span className="micro text-muted">4,700 {tr(lang, "ข้อ", "exercises", "题")}</span>
          </div>
          <h3>
            <Link href="/practice/">
              {tr(lang, "สนามฝึกตอบ & ข้อสอบจำลอง", "Practice Arena & Mock Exams", "练习场与模拟考")}
            </Link>
          </h3>
          <p className="micro">
            {tr(
              lang,
              "รอบฝึกผสมแบบปรับตัวตามผู้เรียน เจาะจุดที่พลาดบ่อย และ 30 ชุดข้อสอบจำลองจับเวลาพร้อมตรวจผล",
              "Adaptive mixed practice sessions, targeted weak-point drills, and 30 timed mock papers.",
              "自适应混合练习、错题针对性巩固以及30套计时全真模拟考卷。",
            )}
          </p>
          <div className="pathway-actions micro">
            <Link href="/practice/">{tr(lang, "เริ่มรอบฝึก", "Start Practice", "开始练习")} →</Link>
            <Link href="/exam/" className="pulse-link">{tr(lang, "ข้อสอบจำลอง", "30 Mock Papers", "模拟考卷")}</Link>
          </div>
        </div>

        <div className="pathway-card">
          <div className="pathway-head">
            <span className="pathway-tag mono">{tr(lang, "เข้าใจ", "GUIDE", "指南")}</span>
            <span className="micro text-muted">10 {tr(lang, "บท", "chapters", "章")}</span>
          </div>
          <h3>
            <Link href="/bible/">
              {tr(lang, "คู่มือเจาะลึก & สิทธิพลเมือง", "Study Bible & Civic Rights", "深入指南与公民权利")}
            </Link>
          </h3>
          <p className="micro">
            {tr(
              lang,
              "คู่มืออ่านกฎหมาย 10 บท แผนผังกลไก สิทธิพลเมือง 22 ด้าน และ 90 แนวข้อสอบสำคัญระดับอำเภอ",
              "10-chapter study guide, constitutional diagrams, 22 civic rights, and 90 district exam topics.",
              "10章法理导读、机构运行图解、22项公民基本权利与90道关键考点。",
            )}
          </p>
          <div className="pathway-actions micro">
            <Link href="/bible/">{tr(lang, "อ่านคู่มือ 10 บท", "Read Guide", "阅读指南")} →</Link>
            <Link href="/rights/" className="pulse-link">{tr(lang, "สิทธิพลเมือง", "Civic Rights", "公民权利")}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
