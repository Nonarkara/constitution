import { amendmentThresholds } from "./amendment.ts";
import { enNoun, formatCount } from "./grammar.ts";
import type { Question } from "./learning";
export const DRILL_COUNT = 4230;
export const DRILL_FAMILIES = 10;
const t = (th: string, en: string, zh: string) => ({ th, en, zh });
export const drillNames = [
  t("เสียงวาระแรก", "First-reading votes", "一读票数"),
  t("เสียงวาระสุดท้าย", "Final-reading votes", "终读票数"),
  t("เสียง ส.ว.", "Senate threshold", "参议员门槛"),
  t("เสียง ส.ส. กลุ่มที่กำหนด", "Specified-party MPs", "特定政党的议员"),
  t("ส.ส. เสนอแก้ไข", "MP amendment proposal", "议员修宪提案"),
  t("สองสภาร่วมเสนอ", "Joint amendment proposal", "两院联合提案"),
  t(
    "เช็กทุกประตูวาระแรก",
    "Check both first-reading gates",
    "核对一读两道门槛",
  ),
  t(
    "เช็กสามประตูวาระสุดท้าย",
    "Check all final-reading gates",
    "核对终读三道门槛",
  ),
  t("รายชื่อที่ยังขาด", "Missing petition signatures", "还缺多少联署"),
  t("เก้าอี้รัฐมนตรี", "Ministerial seats", "部长席位"),
];
/** Neighbours in a family are 97 steps apart, so a round of five is not +1 MP. */
export function drillSpread(seed: number) {
  return (seed * 97) % 423;
}
export function drillMembership(seed: number) {
  const spread = drillSpread(seed);
  return {
    spread,
    H: 72 + spread,
    S: 40 + (spread % 161),
    E: 10 + (spread % 60),
  };
}
export function petitionGap(seed: number) {
  const spread = drillSpread(seed);
  const amendment = spread % 2 === 0;
  const need = amendment ? 50_000 : 10_000;
  const have = amendment ? 8_000 + spread * 90 : 1_000 + spread * 20;
  return { amendment, need, have, missing: need - have };
}
export function ministerialRemoval(seed: number) {
  const spread = drillSpread(seed);
  const have = 15 + (spread % 21);
  const remove = 1 + Math.floor(spread / 21);
  const add = 35 - have + remove;
  return { have, add, remove };
}
export const drillId = (i: number) => `drill-${String(i).padStart(4, "0")}`;
export const drillIds = () =>
  Array.from({ length: DRILL_COUNT }, (_, i) => drillId(i));
