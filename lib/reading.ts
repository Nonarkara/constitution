import type { Lang } from "./i18n";

export type Term = {
  id: string;
  term: Record<Lang, string>;
  match: Record<Lang, string[]>;
  def: Record<Lang, string>;
  sections: number[];
};
export type Token =
  | { kind: "xref"; start: number; end: number; section: number }
  | { kind: "term"; start: number; end: number; id: string };

const arabic = (t: string) => t.replace(/[๐-๙]/g, (d) => String("๐๑๒๓๔๕๖๗๘๙".indexOf(d)));
const XREF: Record<Lang, RegExp> = {
  th: /มาตรา\s*([๐-๙0-9]+)/g,
  en: /[Ss]ection\s+(\d+)/g,
  zh: /第(\d+)条/g,
};

/**
 * Cross-references and glossary terms in one section's text, non-overlapping and
 * in order. A term is marked once per section so the page does not turn into links.
 */
export function readingTokens(text: string, lang: Lang, own: number, glossary: Term[]): Token[] {
  const found: Token[] = [];
  for (const m of text.matchAll(XREF[lang])) {
    const n = Number(arabic(m[1]));
    if (n >= 1 && n <= 279 && n !== own)
      found.push({ kind: "xref", start: m.index!, end: m.index! + m[0].length, section: n });
  }
  for (const t of glossary) {
    let best = -1,
      len = 0;
    for (const s of t.match[lang] ?? []) {
      const at = s ? text.indexOf(s) : -1;
      if (at >= 0 && (best < 0 || at < best || (at === best && s.length > len))) [best, len] = [at, s.length];
    }
    if (best >= 0) found.push({ kind: "term", start: best, end: best + len, id: t.id });
  }
  found.sort((a, b) => a.start - b.start || b.end - a.end);
  const out: Token[] = [];
  for (const t of found) if (!out.length || t.start >= out[out.length - 1].end) out.push(t);
  return out;
}
