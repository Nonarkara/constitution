import type { Text } from "./i18n";
import type { Progress } from "./learning";
export const text = (th: string, en: string, zh: string): Text => ({
  th,
  en,
  zh,
});
export const civicRooms = [
  {
    id: "door",
    sections: [255, 256],
    ids: [1, 2, 3, 4, 5, 6, 15],
    name: text("ประตูแก้ไข", "The amendment door", "修宪门"),
    story: text(
      "ติ๊กกี้ถือคำสัญญามาถึงบ้าน ประตูแรกถามว่าใครเสนอได้ ประตูต่อมาขอกุญแจเสียงสภา นาฬิกาทรายให้รอ และบางประตูมีโต๊ะประชามติ ไม่มีใครเปิดทุกบานด้วยบัตรเลือกตั้งใบเดียว",
      "Tikky arrives carrying a promise. The first door asks who can propose it; the next needs parliamentary keys. An hourglass asks her to wait, and some doors have a referendum table. One ballot cannot open them all.",
      "蒂琪带着一个承诺来到房子。第一扇门问谁能提案，下一扇需要议会票数的钥匙。沙漏提醒等待，有些门前还摆着公投桌。一张选票打不开全部门。",
    ),
    fact: text(
      "รู้ไหม: เกณฑ์วาระแรกคือไม่น้อยกว่าครึ่ง แต่วาระสุดท้ายคือมากกว่าครึ่ง อย่าปัดสองคำนี้ให้เหมือนกัน",
      "Small but important: first reading says at least half; final reading says more than half. Those are different boundaries.",
      "小而重要的区别：一读是至少半数，终读是超过半数。两者不是同一个门槛。",
    ),
  },
  {
    id: "ballot",
    sections: [3, 159],
    ids: [7, 8],
    name: text("โต๊ะบัตรเลือกตั้ง", "The ballot table", "选票桌"),
    story: text(
      "ที่โต๊ะบัตร ติ๊กกี้ส่งงานให้ผู้แทน ไม่ได้ส่งเช็คเปล่า หลังกล่องบัตรยังมีโต๊ะสภาและกฎหมายอยู่ คำว่า «ประชาชนเลือกแล้ว» ไม่ได้ลบโต๊ะเหล่านั้น",
      "At the ballot table, Tikky hands over a job, not a blank cheque. Beyond the box stand the House table and the law. “The people elected us” does not make those disappear.",
      "在选票桌前，蒂琪交付的是职责，不是空白支票。投票箱后还有议会桌与法律。“人民选了我们”不会让它们消失。",
    ),
    fact: text(
      "รัฐธรรมนูญแยกแหล่งที่มาของอำนาจออกจากวิธีใช้อำนาจ ชนะเลือกตั้งกับทำได้ตามกฎหมายจึงเป็นคนละคำถาม",
      "The source of power and the rules for exercising it are separate questions. Winning an election is not the same as having legal authority for every act.",
      "权力来源与行使权力的规则是两回事。赢得选举不等于每项行动都有法律授权。",
    ),
  },
  {
    id: "square",
    sections: [34, 41, 44, 133, 256],
    ids: [9, 10, 11, 16],
    name: text("จัตุรัสที่คุยกันได้", "The public square", "公共广场"),
    story: text(
      "ติ๊กกี้นั่งฟังคนที่เห็นต่างในจัตุรัส ทุกคนมีพื้นที่พูดภายใต้เงื่อนไขของกฎหมาย ข้างจัตุรัสมีสองประตู: กฎหมายที่ประชาชนเสนอได้บางเรื่องหนึ่งหมื่นชื่อ และร่างแก้ไขห้าหมื่นชื่อ เสียงดังไม่ใช่ทางลัด แต่การมีส่วนร่วมก็ไม่ใช่ความผิดโดยตัวมันเอง",
      "Tikky listens to people she disagrees with. The square offers room to speak under legal conditions. Beside it are two doors: qualifying citizen bills need ten thousand signatures; amendment proposals need fifty thousand. Loudness is no shortcut, and participation itself is not wrongdoing.",
      "蒂琪倾听与自己意见不同的人。广场提供依法发声的空间。旁边有两扇门：符合条件的公民法案须一万签名，修宪提案须五万。大声不是捷径，参与本身也不是过错。",
    ),
    fact: text(
      "สิทธิให้รับเรื่องและพิจารณาคำร้อง ไม่ได้แปลว่าหน่วยงานต้องอนุมัติทุกคำขอ",
      "A right to have a petition considered does not guarantee every request will be granted.",
      "有权让请愿得到审议，不等于每项请求都会获准。",
    ),
  },
  {
    id: "desk",
    sections: [62, 77, 140],
    ids: [12, 13, 14],
    name: text("โต๊ะเงินและผลกระทบ", "The budget desk", "预算桌"),
    story: text(
      "ติ๊กกี้วางโปสเตอร์ไว้ข้างเหรียญ ถ้าบอกว่าแจกฟรี เธอเปิดลิ้นชักถามว่าเงินมาจากไหน ใครอนุมัติ และอะไรต้องรอ ตาชั่งไม่ได้บอกให้ชอบหรือเกลียดนโยบาย มันช่วยให้เห็นสิ่งที่ต้องแลก",
      "Tikky lays a poster beside some coins. “Free” makes her open the drawer: where does the money come from, who authorises it, and what must wait? The scale does not tell her to love or hate a policy; it makes the trade-offs visible.",
      "蒂琪把海报放在硬币旁。“免费”让她拉开抽屉：钱从哪来，谁有权批准，什么需要等待？天平不要求她喜欢或讨厌政策，而是让取舍看得见。",
    ),
    fact: text(
      "การรับฟังผู้เกี่ยวข้องและวิเคราะห์ผลกระทบก่อนตรากฎหมายเป็นหลักในมาตรา 77 ไม่ใช่แค่รายละเอียดบนโปสเตอร์",
      "Consultation and impact analysis before legislation are principles in section 77, not just poster details.",
      "立法前征求意见与分析影响是第77条的原则，不只是海报上的细节。",
    ),
  },
];
export const roomIds = (room: (typeof civicRooms)[number]) =>
  room.ids.map((n) => `civic-${String(n).padStart(2, "0")}`);
/** Due cards, past errors, unseen cards, then already-correct cards. Stable ordering within a tier. */
export function civicQueue(ids: string[], progress: Progress, now: number) {
  const rank = (id: string) => {
    const q = progress.questions[id];
    return q ? (q.due <= now ? 0 : !q.correct ? 1 : 3) : 2;
  };
  return [...ids].sort((a, b) => rank(a) - rank(b));
}
export const RESUME_COOKIE = "constitution-civic-room";
export function resumedRoom(cookie: string): string | null {
  const raw = cookie
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${RESUME_COOKIE}=`))
    ?.split("=")[1];
  return civicRooms.some((r) => r.id === raw) ? raw! : null;
}
