export type Lang = "th" | "en" | "zh";
export type Text = Record<Lang, string>;
export const tr = (lang: Lang, th: string, en: string, zh: string) =>
  ({ th, en, zh })[lang];
export const labels = {
  title: { th: "รัฐธรรมนูญ", en: "The Constitution", zh: "泰国宪法" },
  learn: { th: "เส้นทางเรียน", en: "Learn", zh: "学习路径" },
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
