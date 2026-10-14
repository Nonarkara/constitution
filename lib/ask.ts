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

// One attempt stays under about 75 seconds. A single retry still finishes
// well inside three minutes, instead of hanging for six.
export const ATTEMPT_BUDGET_MS = 75_000;
export const ASK_RETRIES = 1;
export const pollDelay = (attempt: number) =>
  [1500, 2000, 3000, 5000][Math.min(attempt, 3)];

export function pollSteps(budget = ATTEMPT_BUDGET_MS): number[] {
  const steps: number[] = [];
  let used = 0;
  let attempt = 0;
  while (used + pollDelay(attempt) <= budget && steps.length < 40) {
    const delay = pollDelay(attempt);
    steps.push(delay);
    used += delay;
    attempt++;
  }
  return steps;
}

export const POLL_LIMIT = pollSteps().length;

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

export type AskExcerpt = { number: number; text: string };

const clip = (text: string, max: number) =>
  text.length <= max ? text : `${text.slice(0, max).trimEnd()}…`;

/**
 * The remote model only sees `question`. Ground it in the section the learner
 * is reading, in that learner's language, and forbid dropped exceptions and
 * invented sources.
 */
export function askRequest(
  question: string,
  lang: Lang,
  sections: number[] = [],
  excerpts: AskExcerpt[] = [],
) {
  const rules = tr(
    lang,
    "ตอบจากตัวบทด้านล่างเท่านั้น ห้ามตัดข้อยกเว้นออก รวมถึง “หรือมีเหตุอย่างอื่นตามที่กฎหมายบัญญัติ” การไม่มีหมายศาลอย่างเดียวไม่ได้แปลว่าปฏิเสธได้หรือว่าไม่มีอำนาจ ห้ามอ้างแหล่งที่ไม่ได้ให้มา และห้ามอ้างประมวลอัยการซึ่งไม่มีอยู่ ถ้ายกข้อความให้ใช้ภาษาไทย",
    "Answer only from the sections below. Do not drop an exception, including “or other grounds as provided by law”. No court order, by itself, does not mean the person may refuse or that officials have no authority. Do not invent sources. Do not cite a Prosecutor's Code. Quote clauses in English, never in untranslated Thai.",
    "只根据下面的条文回答。不要漏掉例外，包括“或法律规定的其他理由”。仅没有法院命令，并不等于可以拒绝，也不等于对方没有权力。不要编造来源，不要引用并不存在的《检察官法典》。引文用中文，不要夹未翻译的泰文。",
  );
  const quoted = excerpts
    .slice(0, 5)
    .map((excerpt) =>
      tr(
        lang,
        `มาตรา ${excerpt.number}: ${clip(excerpt.text, 900)}`,
        `Section ${excerpt.number}: ${clip(excerpt.text, 900)}`,
        `第${excerpt.number}条：${clip(excerpt.text, 900)}`,
      ),
    )
    .join("\n\n");
  const asked = tr(
    lang,
    `คำถามของผู้เรียน: ${question.trim()}`,
    `Learner's question: ${question.trim()}`,
    `学习者的问题：${question.trim()}`,
  );
  return {
    question: clip([rules, quoted, asked].filter(Boolean).join("\n\n"), 3800),
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
  return confidenceLabel("SOLID", lang);
}

export type ConfidenceJob = {
  grounded?: boolean;
  confidence?: string | null;
  final?: { grounded?: boolean; confidence?: string | null };
};

/** The label is the payload's confidence word. MIXED is not shown as SOLID. */
export function readConfidence(job: ConfidenceJob | null | undefined): string | null {
  const raw = job?.confidence ?? job?.final?.confidence;
  if (typeof raw !== "string") return null;
  const head = raw.trim().split(/[:：\s]/)[0]?.replace(/[^A-Za-z]/g, "").toUpperCase();
  return head || null;
}

export function confidenceLabel(level: string, lang: Lang): string {
  switch (level.toUpperCase()) {
    case "SOLID":
      return tr(lang, "อ้างอิงได้", "SOLID", "有依据");
    case "MIXED":
      return tr(lang, "อ้างอิงปน", "MIXED", "依据不全");
    case "WEAK":
    case "LOW":
      return tr(lang, "อ้างอิงอ่อน", "WEAK", "依据薄弱");
    case "NONE":
      return tr(lang, "ยังอ้างอิงไม่ได้", "NOT GROUNDED", "尚无依据");
    default:
      return level;
  }
}

export function showGroundedMark(
  result: { grounded?: boolean; confidence?: string | null; final?: { confidence?: string | null } } | null | undefined,
): boolean {
  const level = readConfidence(result);
  if (level) return level === "SOLID";
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

const THAI_RUN = /[\u0E00-\u0E7F][\u0E00-\u0E7F\s]{0,400}[\u0E00-\u0E7F]/g;

/** English and Chinese answers must not keep an untranslated Thai quotation. */
export function quotesInAnswerLanguage(answer: string, lang: Lang, translations: string[] = []): string {
  if (lang === "th" || !THAI_RUN.test(answer)) return answer;
  THAI_RUN.lastIndex = 0;
  const stripped = answer.replace(THAI_RUN, " ").replace(/[ ]{2,}/g, " ").replace(/\s+([,.;:!?])/g, "$1").trim();
  const gloss = translations.map((text) => text.trim()).filter(Boolean);
  const missing = gloss.filter((text) => !stripped.includes(text.slice(0, 48)));
  return [stripped, ...missing].filter(Boolean).join("\n\n").trim();
}

/** Drop a source the model invented. A Prosecutor's Code is not Thai law. */
export function stripFabricatedSources(answer: string): string {
  return answer
    .replace(/[^\n.。]*Prosecutor['’]s Code[^\n.。]*[.。]?/gi, "")
    .replace(/[^\n.。]*ประมวลอัยการ[^\n.。]*[.。]?/g, "")
    .replace(/[^\n.。]*检察官法典[^\n.。]*[。.]?/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const SECTION_36_EXCEPTION = /หรือมีเหตุอย่างอื่น|other grounds|其他理由|法律规定的其他|或法律另有规定/;

/** If the answer drops section 36's statutory exception, put that exception back. */
export function keepStatutoryExceptions(
  answer: string,
  lang: Lang,
  sections: number[],
  noteFirst = false,
): string {
  if (!sections.includes(36) || SECTION_36_EXCEPTION.test(answer)) return answer;
  const note = tr(
    lang,
    "มาตรา 36 ห้ามตรวจ กัก หรือเปิดเผยข้อมูลที่สื่อสารถึงกัน เว้นแต่มีคำสั่งหรือหมายของศาล หรือมีเหตุอย่างอื่นตามที่กฎหมายบัญญัติ การไม่มีหมายศาลอย่างเดียวจึงยังไม่จบคำถาม",
    "Section 36 bars censorship, detention or disclosure of a communication except by a court order or warrant, or where there are other grounds as provided by law. No court order, by itself, does not settle the question.",
    "第36条禁止检查、扣留或披露人们之间的通信，除非有法院的命令或令状，或者另有法律规定的其他理由。仅没有法院命令，并不能单独决定这个问题。",
  );
  const body = answer.trim();
  if (!body) return note;
  return noteFirst ? `${note}\n\n${body}` : `${body}\n\n${note}`;
}

const THAI_LETTERS = /[\u0E00-\u0E7F]/g;
const CJK_LETTERS = /[\u4E00-\u9FFF]/g;
const LATIN_LETTERS = /[A-Za-z]/g;

/** Dominant script of a model answer. Mixed or tiny answers are not a language. */
export function dominantLanguage(text: string): Lang | null {
  const thai = text.match(THAI_LETTERS)?.length ?? 0;
  const cjk = text.match(CJK_LETTERS)?.length ?? 0;
  const latin = text.match(LATIN_LETTERS)?.length ?? 0;
  const total = thai + cjk + latin;
  if (total < 8) return null;
  const ranked = [
    ["th", thai],
    ["zh", cjk],
    ["en", latin],
  ].sort((a, b) => Number(b[1]) - Number(a[1]));
  const top = Number(ranked[0][1]);
  const second = Number(ranked[1][1]);
  if (top / total < 0.6 || second > top * 0.45) return null;
  return ranked[0][0] as Lang;
}

/**
 * Quoted Thai statute text is the law, not the language of the answer.
 * English and Chinese pages ignore those letters before the script check.
 */
export function proseForLanguage(text: string): string {
  THAI_RUN.lastIndex = 0;
  THAI_LETTERS.lastIndex = 0;
  return text
    .replace(/[“"「『«][^”"」』»]*[\u0E00-\u0E7F][^”"」』»]*[”"」』»]/g, " ")
    .replace(THAI_RUN, " ")
    .replace(THAI_LETTERS, " ");
}

/** The answer must be in the language of the page. A Thai reply on a Chinese page is not. */
export function answerMatchesUi(text: string, lang: Lang): boolean {
  const sample = lang === "th" ? text : proseForLanguage(text);
  return dominantLanguage(sample) === lang;
}

function unsafeRefusal(sentence: string): boolean {
  const value = sentence.toLowerCase();
  const denial =
    /authority is lacking|lacks (?:the |their )?authority|no (?:\w+ )?authority|no power to|exceeds their power|beyond their power|do not have to comply|no obligation to (?:cooperate|comply)|no reason to comply|do not consent|not consent to|legal basis to tell|违反第36条|属于违法|越权|ไม่ต้องยอม|ไม่ยินยอม|เกินอำนาจ/;
  if (denial.test(value)) return true;
  const refusal =
    /may refuse|can refuse|could refuse|refuse without|right to refuse|allows you to refuse|right to demand|ปฏิเสธได้|มีสิทธิ์?ปฏิเสธ|สามารถปฏิเสธ|可以拒绝|有权拒绝|无权/;
  if (refusal.test(value)) return true;
  const search = /search|ค้น|搜查|ตรวจค้น|dwelling|premises|บ้าน/;
  const order = /court order|warrant|หมาย|法院命令|令状|without a court order/;
  const noAuthority = /no authority|no provision that grants|automatic power|ไม่มีอำนาจ|无权|没有权力|没有搜查/;
  return noAuthority.test(value) && (search.test(value) || order.test(value) || /inspect|examin|message|communication|ตรวจ|通信/.test(value));
}

const SENTENCE_SPLIT = /\n+|(?<=[.。！？!?])\s+|…+|;\s+/;

/** A sentence that is only an empty quotation mark is not an answer. */
export function dropEmptyQuotes(answer: string): string {
  const kept = answer.split(SENTENCE_SPLIT).filter((part) => {
    const bare = part.replace(/[“”„«»"'「」『』\s.…—–\-]+/g, "");
    return bare.length > 0;
  });
  return kept
    .join("\n")
    .replace(/[“「『"][^A-Za-z\u0E00-\u0E7F\u4E00-\u9FFF]{0,12}[”」』"]/g, "")
    .replace(/\s+[”」』"]/g, "")
    .replace(/\*\*/g, "")
    .replace(/[ ]{2,}/g, " ")
    .trim();
}

/** Drop a sentence that says the person may refuse a search, or that authority is lacking. */
export function dropUnsafeRefusals(answer: string): string {
  const kept = answer
    .split(SENTENCE_SPLIT)
    .filter((part) => part.trim() && !unsafeRefusal(part));
  return kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** English answers cite a section, not an article. */
export function citeAsSection(answer: string, lang: Lang): string {
  if (lang !== "en") return answer;
  const titled = (word: string, replacement: string) => (word[0] === "A" ? replacement : replacement.toLowerCase());
  return answer
    .replace(/\barticles\b/gi, (word) => titled(word, "Sections"))
    .replace(/\barticle\b/gi, (word) => titled(word, "Section"));
}

export function shapeAskAnswer(
  answer: string,
  lang: Lang,
  sections: number[],
  translations: string[] = [],
): string {
  const stripped = stripFabricatedSources(answer);
  const refused = dropUnsafeRefusals(stripped);
  const cited = citeAsSection(refused, lang);
  const glossed = quotesInAnswerLanguage(cited, lang, translations);
  const cleaned = dropEmptyQuotes(glossed);
  const dropped = refused.trim() !== stripped.trim() || cleaned.trim() !== glossed.trim();
  return keepStatutoryExceptions(cleaned, lang, sections, dropped);
}

/** Shown when a retry still comes back in the wrong language. No confidence badge. */
export function wrongLanguageResult(lang: Lang, excerpts: AskExcerpt[]) {
  const lead = tr(
    lang,
    "คำตอบกลับมาเป็นคนละภาษากับหน้าที่เปิดอยู่ จึงไม่แสดงข้อความนั้น",
    "The answer came back in a different language from this page, so it is not shown.",
    "回答所用的语言与当前页面不一致，因此不显示那段文字。",
  );
  const body = excerpts
    .map((excerpt) =>
      tr(
        lang,
        `มาตรา ${excerpt.number}\n${excerpt.text}`,
        `Section ${excerpt.number}\n${excerpt.text}`,
        `第${excerpt.number}条\n${excerpt.text}`,
      ),
    )
    .join("\n\n");
  return {
    answer: [lead, body].filter(Boolean).join("\n\n"),
    confidence: null,
    grounded: false,
    sources: [] as AskSource[],
  };
}

export function notebookFallback(lang: Lang, excerpts: AskExcerpt[]) {
  const lead = tr(
    lang,
    "Non-Laws ยังไม่ส่งคำตอบกลับในเวลาที่กำหนด ด้านล่างคือตัวบทที่ใช้ถาม อ่านทุกข้อยกเว้น ไม่ใช่แค่เงื่อนไขเดียว",
    "Non-Laws did not answer in time. Below is the section you were reading. Read every exception, not only one condition.",
    "Non-Laws 没有在时限内返回。下面是你正在读的条文。请读每一项例外，而不只是一个条件。",
  );
  const body = excerpts
    .map((excerpt) =>
      tr(
        lang,
        `มาตรา ${excerpt.number}\n${excerpt.text}`,
        `Section ${excerpt.number}\n${excerpt.text}`,
        `第${excerpt.number}条\n${excerpt.text}`,
      ),
    )
    .join("\n\n");
  return {
    answer: [lead, body].filter(Boolean).join("\n\n"),
    confidence: "MIXED" as const,
    grounded: false,
    sources: [] as AskSource[],
  };
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
