"use client";
import { Hub } from "@/components/Hub";

export default function Page() {
  return (
    <Hub
      title={{ th: "สำรวจ", en: "Explore", zh: "探索" }}
      intro={{
        th: "สิทธิ ข่าว และเครื่องมือรอบรัฐธรรมนูญ นอกเส้นทางเรียนกับรอบฝึก",
        en: "Rights, news and the tools around the constitution, outside the guide and the practice session.",
        zh: "权利、新闻，以及指南和练习之外的宪法工具。",
      }}
      items={[
        { href: "/rights/", title: { th: "สิทธิของคุณ", en: "Your rights", zh: "你的权利" }, text: { th: "เดาก่อน แล้วเปิดตัวบท", en: "Guess, then open the law", zh: "先猜，再看条文" } },
        { href: "/polls/", title: { th: "คำถามส่วนตัว", en: "Polls", zh: "问卷" }, text: { th: "เก็บเหตุผลไว้ในเครื่องนี้", en: "Keep your reasons on this device", zh: "把理由留在这台设备上" } },
        { href: "/civic/", title: { th: "คำสัญญา", en: "Civic", zh: "承诺" }, text: { th: "ตรวจคำสัญญากับตัวบท", en: "Check a promise against the text", zh: "用条文核查承诺" } },
        { href: "/amend/", title: { th: "การแก้ไข", en: "Amend", zh: "修宪" }, text: { th: "เรื่องสมมติ ผ่านประตูจริง", en: "A fictional draft through the real gates", zh: "虚构草案，真实门槛" } },
        { href: "/news/", title: { th: "ข่าว", en: "News", zh: "新闻" }, text: { th: "หัวข่าว ไม่ใช่เนื้อข่าว", en: "Headlines, not article text", zh: "标题，不是正文" } },
        { href: "/memory/", title: { th: "บ้านความจำ", en: "Memory", zh: "记忆屋" }, text: { th: "16 ห้องสำหรับจำตัวเลข", en: "16 rooms for the numbers", zh: "十六间房间，用来记数字" } },
        { href: "/sources/", title: { th: "แหล่งอ้างอิง", en: "Sources", zh: "资料来源" }, text: { th: "ต้นฉบับและคำแปล", en: "The original text and the translations", zh: "原文与译文" } },
      ]}
    />
  );
}
