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
import { RIGHT_GROUPS } from "@/lib/rights";

// Counted from the data, never typed in. These were both wrong as literals
// once: the homepage said 10 guide chapters (there are 13) and 22 civic
// rights (there are 15), while the README already had 13 right.
const GUIDE_CHAPTERS = GUIDE.length;
const RIGHTS_COUNT = RIGHT_GROUPS.reduce((n, g) => n + g.ids.length, 0);

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

  // A pulse bar of three zeros and two divider rules tells a first-time visitor
  // nothing they can act on. Show the counters only once there is something in
  // them; the notebook link always stays.
  const showPulse = known.met > 0 || plan.due > 0 || notesCount > 0;

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

      {/* Pulse Summary Bar. Rendered as three zeros, two divider rules and a
          link to a first-time visitor — three counters that can only say zero
          before anyone has studied. The link is actionable, so it stays; the
          zeros and the rules they were separated by do not. */}
      <section className="home-pulse" aria-label={tr(lang, "สรุปการเรียนของคุณ", "Your study pulse", "学习概览")}>
        {showPulse && (
          <>
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
          </>
        )}
      </section>

      {/* Editorial Learning Architecture: One Dominant Anchor + Two Engines + Reference Shelf */}
      <section className="home-architecture" aria-label={tr(lang, "เส้นทางการเรียน", "Learning pathways", "学习路径")}>
        {/* Tier 1: Dominant Anchor - Double-Page Notebook */}
        <div className="home-anchor">
          <div className="anchor-badge mono">
            <span className="text-muted">279 {tr(lang, "มาตรา", "sections", "条")}</span>
          </div>
          <div className="anchor-content">
            <div className="anchor-copy">
              <h2>
                <Link href="/notebook/">
                  {tr(lang, "สมุดสองหน้า", "The two-page notebook", "双页笔记本")}
                </Link>
              </h2>
              <p>
                {tr(
                  lang,
                  "อ่านทีละสองมาตราเหมือนสมุดบนโต๊ะ ระบายสีทั้งมาตรา จดโน้ตที่ขอบ และเทียบสามภาษา โน้ตจะกลับมาในรอบทบทวน",
                  "Two sections at a time, like a book open on the desk. Colour a whole section, write in the margin, compare three languages. Your notes come back in review.",
                  "像摊在桌上的书，每次读两条。给整条上色、在页边写笔记、对照三种语言。笔记会在复习时出现。",
                )}
              </p>
              <div className="anchor-actions">
                {/* Amber marks the one next action (the lesson above); this is a second door, not a second call. */}
                <Link href="/notebook/">
                  {tr(lang, "เปิดสมุดสองหน้า", "Open the notebook", "打开双页笔记")} →
                </Link>
                <Link href="/read/">
                  {tr(lang, "อ่านทั้งฉบับทีละหมวด", "Read the whole text", "阅读全文")} →
                </Link>
              </div>
            </div>
            <div className="anchor-features mono micro">
              <div className="feature-chip">
                <b>279</b> {tr(lang, "มาตราครบถ้วน", "sections", "条宪法全文")}
              </div>
              <div className="feature-chip">
                <b>3</b> {tr(lang, "ภาษาเคียงกัน", "scripts", "三语对照")}
              </div>
              <div className="feature-chip">
                <b>4</b> {tr(lang, "สีไฮไลต์ + โน้ต", "highlighters", "色高亮批注")}
              </div>
            </div>
          </div>
        </div>

        {/* Tier 2: Two Asymmetrical Study Engines - Practice vs Memory */}
        <div className="home-engines">
          {/* Practice Engine */}
          <div className="engine-column">
            <div className="engine-head">
              <span className="engine-tag mono">{tr(lang, "ฝึกทำโจทย์", "DRILL & EXAM", "刷题实战")}</span>
              <span className="mono micro text-muted">4,700 {tr(lang, "ข้อ", "exercises", "题")}</span>
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
            <div className="engine-links micro">
              <Link href="/practice/">{tr(lang, "เริ่มรอบฝึก", "Start Practice", "开始练习")} →</Link>
              <Link href="/exam/" className="pulse-link">{tr(lang, "ข้อสอบจำลอง 30 ชุด", "30 Mock Papers", "30套模拟卷")}</Link>
              <Link href="/along/" className="pulse-link">{tr(lang, "90 ประเด็นสอบนายอำเภอ", "90 District Topics", "90道实务考点")}</Link>
            </div>
          </div>

          {/* Memory Engine */}
          <div className="engine-column">
            <div className="engine-head">
              <span className="engine-tag mono">{tr(lang, "ความจำเชิงพื้นที่", "RECALL & PALACE", "空间记忆")}</span>
              <span className="mono micro text-muted">16 {tr(lang, "ห้อง", "rooms", "房间")}</span>
            </div>
            <h3>
              <Link href="/memory/">
                {tr(lang, "วังความจำ & การ์ดช่วยจำ", "Memory Palace & Flashcards", "记忆宫殿与闪卡")}
              </Link>
            </h3>
            <p className="micro">
              {tr(
                lang,
                "จำโครงสร้างด้วยภาพอาคาร 16 ห้อง พลิกการ์ดทวนความจำ และแผ่นสรุปตัวเลข 41 ค่าที่ออกสอบบ่อย พร้อม 7 กับดักสำคัญ",
                "16-room spatial memory palace, flip-to-recall flashcards, and a 41-number exam cram sheet with 7 high-yield traps.",
                "16间空间记忆宫殿、翻转闪卡以及41个核心数字与7大高频陷阱速记表。",
              )}
            </p>
            <div className="engine-links micro">
              <Link href="/memory/">{tr(lang, "เดินชมวังความจำ", "Memory Palace", "记忆宫殿")} →</Link>
              <Link href="/cram/" className="pulse-link">{tr(lang, "สูตรตัวเลข 41 ค่า", "41 Cram Numbers", "41个考点数字")}</Link>
              <Link href="/flashcards/" className="pulse-link">{tr(lang, "การ์ดความจำ", "Flashcards", "记忆闪卡")}</Link>
            </div>
          </div>
        </div>

        {/* Tier 3: Reference & Civic Knowledge Shelf */}
        <div className="home-reference">
          <div className="reference-lead">
            <span className="reference-tag mono micro">{tr(lang, "คู่มือและหลักการ", "GUIDE & PRINCIPLES", "导读与宪政原则")}</span>
            <h3>
              <Link href="/bible/">
                {tr(lang, `คู่มือเจาะลึก ${GUIDE_CHAPTERS} บท & สิทธิพลเมือง ${RIGHTS_COUNT} ด้าน`, `Study Bible (${GUIDE_CHAPTERS} Chapters) & Civic Rights (${RIGHTS_COUNT})`, `深入指南（${GUIDE_CHAPTERS}章）与公民权利（${RIGHTS_COUNT}项）`)}
              </Link>
            </h3>
            <p className="micro">
              {tr(
                lang,
                `คู่มืออ่านกฎหมาย ${GUIDE_CHAPTERS} บท แผนผังกลไก สิทธิพลเมือง ${RIGHTS_COUNT} ด้าน และ 90 แนวข้อสอบสำคัญระดับอำเภอ`,
                `${GUIDE_CHAPTERS}-chapter study guide, constitutional diagrams, ${RIGHTS_COUNT} civic rights, and 90 district exam topics.`,
                `${GUIDE_CHAPTERS}章法理导读、机构运行图解、${RIGHTS_COUNT}项公民基本权利与90道关键考点。`,
              )}
            </p>
          </div>
          <div className="reference-nav micro">
            <Link href="/bible/">{tr(lang, `อ่านคู่มือ ${GUIDE_CHAPTERS} บท`, `Read ${GUIDE_CHAPTERS} Chapters`, `阅读${GUIDE_CHAPTERS}章指南`)} →</Link>
            <Link href="/rights/" className="pulse-link">{tr(lang, `สิทธิพลเมือง ${RIGHTS_COUNT} ด้าน`, `${RIGHTS_COUNT} Civic Rights`, `${RIGHTS_COUNT}项公民权利`)}</Link>
            <Link href="/cheatsheet/" className="pulse-link">{tr(lang, "แผ่นสรุปสูตร", "Cheat Sheet", "速记表")}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
