import type { Text } from "./i18n.ts";
import { palace, palaceFor } from "./palace.ts";

const t = (th: string, en: string, zh: string): Text => ({ th, en, zh });

export type MemoryItem = {
  id?: string;
  chapter?: number;
  sections: number[];
  prompt?: Partial<Text>;
};

export type MemoryCueModel = {
  topic: string;
  chapter: number | null;
  image: boolean;
  number: string;
  meaning: Text;
  joke: Text;
};

const PM_TERM: MemoryCueModel = {
  topic: "pm-term",
  chapter: null,
  image: false,
  number: "8",
  meaning: t(
    "นาฬิกา 8 ปีของนายกรัฐมนตรีคนเดียว รวมกันแล้วเกินไม่ได้ ไม่ว่าจะติดต่อกันหรือไม่ ช่วงรักษาการหลังพ้นตำแหน่งไม่นับ เพดาน 35 คนเป็นคนละกฎในมาตราเดียวกัน",
    "One Prime Minister, eight years in total, consecutive or not. Time spent carrying on after leaving office does not count. The cap of 35 other ministers is a different rule in the same section.",
    "同一位总理累计不得超过八年，不论是否连续。卸任后继续履职的期间不计算。最多35名其他部长是同一条里的另一项规则。",
  ),
  joke: t(
    "นาฬิกาเรือนนี้มีแปดชั่วโมง ไม่ได้นับเก้าอี้ในห้อง",
    "This clock has eight hours. It is not a count of chairs in the room.",
    "这只钟只有八个小时，不是在数房间里的椅子。",
  ),
};

const UNAMENDABLE: MemoryCueModel = {
  topic: "unamendable",
  chapter: null,
  image: false,
  number: "255",
  meaning: t(
    "มาตรา 255 ห้ามแก้การปกครองระบอบประชาธิปไตยอันมีพระมหากษัตริย์ทรงเป็นประมุข หรือเปลี่ยนรูปแบบของรัฐ ชื่อ 50,000 คนกับระยะรอ 15+15 วันเป็นมาตรา 256 คนละกฎ",
    "Section 255 prohibits an amendment that changes the democratic regime with the King as Head of State, or the form of the State. The 50,000 signatures and the 15+15 day waits are section 256, a different rule.",
    "第255条禁止改变以国王为国家元首的民主政体或国家形式的修正。5万个签名和15+15天的等待是第256条，是另一项规则。",
  ),
  joke: t(
    "กุญแจล็อกแกนกลาง ไม่ใช่คลิปบอร์ดเก็บรายชื่อ",
    "A lock on the core, not a clipboard of signatures.",
    "锁住的是核心，不是那块联署夹板。",
  ),
};

const CABINET_IDS = new Set(["c08-01", "c08-04"]);
const PM_TERM_IDS = new Set(["pm-eight-years", "s158-a"]);

export function topicFor(item: MemoryItem): string | null {
  const id = item.id ?? "";
  if (PM_TERM_IDS.has(id)) return "pm-term";
  if (CABINET_IDS.has(id)) return "cabinet-size";
  if (id.startsWith("drill-")) {
    const n = Number(id.slice(6));
    if (Number.isInteger(n) && Math.floor(n / 423) === 9) return "cabinet-size";
  }
  const sections = item.sections ?? [];
  if (sections.includes(255) && !sections.includes(256)) return "unamendable";
  if (sections.includes(256) && !sections.includes(255)) return "amendment-petition";
  if (sections.length === 1 && sections[0] === 158) {
    const blob = `${item.prompt?.th ?? ""} ${item.prompt?.en ?? ""} ${item.prompt?.zh ?? ""}`;
    if (/35|สามสิบห้า|三十五|Cabinet size|other ministers|จำนวนคณะรัฐมนตรี|รัฐมนตรีอื่น/.test(blob))
      return "cabinet-size";
    if (/แปดปี|eight year|八年|caretaker|ปฏิบัติหน้าที่ต่อไป|继续履职/.test(blob))
      return "pm-term";
  }
  return null;
}

function fromPalace(chapter: number, topic: string): MemoryCueModel | null {
  const entry = palaceFor(chapter);
  if (!entry) return null;
  return {
    topic,
    chapter,
    image: true,
    number: entry.number,
    meaning: entry.meaning,
    joke: entry.joke,
  };
}

/** A cue matches the question's rule. A chapter picture is not used when it teaches a different rule in the same chapter. */
export function memoryCueFor(item: MemoryItem): MemoryCueModel | null {
  const topic = topicFor(item);
  if (topic === "pm-term") return PM_TERM;
  if (topic === "unamendable") return UNAMENDABLE;
  if (topic === "cabinet-size") return fromPalace(8, topic);
  if (topic === "amendment-petition") return fromPalace(15, topic);
  const sections = item.sections ?? [];
  const entry = palace.find(
    (p) =>
      p.sections.length > 0 &&
      p.sections.every((n) => sections.includes(n)) &&
      !p.sections.some((n) => n === 158 || n === 255 || n === 256),
  );
  if (!entry) return null;
  return fromPalace(entry.chapter, `chapter-${entry.chapter}`);
}

type WhyCase = MemoryItem & { why?: Text };

/** A case "why" is shown only when it is about the same rule, not merely the same chapter or section number. */
export function matchingWhys<T extends WhyCase>(cases: readonly T[], item: MemoryItem): T[] {
  const topic = topicFor(item);
  return cases.filter((entry) => {
    const caseTopic = topicFor(entry);
    if (topic && caseTopic) return topic === caseTopic;
    if (caseTopic && !topic) return false;
    if (!entry.sections.length || !item.sections.length) return false;
    return (
      entry.sections.length === item.sections.length &&
      entry.sections.every((n) => item.sections.includes(n))
    );
  });
}
