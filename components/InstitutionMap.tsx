"use client";
import { useState } from "react";
import Link from "next/link";
import { useStudy } from "./Provider";
import { tr, sectionLabel } from "@/lib/i18n";
export function InstitutionMap() {
  const { lang } = useStudy();
  const [selected, setSelected] = useState(0);
  const branches = [
    {
      title: tr(lang, "รัฐสภา", "National Assembly", "国会"),
      section: 79,
      detail: tr(
        lang,
        "ประกอบด้วยสภาผู้แทนราษฎรและวุฒิสภา มีบทบาทด้านการตรากฎหมายและการควบคุมการบริหารตามรัฐธรรมนูญ",
        "The House of Representatives and the Senate form Parliament. Its constitutional roles include legislation and oversight of administration.",
        "由众议院与参议院组成，依宪法行使立法及监督行政等职权。",
      ),
    },
    {
      title: tr(lang, "คณะรัฐมนตรี", "Council of Ministers", "内阁"),
      section: 158,
      detail: tr(
        lang,
        "นายกรัฐมนตรีและรัฐมนตรีบริหารราชการแผ่นดินตามรัฐธรรมนูญและกฎหมาย และมีหน้าที่ตามมาตรา 164",
        "The Prime Minister and ministers administer state affairs under the Constitution and law, with duties set out in section 164.",
        "总理及部长依宪法与法律治理国家事务，职责见第164条。",
      ),
    },
    {
      title: tr(lang, "ศาล", "Courts", "法院"),
      section: 188,
      detail: tr(
        lang,
        "พิจารณาพิพากษาคดี ผู้พิพากษาและตุลาการมีอิสระในการพิจารณาพิพากษาตามรัฐธรรมนูญและกฎหมาย",
        "Courts try and adjudicate cases. Judges are independent in adjudication under the Constitution and law.",
        "审理并裁判案件。法官依宪法与法律独立履行审判职责。",
      ),
    },
  ];
  return (
    <section className="institution-map">
      <h2>
        {tr(
          lang,
          "อำนาจอธิปไตยใช้ผ่านใครบ้าง",
          "Through which institutions is sovereign power exercised?",
          "主权通过哪些机构行使？",
        )}
      </h2>
      <p className="micro">
        {tr(
          lang,
          "มาตรา 3 ระบุว่าอำนาจอธิปไตยเป็นของปวงชนชาวไทย พระมหากษัตริย์ทรงใช้อำนาจนั้นทางรัฐสภา คณะรัฐมนตรี และศาล ตามรัฐธรรมนูญ",
          "Section 3: sovereign power belongs to the Thai people; the King exercises it through Parliament, the Council of Ministers and the Courts under the Constitution.",
          "第3条：主权属于泰国人民，国王依宪法通过国会、内阁及法院行使该权力。",
        )}
      </p>
      <svg
        viewBox="0 0 640 180"
        role="img"
        aria-label={tr(
          lang,
          "แผนภาพมาตรา 3: อำนาจของประชาชนใช้ทางรัฐสภา คณะรัฐมนตรี และศาล",
          "Section 3 diagram: the people’s sovereign power is exercised through Parliament, Cabinet and Courts",
          "第3条图示：人民主权通过国会、内阁及法院行使",
        )}
      >
        <rect
          x="190"
          y="5"
          width="260"
          height="48"
          fill="var(--wash)"
          stroke="var(--ink)"
        />
        <text x="320" y="35" textAnchor="middle">
          {tr(lang, "ปวงชนชาวไทย", "Thai people", "泰国人民")}
        </text>
        {branches.map((branch, i) => {
          const x = 20 + i * 210;
          return (
            <g
              key={branch.section}
              className={selected === i ? "branch-selected" : ""}
            >
              <path
                d={`M320 53 V85 H${x + 90} V115`}
                fill="none"
                stroke={selected === i ? "var(--accent)" : "var(--line)"}
                strokeWidth={selected === i ? 3 : 1}
              />
              <rect
                x={x}
                y="115"
                width="180"
                height="52"
                fill={selected === i ? "var(--accent)" : "var(--paper)"}
                stroke="var(--ink)"
              />
              <text x={x + 90} y="146" textAnchor="middle">
                {branch.title}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flow-tabs institution-tabs">
        {branches.map((branch, i) => (
          <button
            key={branch.section}
            aria-pressed={selected === i}
            onClick={() => setSelected(i)}
          >
            {branch.title}
          </button>
        ))}
      </div>
      <div className="flow-detail" key={selected} aria-live="polite">
        <p>{branches[selected].detail}</p>
        <Link href={`/section/?n=${branches[selected].section}`}>
          {sectionLabel(lang, branches[selected].section)} →
        </Link>
      </div>
      <p className="micro">
        {tr(
          lang,
          "แผนภาพนี้แสดงความสัมพันธ์ตามมาตรา 3 ไม่ใช่สายบังคับบัญชา องค์กรอิสระมีสถานะและหน้าที่ตามหมวด 12",
          "This diagram shows the relationship in section 3, not a reporting hierarchy. Independent organs have their own status and duties under chapter 12.",
          "此图展示第3条的关系，并非上下级指挥链。独立机构的地位与职责见第12章。",
        )}{" "}
        <Link href="/section/?n=215">{sectionLabel(lang, 215)} →</Link>
      </p>
    </section>
  );
}
