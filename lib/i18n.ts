export type Lang = "th" | "en" | "zh";
export type Text = Record<Lang, string>;
export const tr = (lang: Lang, th: string, en: string, zh: string) =>
  ({ th, en, zh })[lang];
export const labels = {
  title: { th: "รัฐธรรมนูญ", en: "The Constitution", zh: "泰国宪法" },
  learn: { th: "เส้นทางเรียน", en: "Learn", zh: "学习路径" },
  read: { th: "อ่านทั้งฉบับ", en: "Read", zh: "阅读全文" },
  practice: { th: "ฝึกตอบ", en: "Practice", zh: "练习" },
  notes: { th: "สิ่งที่คุณรู้", en: "What you know", zh: "你所知道的" },
  library: { th: "ห้องสมุด", en: "Library", zh: "资料库" },
  notebook: {
    th: "สมุดคู่หน้า 279 มาตรา",
    en: "Double-page notebook",
    zh: "双页开本宪法",
  },
  flashcards: {
    th: "การ์ดความจำ",
    en: "Flashcards",
    zh: "记忆闪卡",
  },
  rights: { th: "สิทธิของคุณ", en: "Your rights", zh: "你的权利" },
  cheatsheet: {
    th: "สรุปสูตร & แผนภาพ",
    en: "Cheat sheets & diagrams",
    zh: "速查表与图解",
  },
  search: { th: "ค้นมาตรา", en: "Find a section", zh: "查找条文" },
  review: { th: "ทบทวน", en: "Review", zh: "复习" },
  sources: { th: "แหล่งอ้างอิง", en: "Sources", zh: "资料来源" },
  settings: { th: "อุปกรณ์", en: "Your device", zh: "设备设置" },
  listen: { th: "ฟังมาตรานี้", en: "Listen", zh: "朗读" },
  stop: { th: "หยุดฟัง", en: "Stop", zh: "停止" },
  chapter: { th: "หมวด", en: "Chapter", zh: "章" },
  section: { th: "มาตรา", en: "Section", zh: "条" },
} satisfies Record<string, Text>;

export const sectionLabel = (lang: Lang, n: number | string) =>
  lang === "zh" ? `第${n}条` : `${labels.section[lang]} ${n}`;

/** Chapter picker: Thai หมวด / English Chapter / Chinese 第N章, and a section range in that language. */
export function chapterPickerLabel(
  lang: Lang,
  chapter: { number: number; title: Text; start: number; end: number },
): string {
  const head =
    chapter.number === 17
      ? chapter.title[lang]
      : tr(
          lang,
          `หมวด ${chapter.number}`,
          `Chapter ${chapter.number}`,
          `第${chapter.number}章`,
        );
  const range =
    lang === "zh"
      ? `第${chapter.start}–${chapter.end}条`
      : lang === "en"
        ? `Sections ${chapter.start}–${chapter.end}`
        : `ม. ${chapter.start}–${chapter.end}`;
  const name = chapter.number === 17 ? "" : `: ${chapter.title[lang]}`;
  return `${head}${name} (${range})`;
}
