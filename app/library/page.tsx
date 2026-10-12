"use client";
import { Hub } from "@/components/Hub";
export default function Page() {
  return (
    <Hub
      kicker="LIBRARY · 05"
      title={{ th: "ห้องสมุด", en: "Library", zh: "资料库" }}
      intro={{
        th: "อ่านให้เข้าใจระบบ สิทธิในชีวิตจริง ดัชนี และอภิธานศัพท์",
        en: "Understand the system: your rights, the index and the glossary.",
        zh: "理解整个体系：你的权利、索引和术语表。",
      }}
      items={[
        { href: "/rights/", mark: "R", title: { th: "สิทธิของคุณ", en: "Your rights", zh: "你的权利" }, text: { th: "โจทย์ชีวิตจริง เดาก่อนแล้วเปิดตัวบท", en: "Real-life puzzles: guess, then open the law", zh: "生活题：先猜，再看条文" } },
        { href: "/topics/", mark: "I", title: { th: "ดัชนีเรื่อง", en: "Subject index", zh: "主题索引" }, text: { th: "หาตามเรื่องในชีวิต เช่น ภาษี การชุมนุม การศึกษา", en: "Look things up the everyday way: tax, assembly, schooling", zh: "按生活话题查找：税收、集会、教育" } },
        { href: "/glossary/", mark: "G", title: { th: "อภิธานศัพท์", en: "Glossary", zh: "术语表" }, text: { th: "ศัพท์กฎหมายที่เจอในตัวบท อธิบายด้วยภาษาง่าย", en: "Legal terms from the text, in plain words", zh: "条文中的法律术语，用平实的话解释" } },
        { href: "/cheatsheet/", mark: "C", title: { th: "สรุปภาพ", en: "Cheat sheets", zh: "速查图" }, text: { th: "แผนภาพโครงสร้างอำนาจและขั้นตอน", en: "Diagrams of powers and procedures", zh: "权力结构与程序图解" } },
        { href: "/sources/", mark: "S", title: { th: "แหล่งอ้างอิง", en: "Sources", zh: "资料来源" }, text: { th: "ต้นฉบับ คำแปล และที่มาของวิธีเรียน", en: "Original texts, translations and the learning research", zh: "原文、译文与学习方法的依据" } },
        { href: "/settings/", mark: "D", title: { th: "อุปกรณ์", en: "Your device", zh: "设备设置" }, text: { th: "ติดตั้ง ใช้ออฟไลน์ สำรองความก้าวหน้า", en: "Install, use offline, back up your progress", zh: "安装、离线使用、备份进度" } },
      ]}
    />
  );
}
