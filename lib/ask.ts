import { tr, type Lang } from "./i18n.ts";
export const ASK_ORIGIN =
  process.env.NEXT_PUBLIC_ASK_ORIGIN ?? "https://nonwriter.nonarkara.org";
export const askLanguage = (lang: Lang) => (lang === "zh" ? "zh-Hans" : lang);

// The question rides in the fragment, which browsers never send to a server.
export function deepLink(question: string, sections: number[] = []) {
  const p = new URLSearchParams({ q: question.slice(0, 1500) });
  if (sections.length) p.set("s", sections.slice(0, 5).join(","));
  return `${ASK_ORIGIN}/#laws?${p}`;
}

// About 4.5 minutes of polling, longer than the server's own job timeout.
export const POLL_LIMIT = 60;
export const pollDelay = (attempt: number) =>
  [1500, 2000, 3000, 5000][Math.min(attempt, 3)];

export type AskOutcome =
  | "accepted"
  | "rate"
  | "refused"
  | "unavailable"
  | "invalid"
  | "server";
export function classify(status: number, body: { refused?: boolean }): AskOutcome {
  if (status === 202) return "accepted";
  if (status === 429) return "rate";
  if (status === 422 && body?.refused) return "refused";
  if (status === 503) return "unavailable";
  if (status === 400) return "invalid";
  return "server";
}

// Constitution rows are re-rendered from this app's own corpus, never the server's copy.
export type AskSource = { title?: string; url?: string };

/** Constitution embeds ask for a plain explanation, never the direct/polemic voice. */
export function askRequest(question: string, lang: Lang, sections: number[] = []) {
  return {
    question,
    tone: "plain" as const,
    language: askLanguage(lang),
    consent: true as const,
    ...(sections.length ? { constitution: sections.slice(0, 5) } : {}),
  };
}

export function consentCopy(lang: Lang): string {
  return tr(
    lang,
    "คำถามนี้ถูกบันทึกไว้เพื่อการศึกษาโดย Non-Laws (nonwriter.nonarkara.org) ตลอดไป อย่าใส่ชื่อจริงหรือเลขประจำตัว",
    "Saved forever for study by Non-Laws (nonwriter.nonarkara.org). Leave out real names and ID numbers.",
    "此问题由 Non-Laws（nonwriter.nonarkara.org）永久保存供研究。请勿填写真实姓名或证件号码。",
  );
}

export function studyDisclaimer(lang: Lang): string {
  return tr(
    lang,
    "ข้อมูลเพื่อการค้นคว้า มิใช่คำแนะนำทางกฎหมาย ตัวบทภาษาไทยเป็นหลัก",
    "Study material, not legal advice. The Thai text prevails.",
    "学习材料，并非法律意见。以泰文原文为准。",
  );
}

export function groundedLabel(lang: Lang): string {
  return tr(lang, "อ้างอิงได้", "SOLID", "有依据");
}

export function showGroundedMark(result: { grounded?: boolean } | null | undefined): boolean {
  return result?.grounded === true;
}

export function looksLikeProviderError(text: string): boolean {
  return /429|openrouter|rate-?limit|HTTP\s+\d{3}|gemma|groq|gpt-oss|temporarily/i.test(text);
}

