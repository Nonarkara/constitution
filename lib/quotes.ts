/** Quotation marks, with an ellipsis only where the excerpt is not the whole section. */
export function quoteFrame(full: string, excerpt: string): string {
  const at = full.indexOf(excerpt);
  if (at < 0) return `“${excerpt}”`;
  const before = at > 0;
  const after = at + excerpt.length < full.length;
  return `${before ? "…" : ""}“${excerpt}”${after ? "…" : ""}`;
}

/** A quote that starts on a conjunction is a sentence cut in half. */
export function quoteStartsClean(excerpt: string): boolean {
  return !/^(หรือ|และ|แต่|ย่อม|โดย|เพื่อ|ซึ่ง|ว่า|เว้นแต่)/.test(excerpt.trim());
}
