import type { Text } from "./i18n";

/**
 * Suggested study starting points for broad headline keywords.
 *
 * The news desk has nine topics, matched from publisher headlines. The
 * notebook already holds two things that can place those topics: an index of
 * 197 everyday subjects, each matched to the sections that genuinely address
 * it (data/topics.json), and a memory house of sixteen rooms (lib/palace.ts).
 *
 * THE HOUSE HAS SIXTEEN ROOMS, NOT SEVENTEEN. The constitution has sixteen numbered
 * chapters plus separate Transitory Provisions (sections 262-279),
 * and it has no room in the house: the rooms are chapters one to sixteen.
 * Every room in the house is one of those chapters, so no room ever stands
 * for a chapter it does not hold, and none was invented to fill the gap.
 *
 * This table is the join between the two: the subject of the news, and the
 * suggested room of the house for further study. Each
 * row names the study subject it is drawn from, so the join can be checked
 * against the data instead of believed — tests/news-palace.test.ts reads
 * data/topics.json, data/outline.json and lib/palace.ts, and fails if a
 * section, a chapter or a room here has drifted away from them.
 *
 * THE ROOM IS THE ROOM OF THE CHAPTER, never a room invented to fit the
 * subject: three news topics sit in the National Assembly because three
 * kinds of law really are made there, and saying so is more useful than
 * pretending each one has a room of its own.
 *
 * A SUBJECT'S SECTIONS CAN SPREAD OVER CHAPTERS, so a row cites only the
 * sections of that subject inside its own room's chapter. The referendum is
 * matched to sections 50, 166, 224 and 256, which belong to four chapters;
 * its room is the amendment chapter, and section 256 — the referendum on an
 * amendment — is the one that lies in it. The other three sections are left
 * to the constitution's own index, where they are already listed under the
 * subject; a row that cited them beside one room would be claiming the
 * room holds them, and it does not.
 */
export type NewsHome = {
  /** The id of the subject in the constitution's own index. */
  subject: string;
  /** That subject's title, in the three languages. */
  title: Text;
  /** The short form of that title, for the one-line row it stands in. */
  short: Text;
  /** The sections that subject is matched to. */
  sections: number[];
  /** The chapter of the constitution the subject sits in. */
  chapter: number;
};

/** A chapter of the constitution, as data/outline.json writes it. */
export type ChapterRange = { number: number; start: number; end: number };

export const newsHomes: Record<string, NewsHome> = {
  constitution: {
    subject: "constitutional-amendment",
    title: {
      th: "การแก้ไขรัฐธรรมนูญ",
      en: "Amending the Constitution",
      zh: "修改宪法",
    },
    short: { th: "แก้ไขรัฐธรรมนูญ", en: "Amendment", zh: "修宪" },
    sections: [255, 256],
    chapter: 15,
  },
  referendum: {
    subject: "referendum",
    title: {
      th: "การออกเสียงประชามติ",
      en: "Referendum",
      zh: "公民投票",
    },
    short: { th: "ประชามติ", en: "Referendum", zh: "公投" },
    sections: [50, 166, 224, 256],
    chapter: 15,
  },
  legislation: {
    subject: "law-making",
    title: { th: "การตรากฎหมาย", en: "How a law is made", zh: "立法程序" },
    short: { th: "ตรากฎหมาย", en: "Law-making", zh: "立法" },
    sections: [81, 133, 136, 137, 145, 146],
    chapter: 7,
  },
  court: {
    subject: "courts",
    title: { th: "ศาล", en: "The courts", zh: "法院" },
    short: { th: "ศาล", en: "Courts", zh: "法院" },
    sections: [188, 189, 190, 191],
    chapter: 10,
  },
  parliament: {
    subject: "national-assembly",
    title: { th: "รัฐสภา", en: "National Assembly", zh: "国会" },
    short: { th: "รัฐสภา", en: "Parliament", zh: "国会" },
    sections: [79, 80, 81],
    chapter: 7,
  },
  election: {
    subject: "election-commission",
    title: {
      th: "คณะกรรมการการเลือกตั้ง (กกต.)",
      en: "Election Commission",
      zh: "选举委员会",
    },
    short: { th: "กกต.", en: "Election Commission", zh: "选举委员会" },
    sections: [222, 223, 224, 225, 226, 227],
    chapter: 12,
  },
  rights: {
    subject: "human-rights",
    title: { th: "สิทธิมนุษยชน", en: "Human rights", zh: "人权" },
    short: { th: "สิทธิมนุษยชน", en: "Human rights", zh: "人权" },
    sections: [230, 246, 247],
    chapter: 12,
  },
  budget: {
    subject: "budget",
    title: { th: "งบประมาณ", en: "The budget", zh: "预算" },
    short: { th: "งบประมาณ", en: "Budget", zh: "预算" },
    sections: [140, 141, 142, 143, 144],
    chapter: 7,
  },
  military: {
    subject: "military-service",
    title: { th: "การรับราชการทหาร", en: "Military service", zh: "服兵役" },
    short: { th: "ทหาร", en: "Military", zh: "军队" },
    sections: [50],
    chapter: 4,
  },
};

/**
 * The citation under a topic: the sections its law lives in.
 *
 * A run of consecutive sections is written as a range, because that is what
 * it is. A scattered list is written as its first and last with an ellipsis
 * between: the row it stands in is one line, and "§81…146" points at the
 * stretch the subject's sections lie in, where "§81, 133, 136, 137, 145,
 * 146" would not fit and would be cut short if it did.
 */
export function citeSections(sections: number[]): string {
  if (!sections.length) return "";
  if (sections.length === 1) return `§${sections[0]}`;
  const consecutive = sections.every(
    (n, i) => i === 0 || n === sections[i - 1] + 1,
  );
  if (consecutive) return `§${sections[0]}–${sections[sections.length - 1]}`;
  if (sections.length > 3) return `§${sections[0]}…${sections[sections.length - 1]}`;
  return `§${sections.join(", ")}`;
}

/**
 * The sections of a home that lie inside its own room's chapter.
 *
 * A room is one chapter, so a row cites only the subject's sections that fall
 * inside that chapter — not every section the subject touches. The number
 * beside a topic is therefore the sections of that subject in that chapter,
 * which is exactly what the page says it is.
 *
 * The room's own list is a shorter set of highlights inside that chapter, not
 * the whole of it. A room that listed every section of its chapter would be a
 * table of contents wearing a mnemonic's clothes.
 */
export function roomSections(
  home: NewsHome,
  chapters: readonly ChapterRange[],
): number[] {
  const range = chapters.find((c) => c.number === home.chapter);
  if (!range) return [];
  return home.sections.filter((s) => s >= range.start && s <= range.end);
}

/** The citation under a topic row: the sections inside its room. */
export function citeFor(
  home: NewsHome,
  chapters: readonly ChapterRange[],
): string {
  return citeSections(roomSections(home, chapters));
}
