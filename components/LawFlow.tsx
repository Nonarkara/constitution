"use client";
import { useState } from "react";
import Link from "next/link";
import { useStudy } from "./Provider";
import { tr } from "@/lib/i18n";
export function LawFlow({ amendment = false }: { amendment?: boolean }) {
  const { lang } = useStudy();
  const [step, setStep] = useState(0);
  const steps = amendment
    ? [
        {
          title: tr(lang, "เสนอร่าง", "Propose", "提出修宪案"),
          body: tr(
            lang,
            "เสนอได้โดยคณะรัฐมนตรี สมาชิกตามสัดส่วนที่กำหนด หรือประชาชนผู้มีสิทธิเลือกตั้งอย่างน้อย 50,000 คน",
            "The Cabinet, the required proportion of members, or at least 50,000 eligible voters may propose an amendment.",
            "内阁、法定比例的议员或至少五万名选民可提出修宪案。",
          ),
        },
        {
          title: tr(lang, "สามวาระ", "Three readings", "三次审议"),
          body: tr(
            lang,
            "พิจารณาร่วมกันโดยรัฐสภา วาระหนึ่งและสามมีเงื่อนไขเสียง สว. และวาระสามมีเงื่อนไขเสียงพรรคที่ไม่ได้ร่วมรัฐบาลตามมาตรา 256",
            "Parliament considers three readings. The first and third have Senate thresholds; the third also requires specified non-government-party votes under section 256.",
            "国会联合进行三次审议。第一、三读设参议员票数门槛，第三读还须达到第256条规定的非执政党票数。",
          ),
        },
        {
          title: tr(lang, "ตรวจเงื่อนไข", "Check conditions", "核对条件"),
          body: tr(
            lang,
            "เว้น 15 วันหลังวาระสาม และจัดประชามติถ้าเป็นกรณีตามมาตรา 256 (8) การเปลี่ยนรูปแบบรัฐหรือการปกครองตามมาตรา 255 ทำไม่ได้",
            "Wait 15 days after the third reading. A referendum is required in cases under section 256(8). Section 255 forbids specified changes to the state and regime.",
            "第三读后等待十五日。第256条第8项规定的情形须公投，第255条禁止改变特定国家形式与政体。",
          ),
        },
        {
          title: tr(lang, "นำขึ้นทูลเกล้าฯ", "Royal assent", "呈请御准"),
          body: tr(
            lang,
            "ดำเนินการตามมาตรา 256 และเงื่อนไขการตรวจสอบก่อนนำขึ้นทูลเกล้าฯ",
            "Proceed under section 256, including applicable review conditions before submission for royal assent.",
            "依第256条及相关审查程序，呈请国王御准。",
          ),
        },
      ]
    : [
        {
          title: tr(lang, "เสนอร่าง", "Introduce", "提出法案"),
          body: tr(
            lang,
            "ผู้เสนอและเงื่อนไขเป็นไปตามมาตรา 133 ร่างเกี่ยวด้วยการเงินต้องมีคำรับรองของนายกรัฐมนตรี",
            "Sponsors and conditions are set in section 133. A money bill needs the Prime Minister’s endorsement.",
            "提案主体与条件见第133条。财政法案须经总理批准。",
          ),
        },
        {
          title: tr(lang, "สภาผู้แทนฯ", "House", "众议院"),
          body: tr(
            lang,
            "สภาผู้แทนราษฎรพิจารณา เมื่อเห็นชอบแล้วจึงส่งให้วุฒิสภา",
            "The House considers the bill and, on approval, sends it to the Senate.",
            "众议院审议并通过后，将法案送交参议院。",
          ),
        },
        {
          title: tr(lang, "วุฒิสภา", "Senate", "参议院"),
          body: tr(
            lang,
            "วุฒิสภาอาจเห็นชอบ ไม่เห็นชอบ หรือแก้ไขเพิ่มเติม แต่ละกรณีมีขั้นตอนต่างกันตามมาตรา 136–138",
            "The Senate may approve, reject, or amend it. Each outcome follows a different path under sections 136–138.",
            "参议院可通过、否决或修改，分别依第136至138条处理。",
          ),
        },
        {
          title: tr(lang, "ประกาศใช้", "Promulgate", "颁布生效"),
          body: tr(
            lang,
            "เมื่อผ่านขั้นตอนรัฐสภาและการตรวจสอบที่เกี่ยวข้อง นายกรัฐมนตรีนำขึ้นทูลเกล้าฯ ตามมาตรา 145 และประกาศในราชกิจจานุเบกษา",
            "After parliamentary and applicable review procedures, the Prime Minister submits it for royal assent under section 145. It is published in the Government Gazette.",
            "完成国会及相关审查程序后，总理依第145条呈请御准，并在政府公报公布。",
          ),
        },
      ];
  return (
    <section className="law-flow">
      <h2>
        {amendment
          ? tr(lang, "เส้นทางแก้ไขรัฐธรรมนูญ", "The amendment path", "修宪路径")
          : tr(lang, "จากร่างสู่กฎหมาย", "From bill to law", "从法案到法律")}
      </h2>
      <p className="micro">
        {tr(
          lang,
          "ภาพรวมเพื่อเรียนรู้ แตะแต่ละขั้นเพื่ออ่าน ไม่ครอบคลุมข้อยกเว้นทั้งหมด",
          "A learning overview. Select a step to read. It does not cover every exception.",
          "学习用流程概览。点击步骤查看，并未涵盖全部例外。",
        )}
      </p>
      <div className="flow-tabs">
        {steps.map((s, i) => (
          <button key={i} aria-pressed={step === i} onClick={() => setStep(i)}>
            <span className="mono">0{i + 1}</span>
            {s.title}
          </button>
        ))}
      </div>
      <p className="flow-detail" key={step}>
        {steps[step].body}
      </p>
      <Link href={`/section/?n=${amendment ? 256 : 133}`}>
        {tr(lang, "กลับไปอ่านตัวบท", "Read the legal text", "阅读原条文")} ↗
      </Link>
    </section>
  );
}
