import type { Text } from "./i18n.ts";

/** Life puzzles that are not rights of a person. They stay on Learn. */
export const NON_RIGHTS = [
  "privy-councillor-party",
  "pm-eight-years",
  "senate-pm-window",
  "mp-concessions",
  "unamendable-core",
] as const;

export const RIGHT_GROUPS: { id: string; title: Text; ids: string[] }[] = [
  {
    id: "person",
    title: {
      th: "ตัวคุณและบ้านของคุณ",
      en: "Your person and your home",
      zh: "你的人身与住所",
    },
    ids: ["phone-messages", "home-search", "equal-treatment", "peaceful-assembly"],
  },
  {
    id: "livelihood",
    title: {
      th: "การเรียน เสียง และการลงชื่อ",
      en: "School, voice and a signature",
      zh: "学业、声音与联署",
    },
    ids: ["free-schooling", "vote-duty", "citizen-bill", "local-petition", "necessary-laws"],
  },
  {
    id: "account",
    title: {
      th: "เมื่อรัฐทำไม่ถูกต้อง",
      en: "When the state gets it wrong",
      zh: "当国家做错时",
    },
    ids: [
      "supreme-law",
      "ombudsman",
      "constitutional-petition",
      "independent-judges",
      "independent-prosecutors",
      "justice-delay",
    ],
  },
];

export function groupedRights<T extends { id: string }>(items: readonly T[]) {
  const byId = new Map(items.map((item) => [item.id, item]));
  let n = 0;
  return RIGHT_GROUPS.map((group) => ({
    id: group.id,
    title: group.title,
    items: group.ids.flatMap((id) => {
      const item = byId.get(id);
      if (!item) return [];
      n += 1;
      return [{ n, item }];
    }),
  })).filter((group) => group.items.length > 0);
}
