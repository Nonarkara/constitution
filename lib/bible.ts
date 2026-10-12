import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Lang } from "./i18n";

// Build-time only: chapters are read from data/bible and each becomes its own static page.
type Pair = { th: string; en: string };
export type Block =
  | { kind: "text" | "logic" | "mnemonic" | "story"; title?: Pair; body: Pair }
  | { kind: "case"; title?: Pair; body: Pair; year?: number; ref?: string }
  | { kind: "critique"; title?: Pair; body: Pair; by?: string }
  | { kind: "numbers"; title?: Pair; rows: { th: string; en: string; value: string; sections?: number[] }[] }
  | { kind: "check"; title?: Pair; items: { q: Pair; a: Pair; sections?: number[] }[] }
  | { kind: "image"; file: string; caption: Pair; credit: string; license: string; source: string };
export type BibleChapter = {
  slug: string;
  id: string;
  order: number;
  title: Pair;
  lede: Pair;
  blocks: Block[];
  sections?: number[];
  sources?: string[];
};
const DIR = join(process.cwd(), "data/bible");

export function bibleChapters(): BibleChapter[] {
  if (!existsSync(DIR)) return [];
  return readdirSync(DIR)
    .filter((f) => /^\d+-[a-z0-9-]+\.json$/.test(f))
    .map((f) => {
      const raw = JSON.parse(readFileSync(join(DIR, f), "utf8"));
      // An image is shown only once its licensed file has been added to public/bible.
      const blocks = (raw.blocks as Block[]).filter(
        (b) => b.kind !== "image" || existsSync(join(process.cwd(), "public/bible", b.file)),
      );
      return { ...raw, blocks, slug: f.replace(/^\d+-/, "").replace(/\.json$/, "") } as BibleChapter;
    })
    .sort((a, b) => a.order - b.order);
}
export const pick = (p: Pair, lang: Lang) => (lang === "th" ? p.th : p.en);
