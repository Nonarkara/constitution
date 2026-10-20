import type { Text } from "./i18n.ts";

export type Door = "learn" | "practise" | "explore";
export type NavLink = { href: string; label: Text };

const text = (th: string, en: string, zh: string): Text => ({ th, en, zh });

export const DOORS: { id: Door; href: string; label: Text }[] = [
  { id: "learn", href: "/bible/", label: text("เรียน", "Learn", "学习") },
  { id: "practise", href: "/practice/", label: text("ฝึก", "Practise", "练习") },
  { id: "explore", href: "/library/", label: text("สำรวจ", "Explore", "探索") },
];

export const GUIDE = [
  { slug: "history", chapters: [] as number[], label: text("ประวัติ", "the history", "历史"), title: text("ประวัติ", "History", "历史") },
  { slug: "how-to-read", chapters: [1], label: text("วิธีอ่าน", "how to read", "如何阅读"), title: text("วิธีอ่าน", "How to read", "如何阅读") },
  { slug: "general-and-king", chapters: [1, 2], label: text("บททั่วไปและพระมหากษัตริย์", "general provisions and the King", "总则与国王"), title: text("บททั่วไปและพระมหากษัตริย์", "General provisions and the King", "总则与国王") },
  { slug: "rights", chapters: [3], label: text("สิทธิ", "rights", "权利"), title: text("สิทธิ", "Rights", "权利") },
  { slug: "duties-state-policy", chapters: [4, 5, 6], label: text("หน้าที่และแนวนโยบาย", "duties and policy", "义务与政策"), title: text("หน้าที่และแนวนโยบาย", "Duties and policy", "义务与政策") },
  { slug: "parliament", chapters: [7], label: text("รัฐสภา", "parliament", "国会"), title: text("รัฐสภา", "Parliament", "国会") },
  { slug: "organic-laws", chapters: [] as number[], label: text("กฎหมายประกอบรัฐธรรมนูญ", "organic laws", "组织法"), title: text("กฎหมายประกอบรัฐธรรมนูญ", "Organic laws", "组织法") },
  { slug: "cabinet", chapters: [8, 9], label: text("คณะรัฐมนตรี", "the cabinet", "内阁"), title: text("คณะรัฐมนตรี", "Cabinet", "内阁") },
  { slug: "courts", chapters: [10, 11], label: text("ศาล", "the courts", "法院"), title: text("ศาล", "Courts", "法院") },
  { slug: "independent-organs", chapters: [12, 13], label: text("องค์กรอิสระ", "independent organs", "独立机构"), title: text("องค์กรอิสระ", "Independent organs", "独立机构") },
  { slug: "local-and-amendment", chapters: [14, 15, 16], label: text("ท้องถิ่นและการแก้ไข", "local government and amendment", "地方与修宪"), title: text("ท้องถิ่นและการแก้ไข", "Local government and amendment", "地方与修宪") },
  { slug: "transitory", chapters: [17], label: text("บทเฉพาะกาล", "transitory provisions", "过渡条款"), title: text("บทเฉพาะกาล", "Transitory provisions", "过渡条款") },
  { slug: "exam-method", chapters: [] as number[], label: text("วิธีทำข้อสอบ", "how to answer", "答题方法"), title: text("วิธีทำข้อสอบ", "How to answer", "答题方法") },
];

/**
 * Routes that exist only to forward somewhere else. They are real files, so a
 * link check passes them, but they have no content of their own and must never
 * be advertised as pages: the sitemap and the podcast feeds both filter this out,
 * and `npm run check:release` fails if one slips back in.
 */
export const REDIRECT_ROUTES: string[] = ["/learn/"];

/** Every page route, including each study-guide chapter. `/learn/` redirects to `/`. */
export const APP_ROUTES = [
  "/",
  "/learn/",
  "/bible/",
  ...GUIDE.map((g) => `/bible/${g.slug}/`),
  "/read/",
  "/section/",
  "/notebook/",
  "/cram/",
  "/glossary/",
  "/topics/",
  "/practice/",
  "/practice/pokklong/",
  "/review/",
  "/exam/",
  "/drills/",
  "/flashcards/",
  "/games/",
  "/along/",
  "/cheatsheet/",
  "/library/",
  "/rights/",
  "/polls/",
  "/civic/",
  "/amend/",
  "/news/",
  "/memory/",
  "/tikki/",
  "/sources/",
  "/research/",
  "/notes/",
  "/settings/",
];

