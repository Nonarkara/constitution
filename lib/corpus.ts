import corpus from "@/data/constitution.json";
import chinese from "@/data/chinese.json";
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
export function chineseText(n: number): string {
  const data = chinese as unknown as Record<string, { zh: string }>;
  return data[String(n)]?.zh ?? "此条的中文学习摘要尚未完成。请查阅泰文原文。";
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
      score: [s.th, s.en, chineseText(s.number)].reduce(
        (score, t) => score + (t.toLowerCase().includes(q) ? 1 : 0),
        0,
      ),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.s.number - b.s.number)
    .map((r) => r.s);
}
