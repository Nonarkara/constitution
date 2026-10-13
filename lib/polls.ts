const t = (th: string, en: string, zh: string) => ({ th, en, zh });
export const POLLS_KEY = "constitution-private-polls-v1";
export const polls = [
  {
    id: "goal",
    question: t(
      "วันนี้อยากได้อะไรกลับไป?",
      "What do you want to take away today?",
      "今天想带走什么？",
    ),
    choices: [
      t("จำตัวเลข", "Remember numbers", "记住数字"),
      t("เข้าใจเหตุผล", "Understand why", "理解理由"),
      t(
        "เอาไปใช้กับเหตุการณ์",
        "Use a rule in a real situation",
        "用于实际情境",
      ),
    ],
  },
  {
    id: "promise",
    question: t(
      "ได้ยินคำสัญญาใหญ่ ๆ อยากตรวจอะไรก่อน?",
      "When you hear a big promise, what would you check first?",
      "听到宏大承诺，想先核查什么？",
    ),
    choices: [
      t("ใครมีอำนาจทำ", "Who has power to do it", "谁有权做"),
      t("ต้องผ่านขั้นตอนไหน", "Which steps it needs", "需要哪些程序"),
      t("เงินและผลกระทบ", "Funding and effects", "资金与影响"),
    ],
  },
  {
    id: "amend",
    question: t(
      "ในเรื่องสมมติของเรา อยากใช้เวลาแก้ไขตอนนี้ไหม?",
      "In our fictional story, would you spend time on amendment now?",
      "在我们的虚构故事中，现在愿意花时间修宪吗？",
    ),
    choices: [
      t("อยาก", "Yes", "愿意"),
      t("ยังไม่อยาก", "Not now", "暂时不愿意"),
      t("ต้องรู้อีกหน่อย", "Need more information", "需要更多信息"),
    ],
  },
  {
    id: "tradeoff",
    question: t(
      "ถ้าต้องเลือกเรื่องหนึ่งให้ทำก่อน คุณจะชั่งอะไร?",
      "If one task must come first, what would you weigh?",
      "若必须先做一件事，你会衡量什么？",
    ),
    choices: [
      t("ประโยชน์ที่จะได้", "Expected benefit", "预期益处"),
      t(
        "ต้นทุนและสิ่งที่ต้องรอ",
        "Cost and what must wait",
        "成本及被推迟的事",
      ),
      t("ความเสี่ยงถ้าไม่ทำ", "Risk of doing nothing", "不做的风险"),
    ],
  },
  {
    id: "senate",
    question: t(
      "เรื่องวุฒิสภา อยากรู้เรื่องไหนให้ชัดก่อน?",
      "What would you clarify about the Senate first?",
      "关于参议院，想先弄清什么？",
    ),
    choices: [
      t("ที่มาและการคัดเลือก", "How members are selected", "成员如何产生"),
      t("หน้าที่และอำนาจ", "Duties and powers", "职责与权力"),
      t("การตรวจสอบการทำงาน", "How its work is checked", "如何监督其工作"),
    ],
  },
  {
    id: "square",
    question: t(
      "เมื่อคนเห็นต่างชุมนุมโดยสงบ คุณอยากตรวจเรื่องใด?",
      "When people who disagree assemble peacefully, what would you examine?",
      "意见不同的人和平集会时，你想核查什么？",
    ),
    choices: [
      t(
        "สิทธิและข้อจำกัดตามกฎหมาย",
        "Rights and legal limits",
        "权利与法律限制",
      ),
      t("ข้อเรียกร้องและหลักฐาน", "Demands and evidence", "诉求与证据"),
      t("ผลกระทบต่อคนอื่น", "Effects on others", "对他人的影响"),
    ],
  },
  {
    id: "evidence",
    question: t(
      "อะไรจะช่วยให้คุณเปลี่ยนความคิดได้?",
      "What could help you reconsider a view?",
      "什么能帮助你重新考虑观点？",
    ),
    choices: [
      t("ตัวบทที่อ่านครบ", "The complete legal text", "完整条文"),
      t("เหตุการณ์ที่มีหลักฐาน", "An evidenced case", "有证据的案例"),
      t(
        "เหตุผลที่ตอบข้อกังวล",
        "An argument answering my concern",
        "回应疑虑的理由",
      ),
    ],
  },
  {
    id: "method",
    question: t(
      "เมื่อจำไม่ได้ อยากลองแบบไหน?",
      "When you cannot recall, what would you try?",
      "想不起来时，愿意试哪种方法？",
    ),
    choices: [
      t(
        "ตอบสั้น ๆ แล้วเปิดเฉลย",
        "Try a short answer, then check",
        "先简答，再核对",
      ),
      t(
        "ใช้ภาพช่วยเรียกกฎ",
        "Use a picture to recall the rule",
        "用图像唤回规则",
      ),
      t("อธิบายให้คนอื่นฟัง", "Explain it to someone", "讲给别人听"),
    ],
  },
  {
    id: "pace",
    question: t(
      "รอบหน้าจังหวะแบบไหนเหมาะกับคุณ?",
      "What pace would suit your next round?",
      "下轮什么节奏适合你？",
    ),
    choices: [
      t("5 ข้อช้า ๆ", "Five questions, slowly", "慢慢做五题"),
      t("10 ข้อสลับเรื่อง", "Ten mixed questions", "十道交错题"),
      t("ลองจับเวลา", "Try a timed paper", "试计时卷"),
    ],
  },
  {
    id: "transfer",
    question: t(
      "อยากเอาความรู้ไปลองกับอะไรต่อ?",
      "Where would you apply what you learned next?",
      "接下来想把所学用在哪里？",
    ),
    choices: [
      t("ข่าวที่อ่านวันนี้", "Today’s news", "今天的新闻"),
      t("คำสัญญาเรื่องหนึ่ง", "One public promise", "一个公共承诺"),
      t("สถานการณ์ในชีวิต", "An everyday situation", "日常情境"),
    ],
  },
];
export type PollRecord = { choice: number; note: string };
export type PollAnswers = Record<string, PollRecord>;
export function parsePolls(input: unknown): PollAnswers | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const out: PollAnswers = {};
  for (const [id, v] of Object.entries(input)) {
    const p = polls.find((p) => p.id === id);
    if (!p || !v || typeof v !== "object") return null;
    const r = v as PollRecord;
    if (
      !Number.isInteger(r.choice) ||
      r.choice < 0 ||
      r.choice >= p.choices.length ||
      typeof r.note !== "string" ||
      r.note.length > 1000
    )
      return null;
    out[id] = { choice: r.choice, note: r.note };
  }
  return out;
}
