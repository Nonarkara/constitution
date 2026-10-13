"use client";
import { Hub } from "@/components/Hub";
export default function Page() {
  return (
    <Hub
      title={{ th: "ห้องสมุด", en: "Library", zh: "资料库" }}
      intro={{
        th: "อ่านให้เข้าใจระบบ สิทธิในชีวิตจริง ดัชนี และอภิธานศัพท์",
        en: "Understand the system: your rights, the index and the glossary.",
        zh: "理解整个体系：你的权利、索引和术语表。",
      }}
      items={[
        { href: "/bible/", title: { th: "คัมภีร์รัฐธรรมนูญ", en: "The study guide", zh: "学习指南" }, text: { th: "13 บท อธิบายทั้งฉบับด้วยตรรกะ คดีจริง ทางลัดช่วยจำ ข้อวิจารณ์ และวิธีทำข้อสอบ", en: "13 chapters: the whole constitution by its logic, real cases, memory aids, critique and exam method", zh: "13章：以逻辑讲解全文，含真实案例、记忆法、批评与答题方法" } },
        { href: "/bible/exam-method/", title: { th: "วิธีทำข้อสอบ", en: "How to answer exam questions", zh: "答题方法" }, text: { th: "อ่านโจทย์ ตัดตัวเลือกด้วยตรรกะ และกับดักที่พบบ่อย", en: "Reading the stem, eliminating by logic, and the common traps", zh: "读题、用逻辑排除选项，以及常见陷阱" } },
        { href: "/bible/history/", title: { th: "ประวัติรัฐธรรมนูญไทย", en: "The history, as a story", zh: "泰国宪法史" }, text: { th: "จาก 2475 ถึง 2560 เล่าเป็นเรื่อง ช่วยจำปีและตัวเลข", en: "From 1932 to 2017 as a story that carries the years and numbers", zh: "从1932到2017，以故事记住年份与数字" } },
        { href: "/drills/", title: { th: "4,700 แบบฝึก", en: "4,700 exercises", zh: "4,700道练习" }, text: { th: "470 โจทย์เขียนเอง + 4,230 โจทย์เปลี่ยนเงื่อนไข", en: "470 authored + 4,230 parameter-generated drills", zh: "470道原创＋4,230道参数生成题" } },
        { href: "/polls/", title: { th: "10 คำถามส่วนตัว", en: "Ten private polls", zh: "十个私人问卷" }, text: { th: "ลองคิดและเก็บเหตุผล ไม่มีคะแนนความเห็น", en: "Keep your reasons; opinions earn no points", zh: "保存理由，不给观点评分" } },
        { href: "/memory/", title: { th: "บ้านความจำ 16 ห้อง", en: "The sixteen-room memory house", zh: "十六间记忆屋" }, text: { th: "ภาพสีอ่อน มุกเล็ก ๆ และตัวเลขที่มีความหมาย", en: "Pastel pictures, small jokes and meaningful numbers", zh: "柔和图画、小笑话与有意义的数字" } },
        { href: "/civic/", title: { th: "ตรวจคำสัญญาในบ้านความจำ", en: "Check promises in the memory house", zh: "在记忆屋核查承诺" }, text: { th: "16 โจทย์แก้ไข สิทธิและงบประมาณ พร้อมคั่นไว้อ่านต่อ", en: "16 amendment, rights and budget puzzles; bookmark the law", zh: "16道修宪、权利与预算题；收藏条文" } },
        { href: "/amend/", title: { th: "ถ้าเราอยากแก้รัฐธรรมนูญ", en: "If we want to amend it", zh: "如果我们想修宪" }, text: { th: "เรื่องสมมติ ประตูจริง และคำตอบของคุณเอง", en: "A fictional story, real gates and your own reflection", zh: "虚构故事、真实门槛与你自己的思考" } },
        { href: "/news/", title: { th: "ข่าวสั้นหนึ่งแก้ว", en: "A cup of headlines", zh: "一杯新闻标题" }, text: { th: "หัวข่าวกฎหมายไทย พร้อมนับคำใน 7 วัน", en: "Thai-law headlines and keyword counts over 7 days", zh: "泰国法律标题与7天关键词计数" } },
        { href: "/research/", title: { th: "ทำไมผมสร้างสมุดเล่มนี้", en: "Why I built this notebook", zh: "我为何做这本笔记" }, text: { th: "Dr. Non: จุดประสงค์ วิธีเรียน และการทดสอบ", en: "Dr. Non: purpose, learning methods and testing", zh: "Dr. Non：目的、学习方法与测试" } },
        { href: "/rights/", title: { th: "สิทธิของคุณ", en: "Your rights", zh: "你的权利" }, text: { th: "20 โจทย์ชีวิตจริง เดาก่อนแล้วเปิดตัวบท", en: "20 real-life puzzles: guess, then open the law", zh: "20道生活题：先猜，再看条文" } },
        { href: "/topics/", title: { th: "ดัชนีเรื่อง", en: "Subject index", zh: "主题索引" }, text: { th: "197 เรื่องในชีวิต เช่น ภาษี การชุมนุม การศึกษา", en: "197 everyday subjects: tax, assembly, schooling", zh: "197个生活话题：税收、集会、教育" } },
        { href: "/glossary/", title: { th: "อภิธานศัพท์", en: "Glossary", zh: "术语表" }, text: { th: "89 ศัพท์กฎหมายจากตัวบท อธิบายด้วยภาษาง่าย", en: "89 legal terms from the text, in plain words", zh: "89个条文中的法律术语，用平实的话解释" } },
        { href: "/cheatsheet/", title: { th: "สรุปภาพ", en: "Cheat sheets", zh: "速查图" }, text: { th: "แผนภาพโครงสร้างอำนาจและขั้นตอน", en: "Diagrams of powers and procedures", zh: "权力结构与程序图解" } },
        { href: "/sources/", title: { th: "แหล่งอ้างอิง", en: "Sources", zh: "资料来源" }, text: { th: "ต้นฉบับ คำแปล และที่มาของวิธีเรียน", en: "Original texts, translations and the learning research", zh: "原文、译文与学习方法的依据" } },
        { href: "/settings/", title: { th: "อุปกรณ์", en: "Your device", zh: "设备设置" }, text: { th: "ติดตั้ง ใช้ออฟไลน์ สำรองความก้าวหน้า", en: "Install, use offline, back up your progress", zh: "安装、离线使用、备份进度" } },
      ]}
    />
  );
}