const LEARN = new Set(["/bible/", "/read/", "/section/", "/notebook/", "/cram/", "/glossary/", "/topics/"]);
const PRACTISE = new Set(["/practice/", "/practice/pokklong/", "/along/", "/review/", "/exam/", "/drills/", "/flashcards/", "/games/", "/cheatsheet/"]);
const EXPLORE = new Set(["/library/", "/rights/", "/polls/", "/civic/", "/amend/", "/news/", "/memory/", "/tikki/", "/sources/", "/research/"]);

const PAGE: Record<string, Text> = {
  "/read/": text("อ่าน", "Read", "阅读"),
  "/notebook/": text("สมุดสองหน้า", "Notebook", "双页"),
  "/cram/": text("สรุปก่อนสอบ", "Night-before sheet", "考前一页"),
  "/glossary/": text("อภิธาน", "Glossary", "术语"),
  "/topics/": text("ดัชนีเรื่อง", "Subject index", "主题索引"),
  "/practice/pokklong/": text("ปกครอง", "Pokklong", "治理"),
  "/review/": text("ทบทวน", "Review", "复习"),
  "/exam/": text("สอบจำลอง", "Mock exam", "模拟考试"),
  "/drills/": text("แบบฝึกตัวเลข", "Drills", "数字练习"),
  "/flashcards/": text("การ์ด", "Flashcards", "闪卡"),
  "/games/": text("จับคู่", "Match", "配对"),
  "/along/": text("แนวข้อสอบนายอำเภอ", "District-chief exam topics", "县长考试题型"),
  "/cheatsheet/": text("สูตร", "Formulas", "公式"),
  "/rights/": text("สิทธิของคุณ", "Your rights", "你的权利"),
  "/polls/": text("คำถามส่วนตัว", "Polls", "问卷"),
  "/civic/": text("คำสัญญา", "Civic", "承诺"),
  "/amend/": text("การแก้ไข", "Amend", "修宪"),
  "/news/": text("ข่าว", "News", "新闻"),
  "/memory/": text("บ้านความจำ", "Memory", "记忆屋"),
  "/tikki/": text("เรื่องราวของติ๊กกี้", "Tikki's Story", "蒂基的故事"),
  "/sources/": text("แหล่งอ้างอิง", "Sources", "资料来源"),
  "/research/": text("ที่มาของสมุด", "About", "关于"),
};

const RANGES: [number, number, number][] = [
  [1, 1, 5],
  [2, 6, 24],
  [3, 25, 49],
  [4, 50, 50],
  [5, 51, 63],
  [6, 64, 78],
  [7, 79, 157],
  [8, 158, 183],
  [9, 184, 187],
  [10, 188, 199],
  [11, 200, 214],
  [12, 215, 247],
  [13, 248, 248],
  [14, 249, 254],
  [15, 255, 256],
  [16, 257, 261],
  [17, 262, 279],
];

export function normalizePath(path: string): string {
  const bare = path.split("?")[0].split("#")[0];
  if (bare === "" || bare === "/") return "/";
  return bare.endsWith("/") ? bare : `${bare}/`;
}

export function chapterOfSection(n: number): number {
  return RANGES.find(([, start, end]) => n >= start && n <= end)?.[0] ?? 1;
}

export function doorFor(path: string): Door | null {
  const p = normalizePath(path);
  if (p.startsWith("/bible/")) return "learn";
  if (LEARN.has(p)) return "learn";
  if (PRACTISE.has(p)) return "practise";
  if (EXPLORE.has(p)) return "explore";
  return null;
}

function doorLink(door: Door): NavLink {
  const found = DOORS.find((item) => item.id === door)!;
  return { href: found.href, label: found.label };
}