export function friendlyAskError(
  kind:
    | "offline"
    | "unreachable"
    | "rate"
    | "refused"
    | "unavailable"
    | "invalid"
    | "server"
    | "lost"
    | "timeout",
  lang: Lang,
): string {
  const copy = {
    offline: [
      "ตอนนี้ออฟไลน์ คำถามยังอยู่ตรงนี้ ถามได้เมื่อกลับมาออนไลน์",
      "You're offline. Your question stays here; ask when you're back online.",
      "当前离线。问题会留在这里，恢复联网后再问。",
    ],
    unreachable: [
      "ติดต่อ Non-Laws ไม่ได้ ลองอีกครั้งได้",
      "Non-Laws didn't answer. You can try again.",
      "连不上 Non-Laws。可以再试一次。",
    ],
    rate: [
      "Non-Laws กำลังรับคำถามหนาแน่น รอสักครู่แล้วลองใหม่",
      "Non-Laws is busy right now. Wait a moment and try again.",
      "Non-Laws 此刻较忙。稍等一下再试。",
    ],
    refused: [
      "Non-Laws รับคำถามนี้ไม่ได้ ลองถามใหม่ให้สั้นลงและไม่ใส่ข้อมูลส่วนตัว",
      "Non-Laws could not take this question. Try a shorter one, with no personal details.",
      "Non-Laws 无法接受这个问题。请缩短问题，且不要包含个人信息。",
    ],
    unavailable: [
      "Non-Laws ยังไม่พร้อม ลองใหม่ในอีกสักครู่",
      "Non-Laws isn't ready. Try again in a moment.",
      "Non-Laws 尚未就绪。过一会儿再试。",
    ],
    invalid: [
      "คำถามนี้ส่งไปไม่ได้ ลองเขียนใหม่",
      "This question could not be sent. Try wording it again.",
      "这个问题发不出去。请换个写法再试。",
    ],
    server: [
      "Non-Laws ตอบกลับไม่สำเร็จ ลองอีกครั้งได้",
      "Non-Laws could not finish the answer. You can try again.",
      "Non-Laws 没能完成回答。可以再试一次。",
    ],
    lost: [
      "คำตอบยังไม่กลับมา ลองอีกครั้งได้",
      "The answer didn't come back. You can try again.",
      "答案没有回来。可以再试一次。",
    ],
    timeout: [
      "รอนานเกินไป ลองอีกครั้งได้",
      "This is taking too long. You can try again.",
      "等得太久了。可以再试一次。",
    ],
  } as const;
  const [th, en, zh] = copy[kind];
  return tr(lang, th, en, zh);
}

export function outcomeError(
  outcome: Exclude<AskOutcome, "accepted">,
  lang: Lang,
): string {
  if (outcome === "rate") return friendlyAskError("rate", lang);
  if (outcome === "refused") return friendlyAskError("refused", lang);
  if (outcome === "unavailable") return friendlyAskError("unavailable", lang);
  if (outcome === "invalid") return friendlyAskError("invalid", lang);
  return friendlyAskError("server", lang);
}

export type ShownSource = { n: number; title: string; url?: string };

/** Keep [n] only when that source can be listed. Otherwise strip the marker. */
export function presentAnswer(answer: string, sources: AskSource[] = []) {
  const list = sources
    .map((source) => ({
      title: (source.title || source.url || "").trim(),
      url: source.url && /^https:\/\//.test(source.url) ? source.url : undefined,
    }))
    .filter((source) => source.title);
  const withMarks = answer.replace(/\[(\d+)\]/g, (token, n) =>
    list[Number(n) - 1] ? token : "",
  );
  const tidy = (value: string) =>
    value
      .replace(/[^\S\n]{2,}/g, " ")
      .replace(/\s+([,.;:!?，。])/g, "$1")
      .trim();
  const cited = [...withMarks.matchAll(/\[(\d+)\]/g)].map((match) => Number(match[1]));
  const shown: ShownSource[] = [...new Set(cited)]
    .filter((n) => list[n - 1])
    .map((n) => ({ n, title: list[n - 1].title, url: list[n - 1].url }));
  if (!shown.length) {
    return { text: tidy(withMarks.replace(/\s*\[\d+\]/g, "")), sources: [] as ShownSource[] };
  }
  return { text: tidy(withMarks), sources: shown };
}

export function readGrounded(job: { grounded?: boolean; final?: { grounded?: boolean } } | null): boolean {
  return job?.grounded === true || job?.final?.grounded === true;
}

export function readSources(job: {
  sources?: AskSource[];
  final?: { sources?: AskSource[] };
} | null): AskSource[] {
  const raw = job?.sources ?? job?.final?.sources ?? [];
  return raw.map((source) => ({
    title: source.title,
    url: source.url,
  }));
}

export function localConstitution(statutes: { cite?: string; section?: string }[] = []) {
  return statutes
    .filter((s) => s.cite?.startsWith("รธน."))
    .map((s) => Number(s.section))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 279);
}
