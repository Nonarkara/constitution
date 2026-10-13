import type { Question } from "./learning";
import { fisherYates } from "./shuffle.ts";
const t = (th: string, en: string, zh: string) => ({ th, en, zh });
const themes = [
  { title: t("ภาพรวม", "Whole system", "全貌"), chapters: [] },
  {
    title: t("พื้นฐานและหน้าที่", "Basics and duties", "基础与义务"),
    chapters: [1, 2, 4, 5],
  },
  {
    title: t("สิทธิในชีวิตจริง", "Everyday rights", "日常权利"),
    chapters: [3, 4, 5],
  },
  {
    title: t("รัฐสภาและรัฐบาล", "Parliament and government", "国会与政府"),
    chapters: [7, 8, 9],
  },
  {
    title: t("ศาลและการตรวจสอบ", "Courts and checks", "法院与监督"),
    chapters: [10, 11, 12, 13],
  },
  {
    title: t(
      "ท้องถิ่นและนโยบาย",
      "Local government and policy",
      "地方政府与政策",
    ),
    chapters: [6, 14, 16],
  },
  { title: t("การแก้รัฐธรรมนูญ", "Amendment", "修宪"), chapters: [15] },
  {
    title: t("การเลือกตั้งและตำแหน่ง", "Elections and offices", "选举与职位"),
    chapters: [7, 8, 12],
  },
  {
    title: t(
      "บริการรัฐและความรับผิด",
      "Public services and responsibility",
      "公共服务与责任",
    ),
    chapters: [4, 5, 6, 9],
  },
  {
    title: t(
      "กฎปัจจุบันกับบทเฉพาะกาล",
      "Current and transitory rules",
      "现行与过渡规则",
    ),
    chapters: [1, 7, 8, 15, 17],
    // The transitory provisions are the theme. Fill them before other chapters.
    core: [17],
  },
];
export const papers = themes.flatMap((theme, j) =>
  [
    { count: 25, minutes: 30 },
    { count: 50, minutes: 60 },
    { count: 100, minutes: 120 },
  ].map((f, k) => ({
    id: `paper-${String(j * 3 + k + 1).padStart(2, "0")}`,
    number: j * 3 + k + 1,
    title: theme.title,
    chapters: theme.chapters,
    core: "core" in theme ? theme.core : [],
    ...f,
  })),
);
export function seededRandom(seed: number) {
  let n = seed >>> 0;
  return () => {
    n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
    return n / 4294967296;
  };
}
function balanced(bank: Question[], count: number, random: () => number) {
  const by = new Map<number, Question[]>();
  for (const q of bank) {
    const own = by.get(q.chapter) ?? [];
    own.push(q);
    by.set(q.chapter, own);
  }
  const buckets = fisherYates(
    [...by.values()].map((b) => fisherYates(b, random)),
    random,
  );
  const out: Question[] = [];
  while (out.length < count && buckets.some((b) => b.length)) {
    for (const b of buckets) {
      const q = b.pop();
      if (q) out.push(q);
      if (out.length === count) break;
    }
  }
  return out;
}
export function makePaper(
  bank: Question[],
  paper: (typeof papers)[number],
): Question[] {
  const random = seededRandom(paper.number * 104729);
  const coreChapters = paper.core ?? [];
  const coreBank = bank.filter((q) => coreChapters.includes(q.chapter));
  const core = coreChapters.length
    ? balanced(coreBank, Math.min(coreBank.length, paper.count), random)
    : [];
  const used = new Set(core.map((q) => q.id));
  const preferred = bank.filter(
    (q) => paper.chapters.includes(q.chapter) && !used.has(q.id),
  );
  const themeFill = coreChapters.length
    ? balanced(
        preferred,
        Math.min(preferred.length, paper.count - core.length),
        random,
      )
    : [];
  const sampled = coreChapters.length
    ? []
    : paper.chapters.length
      ? balanced(
          preferred,
          Math.min(preferred.length, Math.ceil(paper.count * 0.6)),
          random,
        )
      : [];
  const focus = [...core, ...themeFill, ...sampled];
  for (const q of focus) used.add(q.id);
  const rest = balanced(
    bank.filter((q) => !used.has(q.id)),
    paper.count - focus.length,
    random,
  );
  return fisherYates([...focus, ...rest], random).map((q) => {
    const order = fisherYates(
      q.choices.map((_, i) => i),
      random,
    );
    return {
      ...q,
      choices: order.map((i) => q.choices[i]),
      answer: order.indexOf(q.answer),
    };
  });
}