const nextLabel = (th: string, en: string, zh: string): Text => text(`ต่อไป: ${th}`, `Next: ${en}`, `下一步：${zh}`);
const backLabel = (parent: Text): Text => ({
  th: `← กลับไป${parent.th}`,
  en: `← Back to ${parent.en}`,
  zh: `← 返回${parent.zh}`,
});

const home = text("หน้าแรก", "Home", "首页");
const progress = text("ความก้าวหน้าของคุณ", "Your progress", "你的进度");
const settings = text("อุปกรณ์", "Settings", "设置");

function guideBySlug(slug: string) {
  return GUIDE.find((item) => item.slug === slug);
}

export type NavContext = { section?: number; check?: number; drill?: number };

export function crumbsFor(path: string, ctx: NavContext = {}): NavLink[] {
  const p = normalizePath(path);
  if (p === "/" || p === "/learn/") return [];
  if (p === "/notes/") return [
    { href: "/", label: home },
    { href: "/notes/", label: progress },
  ];
  if (p === "/settings/") return [
    { href: "/", label: home },
    { href: "/settings/", label: settings },
  ];
  const door = doorFor(p);
  const head = door ? [doorLink(door)] : [];
  if (p.startsWith("/bible/") && p !== "/bible/") {
    const slug = p.split("/").filter(Boolean)[1];
    const guide = guideBySlug(slug);
    return [...head, { href: p, label: guide?.title ?? text(slug, slug, slug) }];
  }
  if (p === "/practice/" && ctx.check) {
    const chapter = ctx.check;
    return [
      doorLink("learn"),
      { href: `/read/?c=${chapter}`, label: text(`หมวด ${chapter}`, `Ch ${chapter}`, `第${chapter}章`) },
      { href: `/practice/?check=${chapter}`, label: text("ตรวจสั้น ๆ", "Short check", "小测") },
    ];
  }
  if (p === "/practice/" && ctx.drill) {
    const n = ctx.drill;
    return [
      doorLink("practise"),
      { href: `/practice/?session=drill&section=${n}`, label: text(`ฝึก ม.${n}`, `Drill s.${n}`, `练习第${n}条`) },
    ];
  }
  if (p === "/section/") {
    const n = ctx.section;
    if (!n) return [...head, { href: "/section/", label: text("มาตรา", "Section", "条文") }];
    const chapter = chapterOfSection(n);
    return [
      ...head,
      { href: `/read/?c=${chapter}`, label: text(`หมวด ${chapter}`, `Ch ${chapter}`, `第${chapter}章`) },
      { href: `/section/?n=${n}`, label: text(`ม.${n}`, `s.${n}`, `第${n}条`) },
    ];
  }
  if (door && doorLink(door).href === p) return head;
  const label = PAGE[p];
  return label ? [...head, { href: p, label }] : head;
}

export function backFor(path: string, ctx: NavContext = {}): NavLink | null {
  const p = normalizePath(path);
  if (p === "/") return null;
  if (p === "/practice/" && ctx.drill) {
    const n = ctx.drill;
    return { href: `/section/?n=${n}`, label: backLabel(text(`ม.${n}`, `s.${n}`, `第${n}条`)) };
  }
  const crumbs = crumbsFor(p, ctx);
  if (crumbs.length < 2) return { href: "/", label: backLabel(home) };
  const parent = crumbs[crumbs.length - 2];
  return { href: parent.href, label: backLabel(parent.label) };
}

