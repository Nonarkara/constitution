"use client";
import { Hub } from "@/components/Hub";
export default function Page() {
  return (
    <Hub
      kicker="PRACTICE · 03"
      title={{ th: "ฝึกตอบ", en: "Practice", zh: "练习" }}
      intro={{
        th: "ทุกมาตรามีข้อฝึก เลือกวิธีที่เหมาะกับวันนี้ ทบทวนตามรอบ ทำข้อสอบจำลอง เปิดบัตรคำ หรือเล่นเกม",
        en: "Every section has practice. Pick today's way in: spaced review, a mock exam, flashcards or a game.",
        zh: "每一条都有练习。按今天的状态选择：间隔复习、模拟考试、闪卡或游戏。",
      }}
      items={[
        { href: "/review/", mark: "R", title: { th: "ทบทวนตามรอบ", en: "Spaced review", zh: "间隔复习" }, text: { th: "ข้อที่ถึงเวลากลับมา ข้อที่พลาด และข้อจากที่คุณไฮไลต์", en: "Questions that are due, past mistakes and questions from what you highlighted", zh: "到期题、错题，以及来自你标记内容的题目" } },
        { href: "/exam/", mark: "E", title: { th: "ข้อสอบจำลอง", en: "Mock exam", zh: "模拟考试" }, text: { th: "จับเวลา คละทุกหมวด แล้วดูคะแนนแยกตามหมวด", en: "Timed, mixed across chapters, with a score by chapter", zh: "计时、跨章节混合，并按章节给出得分" } },
        { href: "/flashcards/", mark: "F", title: { th: "บัตรคำ", en: "Flashcards", zh: "闪卡" }, text: { th: "พลิกจำทีละใบ", en: "Flip and recall, one card at a time", zh: "一张一张翻卡回忆" } },
        { href: "/games/", mark: "G", title: { th: "เกม", en: "Games", zh: "游戏" }, text: { th: "จับคู่มาตรากับเรื่อง และเกมแข่งเวลา", en: "Match sections to topics, and a race against the clock", zh: "条文与主题配对，以及限时挑战" } },
      ]}
    />
  );
}
