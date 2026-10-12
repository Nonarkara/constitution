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
      icon: "!",
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
      icon: "ก",
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
        "1. คณะรัฐมนตรี (ครม.)\n2. ส.ส. ไม่น้อยกว่า 1/5 ของจำนวน ส.ส. เท่าที่มีอยู่\n3. ส.ส. และ ส.ว. ร่วมกันไม่น้อยกว่า 1/5 ของสมาชิกทั้งสองสภาเท่าที่มีอยู่\n4. ประชาชนผู้มีสิทธิเลือกตั้งไม่น้อยกว่า 50,000 คน\nตัวอย่างเมื่อครบ 500 ส.ส. และ 200 ส.ว.: ข้อ 2 ต้องมี 100 คน; ข้อ 3 ต้องมี 140 คน",
        "1. Council of Ministers (Cabinet)\n2. MPs numbering at least 1/5 of existing House members\n3. MPs and Senators jointly numbering at least 1/5 of existing members of both Houses\n4. At least 50,000 eligible voters\nWith all 500 House and 200 Senate seats filled: route 2 needs 100 MPs; route 3 needs 140 joint signatories.",
        "1. 内阁\n2. 不少于现有众议员总数五分之一的众议员\n3. 众议员与参议员联合，不少于两院现有议员总数五分之一\n4. 不少于五万名有选举权的公民联署\n以500名众议员、200名参议员全部在任为例：第2项需100人；第3项需140人。",
      ),
      tag: "ม.256(1)",
    },
    {
      step: "02",
      title: tr(lang, "วาระที่ 1: ขั้นรับหลักการ (มาตรา 256(3))", "Reading 1: Acceptance (Sec 256(3))", "第一读：接受原则 (第256条第3项)"),
      rule: tr(
        lang,
        "ลงคะแนนแบบเรียกชื่อ:\n• เสียงเห็นชอบไม่น้อยกว่ากึ่งหนึ่งของสมาชิกทั้งสองสภาเท่าที่มีอยู่\n• ในจำนวนนี้ต้องมี ส.ว. เห็นชอบไม่น้อยกว่า 1/3 ของ ส.ว. เท่าที่มีอยู่\nตัวอย่างเมื่อครบ 700 คน และ ส.ว. ครบ 200 คน: ≥ 350 เสียง และ ส.ว. ≥ 67 เสียง",
        "Roll-call vote:\n• At least half of existing members of both Houses must approve\n• Those votes must include at least 1/3 of existing Senators\nWith all 700 seats and all 200 Senate seats filled: ≥ 350 votes, including ≥ 67 Senators.",
        "记名点名表决：\n• 赞成票不少于两院现有议员总数的半数\n• 其中须有不少于现有参议员总数三分之一的参议员赞成\n以两院700席、参议院200席全部在任为例：≥ 350票，其中参议员≥ 67票。",
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
        "เงื่อนไข 3 ชั้น (Triple Lock):\n1. เสียงเห็นชอบมากกว่ากึ่งหนึ่งของสมาชิกทั้งสองสภาเท่าที่มีอยู่\n2. ในจำนวนนี้มี ส.ว. เห็นชอบไม่น้อยกว่า 1/3 ของ ส.ว. เท่าที่มีอยู่\n3. มี ส.ส. จากพรรคที่สมาชิกไม่ได้เป็นรัฐมนตรี ประธานสภาผู้แทนราษฎร หรือรองประธานสภาผู้แทนราษฎร เห็นชอบไม่น้อยกว่า 20% ของ ส.ส. จากทุกพรรคดังกล่าวรวมกัน\nตัวอย่างเมื่อครบ 700 คน และ ส.ว. ครบ 200 คน: ≥ 351 เสียง และ ส.ว. ≥ 67 เสียง",
        "Triple Lock:\n1. More than half of existing members of both Houses must approve\n2. Those votes must include at least 1/3 of existing Senators\n3. At least 20% of the combined MPs of all parties whose members hold none of these offices must approve: minister, House President or House Vice-President\nWith all 700 seats and all 200 Senate seats filled: ≥ 351 votes, including ≥ 67 Senators.",
        "三重锁门槛：\n1. 赞成票须超过两院现有议员总数的半数\n2. 其中须有不少于现有参议员总数三分之一的参议员赞成\n3. 对于没有成员担任部长、众议院议长或副议长的各政党，须有这些政党众议员合计总数至少20%赞成\n以两院700席、参议院200席全部在任为例：≥ 351票，其中参议员≥ 67票。",
      ),
      tag: "ล็อก 3 ชั้น",
    },
    {
      step: "06",
      title: tr(lang, "ด่านประชามติบังคับ (มาตรา 256(8))", "Mandatory Referendum Gate (Sec 256(8))", "强制公投关卡 (第256条第8项)"),
      rule: tr(
        lang,
        "ต้องจัดประชามติหากแก้ไข:\n• หมวด 1 บททั่วไป หมวด 2 พระมหากษัตริย์ หรือหมวด 15 การแก้ไขเพิ่มเติมรัฐธรรมนูญ\n• คุณสมบัติหรือลักษณะต้องห้ามของผู้ดำรงตำแหน่งต่าง ๆ ตามรัฐธรรมนูญ\n• หน้าที่หรืออำนาจของศาลหรือองค์กรอิสระ\n• เรื่องที่ทำให้ศาลหรือองค์กรอิสระไม่อาจปฏิบัติตามหน้าที่หรืออำนาจได้\nต้องได้รับความเห็นชอบจากประชามติก่อนดำเนินการตามมาตรา 256(7)",
        "A referendum is required for amendments to:\n• Chapter 1, Chapter 2 or Chapter 15\n• Qualifications or disqualifications of holders of any constitutional office\n• Duties or powers of Courts or Independent Organs\n• Matters preventing Courts or Independent Organs from performing their duties or exercising their powers\nReferendum approval is required before proceeding under section 256(7).",
        "修改下列事项必须进行全民公投：\n• 第1章、第2章或第15章\n• 宪法规定的各类公职人员的任职资格或禁止任职情形\n• 法院或独立机构的职责或权限\n• 导致法院或独立机构无法履行职责或行使权限的事项\n须经公投通过，方可依第256条第7项继续办理。",
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
        "绝对禁止修改的事项：\n修改宪法产生下列效果之一的：\n1. 改变以国王为国家元首的民主政体，或\n2. 改变国家形式（不可分割的统一王国）\n⟹ 绝对不可进行（自始无效）。",
      ),
      tag: "ห้ามแก้เด็ดขาด",
    },
    {
      step: "08",
      title: tr(lang, "ก่อนนำขึ้นทูลเกล้าฯ (มาตรา 256(7)–(9))", "Before Royal Submission (Sec 256(7)–(9))", "呈请御准之前 (第256条第7至9项)"),
      rule: tr(
        lang,
        "หลังวาระที่ 3 ให้รอไว้ 15 วัน แล้วจึงนำร่างขึ้นทูลเกล้าฯ ตามมาตรา 256(7) โดยนำมาตรา 81 มาใช้โดยอนุโลม\nหากเข้าเงื่อนไขมาตรา 256(8) ต้องได้รับความเห็นชอบจากประชามติก่อนดำเนินการตาม (7)\nหากมีคำร้องตามมาตรา 256(9) ห้ามนำร่างขึ้นทูลเกล้าฯ ระหว่างศาลรัฐธรรมนูญพิจารณา",
        "After Reading 3 approval, wait 15 days before presenting the draft to the King under section 256(7), applying section 81 mutatis mutandis.\nIf section 256(8) applies, referendum approval is required before proceeding under (7).\nIf a petition under section 256(9) is pending, the draft cannot be presented while the Constitutional Court considers it.",
        "第三读通过后，须等待15日，再依第256条第7项呈请国王御准，并准用第81条。\n若符合第256条第8项，须先经公投通过，方可依第7项办理。\n若有第256条第9项的申请，在宪法法院审理期间不得呈请御准。",
      ),
      tag: "ม.256(7)–(9)",
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
        "นายกรัฐมนตรีดำรงตำแหน่งรวมกันเกิน 8 ปีมิได้ ไม่ว่าจะติดต่อกันหรือไม่ แต่ไม่นับระยะเวลาที่อยู่ปฏิบัติหน้าที่ต่อไปหลังพ้นจากตำแหน่ง (ม.158 วรรคสี่)",
        "The PM may serve at most 8 years in total, consecutive or not. Time continuing to perform duties after vacating office is excluded (Sec 158 paragraph 4).",
        "总理累计任期不得超过8年，不论是否连续任职；离任后继续履行职责的期间不计入（第158条第4款）。",
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
        "ส.ส. ไม่น้อยกว่า 1/5 ของ ส.ส. เท่าที่มีอยู่ เสนอญัตติไม่ไว้วางใจรัฐมนตรีรายบุคคลหรือ ครม. ทั้งคณะได้ มติไม่ไว้วางใจต้องมากกว่ากึ่งหนึ่งของ ส.ส. เท่าที่มีอยู่ (เมื่อครบ 500 คน: เสนอ ≥ 100 คน; มติ ≥ 251 เสียง)",
        "At least 1/5 of existing MPs may propose no-confidence in an individual minister or the Cabinet as a whole. Adoption needs more than half of existing MPs. With all 500 seats filled: ≥ 100 sponsors and ≥ 251 votes (Sec 151).",
        "不少于现有众议员总数五分之一可提出对单个部长或全体内阁的不信任案。通过须超过现有众议员总数半数；500席全部在任时，需至少100人提案、251票赞成（第151条）。",
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
        "事出紧急难拖延，四大安全立出台，下次国会即刻送，不准公告次日失效。",
      ),
      story: tr(
        lang,
        "ครม. ไม่สามารถออก พ.ร.ก. ตามใจชอบได้ ต้องผ่าน 4 ด่าน: 1) ฉุกเฉินจำเป็นหลีกเลี่ยงไม่ได้ 2) เข้า 4 เหตุ (มั่นคงชาติ/ปลอดภัยสาธารณะ/เศรษฐกิจ/ภัยพิบัติ) 3) เข้าสภาคราวประชุมถัดไป 4) สมาชิกอย่างน้อย 1/5 ของสภานั้นเท่าที่มีอยู่เสนอผ่านประธานสภาให้ศาลตรวจเหตุ 4 ประการตาม ม.172 วรรคหนึ่งก่อนอนุมัติ",
        "The Cabinet cannot issue decrees arbitrarily. Four strict tests: 1) Inevitable urgency, 2) Four statutory grounds (national security, public safety, economic stability, public calamity), 3) Immediate next session review, 4) At least 1/5 of existing members of either House may refer, through its President before approval, the four purposes in Sec 172 paragraph 1 to the Court.",
        "内阁绝不可随意发布紧急法令，须通过四大关卡：1) 迫切且不可避免的紧急需要，2) 四大限定理由之一（国家安全、公共安全、国家经济安全、公共灾难），3) 下次国会立即审查，4) 任一院现有议员至少五分之一可在批准前经本院议长提交宪法法院，审查第172条第1款四项目的。",
      ),
      sections: [172, 173],
    },
  ];

  return (
    <div className="cheatsheet-page">
      <div className="page-kicker mono">
        {tr(lang, "สูตรและแผนภาพ", "Cheat sheets and diagrams", "速查表与图解")}
      </div>
      
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
              "ทำข้อสอบและเข้าใจโครงสร้างอำนาจอย่างแม่นยำ ไม่ต้องท่องจำแบบสับสน ด้วยแผนภาพสไตล์ดินสอสี สูตรเงื่อนไข และตัวเลขสำคัญในรัฐธรรมนูญ",
              "Master constitutional architecture with precision. No confusing rote memorization: explore crayon diagrams, logic gates, and vital exam numbers.",
              "告别死记硬背与概念混淆。通过温润的蜡笔手绘图解、逻辑判定树与关键数字速查表，清晰透视宪制架构。",
            )}
          </p>
        </div>
      </section>

      {/* Interactive Tabs */}
      <nav
        className="flow-tabs cheatsheet-tabs"
        aria-label={tr(lang, "หัวข้อสูตร", "Formula topics", "公式主题")}
      >
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
              <span className="mono">
                {tr(lang, "หัวข้อ 01 · ลำดับศักดิ์", "01 · Legal hierarchy", "01 · 法律位阶")}
              </span>
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
              {/* Tier 1: Constitution (Top) */}
              <polygon
                points="300,20 220,75 380,75"
                fill={pyramidLevel === 0 ? "var(--accent)" : "var(--paper)"}
                stroke="var(--ink)"
                strokeWidth={pyramidLevel === 0 ? 3 : 1.5}
 className="pyramid-tier"
                onClick={() => setPyramidLevel(0)}
                tabIndex={0}
                role="button"
                aria-label={pyramidLevels[0].title}
              />
              <text x="300" y="55" textAnchor="middle" className="svg-label font-bold" pointerEvents="none">
                1. รัฐธรรมนูญ (ม.5)
              </text>

              {/* Tier 2: Organic Acts, Acts, Decrees */}
              <polygon
                points="220,77 380,77 440,135 160,135"
                fill={pyramidLevel === 1 ? "var(--accent)" : "var(--wash)"}
                stroke="var(--ink)"
                strokeWidth={pyramidLevel === 1 ? 3 : 1.5}
 className="pyramid-tier"
                onClick={() => setPyramidLevel(1)}
                tabIndex={0}
                role="button"
                aria-label={pyramidLevels[1].title}
              />
              <text x="300" y="112" textAnchor="middle" className="svg-label" pointerEvents="none">
                2. พ.ร.ป. / พ.ร.บ. / พ.ร.ก.
              </text>

              {/* Tier 3: Royal Decrees */}
              <polygon
                points="160,137 440,137 500,195 100,195"
                fill={pyramidLevel === 2 ? "var(--accent)" : "var(--paper)"}
                stroke="var(--ink)"
                strokeWidth={pyramidLevel === 2 ? 3 : 1.5}
 className="pyramid-tier"
                onClick={() => setPyramidLevel(2)}
                tabIndex={0}
                role="button"
                aria-label={pyramidLevels[2].title}
              />
              <text x="300" y="172" textAnchor="middle" className="svg-label" pointerEvents="none">
                3. พระราชกฤษฎีกา (พ.ร.ฎ. ม.175)
              </text>

              {/* Tier 4: Ministerial Regs */}
              <polygon
                points="100,197 500,197 550,255 50,255"
                fill={pyramidLevel === 3 ? "var(--accent)" : "var(--wash)"}
                stroke="var(--ink)"
                strokeWidth={pyramidLevel === 3 ? 3 : 1.5}
 className="pyramid-tier"
                onClick={() => setPyramidLevel(3)}
                tabIndex={0}
                role="button"
                aria-label={pyramidLevels[3].title}
              />
              <text x="300" y="232" textAnchor="middle" className="svg-label" pointerEvents="none">
                4. กฎกระทรวง / ประกาศกระทรวง
              </text>

              {/* Tier 5: Local Ordinances (Base) */}
              <polygon
                points="50,257 550,257 590,310 10,310"
                fill={pyramidLevel === 4 ? "var(--accent)" : "var(--paper)"}
                stroke="var(--ink)"
                strokeWidth={pyramidLevel === 4 ? 3 : 1.5}
 className="pyramid-tier"
                onClick={() => setPyramidLevel(4)}
                tabIndex={0}
                role="button"
                aria-label={pyramidLevels[4].title}
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
              <span className="mono font-bold">
                {tr(lang, "สูตร", "Formula", "公式")}
              </span>
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
              <span className="mono">
                {tr(lang, "หัวข้อ 02 · การแก้ไข", "02 · Amendment", "02 · 修宪")}
              </span>
              <h2 id="heading-amendment">
                {tr(lang, "ขั้นตอน 3 วาระการแก้ไขรัฐธรรมนูญ (มาตรา 255 & 256)", "The 3-Reading Amendment Algorithm (Sec 255 & 256)", "修宪三读法定算法 (第255与256条)")}
              </h2>
            </div>
          </div>

          <p className="micro">
            {tr(
              lang,
              "รัฐธรรมนูญ พ.ศ. 2560 เป็นรัฐธรรมนูญแบบแก้ไขยาก มีระบบ 'Triple Lock' กำหนดเสียง ส.ว. และ ส.ส. จากพรรคตามเงื่อนไขมาตรา 256(6)",
              "The 2017 Constitution is rigid: featuring a 'Triple Lock' mechanism requiring Senate approval and qualifying-party MP thresholds under section 256(6).",
              "2017年宪法属于强刚性宪法，设置了必须达到参议员与符合第256条第6项条件的政党众议员特定比例的“三重锁门槛”。",
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
            <Link className="citation" href={`/section/?n=${flowStep === 6 ? 255 : 256}`}>
              {sectionLabel(lang, flowStep === 6 ? 255 : 256)} ↗
            </Link>
          </div>
        </section>
      )}

      {/* TAB 3: Emergency Decrees */}
      {tab === "emergency" && (
        <section className="sheet-section" aria-labelledby="heading-emergency">
          <div className="section-heading">
            <div>
              <span className="mono">
                {tr(lang, "หัวข้อ 03 · พ.ร.ก. ฉุกเฉิน", "03 · Emergency decree", "03 · 紧急法令")}
              </span>
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
                  "ต้องเพื่อรักษาความปลอดภัยของประเทศ ความปลอดภัยสาธารณะ ความมั่นคงทางเศรษฐกิจ หรือป้องปัดภัยพิบัติสาธารณะ และ ครม. ต้องเห็นว่าเป็นกรณีฉุกเฉินที่มีความจำเป็นรีบด่วนอันมิอาจหลีกเลี่ยงได้ (ม.172 วรรคหนึ่ง–สอง)",
                  "The purpose must be national or public safety, national economic security, or averting public calamity. The Cabinet must consider it an unavoidable emergency of necessity and urgency (Sec 172 paragraphs 1–2).",
                  "目的须为维护国家安全、公共安全、国家经济安全或防范公共灾难，且内阁须认定属于不可避免、必要且紧迫的紧急情况（第172条第1至2款）。",
                )}
              </p>
            </div>

            <div className="tree-arrow mono">{tr(lang, "↓ ครบทั้งเหตุและความจำเป็นรีบด่วน", "↓ PURPOSE AND URGENT NECESSITY", "↓ 目的与紧急必要性均满足")}</div>

            <div className="tree-step">
              <span className="mono tree-badge">GATE 2</span>
              <h4>{tr(lang, "พระมหากษัตริย์ทรงตรา พ.ร.ก.", "The King Issues the Decree", "国王颁布紧急法令")}</h4>
              <p>
                {tr(
                  lang,
                  "พระมหากษัตริย์ทรงตราพระราชกำหนดเมื่อ ครม. เห็นว่าเข้าเงื่อนไขข้างต้น พระราชกำหนดมีผลใช้บังคับดังเช่นพระราชบัญญัติ",
                  "The King may issue the decree when the Cabinet considers the conditions above satisfied. It has the force of an Act.",
                  "在内阁认定符合上述条件时，国王可颁布紧急法令，其效力与法律相同。",
                )}
              </p>
            </div>

            <div className="tree-arrow mono">{tr(lang, "↓ ตรวจโดยศาลก่อนอนุมัติ หากมีคำร้อง", "↓ OPTIONAL CHECK BEFORE APPROVAL", "↓ 批准前的可选司法审查")}</div>

            <div className="tree-step">
              <span className="mono tree-badge">GATE 3</span>
              <h4>{tr(lang, "ศาลรัฐธรรมนูญตรวจสอบ (ม.173)", "Constitutional Court Check (Sec 173)", "宪法法院审查 (第173条)")}</h4>
              <p>
                {tr(
                  lang,
                  "ก่อนสภานั้นอนุมัติ สมาชิกไม่น้อยกว่า 1/5 ของสมาชิกเท่าที่มีอยู่ของสภานั้นเข้าชื่อเสนอความเห็นต่อประธานสภาว่า พ.ร.ก. ไม่เป็นไปตาม ม.172 วรรคหนึ่ง (เหตุ 4 ประการ) ประธานส่งศาลรัฐธรรมนูญภายใน 3 วัน และรอการพิจารณาของสภาจนได้รับคำวินิจฉัย\nศาลวินิจฉัยภายใน 60 วัน หากวินิจฉัยว่าไม่เป็นไปตามวรรคหนึ่งด้วยเสียงไม่น้อยกว่า 2/3 ของตุลาการเท่าที่มีอยู่ พ.ร.ก. ไม่มีผลใช้บังคับมาแต่ต้น ต่างจากการไม่อนุมัติของสภา",
                  "Before that House approves, at least 1/5 of its existing members may submit an opinion to its President alleging failure to meet Sec 172 paragraph 1 (the four purposes). The President refers it to the Court within 3 days; parliamentary consideration pauses until the decision is notified.\nThe Court decides within 60 days. A finding of noncompliance needs at least 2/3 of existing judges and makes the decree ineffective from the outset, unlike parliamentary disapproval.",
                  "在本院批准之前，不少于该院现有议员五分之一可向本院议长提出意见，认为法令不符合第172条第1款（四项目的）。议长须在3日内提交宪法法院，国会暂停审议，直至收到裁决通知。\n法院须在60日内裁决。认定不符合第1款须获现有法官至少三分之二赞成，法令自始无效，与国会不批准的后果不同。",
                )}
              </p>
            </div>
            <div className="tree-arrow mono">{tr(lang, "↓ เสนอสภาคราวประชุมถัดไปโดยไม่ชักช้า", "↓ SUBMIT NEXT SITTING WITHOUT DELAY", "↓ 下次会议毫不迟延地提交")}</div>

            <div className="tree-step">
              <span className="mono tree-badge">GATE 4</span>
              <h4>{tr(lang, "ด่านสภาตรวจสอบ (ม.172 ว.3)", "Parliamentary Approval Gate", "国会审查批准门")}</h4>
              <p>
                {tr(
                  lang,
                  "ครม. เสนอต่อรัฐสภาโดยไม่ชักช้าในคราวประชุมถัดไป หากรอเปิดสมัยประชุมสามัญจะล่าช้า ต้องเรียกประชุมวิสามัญ\n• สองสภาอนุมัติ หรือ ส.ว. ไม่อนุมัติแต่ ส.ส. ยืนยันมากกว่ากึ่งหนึ่งของ ส.ส. เท่าที่มีอยู่ ⟹ ยังคงมีผลใช้บังคับเป็น พ.ร.บ. ต่อไป\n• ส.ส. ไม่อนุมัติ หรือ ส.ว. ไม่อนุมัติและ ส.ส. ยืนยันไม่เกินกึ่งหนึ่ง ⟹ พ.ร.ก. ตกไป การไม่อนุมัติมีผลวันถัดจากวันประกาศในราชกิจจานุเบกษา ไม่กระทบกิจการที่ทำระหว่างใช้บังคับ กฎหมายเดิมที่ถูกแก้ไขหรือยกเลิกกลับมีผลตาม ม.172 วรรคสี่",
                  "The Cabinet submits the decree without delay at the next sitting; an extraordinary session is required if waiting for an ordinary session would cause delay.\n• Both Houses approve, or the Senate rejects but the House reaffirms by more than half of existing MPs: it continues with the force of an Act.\n• The House rejects, or the Senate rejects and House reaffirmation is not more than half: the decree lapses. Disapproval takes effect the day after Gazette publication. Acts done during enforcement remain unaffected; laws amended or repealed revive under Sec 172 paragraph 4.",
                  "内阁须在下次国会会议中毫不迟延地提交；若等待常会会造成延误，须召集特别会议。\n• 两院均批准，或参议院否决后众议院以超过现有众议员半数再次确认：继续具有法律效力。\n• 众议院否决，或参议院否决且众议院再次确认未超过半数：法令失效。不批准自刊登政府公报的次日起生效，不影响实施期间已作出的行为；被修改或废止的原法律依第172条第4款恢复效力。",
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
              <span className="mono">
                {tr(lang, "หัวข้อ 04 · ความได้สัดส่วน", "04 · Proportionality", "04 · 比例原则")}
              </span>
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
                {tr(lang, "1. ไม่เกินสมควรแก่เหตุ", "1. No disproportionate restriction", "1. 限制不过度")}
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
                {tr(lang, "3. กระทบศักดิ์ศรีความเป็นมนุษย์", "3. Human dignity affected", "3. 损害人的尊严")}
              </button>
            </div>

            {/* Scale SVG */}
            <svg
              viewBox="0 0 500 220"
              className="crayon-svg"
              role="img"
              aria-label={tr(lang, "ตาชั่งความได้สัดส่วน", "Scale of proportionality", "比例原则天平")}
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
                  <rect x="50" y="130" width="100" height="20" fill="var(--paper)" stroke="var(--ink)" />
                  <text x="100" y="145" textAnchor="middle" className="svg-label">{tr(lang, "ประโยชน์สาธารณะ", "Public interest", "公共利益")}</text>

                  {/* Right Pan: Personal Rights */}
                  <line x1="400" y1="70" x2="360" y2="130" stroke="var(--ink)" strokeWidth="1.5" />
                  <line x1="400" y1="70" x2="440" y2="130" stroke="var(--ink)" strokeWidth="1.5" />
                  <rect x="350" y="130" width="100" height="20" fill="var(--paper)" stroke="var(--ink)" />
                  <text x="400" y="145" textAnchor="middle" className="svg-label">{tr(lang, "สิทธิเสรีภาพ", "Rights and liberties", "权利与自由")}</text>
                </>
              )}

              {scaleFactor === "excess" && (
                <>
                  <line x1="100" y1="110" x2="400" y2="30" stroke="#dc2626" strokeWidth="4" />
                  {/* Left Pan lower: Excessive State intervention */}
                  <line x1="100" y1="110" x2="60" y2="170" stroke="var(--ink)" strokeWidth="1.5" />
                  <line x1="100" y1="110" x2="140" y2="170" stroke="var(--ink)" strokeWidth="1.5" />
                  <rect x="50" y="170" width="100" height="20" fill="#fecaca" stroke="var(--ink)" />
                  <text x="100" y="185" textAnchor="middle" className="svg-label">{tr(lang, "รัฐแทรกแซงล้นเกิน", "Excessive intervention", "过度干预")}</text>

                  {/* Right Pan elevated */}
                  <line x1="400" y1="30" x2="360" y2="90" stroke="var(--ink)" strokeWidth="1.5" />
                  <line x1="400" y1="30" x2="440" y2="90" stroke="var(--ink)" strokeWidth="1.5" />
                  <rect x="350" y="90" width="100" height="20" fill="#fee2e2" stroke="var(--ink)" />
                  <text x="400" y="105" textAnchor="middle" className="svg-label">{tr(lang, "สิทธิถูกลิดรอนเกินเหตุ", "Excessive restriction", "过度限制")}</text>
                </>
              )}

              {scaleFactor === "core" && (
                <>
                  <line x1="100" y1="130" x2="400" y2="10" stroke="#991b1b" strokeWidth="4" />
                  <text x="250" y="30" textAnchor="middle" fill="#991b1b" className="svg-label font-bold">
                    {tr(lang, "ต้องไม่กระทบศักดิ์ศรีความเป็นมนุษย์", "Must respect human dignity", "不得损害人的尊严")}
                  </text>
                </>
              )}
            </svg>

            <div className="formula-box">
              <span className="mono font-bold">{tr(lang, "เงื่อนไขตามมาตรา 26", "Section 26 safeguards", "第26条保障条件")}</span>
              <p>{tr(lang, "ตาชั่งแสดงเฉพาะเรื่องความได้สัดส่วน ต้องตรวจเงื่อนไขอื่นของมาตรา 26 ด้วย", "The scale illustrates proportionality alone. The other section 26 conditions must also be checked.", "天平仅说明比例问题，还须检查第26条的其他条件。")}</p>
              <ol className="proportionality-list">
                <li>{tr(lang, "กฎหมายที่จำกัดสิทธิหรือเสรีภาพต้องเป็นไปตามเงื่อนไขที่รัฐธรรมนูญบัญญัติ", "A law restricting rights or liberties must comply with the conditions provided by the Constitution.", "限制权利或自由的法律，须符合宪法规定的条件。")}</li>
                <li>{tr(lang, "หากรัฐธรรมนูญไม่ได้บัญญัติเงื่อนไขไว้ กฎหมายนั้นต้องไม่ขัดหลักนิติธรรม ไม่เพิ่มภาระหรือจำกัดสิทธิเสรีภาพเกินสมควรแก่เหตุ และไม่กระทบศักดิ์ศรีความเป็นมนุษย์", "Where the Constitution provides no conditions, the law must respect the rule of law, impose no disproportionate burden or restriction, and not affect human dignity.", "宪法未规定条件时，法律不得违反法治原则，不得过度增加负担或限制权利自由，亦不得损害人的尊严。")}</li>
                <li>{tr(lang, "ในกรณีดังกล่าวต้องระบุเหตุผลและความจำเป็นในการจำกัดสิทธิและเสรีภาพไว้ด้วย", "In that case, reasons and necessity for the restriction must also be specified.", "在上述情况下，还须说明限制权利与自由的理由和必要性。")}</li>
                <li>{tr(lang, "กฎหมายต้องใช้บังคับเป็นการทั่วไป ไม่มุ่งหมายแก่กรณีใดหรือบุคคลใดเป็นการเจาะจง", "The law must apply generally, rather than target a particular case or person.", "法律须普遍适用，不得专门针对某个案件或个人。")}</li>
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
              <span className="mono">
                {tr(lang, "หัวข้อ 05 · ตัวเลขสำคัญ", "05 · Numbers worth keeping", "05 · 关键数字")}
              </span>
              <h2 id="heading-numbers">
                {tr(lang, "ตัวเลขสำคัญในรัฐธรรมนูญ", "Vital Numbers for Civil Service & Bar Exams", "泰国宪法关键数字速查")}
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
              <span className="mono">
                {tr(lang, "หัวข้อ 06 · สูตรช่วยจำ", "06 · Memory hooks", "06 · 记忆钩子")}
              </span>
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
