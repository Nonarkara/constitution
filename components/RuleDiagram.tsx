"use client";
import { useStudy } from "./Provider";
import type { Text } from "@/lib/i18n";

type Box = {
  x: number;
  y: number;
  w: number;
  h: number;
  label: Text;
  tone?: "paper" | "wash" | "accent";
};
type Spec = {
  label: Text;
  boxes: Box[];
  lines: [number, number, number, number][];
};

const ink = "var(--ink)";
const wash = "var(--wash)";
const accent = "var(--accent)";

const diagrams: Record<string, Spec> = {
  "supreme-law": {
    label: {
      th: "แผนภาพมาตรา 5: กฎที่ขัดรัฐธรรมนูญใช้ไม่ได้",
      en: "Section 5: a rule that conflicts with the constitution cannot be enforced",
      zh: "第5条：与宪法抵触的规则不得执行",
    },
    boxes: [
      { x: 16, y: 16, w: 130, h: 44, label: { th: "ระเบียบกระทรวง", en: "Ministry rule", zh: "部委规章" }, tone: "paper" },
      { x: 174, y: 16, w: 130, h: 44, label: { th: "รัฐธรรมนูญ", en: "Constitution", zh: "宪法" }, tone: "accent" },
      { x: 96, y: 84, w: 128, h: 40, label: { th: "ใช้บังคับไม่ได้", en: "Unenforceable", zh: "不得执行" }, tone: "wash" },
    ],
    lines: [
      [81, 60, 140, 84],
      [239, 60, 180, 84],
    ],
  },
  "privy-councillor-party": {
    label: {
      th: "แผนภาพมาตรา 12: องคมนตรีแยกจากพรรค",
      en: "Section 12: a Privy Councillor stays apart from parties",
      zh: "第12条：枢密院大臣与政党分开",
    },
    boxes: [
      { x: 16, y: 40, w: 120, h: 44, label: { th: "องคมนตรี", en: "Privy Council", zh: "枢密院" }, tone: "accent" },
      { x: 184, y: 40, w: 120, h: 44, label: { th: "พรรคการเมือง", en: "Political party", zh: "政党" }, tone: "paper" },
    ],
    lines: [[136, 62, 184, 62]],
  },
  "phone-messages": {
    label: {
      th: "แผนภาพมาตรา 36: เปิดข้อความได้เมื่อมีหมายหรือเหตุตามกฎหมาย",
      en: "Section 36: messages open only with a warrant or a ground the law names",
      zh: "第36条：查看通信须有令状或法律规定的事由",
    },
    boxes: [
      { x: 16, y: 36, w: 88, h: 44, label: { th: "ข้อความ", en: "Messages", zh: "消息" }, tone: "accent" },
      { x: 124, y: 36, w: 88, h: 44, label: { th: "หมายศาล", en: "Court order", zh: "法院令状" }, tone: "wash" },
      { x: 232, y: 36, w: 72, h: 44, label: { th: "เปิดได้", en: "May open", zh: "可查看" }, tone: "paper" },
    ],
    lines: [
      [104, 58, 124, 58],
      [212, 58, 232, 58],
    ],
  },
  "home-search": {
    label: {
      th: "แผนภาพมาตรา 33: เข้าบ้านโดยไม่ยินยอมต้องมีคำสั่งหรือหมายศาล",
      en: "Section 33: entry without consent needs a court order or warrant",
      zh: "第33条：未经同意进入住宅须有法院命令或令状",
    },
    boxes: [
      { x: 16, y: 36, w: 88, h: 44, label: { th: "ประตูบ้าน", en: "Your door", zh: "家门" }, tone: "accent" },
      { x: 128, y: 16, w: 80, h: 36, label: { th: "ไม่ยินยอม", en: "No consent", zh: "拒绝" }, tone: "paper" },
      { x: 128, y: 68, w: 80, h: 36, label: { th: "หมายศาล", en: "Warrant", zh: "令状" }, tone: "wash" },
      { x: 228, y: 40, w: 76, h: 40, label: { th: "จึงเข้าได้", en: "Then enter", zh: "方可进入" }, tone: "paper" },
    ],
    lines: [
      [104, 58, 128, 34],
      [104, 58, 128, 86],
      [208, 86, 228, 60],
    ],
  },
  "equal-treatment": {
    label: {
      th: "แผนภาพมาตรา 27: มาตรการที่เปิดทางให้ใช้สิทธิไม่ใช่การเลือกปฏิบัติ",
      en: "Section 27: a measure that opens a right is not unjust discrimination",
      zh: "第27条：为使人同等行使权利而采取的措施不是不公平歧视",
    },
    boxes: [
      { x: 16, y: 40, w: 100, h: 44, label: { th: "ทางลาด", en: "A ramp", zh: "坡道" }, tone: "accent" },
      { x: 150, y: 40, w: 150, h: 44, label: { th: "ไม่ใช่สิทธิพิเศษ", en: "Not a privilege", zh: "不是特权" }, tone: "wash" },
    ],
    lines: [[116, 62, 150, 62]],
  },
  "peaceful-assembly": {
    label: {
      th: "แผนภาพมาตรา 44: ชุมนุมโดยสงบและปราศจากอาวุธ",
      en: "Section 44: a peaceful assembly without weapons",
      zh: "第44条：和平且不携带武器的集会",
    },
    boxes: [
      { x: 16, y: 40, w: 120, h: 44, label: { th: "สวนสาธารณะ", en: "The park", zh: "公园" }, tone: "wash" },
      { x: 168, y: 40, w: 136, h: 44, label: { th: "สงบ ไม่มีอาวุธ", en: "Peaceful, no arms", zh: "和平、无武器" }, tone: "accent" },
    ],
    lines: [[136, 62, 168, 62]],
  },
  "vote-duty": {
    label: {
      th: "แผนภาพมาตรา 50: การไปเลือกตั้งเป็นทั้งสิทธิและหน้าที่",
      en: "Section 50: voting is both a right and a duty",
      zh: "第50条：投票既是权利也是义务",
    },
    boxes: [
      { x: 100, y: 12, w: 120, h: 36, label: { th: "บัตรเลือกตั้ง", en: "The ballot", zh: "选票" }, tone: "accent" },
      { x: 24, y: 76, w: 120, h: 36, label: { th: "สิทธิ", en: "A right", zh: "权利" }, tone: "wash" },
      { x: 176, y: 76, w: 120, h: 36, label: { th: "หน้าที่", en: "A duty", zh: "义务" }, tone: "wash" },
    ],
    lines: [
      [140, 48, 84, 76],
      [180, 48, 236, 76],
    ],
  },
  "free-schooling": {
    label: {
      th: "แผนภาพมาตรา 54: สิบสองปีโดยไม่เก็บค่าใช้จ่าย",
      en: "Section 54: twelve years, free of charge",
      zh: "第54条：十二年，不收费",
    },
    boxes: [
      { x: 12, y: 44, w: 86, h: 40, label: { th: "ก่อนวัยเรียน", en: "Pre-school", zh: "学前" }, tone: "wash" },
      { x: 114, y: 44, w: 92, h: 40, label: { th: "12 ปี", en: "12 years", zh: "12年" }, tone: "accent" },
      { x: 222, y: 44, w: 86, h: 40, label: { th: "ไม่เก็บเงิน", en: "No fee", zh: "不收费" }, tone: "paper" },
    ],
    lines: [
      [98, 64, 114, 64],
      [206, 64, 222, 64],
    ],
  },
  "necessary-laws": {
    label: {
      th: "แผนภาพมาตรา 77: ฟังผู้เกี่ยวข้องก่อนตรากฎหมาย",
      en: "Section 77: hear the people affected before enacting a law",
      zh: "第77条：立法前先听取相关的人",
    },
    boxes: [
      { x: 12, y: 44, w: 86, h: 40, label: { th: "ร้านของคุณ", en: "Your shop", zh: "你的店" }, tone: "accent" },
      { x: 114, y: 44, w: 86, h: 40, label: { th: "รับฟัง", en: "Consult", zh: "听取" }, tone: "wash" },
      { x: 216, y: 44, w: 92, h: 40, label: { th: "จึงออกกฎหมาย", en: "Then the law", zh: "再立法" }, tone: "paper" },
    ],
    lines: [
      [98, 64, 114, 64],
      [200, 64, 216, 64],
    ],
  },
  "citizen-bill": {
    label: {
      th: "แผนภาพมาตรา 133: ผู้มีสิทธิเลือกตั้งหนึ่งหมื่นคนเข้าชื่อเสนอร่างกฎหมาย",
      en: "Section 133: ten thousand voters may propose a bill",
      zh: "第133条：一万名选民可以联署提案",
    },
    boxes: [
      { x: 12, y: 44, w: 100, h: 40, label: { th: "10,000 คน", en: "10,000 voters", zh: "1万选民" }, tone: "accent" },
      { x: 140, y: 44, w: 72, h: 40, label: { th: "สิทธิ", en: "Rights", zh: "权利" }, tone: "wash" },
      { x: 224, y: 44, w: 84, h: 40, label: { th: "ร่างกฎหมาย", en: "A bill", zh: "法案" }, tone: "paper" },
    ],
    lines: [
      [112, 64, 140, 64],
      [212, 64, 224, 64],
    ],
  },
  "pm-eight-years": {
    label: {
      th: "แผนภาพมาตรา 158: นายกรัฐมนตรีรวมกันไม่เกินแปดปี",
      en: "Section 158: a Prime Minister, eight years in total",
      zh: "第158条：总理累计不超过八年",
    },
    boxes: [
      { x: 16, y: 40, w: 110, h: 44, label: { th: "คนคนเดียว", en: "One person", zh: "同一个人" }, tone: "wash" },
      { x: 170, y: 40, w: 130, h: 44, label: { th: "เพดาน 8 ปี", en: "Cap at 8 years", zh: "上限8年" }, tone: "accent" },
    ],
    lines: [[126, 62, 170, 62]],
  },
  "mp-concessions": {
    label: {
      th: "แผนภาพมาตรา 184: ส.ส. ห้ามรับสัมปทานจากรัฐ",
      en: "Section 184: an MP may not take a state concession",
      zh: "第184条：议员不得接受国家特许",
    },
    boxes: [
      { x: 16, y: 40, w: 90, h: 44, label: { th: "ส.ส.", en: "MP", zh: "议员" }, tone: "wash" },
      { x: 140, y: 40, w: 160, h: 44, label: { th: "สัมปทาน ปิดไว้", en: "Concession closed", zh: "特许被关上" }, tone: "accent" },
    ],
    lines: [[106, 62, 140, 62]],
  },
  "independent-judges": {
    label: {
      th: "แผนภาพมาตรา 188: คดีจบที่กฎหมาย ไม่ใช่ที่สายโทรศัพท์",
      en: "Section 188: the case ends on the law, not on a phone call",
      zh: "第188条：案件止于法律，而非一通电话",
    },
    boxes: [
      { x: 12, y: 40, w: 90, h: 44, label: { th: "สายจากรัฐมนตรี", en: "A minister's call", zh: "部长来电" }, tone: "paper" },
      { x: 124, y: 40, w: 80, h: 44, label: { th: "ศาล", en: "The court", zh: "法院" }, tone: "accent" },
      { x: 220, y: 40, w: 88, h: 44, label: { th: "กฎหมาย", en: "The law", zh: "法律" }, tone: "wash" },
    ],
    lines: [
      [102, 62, 124, 62],
      [204, 62, 220, 62],
    ],
  },
  "constitutional-petition": {
    label: {
      th: "แผนภาพมาตรา 213: คนที่ถูกละเมิดสิทธิยื่นคำร้องต่อศาลรัฐธรรมนูญได้",
      en: "Section 213: a person whose rights are violated may petition the Constitutional Court",
      zh: "第213条：权利受侵犯的人可以向宪法法院申请",
    },
    boxes: [
      { x: 16, y: 40, w: 100, h: 44, label: { th: "คนที่เสียหาย", en: "The person harmed", zh: "受害者" }, tone: "accent" },
      { x: 160, y: 40, w: 140, h: 44, label: { th: "ศาลรัฐธรรมนูญ", en: "Constitutional Court", zh: "宪法法院" }, tone: "wash" },
    ],
    lines: [[116, 62, 160, 62]],
  },
  ombudsman: {
    label: {
      th: "แผนภาพมาตรา 230: ผู้ตรวจการแผ่นดินรับเรื่องความไม่เป็นธรรมจากหน่วยงาน",
      en: "Section 230: the Ombudsman takes unfair treatment by an agency",
      zh: "第230条：监察专员受理机关的不公正对待",
    },
    boxes: [
      { x: 12, y: 40, w: 90, h: 44, label: { th: "ใบอนุญาตค้าง", en: "A stalled permit", zh: "卡住的许可" }, tone: "paper" },
      { x: 124, y: 40, w: 180, h: 44, label: { th: "ผู้ตรวจการแผ่นดิน", en: "Ombudsman", zh: "监察专员" }, tone: "accent" },
    ],
    lines: [[102, 62, 124, 62]],
  },
  "independent-prosecutors": {
    label: {
      th: "แผนภาพมาตรา 248: อัยการสั่งคดีเอง กฎใช้ทั่วไป ไม่ใช่รายคดี",
      en: "Section 248: the prosecutor decides; the rule is general, not case by case",
      zh: "第248条：检察官自行决定；规则普遍适用，而非逐案",
    },
    boxes: [
      { x: 12, y: 40, w: 80, h: 44, label: { th: "สำนวน", en: "The file", zh: "案卷" }, tone: "wash" },
      { x: 112, y: 40, w: 80, h: 44, label: { th: "อัยการ", en: "Prosecutor", zh: "检察官" }, tone: "accent" },
      { x: 212, y: 40, w: 96, h: 44, label: { th: "กฎทั่วไป", en: "One rule", zh: "统一规则" }, tone: "paper" },
    ],
    lines: [
      [92, 62, 112, 62],
      [192, 62, 212, 62],
    ],
  },
  "local-petition": {
    label: {
      th: "แผนภาพมาตรา 254: ผู้มีสิทธิเลือกตั้งในท้องถิ่นเข้าชื่อเสนอหรือถอดถอนได้",
      en: "Section 254: local voters may petition to propose or to remove",
      zh: "第254条：地方选民可以联署提案或罢免",
    },
    boxes: [
      { x: 12, y: 40, w: 80, h: 44, label: { th: "ซอยน้ำท่วม", en: "A flooded lane", zh: "积水的巷" }, tone: "paper" },
      { x: 112, y: 40, w: 80, h: 44, label: { th: "รายชื่อ", en: "Signatures", zh: "联署" }, tone: "accent" },
      { x: 212, y: 40, w: 96, h: 44, label: { th: "สภาท้องถิ่น", en: "Local council", zh: "地方议会" }, tone: "wash" },
    ],
    lines: [
      [92, 62, 112, 62],
      [192, 62, 212, 62],
    ],
  },
  "unamendable-core": {
    label: {
      th: "แผนภาพมาตรา 255: รูปแบบของรัฐแก้ไม่ได้",
      en: "Section 255: the form of the state cannot be amended",
      zh: "第255条：国家形式不得修改",
    },
    boxes: [
      { x: 16, y: 40, w: 120, h: 44, label: { th: "แกนที่ล็อก", en: "Locked core", zh: "锁住的核心" }, tone: "accent" },
      { x: 176, y: 40, w: 128, h: 44, label: { th: "ที่เหลือแก้ได้", en: "The rest can move", zh: "其余可以改" }, tone: "wash" },
    ],
    lines: [[136, 62, 176, 62]],
  },
  "justice-delay": {
    label: {
      th: "แผนภาพมาตรา 258: ทุกขั้นตอนต้องมีระยะเวลาที่ชัดเจน",
      en: "Section 258: every stage needs a clear time limit",
      zh: "第258条：每个环节都要有明确时限",
    },
    boxes: [
      { x: 12, y: 44, w: 70, h: 36, label: { th: "เริ่ม", en: "Start", zh: "开始" }, tone: "wash" },
      { x: 100, y: 44, w: 90, h: 36, label: { th: "กำหนดเวลา", en: "A deadline", zh: "时限" }, tone: "accent" },
      { x: 210, y: 44, w: 96, h: 36, label: { th: "ไม่ล่าช้า", en: "Without delay", zh: "不拖延" }, tone: "paper" },
    ],
    lines: [
      [82, 62, 100, 62],
      [190, 62, 210, 62],
    ],
  },
  "senate-pm-window": {
    label: {
      th: "แผนภาพมาตรา 272: ห้าปีแรก ส.ว. ร่วมโหวตนายก แล้วหน้าต่างปิด",
      en: "Section 272: for five years senators joined the Prime Minister vote, then the window shut",
      zh: "第272条：头五年参议员参加总理投票，随后窗口关闭",
    },
    boxes: [
      { x: 12, y: 40, w: 90, h: 44, label: { th: "5 ปีแรก", en: "First 5 years", zh: "头5年" }, tone: "wash" },
      { x: 120, y: 40, w: 80, h: 44, label: { th: "ร่วมโหวต", en: "Joint vote", zh: "共同投票" }, tone: "accent" },
      { x: 218, y: 40, w: 88, h: 44, label: { th: "หมดเวลา", en: "Clock stopped", zh: "时间已到" }, tone: "paper" },
    ],
    lines: [
      [102, 62, 120, 62],
      [200, 62, 218, 62],
    ],
  },
};

export function hasRuleDiagram(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(diagrams, id);
}

export function RuleDiagram({ id }: { id: string }) {
  const { lang } = useStudy();
  const spec = diagrams[id];
  if (!spec) return null;
  return (
    <figure className="rule-diagram">
      <svg viewBox="0 0 320 132" role="img" aria-label={spec.label[lang]}>
        {spec.lines.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth={1.5} />
        ))}
        {spec.boxes.map((box) => (
          <g key={`${box.x}-${box.y}`}>
            <rect
              x={box.x}
              y={box.y}
              width={box.w}
              height={box.h}
              fill={box.tone === "accent" ? accent : box.tone === "wash" ? wash : "var(--paper)"}
              stroke={ink}
            />
            <text x={box.x + box.w / 2} y={box.y + box.h / 2 + 4} textAnchor="middle">
              {box.label[lang]}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
