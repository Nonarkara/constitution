"use client";
import { useState } from "react";
import Link from "next/link";
import { useStudy } from "./Provider";
import { tr, sectionLabel } from "@/lib/i18n";
import { StudyArt } from "./StudyArt";

export function CheatSheet() {
  const { lang } = useStudy();
  const [tab, setTab] = useState<
    "hierarchy" | "amendment" | "emergency" | "rights" | "numbers" | "mnemonics"
  >("hierarchy");

  const [pyramidLevel, setPyramidLevel] = useState<number>(0);
  const [flowStep, setFlowStep] = useState<number>(0);
  const [scaleFactor, setScaleFactor] = useState<"balance" | "excess" | "core">("balance");
  const [selectedNum, setSelectedNum] = useState<string>("500");

  const tabs = [
    {
      id: "hierarchy" as const,
      title: tr(lang, "ลำดับศักดิ์กฎหมาย", "Legal Hierarchy", "法律位阶"),
      icon: "△",
    },
    {
      id: "amendment" as const,
      title: tr(lang, "สูตรแก้รัฐธรรมนูญ", "Amendment Flow", "修宪流程"),
      icon: "03",
    },
    {
      id: "emergency" as const,
      title: tr(lang, "แผนผัง พ.ร.ก. ฉุกเฉิน", "Emergency Decrees", "紧急法令"),
      icon: "⚡",
    },
    {
      id: "rights" as const,
      title: tr(lang, "หลักความได้สัดส่วน", "Proportionality", "比例原则"),
      icon: "⚖",
    },
    {
      id: "numbers" as const,
      title: tr(lang, "ตัวเลขสำคัญใน รธน.", "Vital Numbers", "关键数字"),
      icon: "#",
    },
    {
      id: "mnemonics" as const,
      title: tr(lang, "สูตรช่วยจำ & เรื่องเล่า", "Mnemonics & Stories", "记忆口诀"),
      icon: "💡",
    },
  ];

  // Pyramid Levels for Tab 1
  const pyramidLevels = [
    {
      level: 0,
      title: tr(lang, "1. รัฐธรรมนูญ (มาตรา 5)", "1. Constitution (Sec 5)", "1. 宪法 (第5条)"),
      desc: tr(
        lang,
        "กฎหมายสูงสุดของประเทศ บทบัญญัติแห่งกฎหมาย ข้อบังคับ หรือการกระทำใดขัดหรือแย้งต่อรัฐธรรมนูญ ย่อมเป็นโมฆะและใช้บังคับมิได้",
        "The supreme law of the land. Any statutory provision, regulation or act contrary to or inconsistent with the Constitution is void and unenforceable.",
        "国家最高法律。任何法律条款、规章或行政行为，若抵触或违反宪法，一概无效且不可执行。",
      ),
      sections: [5, 211, 212, 213],
      formula: tr(
        lang,
        "กฎหมายอื่น ∧ ขัดรัฐธรรมนูญ ⟹ เป็นโมฆะทันที (ตรวจโดยศาลรัฐธรรมนูญ)",
        "Law ∧ Conflict(Law, Constitution) ⟹ Void (Certified to Constitutional Court)",
        "任何法律 ∧ 抵触宪法 ⟹ 无效 (由宪法法院审查裁决)",
      ),
      color: "var(--accent)",
    },
    {
      level: 1,
      title: tr(
        lang,
        "2. พ.ร.ป. / พ.ร.บ. / พ.ร.ก.",
        "2. Organic Acts / Acts / Emergency Decrees",
        "2. 组织法 / 普通法律 / 紧急法令",
      ),
      desc: tr(
        lang,
        "กฎหมายระดับพระราชบัญญัติประกอบรัฐธรรมนูญ (พ.ร.ป. 10 ฉบับ ตาม ม.130), พระราชบัญญัติ (พ.ร.บ. ผ่านรัฐสภา 3 วาระ), และพระราชกำหนด (พ.ร.ก. ครม. ตราขึ้นในกรณีฉุกเฉิน ม.172 มีศักดิ์เท่า พ.ร.บ.)",
        "Primary statutory legislation: 10 Organic Acts (Sec 130), Acts of Parliament (enacted by House & Senate), and Emergency Decrees (enacted by Cabinet in emergencies under Sec 172 with force of an Act).",
        "一级法律体系：10部宪法组织法（第130条）、国会制定的普通法律，以及内阁依据第172条在紧急情况下发布具有法律同等效力的紧急法令。",
      ),
      sections: [130, 133, 172],
      formula: tr(
        lang,
        "พ.ร.ป. (10 ฉบับ คุมกลไกหลัก) ≥ พ.ร.บ. (ผ่านสภา) = พ.ร.ก. (ฝ่ายบริหารออกฉุกเฉิน)",
        "Organic Acts (10 laws) ≥ Ordinary Acts (Parliament) = Emergency Decrees (Executive)",
        "宪法组织法 (10部) ≥ 普通法律 (国会制定) = 紧急法令 (内阁应急发布)",
      ),
      color: "#f59e0b",
    },
    {
      level: 2,
      title: tr(
        lang,
        "3. พระราชกฤษฎีกา (พ.ร.ฎ.)",
        "3. Royal Decrees (พ.ร.ฎ.)",
        "3. 皇家法令 (พ.ร.ฎ.)",
      ),
      desc: tr(
        lang,
        "กฎหมายลำดับรองที่พระมหากษัตริย์ทรงตราขึ้นตามคำแนะนำของคณะรัฐมนตรี ตามมาตรา 175 โดยต้องไม่ขัดต่อกฎหมายระดับ พ.ร.บ. เช่น พ.ร.ฎ. ยุบสภา, พ.ร.ฎ. เลือกตั้ง, พ.ร.ฎ. จัดตั้งหน่วยงาน",
        "Subordinate legislation enacted by the King on the advice of the Cabinet under section 175. Must not conflict with any statutory Act. Examples: Dissolution of Parliament, Royal Decree on general election.",
        "二级行政法规：国王依内阁建议依据第175条颁布的皇家法令，不得抵触任何上位法律。例如解散议会法令、选举令等。",
      ),
      sections: [175, 103],
      formula: tr(
        lang,
        "พ.ร.ฎ. ⊂ ต้องมี พ.ร.บ. ให้อำนาจ หรือเป็นพระราชอำนาจตามรัฐธรรมนูญ (ม.175)",
        "Royal Decree ⊂ Must have statutory Act authorization or constitutional prerogative (Sec 175)",
        "皇家法令 ⊂ 必须有上位法律授权或宪法规定 (第175条)",
      ),
      color: "#eab34a",
    },
    {
      level: 3,
      title: tr(
        lang,
        "4. กฎกระทรวง / ประกาศกระทรวง",
        "4. Ministerial Regulations",
        "4. 部级规章与部令",
      ),
      desc: tr(
        lang,
        "กฎหมายลำดับรองที่รัฐมนตรีเจ้าสังกัดออกเพื่อปฏิบัติการให้เป็นไปตามพระราชบัญญัติ ต้องมี พ.ร.บ. ให้อำนาจไว้ชัดเจน และจะขยายอำนาจเกินกว่าที่ พ.ร.บ. กำหนดมิได้",
        "Executive regulations issued by responsible Ministers to execute provisions of statutory Acts. Requires explicit statutory delegation and cannot exceed statutory scope.",
        "主管部长为执行上位法律而颁布的行政规章，必须有上位法律明确授权，不得超越法律授权范围。",
      ),
      sections: [158, 164],
      formula: tr(
        lang,
        "กฎกระทรวง ⊂ ต้องไม่ขัด พ.ร.บ. ∧ มีผลบังคับเฉพาะตามขอบเขตที่กฎหมายแม่บทให้อำนาจ",
        "Ministerial Reg ⊂ Consistent with Act ∧ Confined to delegated statutory scope",
        "部级规章 ⊂ 不得抵触上位法 ∧ 严格限定在母法授权范围内",
      ),
      color: "#d97706",
    },
    {
      level: 4,
      title: tr(
        lang,
        "5. ข้อบัญญัติท้องถิ่น / เทศบัญญัติ",
        "5. Local Ordinances",
        "5. 地方规章与法规",
      ),
      desc: tr(
        lang,
        "กฎหมายที่องค์กรปกครองส่วนท้องถิ่น (อบจ., อบต., เทศบาล, กทม., เมืองพัทยา) ออกใช้บังคับเฉพาะในเขตพื้นที่ของตนตามมาตรา 249–250 ต้องไม่ขัดต่อกฎหมายส่วนกลาง",
        "Local bylaws enacted by local administrative organizations (PAO, TAO, Municipalities, BMA, Pattaya City) enforceable strictly within their jurisdiction under sections 249–250. Must not contradict national laws.",
        "地方行政组织（省行政组织、区行政组织、市政厅、曼谷、芭堤雅）依据第249-250条制定的地方自治规章，仅在本管辖区内有效，绝不得抵触国家法律。",
      ),
      sections: [249, 250, 252],
      formula: tr(
        lang,
        "ข้อบัญญัติท้องถิ่น ⊂ ใช้เฉพาะในเขตพื้นที่ ∧ ต้องไม่ขัดต่อกฎหมายทุกระดับที่อยู่เหนือกว่า",
        "Local Ordinance ⊂ Territorial limit ∧ Cannot conflict with any superior legislation",
        "地方规章 ⊂ 地域管辖限制 ∧ 不得抵触任何上位法律与国家行政法规",
      ),
      color: "#b45309",
    },
  ];

  // Amendment Steps for Tab 2
  const amendmentSteps = [
    {
      step: "01",
      title: tr(lang, "ผู้มีสิทธิเสนอร่าง (มาตรา 256(1))", "Who May Propose (Sec 256(1))", "提案主体 (第256条第1项)"),
      rule: tr(
        lang,
        "1. คณะรัฐมนตรี (ครม.)\n2. ส.ส. ไม่น้อยกว่า 1/5 ของจำนวน ส.ส. ทั้งหมด (100 คน จาก 500 คน)\n3. ส.ส. + ส.ว. ไม่น้อยกว่า 1/5 ของสมาชิกรัฐสภาทั้งหมด (140 คน จาก 700 คน)\n4. ประชาชนผู้มีสิทธิเลือกตั้งไม่น้อยกว่า 50,000 คน (เข้าชื่อเสนอกฎหมาย)",
        "1. Council of Ministers (Cabinet)\n2. MPs not less than 1/5 of House (100 of 500)\n3. MPs + Senators not less than 1/5 of Parliament (140 of 700)\n4. Eligible voters not less than 50,000 persons",
        "1. 内阁\n2. 众议员不少于众议院议员总数五分之一（500人中的100人）\n3. 众议员与参议员联合不少于国会议员总数五分之一（700人中的140人）\n4. 选民不少于五万人联署",
      ),
      tag: "ม.256(1)",
    },
    {
      step: "02",
      title: tr(lang, "วาระที่ 1: ขั้นรับหลักการ (มาตรา 256(3))", "Reading 1: Acceptance (Sec 256(3))", "第一读：接受原则 (第256条第3项)"),
      rule: tr(
        lang,
        "ลงคะแนนแบบเรียกชื่อ:\n• ต้องได้เสียงเห็นชอบไม่น้อยกว่า 'กึ่งหนึ่ง' ของสมาชิกทั้งสองสภา (≥ 350 จาก 700 เสียง)\n• และ 'ต้องมี ส.ว. เห็นชอบด้วยไม่น้อยกว่า 1/3' ของ ส.ว. ทั้งหมด (≥ 67 จาก 200 เสียง)",
        "Roll-call vote required:\n• Must obtain not less than half of total members of both Houses (≥ 350 of 700)\n• MUST include not less than 1/3 of total Senators (≥ 67 of 200)",
        "记名点名表决：\n• 必须获得国会两院议员总数过半数赞成（700票中至少350票）\n• 且赞成票中必须包含不少于参议员总数的三分之一（200票中至少67票）",
      ),
      tag: "ล็อก ส.ว. 1/3",
    },
    {
      step: "03",
      title: tr(lang, "วาระที่ 2: พิจารณาเรียงลำดับมาตรา (มาตรา 256(4))", "Reading 2: Section by Section (Sec 256(4))", "第二读：逐条审议 (第256条第4项)"),
      rule: tr(
        lang,
        "• พิจารณาเรียงตามลำดับมาตรา\n• ถือเอา 'เสียงข้างมาก' เป็นเกณฑ์\n• หากเป็นร่างที่ประชาชน 50,000 คนเสนอ ต้องเปิดโอกาสให้ผู้แทนประชาชนแสดงความคิดเห็นด้วย",
        "• Consideration section by section\n• Decided by a simple majority of votes cast\n• If proposed by 50,000 citizens, civic representatives must be heard",
        "• 逐条审议各条款\n• 以出席并投票者的简单多数票为准\n• 若为五万公民联署案，必须给予公民代表陈述意见的机会",
      ),
      tag: "เสียงข้างมาก",
    },
    {
      step: "04",
      title: tr(lang, "ช่วงเวลาทอดเวลา (มาตรา 256(5))", "Cooling-off Interval (Sec 256(5))", "冷却等待期 (第256条第5项)"),
      rule: tr(
        lang,
        "เมื่อวาระที่ 2 สิ้นสุดลง ต้อง 'รอไว้สิบห้าวัน' จึงจะเข้าสู่วาระที่ 3 ได้ เพื่อให้สมาชิกรัฐสภาและประชาชนได้ศึกษาทบทวนอย่างรอบคอบ",
        "Once Reading 2 finishes, Parliament MUST wait 15 days before proceeding to Reading 3, ensuring thorough reflection and public review.",
        "第二读审议结束后，必须强制等待十五日方可进入第三读，以便议员和公众深思审视。",
      ),
      tag: "รอ 15 วัน",
    },
    {
      step: "05",
      title: tr(lang, "วาระที่ 3: ขั้นเห็นชอบ (มาตรา 256(6))", "Reading 3: Final Approval (Sec 256(6))", "第三读：最终通过 (第256条第6项)"),
      rule: tr(
        lang,
        "เงื่อนไข 3 ชั้น (Triple Lock):\n1. เสียงเห็นชอบเกินกึ่งหนึ่งของสองสภา (≥ 350 เสียง)\n2. ส.ว. เห็นชอบด้วยไม่น้อยกว่า 1/3 (≥ 67 เสียง)\n3. ส.ส. จากพรรคที่ไม่มี รมต. และไม่มีประธาน/รองประธานสภา (พรรคฝ่ายค้าน) เห็นชอบด้วยไม่น้อยกว่า 20%",
        "Triple Lock Formula:\n1. Over half of both Houses (≥ 350)\n2. At least 1/3 of Senate (≥ 67)\n3. At least 20% of MPs from parties without Cabinet ministers or Speaker/Deputy Speakers",
        "三重锁门槛（Triple Lock）：\n1. 国会两院总数过半数赞成（≥ 350票）\n2. 参议员总数三分之一以上赞成（≥ 67票）\n3. 无内阁成员且无正副议长所属政党（在野党）众议员中至少20%赞成",
      ),
      tag: "ล็อก 3 ชั้น",
    },
    {
      step: "06",
      title: tr(lang, "ด่านประชามติบังคับ (มาตรา 256(8))", "Mandatory Referendum Gate (Sec 256(8))", "强制公投关卡 (第256条第8项)"),
      rule: tr(
        lang,
        "หากเป็นการแก้ไข:\n• หมวด 1 บททั่วไป\n• หมวด 2 พระมหากษัตริย์\n• หมวด 15 การแก้ไขเพิ่มเติมรัฐธรรมนูญ\n• เรื่องเกี่ยวกับคุณสมบัติ/อำนาจหน้าที่ของศาลหรือองค์กรอิสระ\n⟹ ต้องจัดให้มีการออกเสียงประชามติก่อนนำขึ้นทูลเกล้าฯ!",
        "Mandatory Referendum triggered if amending:\n• Chapter 1 (General Provisions)\n• Chapter 2 (The King)\n• Chapter 15 (Amendments)\n• Powers, qualifications or duties of Courts or Independent Organs\n⟹ MUST pass a public referendum before Royal Assent!",
        "修改下列事项必须进行全民公决：\n• 第1章 总则\n• 第2章 国王\n• 第15章 宪法修改\n• 法院或独立机构的资格、权限与职责\n⟹ 呈请御准前必须先由全民公投通过！",
      ),
      tag: "ประชามติ",
    },
    {
      step: "07",
      title: tr(lang, "ข้อห้ามเด็ดขาด (มาตรา 255)", "Absolute Red Line (Sec 255)", "绝对不可逾越的红线 (第255条)"),
      rule: tr(
        lang,
        "การแก้ไขเพิ่มเติมรัฐธรรมนูญที่มีผลเป็นการ:\n1. เปลี่ยนแปลงการปกครองระบอบประชาธิปไตยอันมีพระมหากษัตริย์ทรงเป็นประมุข หรือ\n2. เปลี่ยนแปลงรูปแบบของรัฐ (ราชอาณาจักรอันหนึ่งอันเดียว จะแบ่งแยกมิได้)\n⟹ 'จะกระทำมิได้เด็ดขาด' (เป็นโมฆะและดำเนินมิได้)",
        "Absolute Prohibition:\nAmendments having the effect of:\n1. Changing the democratic regime with the King as Head of State, or\n2. Changing the unitary form of the Kingdom\n⟹ STRICTLY FORBIDDEN under all circumstances.",
        "绝对禁止修改的事项：\n修改宪法产生下列效果之一的：\n1. 改变以国王为国家元首的民主政体，或\n2. 改变国家形式（不可分割的统一步王国）\n⟹ 绝对不可进行（自始无效）。",
      ),
      tag: "ห้ามแก้เด็ดขาด",
    },
  ];

  // Vital Numbers Data for Tab 5
  const vitalNumbers = [
    {
      num: "500",
      title: tr(lang, "สมาชิกสภาผู้แทนราษฎร (ส.ส.)", "Members of House (MPs)", "众议院议员总数"),
      detail: tr(
        lang,
        "แบ่งเป็น ส.ส. แบบแบ่งเขตเลือกตั้ง 400 คน และ ส.ส. แบบบัญชีรายชื่อ 100 คน (แก้ไขเพิ่มเติม พ.ศ. 2564 ม.83 และ 86)",
        "400 constituency MPs + 100 party-list MPs (Amended in 2021, Sec 83 & 86).",
        "400名选区议员 + 100名政党名单议员（2021年宪法修正案，第83与86条）。",
      ),
      sections: [83, 86, 91],
    },
    {
      num: "200",
      title: tr(lang, "สมาชิกวุฒิสภา (ส.ว.) ระบบปกติ", "Senate Members (Normal)", "参议院常态人数"),
      detail: tr(
        lang,
        "ส.ว. มี 200 คน มาจากการเลือกกันเองของผู้ทรงคุณวุฒิ 20 กลุ่มอาชีพ วาระ 5 ปี ดำรงตำแหน่งได้วาระเดียว ห้ามสังกัดพรรคการเมือง (ม.107–109)",
        "200 Senators selected from 20 occupational groups. 5-year term, single term only, non-partisan (Sec 107–109).",
        "参议员200人，由20个专业群体互选产生。任期5年，单任制，无党派（第107-109条）。",
      ),
      sections: [107, 108, 109],
    },
    {
      num: "36",
      title: tr(lang, "คณะรัฐมนตรีสูงสุด (ครม.)", "Maximum Cabinet Size", "内阁法定上限"),
      detail: tr(
        lang,
        "ประกอบด้วยนายกรัฐมนตรี 1 คน + รัฐมนตรีอื่นอีกไม่เกิน 35 คน รวมไม่เกิน 36 คน (ม.158 วรรคหนึ่ง)",
        "1 Prime Minister + up to 35 other ministers = Maximum 36 members (Sec 158 p.1).",
        "总理1人 + 其他部长不超过35人 = 内阁总数上限36人（第158条第1款）。",
      ),
      sections: [158],
    },
    {
      num: "8",
      title: tr(lang, "ปี: วาระรวมสูงสุดของนายกรัฐมนตรี", "Years: PM Term Limit", "总理任期累计上限（年）"),
      detail: tr(
        lang,
        "นายกรัฐมนตรีจะดำรงตำแหน่งรวมกันแล้วเกิน 8 ปีมิได้ ไม่ว่าจะเป็นการดำรงตำแหน่งติดต่อกันหรือไม่ (ม.158 วรรคสี่)",
        "The Prime Minister shall not hold office for a total aggregate period of more than 8 years, whether consecutive or not (Sec 158 p.4).",
        "总理累计在任时间不得超过8年，不论是否连续任职（第158条第4款）。",
      ),
      sections: [158],
    },
    {
      num: "19",
      title: tr(lang, "คณะองคมนตรีสูงสุด", "Max Privy Council Size", "枢密院法定上限"),
      detail: tr(
        lang,
        "ประกอบด้วยประธานองคมนตรี 1 คน + องคมนตรีอื่นอีกไม่เกิน 18 คน รวมไม่เกิน 19 คน (ม.10)",
        "1 President of Privy Council + not more than 18 Councillors = Max 19 members (Sec 10).",
        "枢密院院长1人 + 枢密院顾问不超过18人 = 总数不超过19人（第10条）。",
      ),
      sections: [10],
    },
    {
      num: "9",
      title: tr(lang, "ตุลาการศาลรัฐธรรมนูญ", "Constitutional Court Judges", "宪法法院法官人数"),
      detail: tr(
        lang,
        "มีจำนวน 9 คน ดำรงตำแหน่งวาระ 7 ปีนับแต่วันแต่งตั้ง และดำรงตำแหน่งได้เพียงวาระเดียว (ม.200–201)",
        "9 judges, 7-year term, single term only (Sec 200–201).",
        "法官共9人，任期7年，单任制不得连任（第200-201条）。",
      ),
      sections: [200, 201],
    },
    {
      num: "7-3-9-7-7",
      title: tr(lang, "จำนวนกรรมการ 5 องค์กรอิสระ", "Counts: 5 Independent Organs", "五大独立机构成员人数"),
      detail: tr(
        lang,
        "กกต. (7 คน) · ผู้ตรวจการแผ่นดิน (3 คน) · ป.ป.ช. (9 คน) · คตง. (7 คน) · กสม. (7 คน) วาระ 7 ปี วาระเดียว (หมวด 12)",
        "EC (7) · Ombudsman (3) · NACC (9) · State Audit (7) · NHRC (7). 7-year single term (Chapter 12).",
        "选委会 (7) · 监察员 (3) · 反贪委 (9) · 审计委 (7) · 人权委 (7)。任期7年单任制（第12章）。",
      ),
      sections: [222, 228, 232, 238, 246],
    },
    {
      num: "50,000",
      title: tr(lang, "ประชาชนเข้าชื่อแก้รัฐธรรมนูญ", "Voter Petition to Amend", "公民修宪联署门槛"),
      detail: tr(
        lang,
        "ผู้มีสิทธิเลือกตั้งไม่น้อยกว่า 50,000 คน มีสิทธิเข้าชื่อเสนอร่างรัฐธรรมนูญแก้ไขเพิ่มเติมได้ (ม.256(1))",
        "Not less than 50,000 eligible voters may petition to propose a constitutional amendment bill (Sec 256(1)).",
        "不少于五万名选民有权联署提出宪法修正案（第256条第1项）。",
      ),
      sections: [256],
    },
    {
      num: "10,000",
      title: tr(lang, "ประชาชนเข้าชื่อเสนอกฎหมาย พ.ร.บ.", "Voter Petition for an Act", "公民立法联署门槛"),
      detail: tr(
        lang,
        "ผู้มีสิทธิเลือกตั้งไม่น้อยกว่า 10,000 คน เข้าชื่อเสนอร่าง พ.ร.บ. ในหมวดสิทธิเสรีภาพหรือหมวดหน้าที่ของรัฐได้ (ม.133(3))",
        "Not less than 10,000 eligible voters may propose a statutory Act bill concerning rights or state duties (Sec 133(3)).",
        "不少于一万名选民可就权利自由或国家职责事项联署提出普通法案（第133条第3项）。",
      ),
      sections: [133],
    },
    {
      num: "1/5",
      title: tr(lang, "สัดส่วนยื่นไม่ไว้วางใจ (ม.151)", "No-Confidence Motion Ratio", "不信任案动议比例"),
      detail: tr(
        lang,
        "ส.ส. ไม่น้อยกว่า 1/5 (100 คน) เข้าชื่อเสนอญัตติขอเปิดอภิปรายทั่วไปเพื่อลงมติไม่ไว้วางใจนายกฯ หรือรัฐมนตรี (มติผ่านต้องได้ > 250 เสียง)",
        "Not less than 1/5 of House (100 MPs) may submit a motion of no-confidence. Requires over half (>250) of existing MPs to pass (Sec 151).",
        "不少于众议院五分之一（100人）众议员可联署动议对总理或部长进行不信任辩论与表决（通过须全体议员过半数即>250票）。",
      ),
      sections: [151],
    },
  ];

  // Mnemonics & Stories for Tab 6
  const mnemonics = [
    {
      title: tr(lang, "สูตร 'บัตรสองใบ 400-100'", "'Two Ballots: 400-100'", "“双票制 400-100”记忆公式"),
      rhyme: tr(
        lang,
        "ส.ส. ห้าร้อย แบ่งเขตสี่ร้อย บัญชีหนึ่งร้อย บัตรคนละสองใบ",
        "Five hundred in the House: 400 districts, 100 lists, two ballots per voter.",
        "众议员五百位：选区四百席，名单一百席，每人选票发两张。",
      ),
      story: tr(
        lang,
        "จำภาพกระเป๋าสตางค์: แบงก์ร้อย 4 ใบ (400 เขต) กับเหรียญร้อย 1 เหรียญ (100 ปาร์ตี้ลิสต์) รวมเป็น 500 เสียง ในการแก้ไขรัฐธรรมนูญ พ.ศ. 2564 เปลี่ยนจากระบบเดิมมาเป็นระบบบัตรสองใบนี้",
        "Visualize your wallet: four 100-baht notes (400 constituency) plus one 100-baht coin (100 party-list) totaling 500 seats. Enacted by the 2021 constitutional amendment.",
        "想象钱包里有4张百铢纸币（400选区）加1枚百铢硬币（100名单），凑成500席。2021年修宪正式确立这一双票制度。",
      ),
      sections: [83, 86, 91],
    },
    {
      title: tr(lang, "สูตร 'สี่เสาศาลไทย'", "'Four Pillars of the Judiciary'", "“泰国司法四根支柱”"),
      rhyme: tr(
        lang,
        "ยุติธรรม ปกครอง ทหาร รัฐธรรมนูญ สี่เสาค้ำจุน คุ้มครองแผ่นดิน",
        "Justice, Administration, Military, Constitution: four pillars holding the realm.",
        "司法审民刑，行政纠官非，军事卫军纪，宪法裁最高。",
      ),
      story: tr(
        lang,
        "ประเทศไทยไม่ได้มีระบบศาลเดี่ยว: ศาลยุติธรรมดูคดีแพ่ง-อาญา, ศาลปกครองดูข้อพิพาทประชาชนกับเจ้าหน้าที่รัฐ, ศาลทหารดูคดีทหาร, และศาลรัฐธรรมนูญดูความชอบด้วยรัฐธรรมนูญ",
        "Thailand operates a dual/quad-pillar court system: Courts of Justice (civil & criminal), Administrative Courts (citizen vs state), Military Courts, and the Constitutional Court (supreme constitutional arbiter).",
        "泰国采用多元司法体制：司法法院审理民刑事，行政法院裁决官民行政争议，军事法院审理军职案件，宪法法院裁决违宪与宪制争议。",
      ),
      sections: [188, 194, 197, 199, 200],
    },
    {
      title: tr(lang, "สูตร 'รหัส 7-3-9-7-7 องค์กรอิสระ'", "'7-3-9-7-7 Independent Organs Code'", "“7-3-9-7-7 独立机构密码”"),
      rhyme: tr(
        lang,
        "เลือกตั้งเจ็ด ผู้ตรวจสาม ปราบโกงเก้า ตรวจเงินเจ็ด สิทธิเจ็ด วาระเจ็ดปีเดียว",
        "Election 7, Ombudsman 3, NACC 9, Audit 7, Rights 7; all single 7-year terms.",
        "七选三监九反贪，七审计来七人权；任期皆为整七年，只任一届不连任。",
      ),
      story: tr(
        lang,
        "สังเกตว่าเลข 7 เป็นเลขมงคลขององค์กรอิสระ: กกต., คตง., กสม. มี 7 คนเท่ากันหมด และทุกคนดำรงตำแหน่ง '7 ปี วาระเดียว' ยกเว้นผู้ตรวจการแผ่นดินที่มีเพียง 3 คน และ ป.ป.ช. ที่ต้องมีถึง 9 คนเพื่อดูแลคดีปราบโกงทั่วประเทศ",
        "Notice the pattern with 7: Election Commission, State Audit, and NHRC each have 7 members. All serve a single 7-year term. Ombudsmen have 3, and the NACC has 9 members for extensive nationwide anti-corruption jurisdiction.",
        "数字7是独立机构的核心密码：选委会、审计委、人权委皆为7人；且所有机构统一为“7年任期、单任制”！唯监察员精简为3人，反贪委因任务繁重设9人。",
      ),
      sections: [215, 222, 228, 232, 238, 246],
    },
    {
      title: tr(lang, "สูตร 'กฎเหล็ก พ.ร.ก. 4 ประการ'", "'The 4-Prong Emergency Decree Formula'", "“紧急法令四项黄金铁律”"),
      rhyme: tr(
        lang,
        "ฉุกเฉินจำเป็น สี่กรณีมั่นคง ตราส่งสภาทันใด ถ้าไม่เห็นชอบตกไป",
        "Urgent necessity, four security grounds, immediate parliamentary review, lapses if rejected.",
        "事出紧急难拖延，四大安全立出台，下次国会即刻送，若遭否决即失效。",
      ),
      story: tr(
        lang,
        "ครม. ไม่สามารถออก พ.ร.ก. ตามใจชอบได้ ต้องผ่าน 4 ด่าน: 1) ฉุกเฉินจำเป็นหลีกเลี่ยงไม่ได้ 2) เข้า 4 เหตุ (มั่นคงชาติ/ปลอดภัยสาธารณะ/เศรษฐกิจ/ภัยพิบัติ) 3) เข้าสภาคราวประชุมถัดไป 4) ส.ส./ส.ว. 1/5 ส่งศาล รธน. ได้ก่อนสภาลงมติ",
        "The Cabinet cannot issue decrees arbitrarily. Four strict tests: 1) Inevitable urgency, 2) Four statutory grounds (national security, public safety, economic stability, natural disaster), 3) Immediate next session review, 4) 1/5 MPs/Senators may certify to Constitutional Court before vote.",
        "内阁绝不可随意发布紧急法令，须通过四大关卡：1) 迫切且不可避免的紧急需要，2) 四大限定理由之一（国家安全、公共安全、国家经济安全、公共灾难），3) 下次国会立即审查，4) 五分之一议员可在表决前送交宪法法院审查是否紧急。",
      ),
      sections: [172, 173],
    },
  ];

  return (
    <div className="cheatsheet-page">
      <div className="page-kicker mono">CONSTITUTIONAL ALGORITHMS · CHEAT SHEETS</div>
      
      <section className="intro">
        <div className="intro-index mono" aria-hidden="true">
          §
        </div>
        <div className="intro-copy">
          <StudyArt scene="review" />
          <h1>
            {tr(
              lang,
              "สรุปสูตร & แผนภาพ\nเข้าใจด้วยอัลกอริทึม",
              "Cheat Sheets & Formulas:\nLearn Algorithmically.",
              "速查表与思维导图：\n用算法理解宪法。",
            )}
          </h1>
          <p>
            {tr(
              lang,
              "ทำข้อสอบและเข้าใจโครงสร้างอำนาจอย่างแม่นยำ ไม่ต้องท่องจำแบบสับสน ด้วยแผนภาพสไตล์ดินสอสี สูตรเงื่อนไข และตัวเลขสำคัญที่ออกสอบบ่อยที่สุด",
              "Master constitutional architecture with precision. No confusing rote memorization: explore crayon diagrams, logic gates, and vital exam numbers.",
              "告别死记硬背与概念混淆。通过温润的蜡笔手绘图解、逻辑判定树与高频考点速查表，清晰透视宪制架构。",
            )}
          </p>
        </div>
      </section>

      {/* Interactive Tabs */}
      <nav className="flow-tabs cheatsheet-tabs" aria-label="Cheat Sheet Topics">
        {tabs.map((t) => (
          <button
            key={t.id}
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            <span className="mono">{t.icon}</span>
            {t.title}
          </button>
        ))}
      </nav>

      {/* TAB 1: Hierarchy of Laws */}
      {tab === "hierarchy" && (
        <section className="sheet-section" aria-labelledby="heading-hierarchy">
          <div className="section-heading">
            <div>
              <span className="mono">TOPIC 01 · LEGAL HIERARCHY</span>
              <h2 id="heading-hierarchy">
                {tr(lang, "ปิรามิดลำดับศักดิ์ของกฎหมาย (มาตรา 5)", "Pyramid of Legal Hierarchy (Sec 5)", "法律位阶金字塔 (第5条)")}
              </h2>
            </div>
            <span className="micro">
              {tr(lang, "แตะแต่ละชั้นเพื่อดูสูตรและมาตรา", "Select a tier to inspect", "点击层级查看解析")}
            </span>
          </div>

          <div className="crayon-diagram-box">
            {/* SVG Crayon Pyramid */}
            <svg
              viewBox="0 0 600 320"
              className="crayon-svg"
              role="img"
              aria-label={tr(lang, "แผนภาพปิรามิดลำดับศักดิ์ของกฎหมาย", "Legal hierarchy pyramid diagram", "法律位阶金字塔图")}
            >
              <defs>
                <filter id="crayon-filter" x="-5%" y="-5%" width="110%" height="110%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
                </filter>
              </defs>

              {/* Tier 1: Constitution (Top) */}
              <polygon
                points="300,20 220,75 380,75"
                fill={pyramidLevel === 0 ? "var(--accent)" : "#fef3c7"}
                stroke="var(--ink)"
                strokeWidth={pyramidLevel === 0 ? 3 : 1.5}
                filter="url(#crayon-filter)"
                className="pyramid-tier"
                onClick={() => setPyramidLevel(0)}
                tabIndex={0}
                role="button"
                aria-label="Constitution"
              />
              <text x="300" y="55" textAnchor="middle" className="svg-label font-bold" pointerEvents="none">
                1. รัฐธรรมนูญ (ม.5)
              </text>

              {/* Tier 2: Organic Acts, Acts, Decrees */}
              <polygon
                points="220,77 380,77 440,135 160,135"
                fill={pyramidLevel === 1 ? "var(--accent)" : "#ffedd5"}
                stroke="var(--ink)"
                strokeWidth={pyramidLevel === 1 ? 3 : 1.5}
                filter="url(#crayon-filter)"
                className="pyramid-tier"
                onClick={() => setPyramidLevel(1)}
                tabIndex={0}
                role="button"
                aria-label="Acts and Decrees"
              />
              <text x="300" y="112" textAnchor="middle" className="svg-label" pointerEvents="none">
                2. พ.ร.ป. / พ.ร.บ. / พ.ร.ก.
              </text>

              {/* Tier 3: Royal Decrees */}
              <polygon
                points="160,137 440,137 500,195 100,195"
                fill={pyramidLevel === 2 ? "var(--accent)" : "#fef9c3"}
                stroke="var(--ink)"
                strokeWidth={pyramidLevel === 2 ? 3 : 1.5}
                filter="url(#crayon-filter)"
                className="pyramid-tier"
                onClick={() => setPyramidLevel(2)}
                tabIndex={0}
                role="button"
                aria-label="Royal Decrees"
              />
              <text x="300" y="172" textAnchor="middle" className="svg-label" pointerEvents="none">
                3. พระราชกฤษฎีกา (พ.ร.ฎ. ม.175)
              </text>

              {/* Tier 4: Ministerial Regs */}
              <polygon
                points="100,197 500,197 550,255 50,255"
                fill={pyramidLevel === 3 ? "var(--accent)" : "#f3f4f6"}
                stroke="var(--ink)"
                strokeWidth={pyramidLevel === 3 ? 3 : 1.5}
                filter="url(#crayon-filter)"
                className="pyramid-tier"
                onClick={() => setPyramidLevel(3)}
                tabIndex={0}
                role="button"
                aria-label="Ministerial Regulations"
              />
              <text x="300" y="232" textAnchor="middle" className="svg-label" pointerEvents="none">
                4. กฎกระทรวง / ประกาศกระทรวง
              </text>

              {/* Tier 5: Local Ordinances (Base) */}
              <polygon
                points="50,257 550,257 590,310 10,310"
                fill={pyramidLevel === 4 ? "var(--accent)" : "#e5e7eb"}
                stroke="var(--ink)"
                strokeWidth={pyramidLevel === 4 ? 3 : 1.5}
                filter="url(#crayon-filter)"
                className="pyramid-tier"
                onClick={() => setPyramidLevel(4)}
                tabIndex={0}
                role="button"
                aria-label="Local Ordinances"
              />
              <text x="300" y="290" textAnchor="middle" className="svg-label" pointerEvents="none">
                5. ข้อบัญญัติท้องถิ่น (ม.249–250)
              </text>
            </svg>
          </div>

          {/* Level Details */}
          <div className="flow-detail card-selected" key={pyramidLevel}>
            <h3>{pyramidLevels[pyramidLevel].title}</h3>
            <p>{pyramidLevels[pyramidLevel].desc}</p>
            <div className="formula-box">
              <span className="mono font-bold">ALGORITHM / 公式:</span>
              <code>{pyramidLevels[pyramidLevel].formula}</code>
            </div>
            <div className="citations-row">
              {pyramidLevels[pyramidLevel].sections.map((n) => (
                <Link className="citation" href={`/section/?n=${n}`} key={n}>
                  {sectionLabel(lang, n)} ↗
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: Amendment Flow */}
      {tab === "amendment" && (
        <section className="sheet-section" aria-labelledby="heading-amendment">
          <div className="section-heading">
            <div>
              <span className="mono">TOPIC 02 · AMENDMENT ALGORITHM</span>
              <h2 id="heading-amendment">
                {tr(lang, "ขั้นตอน 3 วาระการแก้ไขรัฐธรรมนูญ (มาตรา 255 & 256)", "The 3-Reading Amendment Algorithm (Sec 255 & 256)", "修宪三读法定算法 (第255与256条)")}
              </h2>
            </div>
          </div>

          <p className="micro">
            {tr(
              lang,
              "รัฐธรรมนูญ พ.ศ. 2560 เป็นรัฐธรรมนูญแบบแก้ไขยาก มีระบบ 'Triple Lock' ล็อกเสียง ส.ว. และ ส.ส. ฝ่ายค้าน",
              "The 2017 Constitution is rigid: featuring a 'Triple Lock' mechanism requiring Senate approval and non-government MP thresholds.",
              "2017年宪法属于强刚性宪法，设置了必须达到参议员与在野党特定比例的“三重锁门槛”。",
            )}
          </p>

          <div className="steps-progress-grid">
            {amendmentSteps.map((s, i) => (
              <button
                key={s.step}
                className={"step-card " + (flowStep === i ? "selected" : "")}
                onClick={() => setFlowStep(i)}
              >
                <div className="step-head">
                  <span className="mono step-tag">{s.tag}</span>
                  <span className="mono step-num">{s.step}</span>
                </div>
                <h4>{s.title}</h4>
              </button>
            ))}
          </div>

          <div className="flow-detail card-selected" key={flowStep}>
            <h3>{amendmentSteps[flowStep].title}</h3>
            <pre className="step-rule-text">{amendmentSteps[flowStep].rule}</pre>
            <Link className="citation" href="/section/?n=256">
              {sectionLabel(lang, 256)} ↗
            </Link>
          </div>
        </section>
      )}

      {/* TAB 3: Emergency Decrees */}
      {tab === "emergency" && (
        <section className="sheet-section" aria-labelledby="heading-emergency">
          <div className="section-heading">
            <div>
              <span className="mono">TOPIC 03 · EMERGENCY DECREE LOGIC GATES</span>
              <h2 id="heading-emergency">
                {tr(lang, "อัลกอริทึมตรวจสอบ พระราชกำหนด (พ.ร.ก. มาตรา 172)", "Emergency Decree 4-Gate Decision Tree (Sec 172)", "紧急法令四道判定门 (第172条)")}
              </h2>
            </div>
          </div>

          <div className="decision-tree-container">
            <div className="tree-step">
              <span className="mono tree-badge">GATE 1</span>
              <h4>{tr(lang, "ความจำเป็นรีบด่วน", "Urgent & Inevitable Necessity", "迫切且不可避免的需要")}</h4>
              <p>
                {tr(
                  lang,
                  "เพื่อประโยชน์ในอันที่จะรักษาความปลอดภัยของประเทศ ความปลอดภัยสาธารณะ ความมั่นคงทางเศรษฐกิจ หรือป้องปัดภัยพิบัติสาธารณะ",
                  "In order to preserve national security, public safety, national economic stability, or avert public calamity.",
                  "为了维护国家安全、公共安全、国家经济安全或防范公共灾难。",
                )}
              </p>
            </div>

            <div className="tree-arrow mono">↓ PASS 1 ∧ PASS 2</div>

            <div className="tree-step">
              <span className="mono tree-badge">GATE 2</span>
              <h4>{tr(lang, "คณะรัฐมนตรีตรา พ.ร.ก.", "Cabinet Enacts Decree", "内阁发布紧急法令")}</h4>
              <p>
                {tr(
                  lang,
                  "มีผลบังคับใช้เป็นกฎหมายทันที มีศักดิ์เทียบเท่าพระราชบัญญัติ",
                  "Becomes enforceable immediately with the force of an Act of Parliament.",
                  "立即生效执行，具有法律同等效力。",
                )}
              </p>
            </div>

            <div className="tree-arrow mono">↓ SUBMIT NEXT SESSION</div>

            <div className="tree-step">
              <span className="mono tree-badge">GATE 3</span>
              <h4>{tr(lang, "ด่านสภาตรวจสอบ (ม.172 ว.3)", "Parliamentary Approval Gate", "国会审查批准门")}</h4>
              <p>
                {tr(
                  lang,
                  "เสนอต่อรัฐสภาโดยไม่ชักช้าในคราวประชุมถัดไป:\n• ถ้ารัฐสภา 'อนุมัติ' ⟹ มีผลเป็น พระราชบัญญัติ (พ.ร.บ.) ถาวรต่อไป\n• ถ้ารัฐสภา 'ไม่อนุมัติ' ⟹ พ.ร.ก. นั้น 'เป็นอันตกไป' (แต่ไม่กระทบกิจการที่ทำไปแล้ว)",
                  "Submitted to Parliament without delay:\n• Approved ⟹ Permanently valid as an Act\n• Rejected ⟹ Decree lapses immediately (without affecting past valid transactions)",
                  "下次会议时不延误地提交国会：\n• 批准 ⟹ 成为永久有效法律\n• 否决 ⟹ 该法令即刻失效（但不影响此前已执行的行为）",
                )}
              </p>
            </div>

            <div className="tree-arrow mono">↓ JUDICIAL CHECK</div>

            <div className="tree-step">
              <span className="mono tree-badge">GATE 4</span>
              <h4>{tr(lang, "ศาลรัฐธรรมนูญตรวจสอบ (ม.173)", "Constitutional Court Check (Sec 173)", "宪法法院审查 (第173条)")}</h4>
              <p>
                {tr(
                  lang,
                  "ก่อนที่สภาจะลงมติ ส.ส. หรือ ส.ว. ไม่น้อยกว่า 1/5 ของแต่ละสภา เข้าชื่อเสนอประธานสภา ส่งเรื่องให้ 'ศาลรัฐธรรมนูญ' วินิจฉัยความจำเป็นรีบด่วนได้ หากขัด พ.ร.ก. ตกไปทันที",
                  "Before the vote, not less than 1/5 of MPs or Senators may petition the Court to rule on whether the decree truly meets the emergency conditions.",
                  "在表决前，不少于五分之一众议员或参议员可联名送交宪法法院，裁决该法令是否真正具备法定紧急必要条件。",
                )}
              </p>
            </div>
          </div>
          <div className="citations-row">
            <Link className="citation" href="/section/?n=172">
              {sectionLabel(lang, 172)} ↗
            </Link>
            <Link className="citation" href="/section/?n=173">
              {sectionLabel(lang, 173)} ↗
            </Link>
          </div>
        </section>
      )}

      {/* TAB 4: Proportionality Test */}
      {tab === "rights" && (
        <section className="sheet-section" aria-labelledby="heading-rights">
          <div className="section-heading">
            <div>
              <span className="mono">TOPIC 04 · PROPORTIONALITY SCALE</span>
              <h2 id="heading-rights">
                {tr(lang, "ตราชั่งหลักความได้สัดส่วนในการจำกัดสิทธิ (มาตรา 26)", "The Proportionality Scale for Rights (Sec 26)", "基本权利限制比例原则天平 (第26条)")}
              </h2>
            </div>
          </div>

          <div className="scale-interactive">
            <div className="flow-tabs">
              <button
                aria-pressed={scaleFactor === "balance"}
                onClick={() => setScaleFactor("balance")}
              >
                {tr(lang, "1. ได้สัดส่วน (ชอบด้วย รธน.)", "1. Balanced (Constitutional)", "1. 符合比例（合宪）")}
              </button>
              <button
                aria-pressed={scaleFactor === "excess"}
                onClick={() => setScaleFactor("excess")}
              >
                {tr(lang, "2. เกินสมควรแก่เหตุ (ขัด รธน.)", "2. Disproportionate (Unconstitutional)", "2. 过度限制（违宪）")}
              </button>
              <button
                aria-pressed={scaleFactor === "core"}
                onClick={() => setScaleFactor("core")}
              >
                {tr(lang, "3. กระทบสาระสำคัญ (โมฆะ)", "3. Core Impairment (Void)", "3. 侵及本质（无效）")}
              </button>
            </div>

            {/* Scale SVG */}
            <svg
              viewBox="0 0 500 220"
              className="crayon-svg"
              role="img"
              aria-label="Scale of proportionality"
            >
              {/* Stand */}
              <line x1="250" y1="40" x2="250" y2="190" stroke="var(--ink)" strokeWidth="4" />
              <line x1="180" y1="190" x2="320" y2="190" stroke="var(--ink)" strokeWidth="4" />

              {/* Fulcrum and Beam */}
              {scaleFactor === "balance" && (
                <>
                  <line x1="100" y1="70" x2="400" y2="70" stroke="var(--accent)" strokeWidth="4" />
                  {/* Left Pan: State Interest */}
                  <line x1="100" y1="70" x2="60" y2="130" stroke="var(--ink)" strokeWidth="1.5" />
                  <line x1="100" y1="70" x2="140" y2="130" stroke="var(--ink)" strokeWidth="1.5" />
                  <rect x="50" y="130" width="100" height="20" fill="#fef3c7" stroke="var(--ink)" />
                  <text x="100" y="145" textAnchor="middle" className="svg-label">ประโยชน์สาธารณะ</text>

                  {/* Right Pan: Personal Rights */}
                  <line x1="400" y1="70" x2="360" y2="130" stroke="var(--ink)" strokeWidth="1.5" />
                  <line x1="400" y1="70" x2="440" y2="130" stroke="var(--ink)" strokeWidth="1.5" />
                  <rect x="350" y="130" width="100" height="20" fill="#fef3c7" stroke="var(--ink)" />
                  <text x="400" y="145" textAnchor="middle" className="svg-label">สิทธิเสรีภาพ</text>
                </>
              )}

              {scaleFactor === "excess" && (
                <>
                  <line x1="100" y1="110" x2="400" y2="30" stroke="#dc2626" strokeWidth="4" />
                  {/* Left Pan lower: Excessive State intervention */}
                  <line x1="100" y1="110" x2="60" y2="170" stroke="var(--ink)" strokeWidth="1.5" />
                  <line x1="100" y1="110" x2="140" y2="170" stroke="var(--ink)" strokeWidth="1.5" />
                  <rect x="50" y="170" width="100" height="20" fill="#fecaca" stroke="var(--ink)" />
                  <text x="100" y="185" textAnchor="middle" className="svg-label">รัฐแทรกแซงล้นเกิน</text>

                  {/* Right Pan elevated */}
                  <line x1="400" y1="30" x2="360" y2="90" stroke="var(--ink)" strokeWidth="1.5" />
                  <line x1="400" y1="30" x2="440" y2="90" stroke="var(--ink)" strokeWidth="1.5" />
                  <rect x="350" y="90" width="100" height="20" fill="#fee2e2" stroke="var(--ink)" />
                  <text x="400" y="105" textAnchor="middle" className="svg-label">สิทธิถูกลิดรอนเกินเหตุ</text>
                </>
              )}

              {scaleFactor === "core" && (
                <>
                  <line x1="100" y1="130" x2="400" y2="10" stroke="#991b1b" strokeWidth="4" />
                  <text x="250" y="30" textAnchor="middle" fill="#991b1b" className="svg-label font-bold">
                    กระทบกระเทือนสาระสำคัญ = ตกไปทันที!
                  </text>
                </>
              )}
            </svg>

            <div className="formula-box">
              <span className="mono font-bold">THE 4-PILLAR PROPORTIONALITY TEST (มาตรา 26):</span>
              <ol className="proportionality-list">
                <li><strong>1. ฐานทางกฎหมาย (Legal Basis):</strong> ต้องจำกัดโดยบทบัญญัติแห่งกฎหมายระดับ พ.ร.บ. ตามเงื่อนไขที่ รธน. กำหนด</li>
                <li><strong>2. แก่นแท้แห่งสิทธิ (Essential Substance):</strong> ต้องไม่กระทบกระเทือนสาระสำคัญแห่งสิทธิหรือเสรีภาพนั้น</li>
                <li><strong>3. ความทั่วไป (Generality):</strong> ต้องไม่มุ่งหมายให้ใช้บังคับแก่กรณีใดกรณีหนึ่งหรือแก่บุคคลใดบุคคลหนึ่งเป็นการเจาะจง</li>
                <li><strong>4. ความได้สัดส่วน (Proportionality Test):</strong> เหมาะสมแก่เป้าหมาย ∧ จำเป็นยิ่งยวด (เลือกมาตรการที่กระทบสิทธิน้อยที่สุด) ∧ ได้สัดส่วนพอสมควรแก่เหตุ</li>
              </ol>
            </div>
            <Link className="citation" href="/section/?n=26">
              {sectionLabel(lang, 26)} ↗
            </Link>
          </div>
        </section>
      )}

      {/* TAB 5: Vital Numbers */}
      {tab === "numbers" && (
        <section className="sheet-section" aria-labelledby="heading-numbers">
          <div className="section-heading">
            <div>
              <span className="mono">TOPIC 05 · VITAL NUMBERS</span>
              <h2 id="heading-numbers">
                {tr(lang, "ตัวเลขมหัศจรรย์ในรัฐธรรมนูญที่ออกสอบบ่อย", "Vital Numbers for Civil Service & Bar Exams", "泰国宪法高频关键数字速查")}
              </h2>
            </div>
          </div>

          <div className="numbers-grid">
            {vitalNumbers.map((item) => (
              <button
                key={item.num}
                className={"number-card " + (selectedNum === item.num ? "selected" : "")}
                onClick={() => setSelectedNum(item.num)}
              >
                <div className="number-val mono">{item.num}</div>
                <div className="number-title">{item.title}</div>
              </button>
            ))}
          </div>

          {(() => {
            const cur = vitalNumbers.find((n) => n.num === selectedNum) ?? vitalNumbers[0];
            return (
              <div className="flow-detail card-selected" key={cur.num}>
                <h3>{cur.num}: {cur.title}</h3>
                <p>{cur.detail}</p>
                <div className="citations-row">
                  {cur.sections.map((n) => (
                    <Link className="citation" href={`/section/?n=${n}`} key={n}>
                      {sectionLabel(lang, n)} ↗
                    </Link>
                  ))}
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* TAB 6: Mnemonics */}
      {tab === "mnemonics" && (
        <section className="sheet-section" aria-labelledby="heading-mnemonics">
          <div className="section-heading">
            <div>
              <span className="mono">TOPIC 06 · MNEMONICS & STORIES</span>
              <h2 id="heading-mnemonics">
                {tr(lang, "สูตรจำ & กลอนช่วยจำ 3 ภาษา", "Memory Anchors & Rhymes", "三语记忆口诀与助记故事")}
              </h2>
            </div>
          </div>

          <div className="mnemonics-list">
            {mnemonics.map((m, idx) => (
              <article className="mnemonic-card" key={idx}>
                <div className="mnemonic-head">
                  <span className="mono">RHYME · 0{idx + 1}</span>
                  <h3>{m.title}</h3>
                </div>
                <div className="rhyme-quote">
                  <em>"{m.rhyme}"</em>
                </div>
                <p>{m.story}</p>
                <div className="citations-row">
                  {m.sections.map((n) => (
                    <Link className="citation" href={`/section/?n=${n}`} key={n}>
                      {sectionLabel(lang, n)} ↗
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="note" style={{ marginTop: "32px" }}>
        <strong>
          {tr(lang, "กฎหมายสูงสุดคือแผนที่", "The Constitution is a Map", "宪法是一张地图")}
        </strong>
        <p>
          {tr(
            lang,
            "การเรียนกฎหมายที่ดีไม่ใช่การท่องจำตัวอักษรอย่างแห้งแล้ง แต่คือการเข้าใจว่าแต่ละกลไกออกแบบมาเพื่อถ่วงดุลอำนาจและปกป้องศักดิ์ศรีความเป็นมนุษย์อย่างไร ตรวจสอบกับตัวบทจริงเสมอเมื่อมีข้อสงสัย",
            "Effective legal learning is never sterile memorization, but understanding how checks and balances protect human dignity. Always verify against the authentic law.",
            "优秀的法律学习从不靠机械背诵，而是深刻理解各权力制衡机制如何捍卫人的尊严。存疑时请始终以法律原文为准。",
          )}
        </p>
      </div>
    </div>
  );
}
