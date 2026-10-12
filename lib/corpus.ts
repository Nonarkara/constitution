import corpus from "@/data/constitution.json";
import chinese from "@/data/chinese.json";
import zhFirst from "@/data/translations/zh-001-139.json";
import zhSecond from "@/data/translations/zh-140-279.json";
import enAmendments from "@/data/translations/en-amendments.json";
import enCorrections from "@/data/translations/en-corrections.json";
export type Section = {
  number: number;
  chapter: number;
  th: string;
  en: string;
  amended: boolean;
  englishStatus: string;
  source: {
    th: { url: string; pages: number[] };
    en: { url: string; pages: number[] };
  };
};
export type Chapter = {
  number: number;
  title: { th: string; en: string; zh: string };
  start: number;
  end: number;
};
export const sections = corpus.sections as Section[];
export const chapters = corpus.chapters as Chapter[];
export const meta = corpus.meta;
const zhTranslations = { ...zhFirst, ...zhSecond } as Record<
  string,
  { zh: string }
>;
const enTranslations = { ...enAmendments, ...enCorrections } as Record<
  string,
  { en: string }
>;
export function chineseText(n: number): string {
  return zhTranslations[String(n)]?.zh ?? "此条译文缺失，请查阅泰文原文。";
}
export function chineseSummary(n: number): string {
  return (chinese as Record<string, { zh: string }>)[String(n)]?.zh ?? "";
}
export function englishText(n: number): string {
  return (
    enTranslations[String(n)]?.en ??
    sections.find((s) => s.number === n)?.en ??
    ""
  );
}
/** Body under a heading that already names the section. Drops a repeated Chinese title line. */
export function sectionBody(n: number, lang: "th" | "en" | "zh"): string {
  const text = readingText(n, lang);
  if (lang !== "zh") return text;
  return text.replace(new RegExp(`^第\\s*${n}\\s*条\\s*`), "");
}
export function readingText(n: number, lang: "th" | "en" | "zh"): string {
  return lang === "zh"
    ? chineseText(n)
    : lang === "en"
      ? englishText(n)
      : (sections.find((s) => s.number === n)?.th ?? "");
}
export function englishIsStudyTranslation(n: number) {
  return String(n) in enTranslations;
}
export function searchSections(query: string): Section[] {
  const q = query
    .trim()
    .toLowerCase()
    .replace(/[๐-๙]/g, (c) => String("๐๑๒๓๔๕๖๗๘๙".indexOf(c)));
  if (!q) return [];
  const number = q.match(
    /^(?:(?:มาตรา(?:ที่)?|section|第)\s*)?(\d+)\s*(?:条)?$/i,
  );
  if (number) return sections.filter((s) => s.number === Number(number[1]));
  return sections
    .map((s) => ({
      s,
      score: [
        s.th,
        englishText(s.number),
        chineseText(s.number),
        chineseSummary(s.number),
      ].reduce((score, t) => score + (t.toLowerCase().includes(q) ? 1 : 0), 0),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.s.number - b.s.number)
    .map((r) => r.s);
}