export function nextFor(path: string, ctx: NavContext = {}): NavLink | null {
  const p = normalizePath(path);
  if (p === "/") return null;
  if (p === "/learn/") return { href: "/", label: nextLabel("หน้าแรก", "home", "首页") };
  if (p === "/bible/") return { href: `/bible/${GUIDE[0].slug}/`, label: nextLabel(GUIDE[0].label.th, GUIDE[0].label.en, GUIDE[0].label.zh) };
  if (p.startsWith("/bible/")) {
    const slug = p.split("/").filter(Boolean)[1];
    const index = GUIDE.findIndex((item) => item.slug === slug);
    const following = GUIDE[index + 1];
    if (!following) return { href: "/practice/", label: nextLabel("ฝึก", "practise", "练习") };
    return { href: `/bible/${following.slug}/`, label: nextLabel(following.label.th, following.label.en, following.label.zh) };
  }
  if (p === "/section/") {
    const n = ctx.section;
    if (!n) return { href: "/read/", label: nextLabel("อ่านตัวบท", "read the text", "阅读条文") };
    return { href: `/practice/?check=${chapterOfSection(n)}`, label: nextLabel("ตรวจสั้น ๆ", "a short check", "小测验") };
  }
  const fixed: Record<string, NavLink> = {
    "/read/": { href: "/section/?n=1", label: nextLabel("มาตรา 1", "section 1", "第1条") },
    "/notebook/": { href: "/read/", label: nextLabel("อ่านทั้งฉบับ", "read the text", "阅读全文") },
    "/cram/": { href: "/exam/", label: nextLabel("สอบจำลอง", "the mock exam", "模拟考试") },
    "/glossary/": { href: "/read/", label: nextLabel("อ่านตัวบท", "read the text", "阅读条文") },
    "/topics/": { href: "/read/", label: nextLabel("อ่านตัวบท", "read the text", "阅读条文") },
    "/practice/": { href: "/exam/", label: nextLabel("สอบจำลอง", "the mock exam", "模拟考试") },
    "/practice/pokklong/": { href: "/practice/", label: nextLabel("รอบฝึก", "the practice session", "练习") },
    "/review/": { href: "/bible/", label: nextLabel("เรียนส่วนที่ยังไม่แน่น", "learn the weak part", "学习还不熟的部分") },
    "/exam/": { href: "/practice/?session=mixed", label: nextLabel("ฝึกข้อที่พลาด", "practise what you missed", "练习错过的题") },
    "/drills/": { href: "/practice/", label: nextLabel("รอบฝึก", "the practice session", "练习") },
    "/flashcards/": { href: "/practice/", label: nextLabel("รอบฝึก", "the practice session", "练习") },
    "/games/": { href: "/practice/", label: nextLabel("รอบฝึก", "the practice session", "练习") },
    "/along/": { href: "/exam/", label: nextLabel("สอบจำลอง", "the mock exam", "模拟考试") },
    "/cheatsheet/": { href: "/practice/", label: nextLabel("รอบฝึก", "the practice session", "练习") },
    "/library/": { href: "/rights/", label: nextLabel("สิทธิของคุณ", "your rights", "你的权利") },
    "/rights/": { href: "/bible/rights/", label: nextLabel("เรียนสิทธิ", "learn rights", "学习权利") },
    "/polls/": { href: "/civic/", label: nextLabel("ตรวจคำสัญญา", "check a promise", "核查承诺") },
    "/civic/": { href: "/amend/", label: nextLabel("การแก้ไข", "amendment", "修宪") },
    "/amend/": { href: "/bible/local-and-amendment/", label: nextLabel("เรียนการแก้ไข", "learn amendment", "学习修宪") },
    "/news/": { href: "/rights/", label: nextLabel("สิทธิของคุณ", "your rights", "你的权利") },
    "/memory/": { href: "/bible/", label: nextLabel("เรียนคู่มือ", "the study guide", "学习指南") },
    "/tikki/": { href: "/bible/", label: nextLabel("เริ่มเรียนรู้", "start learning", "开始学习") },
    "/sources/": { href: "/read/", label: nextLabel("อ่านตัวบท", "read the text", "阅读条文") },
    "/research/": { href: "/sources/", label: nextLabel("แหล่งอ้างอิง", "sources", "资料来源") },
    "/notes/": { href: "/practice/?session=mixed", label: nextLabel("ฝึกต่อ", "practise", "继续练习") },
    "/settings/": { href: "/", label: nextLabel("หน้าแรก", "home", "首页") },
  };
  return fixed[p] ?? { href: "/", label: nextLabel("หน้าแรก", "home", "首页") };
}
