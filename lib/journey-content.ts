import type { Text } from "./i18n";
const t = (th: string, en: string, zh: string): Text => ({ th, en, zh });
export const journey = [
  {
    title: t("ซองจดหมายของติ๊กกี้", "Tikky’s envelope", "Tikky 的信封"),
    body: t(
      "เรื่องสมมติ: ติ๊กกี้กับเพื่อนอยากลดอายุขั้นต่ำของผู้สมัคร ส.ว. เพื่อให้คนรุ่นใหม่มีโอกาสมากขึ้น นี่คือการแก้คุณสมบัติผู้ดำรงตำแหน่งตามรัฐธรรมนูญ ไม่ใช่แค่ประกาศนโยบาย คุณช่วยพาร่างนี้ผ่านประตูแต่ละบานได้ไหม?",
      "Fiction: Tikky and her friends want to lower the minimum age for Senate candidates so younger people can participate. This changes the qualifications of a constitutional officeholder; a policy announcement alone cannot do it. Can you help their draft through each doorway?",
      "虚构故事：Tikky 和朋友想降低参议员候选人的最低年龄，让年轻人有更多机会。这是在修改宪法公职的任职资格，不能只靠政策宣言。你能带着草案走过每一道门吗？",
    ),
    note: t(
      "แก้รายมาตราภายใต้รัฐธรรมนูญปัจจุบัน การจัดทำรัฐธรรมนูญใหม่ทั้งฉบับมีคำถามทางกฎหมายเพิ่มเติม ไม่ได้จำลองในที่นี้",
      "This journey models amendments under the current Constitution. Drafting an entirely new constitution raises additional legal questions and is outside this simulation.",
      "这里模拟现行宪法下的条文修订。重新制定整部宪法还有额外法律问题，本模拟不涵盖。",
    ),
    question: t(
      "เพื่อน 50,000 คนเสนอร่างได้เมื่อใด?",
      "When can 50,000 friends propose the draft?",
      "五万名朋友在什么情况下可提出草案？",
    ),
    choices: [
      t(
        "เมื่อเป็นผู้มีสิทธิเลือกตั้งและเข้าชื่อตามกฎหมาย",
        "When they are eligible voters petitioning under the law",
        "具备选举权并依法联署时",
      ),
      t(
        "เมื่อโพสต์ได้ 50,000 ไลก์",
        "When a post gets 50,000 likes",
        "帖子获得五万个赞时",
      ),
      t(
        "เมื่อคณะรัฐมนตรีเห็นด้วยเท่านั้น",
        "Only when the Cabinet agrees",
        "只有内阁同意时",
      ),
    ],
    answer: 0,
    explanation: t(
      "มาตรา 256(1): ครม., ส.ส. อย่างน้อย 1/5 เท่าที่มีอยู่, ส.ส. และ ส.ว. ร่วมกันอย่างน้อย 1/5 ของสองสภาเท่าที่มีอยู่ หรือผู้มีสิทธิเลือกตั้งอย่างน้อย 50,000 คน เสนอได้ การเข้าชื่อมีรายละเอียดตามกฎหมาย",
      "Section 256(1) allows the Cabinet, at least one fifth of existing MPs, MPs and Senators jointly numbering at least one fifth of both Houses’ existing members, or at least 50,000 eligible voters to propose. Petition formalities are governed by law.",
      "第256条第1项允许内阁、至少五分之一现有众议员、合计至少占两院现有议员五分之一的众议员与参议员，或至少五万名有选举权的公民提案。联署手续须依法办理。",
    ),
    sections: [256],
  },
  {
    title: t("ห้องรับหลักการ", "The first-reading room", "接受原则的房间"),
    body: t(
      "วาระที่ 1 ใช้ไม่น้อยกว่ากึ่งหนึ่งของสมาชิกทั้งสองสภาเท่าที่มีอยู่ และในเสียงนั้นต้องมี ส.ว. อย่างน้อย 1/3 เท่าที่มีอยู่ ถ้าครบ 700 คนและมี ส.ว. 200 คน ต้องมีอย่างน้อย 350 เสียง รวม ส.ว. อย่างน้อย 67 เสียง เสียงทั้งหมดกับเสียง ส.ว. เป็นเงื่อนไขคนละข้อ",
      "Reading 1 needs at least half of both Houses’ existing members, including at least one third of existing Senators. With all 700 seats filled and 200 Senators: at least 350 votes, including 67 Senators. The total and Senate counts are separate conditions.",
      "第一读须获两院现有议员至少半数赞成，其中须有至少三分之一现有参议员。两院700席、参议院200席全部在任时，需至少350票，其中参议员至少67票。总票数与参议员票数是两个条件。",
    ),
    note: t(
      "ห้องในเรื่องเป็นเครื่องช่วยจำ ไม่ใช่สถานที่จริงของรัฐสภา",
      "These rooms are memory cues, not the actual Parliament building.",
      "故事里的房间是记忆线索，并非真实国会建筑。",
    ),
    question: t(
      "ครบ 700 คน: เห็นชอบ 400 คน แต่มี ส.ว. เพียง 60 คน ผ่านวาระแรกไหม?",
      "All 700 seats filled: 400 approve, but only 60 are Senators. Does Reading 1 pass?",
      "700席全部在任：400票赞成，但只有60票来自参议员。第一读通过吗？",
    ),
    choices: [
      t(
        "ผ่าน เพราะเกินครึ่ง",
        "Yes: more than half approve",
        "通过，因为超过半数",
      ),
      t(
        "ไม่ผ่าน เพราะเสียง ส.ว. ไม่ถึง 67",
        "No: fewer than 67 Senators approve",
        "不通过，参议员赞成票不足67",
      ),
      t(
        "ผ่าน ถ้าประชาชนเห็นด้วย",
        "Yes, if the public agrees",
        "公众支持就通过",
      ),
    ],
    answer: 1,
    explanation: t(
      "ต้องผ่านทั้งสองเงื่อนไขพร้อมกัน เสียงรวมมากไม่ทดแทนเกณฑ์ ส.ว.",
      "Both conditions must hold. Extra total votes cannot replace the Senate threshold.",
      "两个条件须同时满足。更多总票数不能代替参议员门槛。",
    ),
    sections: [256],
  },
  {
    title: t(
      "โต๊ะรายมาตราและนาฬิกาสองเรือน",
      "The drafting desk and two clocks",
      "逐条审议的桌子与两只时钟",
    ),
    body: t(
      "วาระที่ 2 พิจารณารายมาตราและใช้เสียงข้างมาก หากประชาชนเสนอ ต้องเปิดโอกาสให้ผู้แทนแสดงความคิดเห็น หลังวาระที่ 2 รอ 15 วันก่อนวาระที่ 3 วาระที่ 3 ต้องมากกว่ากึ่งหนึ่งของสองสภา พร้อม ส.ว. 1/3 และ ส.ส. อย่างน้อย 20% ของทุกพรรคที่ไม่มีสมาชิกเป็นรัฐมนตรี ประธานหรือรองประธานสภาผู้แทนราษฎรรวมกัน หลังอนุมัติยังมีการรอ 15 วันอีกครั้งตาม (7)",
      "Reading 2 considers each section by majority vote; representatives of citizen proposers must have an opportunity to speak. Wait 15 days before Reading 3. Final approval needs more than half of both Houses, one third of Senators, and at least 20% of the combined MPs of all parties whose members hold no minister, House President or Vice-President office. After approval, paragraph (7) requires another 15-day wait.",
      "第二读逐条审议，以多数票决定；公民提案的代表须有陈述机会。之后等待15日，才进入第三读。最终通过须超过两院现有议员半数、至少三分之一参议员，以及没有成员担任部长、众议院议长或副议长的各政党众议员合计至少20%。批准后，第7项另规定等待15日。",
    ),
    note: t(
      "เกณฑ์ใช้สมาชิกเท่าที่มีอยู่ ไม่ใช่จำนวนที่นั่งตามปกติเสมอไป",
      "Denominators use existing members, not always the normal seat totals.",
      "分母是现有议员人数，并非一律使用法定席位数。",
    ),
    question: t(
      "ครบ 700 คน: 350 เสียงผ่านวาระที่ 1 แล้ว ผ่านวาระที่ 3 ด้วยไหม?",
      "With 700 existing members, 350 passes Reading 1. Is it enough for Reading 3?",
      "700名议员全部在任时，350票足够第一读。第三读也足够吗？",
    ),
    choices: [
      t(
        "พอ ทั้งสองวาระใช้เกณฑ์เดียวกัน",
        "Yes: both use the same threshold",
        "够，两读门槛相同",
      ),
      t(
        "ไม่พอ ต้องอย่างน้อย 351 และผ่านเงื่อนไขอื่น",
        "No: at least 351 and the other conditions are needed",
        "不够，至少需351票且满足其他条件",
      ),
      t("พอ ถ้ารอ 15 วัน", "Yes, after waiting 15 days", "等15日后就够"),
    ],
    answer: 1,
    explanation: t(
      "วาระแรกไม่น้อยกว่าครึ่ง วาระสามมากกว่าครึ่ง การรอเวลาไม่เพิ่มเสียงให้ร่าง",
      "First reading is at least half; final reading is more than half. Waiting does not add votes.",
      "第一读至少半数，第三读须超过半数。等待不会增加票数。",
    ),
    sections: [256],
  },
  {
    title: t(
      "ประตูประชามติและข้อห้าม",
      "The referendum door and limits",
      "公投之门与修宪界限",
    ),
    body: t(
      "ร่างสมมติแก้คุณสมบัติ ส.ว. จึงเข้าเงื่อนไขประชามติ มาตรา 256(8) ยังครอบคลุมหมวด 1, 2, 15 คุณสมบัติหรือลักษณะต้องห้ามของตำแหน่งตามรัฐธรรมนูญ หน้าที่หรืออำนาจศาล/องค์กรอิสระ และเรื่องที่ทำให้หน่วยงานเหล่านั้นทำหน้าที่ไม่ได้ ต้องได้ความเห็นชอบจากประชามติก่อนดำเนินการตาม (7) ถ้ามีคำร้องตาม (9) ห้ามนำร่างขึ้นทูลเกล้าฯ ระหว่างศาลพิจารณา มาตรา 255 ห้ามเปลี่ยนระบอบประชาธิปไตยอันมีพระมหากษัตริย์ทรงเป็นประมุขหรือรูปแบบของรัฐ",
      "Our fictional draft changes Senate qualifications, so it requires a referendum. Section 256(8) also covers Chapters 1, 2 and 15; qualifications/disqualifications for constitutional offices; duties/powers of courts or independent organs; and measures preventing those bodies from functioning. Referendum approval precedes proceeding under (7). A pending (9) petition blocks royal submission during Court consideration. Section 255 prohibits changing the democratic regime with the King as Head of State or the form of the State.",
      "虚构草案修改参议员资格，因此须公投。第256条第8项还涵盖第1、2、15章、宪法公职资格或禁止任职情形、法院或独立机构职责权限，以及令这些机构无法履职的事项。须先经公投通过，再依第7项办理。第9项申请在法院审理期间会阻止呈请御准。第255条禁止改变以国王为元首的民主政体或国家形式。",
    ),
    note: t(
      "นี่ไม่ใช่คำทำนายว่าจะผ่าน หรือคำแนะนำร่างรัฐธรรมนูญใหม่ทั้งฉบับ",
      "This predicts no outcome and is not guidance for drafting an entirely new constitution.",
      "这里不预测结果，也不是重新制定整部宪法的操作指南。",
    ),
    question: t(
      "แก้คุณสมบัติผู้ดำรงตำแหน่งตามรัฐธรรมนูญ ต้องมีประชามติหรือไม่?",
      "Does changing a constitutional officeholder’s qualifications require a referendum?",
      "修改宪法公职的任职资格须公投吗？",
    ),
    choices: [
      t(
        "ต้อง ตามมาตรา 256(8)",
        "Yes, under section 256(8)",
        "须，依第256条第8项",
      ),
      t(
        "ไม่ต้อง ถ้า ส.ส. เห็นชอบมาก",
        "No, if enough MPs approve",
        "众议员赞成够多就不必",
      ),
      t("แล้วแต่ยอดไลก์", "It depends on likes", "看点赞数"),
    ],
    answer: 0,
    explanation: t(
      "เสียงในสภาไม่แทนประชามติที่รัฐธรรมนูญกำหนด และประชามติก็ไม่ข้ามข้อห้ามมาตรา 255",
      "Parliamentary votes do not replace a required referendum. A referendum does not bypass section 255’s prohibitions either.",
      "国会表决不能代替法定公投；公投也不能绕过第255条禁止事项。",
    ),
    sections: [255, 256],
  },
];
export const debates = [
  {
    title: t(
      "กองทัพมีไว้ทำอะไร?",
      "What is the military for?",
      "军队的职责是什么？",
    ),
    sections: [52],
    body: t(
      "มาตรา 52 กำหนดหน้าที่รัฐด้านความมั่นคงและการทหารที่มีประสิทธิภาพ คำถามเชิงนโยบายคือขนาด งบประมาณ และการกำกับที่เหมาะสม การมีหน้าที่ตามรัฐธรรมนูญไม่ได้พิสูจน์ว่างบทุกก้อนคุ้มค่า",
      "Section 52 addresses security and efficient military services. Size, budgets and oversight are policy questions. A constitutional duty does not prove that every expenditure is worthwhile.",
      "第52条规定国家安全及高效的军事服务。规模、预算与监督属于政策问题。宪法职责不能证明每项开支都值得。",
    ),
  },
  {
    title: t(
      "ยังต้องมี ส.ว. ไหม?",
      "Do we still need a Senate?",
      "还需要参议院吗？",
    ),
    sections: [107, 111, 136],
    body: t(
      "รัฐธรรมนูญปัจจุบันมีวุฒิสภา 200 คน ผู้สนับสนุนสองสภาอาจให้เหตุผลเรื่องการทบทวนกฎหมาย ผู้วิจารณ์อาจถามเรื่องความรับผิดชอบต่อประชาชน เปรียบเทียบทั้งประโยชน์และต้นทุนก่อนเลือก ไม่ใช่คำถามที่ตัวบทตอบความคุ้มค่าให้เรา",
      "The current Constitution provides for 200 Senators. Supporters of two chambers may value legislative review; critics may question accountability. Compare benefits and costs. The legal text establishes the institution, not a verdict on its worth.",
      "现行宪法设200名参议员。支持两院制者可能重视复核法律，批评者可能质疑问责。应比较收益与成本；条文规定机构，并不替我们判定是否值得。",
    ),
  },
  {
    title: t("เงินเดือนและความคุ้มค่า", "Pay and value", "薪酬与价值"),
    sections: [183, 140, 141],
    body: t(
      "มาตรา 183 ให้ค่าตอบแทนสมาชิกสภาเป็นไปตามพระราชกฤษฎีกา ไม่ได้ระบุยอดเงินเดือนในรัฐธรรมนูญ ถ้าจะตัดสินความคุ้มค่า ต้องใช้ค่าตอบแทนล่าสุด งบที่ตรวจสอบได้ ผลงาน และต้นทุนของทางเลือก ไม่ควรเดาตัวเลข",
      "Section 183 leaves parliamentary remuneration to a Royal Decree; the Constitution does not give salary amounts. Assess value using current pay rules, audited budgets, performance and the costs of alternatives, rather than guessed figures.",
      "第183条将议员报酬交由皇家法令规定，宪法本身不列工资数额。评价价值须查最新薪酬规则、可核实预算、工作成果与替代方案成本，不能猜数字。",
    ),
  },
  {
    title: t(
      "เอาผู้นำออกได้อย่างไร?",
      "How can an officeholder be removed?",
      "如何追究任职者责任？",
    ),
    sections: [151, 152, 170, 234, 235],
    body: t(
      "ไม่ไว้วางใจไม่ใช่การกล่าวหาทุจริตเส้นทางเดียวกัน มาตรา 151 ใช้ ส.ส. อย่างน้อย 1/5 เท่าที่มีอยู่เสนอ และมากกว่าครึ่งลงมติ ส่วนมาตรา 152 อภิปรายโดยไม่ลงมติ การสิ้นสุดตำแหน่งและคดีทุจริตมีเงื่อนไขต่างกัน ไม่มีโควตา “ลองได้กี่ครั้ง” ที่ใช้กับทุกกรณีเหมือนกัน",
      "No-confidence and corruption proceedings are different routes. Section 151 needs at least one fifth of existing MPs to propose and more than half to adopt no-confidence; section 152 is debate without a vote. Removal and corruption proceedings have different conditions. There is no single “number of tries” applicable to every route.",
      "不信任表决与贪腐程序是不同途径。第151条须至少五分之一现有众议员提案、超过半数通过；第152条只辩论不表决。离任与贪腐程序条件各异，不存在适用于一切途径的统一“可尝试次数”。",
    ),
  },
];