export function makeDrill(i: number): Question {
  if (!Number.isInteger(i) || i < 0 || i >= DRILL_COUNT)
    throw new RangeError("Invalid drill");
  const family = Math.floor(i / 423),
    seed = i % 423,
    { H, S, E } = drillMembership(seed);
  const a = amendmentThresholds(H, S, E),
    total = H + S;
  let value = 0,
    prompt = t("", "", ""),
    explanation = t("", "", ""),
    sections = [256],
    chapter = 15;
  const fiction = t(
    `โจทย์สมมติ มี ส.ส. ${H} คน ส.ว. ${S} คน นับสมาชิกเท่าที่มีอยู่`,
    `Fiction: ${H} existing MPs and ${S} existing senators.`,
    `假设现有${H}名众议员、${S}名参议员。`,
  );
  const counts = [
    a.first,
    a.final,
    a.senate,
    a.eligible,
    a.proposalMPs,
    a.proposalJoint,
  ];
  const subjects = [
    t(
      "วาระแรกต้องได้เสียงรวมอย่างน้อยกี่เสียง?",
      "What is the minimum total yes vote at first reading?",
      "一读至少需要多少总赞成票？",
    ),
    t(
      "วาระสุดท้ายต้องได้เสียงรวมอย่างน้อยกี่เสียง?",
      "What is the minimum total yes vote at final reading?",
      "终读至少需要多少总赞成票？",
    ),
    t(
      "ต้องได้เสียง ส.ว. อย่างน้อยกี่คน?",
      "What is the minimum Senate yes vote?",
      "参议员至少须多少票赞成？",
    ),
    t(
      `สมมติมี ส.ส. ในกลุ่มพรรคที่กำหนด ${E} คน วาระสุดท้ายต้องได้เสียงกลุ่มนี้อย่างน้อยกี่คน?`,
      `Assume ${E} MPs in the specified party group. How many must vote yes at final reading?`,
      `假设特定政党组有${E}名议员，终读至少须其中多少人赞成？`,
    ),
    t(
      "ถ้า ส.ส. เสนอร่างแก้ไข ต้องเข้าชื่ออย่างน้อยกี่คน?",
      "If MPs propose an amendment, how many must sign?",
      "众议员提出修宪草案，至少须多少人联署？",
    ),
    t(
      "ถ้า ส.ส. และ ส.ว. ร่วมเสนอ ต้องเข้าชื่อรวมอย่างน้อยกี่คน?",
      "For a joint MP–Senator proposal, how many must sign in total?",
      "两院成员联合提案，至少须多少人联署？",
    ),
  ];
  const rules = [
    t(
      "วาระแรก: ไม่น้อยกว่าครึ่งของสมาชิกสองสภาเท่าที่มีอยู่",
      "First reading: at least half of existing combined membership",
      "一读：至少现有两院成员的半数",
    ),
    t(
      "วาระสุดท้าย: มากกว่าครึ่ง ไม่ใช่แค่ถึงครึ่ง",
      "Final reading: more than half, not merely half",
      "终读：超过半数，不是达到半数",
    ),
    t(
      "เสียง ส.ว.: ไม่น้อยกว่าหนึ่งในสาม ปัดขึ้นเมื่อเป็นเศษ",
      "Senators: at least one third; round a fraction up",
      "参议员：至少三分之一；有小数须向上取整",
    ),
    t(
      "กลุ่มพรรคที่กำหนด: ไม่น้อยกว่า 20% รวมทั้งกลุ่ม ไม่แยกคิดทีละพรรค",
      "Specified parties: at least 20% across the combined eligible group, not per party",
      "特定政党：合计议员的至少20%，不是逐党计算",
    ),
    t(
      "ส.ส. เสนอแก้ไข: อย่างน้อยหนึ่งในห้าของ ส.ส. เท่าที่มีอยู่",
      "MP proposal: at least one fifth of existing MPs",
      "众议员提案：至少现有众议员的五分之一",
    ),
    t(
      "ร่วมเสนอ: อย่างน้อยหนึ่งในห้าของสมาชิกสองสภาเท่าที่มีอยู่",
      "Joint proposal: at least one fifth of existing combined membership",
      "联合提案：至少现有两院成员的五分之一",
    ),
  ];
  if (family < 6) {
    value = counts[family];
    const denominator = [total, total, S, E, H, total][family];
    const divisor = [2, 2, 3, 5, 5, 5][family];
    prompt = t(
      `${fiction.th} ${subjects[family].th}`,
      `${fiction.en} ${subjects[family].en}`,
      `${fiction.zh} ${subjects[family].zh}`,
    );
    explanation = t(
      `${rules[family].th} คิดจาก ${denominator} ÷ ${divisor} จึงต้อง ${value} คน นี่เป็นเกณฑ์หนึ่งส่วน ยังต้องตรวจเงื่อนไขอื่นในมาตรา 256 กลุ่ม ส.ส. หมายถึงพรรคที่สมาชิกมิได้เป็นรัฐมนตรี ประธานหรือรองประธานสภาผู้แทนราษฎร`,
      ` ${rules[family].en}. From ${denominator} ÷ ${divisor}, the minimum is ${value}. This checks one gate, not the whole process. The specified group comprises MPs in parties whose members are not ministers, House Speaker or Deputy Speakers.`,
      ` ${rules[family].zh}。按${denominator}÷${divisor}计算，最低为${value}人。这只核对一道门槛，尚须检查第256条其他条件。特定组指成员未任部长、众议院议长或副议长的政党之议员。`,
    );
  } else if (family === 6 || family === 7) {
    const kind = seed % 4;
    let totalYes =
        (family === 6 ? a.first : a.final) -
        (kind === 1 || (family === 6 && kind === 3) ? 1 : 0),
      senateYes =
        a.senate - (kind === 2 || (family === 6 && kind === 3) ? 1 : 0),
      eligibleYes = a.eligible - (family === 7 && kind === 3 ? 1 : 0);
    const choices =
      family === 6
        ? [
            t(
              "ถึงเกณฑ์เสียงทั้งสองส่วน",
              "Both vote thresholds met",
              "两项票数门槛均达到",
            ),
            t(
              "ขาดเฉพาะเสียงรวม",
              "Only total votes fall short",
              "仅总票数不足",
            ),
            t(
              "ขาดเฉพาะเสียง ส.ว.",
              "Only Senate votes fall short",
              "仅参议员票数不足",
            ),
            t("ขาดทั้งสองส่วน", "Both fall short", "两项均不足"),
          ]
        : [
            t(
              "ถึงเกณฑ์เสียงทั้งสามส่วน",
              "All three vote thresholds met",
              "三项票数门槛均达到",
            ),
            t(
              "ขาดเฉพาะเสียงรวม",
              "Only total votes fall short",
              "仅总票数不足",
            ),
            t(
              "ขาดเฉพาะเสียง ส.ว.",
              "Only Senate votes fall short",
              "仅参议员票数不足",
            ),
            t(
              "ขาดเฉพาะกลุ่ม ส.ส. ที่กำหนด",
              "Only specified-party MPs fall short",
              "仅特定政党组议员票数不足",
            ),
          ];
    prompt = t(
      `${fiction.th} ได้เสียงรวม ${totalYes} ส.ว. ${senateYes}${family === 7 ? ` และกลุ่ม ส.ส. ที่กำหนด ${eligibleYes} จาก ${E}` : ""} ผลเช็กเกณฑ์เสียง${family === 6 ? "วาระแรก" : "วาระสุดท้าย"}คืออะไร?`,
      `${fiction.en} Yes votes: total ${totalYes}, senators ${senateYes}${family === 7 ? `, specified-party MPs ${eligibleYes} of ${E}` : ""}. Which ${family === 6 ? "first" : "final"}-reading vote check is correct?`,
      `${fiction.zh}赞成票：总计${totalYes}，参议员${senateYes}${family === 7 ? `，特定政党组${E}人中${eligibleYes}票` : ""}。哪项${family === 6 ? "一读" : "终读"}票数检查正确？`,
    );
    explanation = t(
      `ตรวจทีละส่วน: เสียงรวมต้อง ${family === 6 ? a.first : a.final} ส.ว. ต้อง ${a.senate}${family === 7 ? ` และกลุ่ม ส.ส. ต้อง ${a.eligible}` : ""} จึงได้ผลว่า «${choices[kind].th}» ถึงเสียงไม่ได้แปลว่าจบกระบวนการ กลุ่มพรรคที่กำหนดคือพรรคที่สมาชิกมิได้เป็นรัฐมนตรี ประธานหรือรองประธานสภาผู้แทนราษฎร`,
      `Check each gate: total ${family === 6 ? a.first : a.final}, senators ${a.senate}${family === 7 ? `, specified MPs ${a.eligible}` : ""}. Result: ${choices[kind].en}. Meeting vote thresholds does not finish the process. The specified group covers parties whose members are not ministers, House Speaker or Deputy Speakers.`,
      `逐项检查：总票数须${family === 6 ? a.first : a.final}，参议员须${a.senate}${family === 7 ? `，特定组须${a.eligible}` : ""}。结果：${choices[kind].zh}。票数达标不代表程序完成。特定组指成员未任部长、众议院议长或副议长的政党之议员。`,
    );
    return {
      id: drillId(i),
      chapter,
      sections,
      prompt,
      choices,
      answer: kind,
      explanation,
    };
  } else if (family === 8) {
    const gap = petitionGap(seed),
      amendment = gap.amendment,
      need = gap.need,
      have = gap.have;
    value = gap.missing;
    sections = amendment ? [256] : [133];
    chapter = amendment ? 15 : 7;
    prompt = t(
      `สมมติมีผู้มีสิทธิเลือกตั้งเข้าชื่อ ${formatCount(have)} คน เพื่อเสนอ${amendment ? "ร่างแก้รัฐธรรมนูญ" : "ร่างกฎหมายเรื่องในหมวด 3 หรือ 5 ตามเงื่อนไข"} ยังขาดอย่างน้อยกี่ชื่อ?`,
      `Fiction: ${formatCount(have)} eligible voters sign ${amendment ? "an amendment proposal" : "a qualifying Chapter 3 or 5 bill"}. How many more signatures are needed?`,
      `假设已有${formatCount(have)}名选民联署${amendment ? "修宪提案" : "符合条件的第3或5章法案"}，至少还缺多少签名？`,
    );
    explanation = t(
      `เกณฑ์ ${formatCount(need)} คน ลบที่มี ${formatCount(have)} = ยังขาด ${formatCount(value)} การครบชื่อเปิดทางให้เสนอ ไม่รับรองว่าผ่าน ${amendment ? "" : "ร่างกฎหมายการเงินยังต้องมีคำรับรองจากนายกรัฐมนตรี"}`,
      `Threshold ${formatCount(need)} minus ${formatCount(have)} = ${formatCount(value)} more. Enough signatures allow a proposal, not guaranteed passage. ${amendment ? "" : "A money bill also needs the Prime Minister's endorsement."}`,
      `门槛${formatCount(need)}减去已有${formatCount(have)}，还缺${formatCount(value)}。联署达标只能提案，不保证通过。${amendment ? "" : "财政法案还须总理认可。"}`,
    );
  } else {
    sections = [158];
    chapter = 8;
    const seats = ministerialRemoval(seed),
      have = seats.have,
      add = seats.add;
    value = seats.remove;
    prompt = t(
      `สมมติมีรัฐมนตรีอื่นนอกจากนายกรัฐมนตรี ${formatCount(have)} คน อยากเพิ่มอีก ${formatCount(add)} คน ต้องลดจากจำนวนที่เสนออย่างน้อยกี่คนเพื่อไม่เกินเพดาน?`,
      `Fiction: ${enNoun(have, "minister", "ministers")} besides the PM, with ${formatCount(add)} more proposed. How many must be removed from the proposal to stay within the cap?`,
      `假设总理之外已有${formatCount(have)}名部长，拟再加${formatCount(add)}名，至少须从拟议总数中减去多少人才能不超上限？`,
    );
    explanation = t(
      `มาตรา 158 ให้มีรัฐมนตรีอื่นไม่เกิน 35 คน ${formatCount(have)}+${formatCount(add)}=${formatCount(have + add)} จึงต้องลดอย่างน้อย ${formatCount(value)} คน อย่านับนายกรัฐมนตรีปนใน 35 และยังมีเงื่อนไขแต่งตั้งอื่น นี่ไม่ใช่เพดาน 8 ปี`,
      `Section 158 permits at most 35 other ministers. ${formatCount(have)}+${formatCount(add)}=${formatCount(have + add)}; remove at least ${formatCount(value)}. The PM is outside this 35, and other appointment conditions still apply. This is not the eight-year limit.`,
      `第158条允许最多35名其他部长。${formatCount(have)}+${formatCount(add)}=${formatCount(have + add)}，至少须减少${formatCount(value)}人。总理不计入这35人，其他任命条件仍须满足。这不是八年上限。`,
    );
  }
  const values = [value, value + 1, Math.max(0, value - 1), value + 2];
  if (new Set(values).size !== 4) values[2] = value + 3;
  const answer = seed % 4;
  [values[0], values[answer]] = [values[answer], values[0]];
  return {
    id: drillId(i),
    chapter,
    sections,
    prompt,
    choices: values.map((n) =>
      family < 4
        ? t(`${formatCount(n)} เสียง`, enNoun(n, "vote", "votes"), `${formatCount(n)}票`)
        : family === 8
          ? t(`${formatCount(n)} ชื่อ`, enNoun(n, "signature", "signatures"), `${formatCount(n)}个签名`)
          : t(`${formatCount(n)} คน`, enNoun(n, "person", "people"), `${formatCount(n)}人`),
    ),
    answer,
    explanation,
  };
}
