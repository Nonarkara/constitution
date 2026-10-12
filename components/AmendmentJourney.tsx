"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useStudy } from "./Provider";
import { StudyArt } from "./StudyArt";
import { tr, sectionLabel } from "@/lib/i18n";
import { journey, debates } from "@/lib/journey-content";
import {
  assessAmendmentVotes,
  REFLECTION_KEY,
  parseReflection,
  type Reflection,
  type VoteInput,
} from "@/lib/amendment";

function VoteLab() {
  const { lang } = useStudy();
  const [v, setV] = useState<VoteInput>({
    house: 500,
    senate: 200,
    totalYes: 350,
    senateYes: 67,
    eligibleMPs: 100,
    eligibleYes: 20,
  });
  let result: ReturnType<typeof assessAmendmentVotes> | null = null;
  try {
    result = assessAmendmentVotes(v);
  } catch {
    /* Incomplete numeric entry: show validation below. */
  }
  const fields: [keyof VoteInput, string, number][] = [
    [
      "house",
      tr(
        lang,
        "ส.ส. เท่าที่มีอยู่ (สมมติ)",
        "Existing MPs (fictional)",
        "现有众议员（假设）",
      ),
      500,
    ],
    [
      "senate",
      tr(
        lang,
        "ส.ว. เท่าที่มีอยู่ (สมมติ)",
        "Existing Senators (fictional)",
        "现有参议员（假设）",
      ),
      200,
    ],
    [
      "eligibleMPs",
      tr(
        lang,
        "ส.ส. ทุกพรรคที่เข้าเงื่อนไขรวมกัน",
        "Combined MPs of qualifying parties",
        "符合条件的各党众议员合计",
      ),
      v.house,
    ],
    [
      "totalYes",
      tr(
        lang,
        "เสียงเห็นชอบรวมสองสภา",
        "Total approving votes",
        "两院赞成票总数",
      ),
      v.house + v.senate,
    ],
    [
      "senateYes",
      tr(
        lang,
        "ในเสียงรวม: ส.ว. เห็นชอบ",
        "Of the total: approving Senators",
        "总票数中：参议员赞成票",
      ),
      v.senate,
    ],
    [
      "eligibleYes",
      tr(
        lang,
        "ในเสียงรวม: ส.ส. พรรคตามเงื่อนไขเห็นชอบ",
        "Of the total: approving qualifying-party MPs",
        "总票数中：符合条件的政党众议员赞成票",
      ),
      v.eligibleMPs,
    ],
  ];
  return (
    <section className="vote-lab" aria-labelledby="vote-title">
      <h2 id="vote-title">
        {tr(
          lang,
          "ลองจัดเสียงในสภา",
          "Try assembling the votes",
          "试着凑齐票数",
        )}
      </h2>
      <p>
        {tr(
          lang,
          "ตัวเลขสมมติทั้งหมด ส.ว. และ ส.ส. ตามเงื่อนไขต้องอยู่ในเสียงรวมแล้ว ไม่ใช่เสียงที่บวกเพิ่ม พรรคที่เข้าเงื่อนไขคือพรรคที่ไม่มีสมาชิกเป็นรัฐมนตรี ประธานหรือรองประธานสภาผู้แทนราษฎร",
          "Every number is fictional. Senate and qualifying-party votes are included in the total, not added to it. Qualifying parties have no member serving as minister, House President or Vice-President.",
          "所有数字均为假设。参议员及符合条件的政党票数已计入总数，不能另行相加。符合条件的政党没有成员担任部长、众议院议长或副议长。",
        )}
      </p>
      <div className="vote-inputs">
        {fields.map(([key, label, max]) => (
          <label key={key}>
            {label}
            <input
              type="number"
              min={key === "house" || key === "senate" ? 1 : 0}
              max={max}
              step="1"
              value={Number.isNaN(v[key]) ? "" : v[key]}
              onChange={(e) =>
                setV({
                  ...v,
                  [key]: e.target.value === "" ? NaN : Number(e.target.value),
                })
              }
            />
          </label>
        ))}
      </div>
      <div className="vote-verdict" role="status" aria-live="polite">
        {!result?.valid ? (
          <p>
            {tr(
              lang,
              "ตรวจจำนวนสมาชิกและเสียง: ต้องเป็นจำนวนเต็ม เสียงย่อยต้องไม่เกินเสียงรวมและสมาชิกของกลุ่มนั้น",
              "Check the counts: use whole numbers, with approving subgroups within the total and their own membership.",
              "请检查人数：使用整数，各组赞成票不能超过总票数或该组人数。",
            )}
          </p>
        ) : (
          <>
            <dl>
              <dt>{tr(lang, "วาระที่ 1", "Reading 1", "第一读")}</dt>
              <dd>
                {result.first
                  ? tr(lang, "ผ่าน", "Pass", "通过")
                  : tr(lang, "ยังไม่ผ่าน", "Not yet", "尚未通过")}{" "}
                · ≥ {result.thresholds.first} +{" "}
                {tr(lang, "ในนั้น ส.ว.", "including Senators", "其中参议员")} ≥{" "}
                {result.thresholds.senate}
              </dd>
              <dt>{tr(lang, "วาระที่ 3", "Reading 3", "第三读")}</dt>
              <dd>
                {result.final
                  ? tr(
                      lang,
                      "ผ่านเกณฑ์เสียง",
                      "Vote thresholds pass",
                      "票数门槛通过",
                    )
                  : tr(lang, "ยังไม่ผ่าน", "Not yet", "尚未通过")}{" "}
                · ≥ {result.thresholds.final};{" "}
                {tr(lang, "ส.ว.", "Senators", "参议员")} ≥{" "}
                {result.thresholds.senate};{" "}
                {tr(
                  lang,
                  "ส.ส. ตามเงื่อนไข",
                  "qualifying MPs",
                  "符合条件的众议员",
                )}{" "}
                ≥ {result.thresholds.eligible}
              </dd>
            </dl>
            <p className="micro">
              {tr(
                lang,
                "ผ่านเสียงยังไม่เท่ากับแก้สำเร็จ ต้องผ่านประตูอื่นด้วย",
                "Passing vote thresholds does not finish the amendment. Other gates still apply.",
                "达到票数门槛不等于修宪完成，还须经过其他程序。",
              )}
            </p>
          </>
        )}
      </div>
      <Link href="/section/?n=256">{sectionLabel(lang, 256)} ↗</Link>
    </section>
  );
}
export function AmendmentJourney() {
  const { lang, ready } = useStudy();
  const [step, setStep] = useState(0),
    [picked, setPicked] = useState<number | null>(null),
    [checked, setChecked] = useState(false);
  const [reform, setReform] = useState(25),
    [schools, setSchools] = useState(40);
  const [reflection, setReflection] = useState<
    Omit<Reflection, "savedAt" | "version">
  >({ choice: "unsure", proposal: "", benefit: "", cost: "", evidence: "" });
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(REFLECTION_KEY);
      if (raw) {
        const saved = parseReflection(JSON.parse(raw));
        if (saved) setReflection(saved);
        else {
          localStorage.setItem(`${REFLECTION_KEY}-backup-${Date.now()}`, raw);
          setStatus("error");
        }
      }
    } catch {
      setStatus("error");
    }
  }, []);
  const move = (n: number) => {
    setStep(n);
    setPicked(null);
    setChecked(false);
    setStatus("idle");
  };
  const stageRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (step > 0) stageRef.current?.focus();
  }, [step]);
  const current = journey[step];
  const save = () => {
    try {
      const value: Reflection = {
        ...reflection,
        version: 1,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(REFLECTION_KEY, JSON.stringify(value));
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  };
  const exportNote = () => {
    const text = JSON.stringify(
      { ...reflection, version: 1, savedAt: new Date().toISOString() },
      null,
      2,
    );
    const url = URL.createObjectURL(
      new Blob([text], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-amendment-reflection.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="amendment-journey">
      <div className="civic-title">
        <div>
          <h1>
            {tr(
              lang,
              "ถ้าเราอยากแก้รัฐธรรมนูญ",
              "If we want to amend it",
              "如果我们想修宪",
            )}
          </h1>
          <p>
            {tr(
              lang,
              "เรื่องสมมติ ประตูจริง คำตอบของคุณเอง",
              "A fictional story. Real gates. Your own answer.",
              "虚构故事，真实门槛，你自己的答案。",
            )}
          </p>
        </div>
        <StudyArt scene="reading" />
      </div>
      <nav
        className="journey-progress"
        aria-label={tr(lang, "ช่วงของเรื่อง", "Story stages", "故事阶段")}
      >
        {[
          ...journey.map((x) => x.title[lang]),
          tr(lang, "ต้นทุนและทางเลือก", "Costs and choices", "成本与选择"),
          tr(lang, "คำตอบของฉัน", "My answer", "我的答案"),
        ].map((title, i) => (
          <button
            key={i}
            disabled={!ready}
            aria-current={step === i ? "step" : undefined}
            onClick={() => move(i)}
          >
            <span className="mono">{i + 1}</span> {title}
          </button>
        ))}
      </nav>
      <article
        className="journey-chapter"
        key={step}
        ref={stageRef}
        tabIndex={-1}
      >
        {current ? (
          <>
            <h2>{current.title[lang]}</h2>
            <p>{current.body[lang]}</p>
            <p className="micro">{current.note[lang]}</p>
            <div
              className="doorway-path"
              aria-label={tr(
                lang,
                "เส้นทางที่ร่างต้องผ่าน",
                "The draft’s pathway",
                "草案的路径",
              )}
            >
              {[
                tr(lang, "เสนอ", "Propose", "提案"),
                tr(lang, "3 วาระ", "3 readings", "三读"),
                tr(
                  lang,
                  "ประชามติเมื่อจำเป็น",
                  "Referendum if required",
                  "必要时公投",
                ),
                tr(lang, "นำขึ้นทูลเกล้าฯ", "Royal submission", "呈请御准"),
              ].map((s, i) => (
                <span key={s}>
                  <b className="mono">{i + 1}</b>
                  {s}
                </span>
              ))}
            </div>
            <fieldset className="journey-recall">
              <legend>{current.question[lang]}</legend>
              {current.choices.map((choice, i) => (
                <label key={i}>
                  <input
                    type="radio"
                    name={`recall-${step}`}
                    checked={picked === i}
                    disabled={checked || !ready}
                    onChange={() => setPicked(i)}
                  />
                  {choice[lang]}
                </label>
              ))}
              <button
                disabled={!ready || picked === null || checked}
                onClick={() => setChecked(true)}
              >
                {tr(lang, "ตรวจความเข้าใจ", "Check understanding", "检查理解")}
              </button>
              {checked && (
                <div role="status">
                  <strong>
                    {picked === current.answer
                      ? tr(
                          lang,
                          "ใช่ ลองอธิบายด้วยคำของคุณ",
                          "Yes. Try explaining it in your own words.",
                          "正确。试着用自己的话解释。",
                        )
                      : tr(
                          lang,
                          "ลองดูเงื่อนไขอีกครั้ง",
                          "Look at the conditions again.",
                          "再看看条件。",
                        )}
                  </strong>
                  <p>{current.explanation[lang]}</p>
                  {picked !== current.answer && (
                    <button
                      onClick={() => {
                        setPicked(null);
                        setChecked(false);
                      }}
                    >
                      {tr(lang, "ลองใหม่", "Try again", "再试一次")}
                    </button>
                  )}
                </div>
              )}
            </fieldset>
            <p>
              {current.sections.map((n) => (
                <Link className="citation" key={n} href={`/section/?n=${n}`}>
                  {sectionLabel(lang, n)} ↗{" "}
                </Link>
              ))}
            </p>
            {step === 2 && <VoteLab />}
            {step === 3 && (
              <aside className="historic-example">
                <h3>
                  {tr(
                    lang,
                    "หนึ่งตัวอย่างจริง ไม่ใช่สถิติความสำเร็จ",
                    "One actual example, not a success rate",
                    "一个真实案例，并非成功率",
                  )}
                </h3>
                <p>
                  {tr(
                    lang,
                    "ฉบับแก้ไข พ.ศ. 2564 เปลี่ยนมาตรา 83, 86, 91 เป็น ส.ส. เขต 400 คนและบัญชีรายชื่อ 100 คน แสดงว่ารัฐธรรมนูญฉบับนี้แก้ได้ แต่ไม่ได้แปลว่าทุกร่างหรือการร่างใหม่ทั้งฉบับใช้เส้นทางเดียวกัน",
                    "The 2021 amendment changed sections 83, 86 and 91 to 400 constituency and 100 party-list MPs. It shows this Constitution can be amended. It does not mean every proposal, or drafting a whole new constitution, follows the same path.",
                    "2021年修正案修改第83、86、91条，设400名选区众议员与100名名单众议员。这说明本宪法可以修订，并不意味着每种提案或重订整部宪法都走同一路径。",
                  )}
                </p>
                <Link href="/sources/">
                  {tr(
                    lang,
                    "ดูฉบับแก้ไขทางการ",
                    "Open the official amendment source",
                    "查看正式修正来源",
                  )}{" "}
                  ↗
                </Link>
                <h3>
                  {tr(
                    lang,
                    "ทำไมร่างอาจไปต่อไม่ได้?",
                    "Why might a draft stall?",
                    "草案为何可能停滞？",
                  )}
                </h3>
                <p>
                  {tr(
                    lang,
                    "เสียงรวมไม่พอ เสียง ส.ว. ไม่พอ เสียง ส.ส. ตามเงื่อนไขไม่พอ ประชามติไม่เห็นชอบ หรือมีประเด็นศาล ข้อต่อเหล่านี้เป็นความเป็นไปได้ตามกติกา ไม่ใช่คำกล่าวว่าสาเหตุใดเกิดบ่อยที่สุด",
                    "Insufficient total votes, Senate votes or qualifying-party MPs; an unsuccessful required referendum; or Court issues. These are possible bottlenecks under the rules, not claims about which occurs most often.",
                    "总票数、参议员票数或符合条件的政党票数不足，必要的公投未获批准，或法院问题，都可能成为瓶颈。这里不声称哪种情况发生最频繁。",
                  )}
                </p>
              </aside>
            )}
          </>
        ) : step === 4 ? (
          <>
            <h2>
              {tr(
                lang,
                "เวลาและความสนใจมีต้นทุน",
                "Time and attention have costs",
                "时间与注意力都有成本",
              )}
            </h2>
            <p>
              {tr(
                lang,
                "สมมติรัฐบาลมีความสนใจ 100 หน่วยให้โครงการ 3 เรื่อง หน่วยนี้ไม่ใช่บาท วัน หรือประมาณการจริง ลองจัดสรร แล้วถามว่าอะไรต้องรอ ถ้าใช้กับการแก้รัฐธรรมนูญมากขึ้น",
                "Imagine 100 units of government attention shared between three projects. These are not baht, days or real estimates. Allocate them and ask what waits when amendment work gets more attention.",
                "假设政府有100单位注意力，分给三个项目。这不是泰铢、天数或真实估算。试着分配：修宪占用更多注意力时，什么事情需要等待？",
              )}
            </p>
            <label className="cost-slider" htmlFor="fiction-reform">
              {tr(lang, "แก้รัฐธรรมนูญ", "Amendment work", "修宪工作")}{" "}
              <output>{reform}/100</output>
              <input
                id="fiction-reform"
                type="range"
                min="0"
                max="100"
                value={reform}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setReform(n);
                  setSchools(Math.min(schools, 100 - n));
                }}
              />
            </label>
            <label className="cost-slider" htmlFor="fiction-schools">
              {tr(lang, "ปรับปรุงโรงเรียน", "School improvements", "改善学校")}{" "}
              <output>{schools}/100</output>
              <input
                id="fiction-schools"
                type="range"
                min="0"
                max={100 - reform}
                value={schools}
                onChange={(e) => setSchools(Number(e.target.value))}
              />
            </label>
            <p role="status">
              {tr(
                lang,
                "บริการสุขภาพเหลือ",
                "Health services receive",
                "医疗服务获得",
              )}{" "}
              <strong>{100 - reform - schools}/100</strong>
            </p>
            <p>
              {tr(
                lang,
                "นี่เป็นภาพอธิบายค่าเสียโอกาส ไม่ได้บอกว่าต้องเลือกระหว่างสิทธิกับบริการสาธารณะเสมอไป ในชีวิตจริงต้องดูงบ ค่าจัดประชามติ เวลาสภา ประโยชน์ระยะยาว และทางเลือกที่ทำพร้อมกันได้",
                "This illustrates opportunity cost; rights and public services are not always mutually exclusive. Real decisions need budgets, referendum costs, parliamentary time, long-term benefits and options that can proceed together.",
                "这只是机会成本示意，并不意味着权利与公共服务总是二选一。实际决策须考察预算、公投成本、国会时间、长期收益与可并行的方案。",
              )}
            </p>
            {debates.map((d) => (
              <details key={d.title.en}>
                <summary>{d.title[lang]}</summary>
                <p>{d.body[lang]}</p>
                {d.sections.map((n) => (
                  <Link className="citation" href={`/section/?n=${n}`} key={n}>
                    {sectionLabel(lang, n)} ↗{" "}
                  </Link>
                ))}
              </details>
            ))}
          </>
        ) : (
          <>
            <h2>
              {tr(
                lang,
                "หลังเดินครบทุกประตู คุณคิดอย่างไร?",
                "After the journey, what do you think?",
                "走过这些门后，你怎么想？",
              )}
            </h2>
            <p>
              {tr(
                lang,
                "ไม่มีคะแนนสำหรับความเห็นทางการเมือง บันทึกนี้อยู่ในเครื่องของคุณ ไม่ส่งขึ้นเซิร์ฟเวอร์ จะเปลี่ยนใจก็ได้",
                "Political opinions earn no points. This note stays on your device and is not sent to a server. You may change your mind.",
                "政治意见没有分数。笔记只存于本设备，不发送至服务器，你可以改变想法。",
              )}
            </p>
            <fieldset>
              <legend>
                {tr(
                  lang,
                  "ควรให้รัฐบาลใช้เวลากับการแก้ครั้งนี้ไหม?",
                  "Should the government spend time on this amendment?",
                  "政府应为这次修宪投入时间吗？",
                )}
              </legend>
              {(["yes", "no", "unsure"] as const).map((choice, i) => (
                <label className="reflection-choice" key={choice}>
                  <input
                    type="radio"
                    name="position"
                    checked={reflection.choice === choice}
                    onChange={() => {
                      setReflection({ ...reflection, choice });
                      setStatus("idle");
                    }}
                  />
                  {
                    [
                      tr(lang, "ควร", "Yes", "应该"),
                      tr(lang, "ไม่ควรตอนนี้", "Not now", "现在不应"),
                      tr(lang, "ยังไม่แน่ใจ", "Unsure", "尚不确定"),
                    ][i]
                  }
                </label>
              ))}
            </fieldset>
            {(["proposal", "benefit", "cost", "evidence"] as const).map(
              (field, i) => (
                <label className="reflection-field" key={field}>
                  {
                    [
                      tr(
                        lang,
                        "จะแก้อะไร และเพราะอะไร?",
                        "What would you change, and why?",
                        "你想改什么，为什么？",
                      ),
                      tr(
                        lang,
                        "ใครได้ประโยชน์ ใครอาจเสียประโยชน์?",
                        "Who benefits? Who might lose?",
                        "谁受益，谁可能受损？",
                      ),
                      tr(
                        lang,
                        "ต้นทุนที่ยอมรับได้ และสิ่งที่ต้องรอ",
                        "Acceptable costs and what would have to wait",
                        "可接受的成本，以及什么需要等待",
                      ),
                      tr(
                        lang,
                        "หลักฐานใดจะทำให้คุณเปลี่ยนใจ?",
                        "What evidence would change your mind?",
                        "什么证据会使你改变想法？",
                      ),
                    ][i]
                  }
                  <textarea
                    maxLength={3000}
                    rows={3}
                    value={reflection[field]}
                    onChange={(e) => {
                      setReflection({ ...reflection, [field]: e.target.value });
                      setStatus("idle");
                    }}
                  />
                </label>
              ),
            )}
            <div className="actions">
              <button disabled={!ready} onClick={save}>
                {tr(lang, "เก็บคำตอบของฉัน", "Save my answer", "保存我的答案")}
              </button>
              <button disabled={!ready} onClick={exportNote}>
                {tr(lang, "ดาวน์โหลดบันทึก", "Download note", "下载笔记")}
              </button>
            </div>
            <p role="status">
              {status === "saved"
                ? tr(
                    lang,
                    "บันทึกแล้วในเครื่องนี้ เปิดกลับมาหรือแก้ไขได้",
                    "Saved on this device. Return to edit it anytime.",
                    "已存于本设备，可随时回来修改。",
                  )
                : status === "error"
                  ? tr(
                      lang,
                      "อ่านหรือบันทึกในเครื่องไม่ได้ ยังพิมพ์และดาวน์โหลดได้",
                      "Device storage could not be read or saved. You can still write and download.",
                      "无法读取或保存设备存储，仍可填写并下载。",
                    )
                  : ""}
            </p>
            <Link href="/notes/">
              {tr(
                lang,
                "กลับไปบันทึกของคุณ",
                "Go to your notes",
                "前往你的笔记",
              )}{" "}
              ↗
            </Link>
          </>
        )}
      </article>
      <div className="journey-controls">
        <button disabled={step === 0 || !ready} onClick={() => move(step - 1)}>
          {tr(lang, "ย้อนกลับ", "Back", "返回")}
        </button>
        <span>{step + 1}/6</span>
        <button
          disabled={
            step === 5 ||
            !ready ||
            (step < 4 && (!checked || picked !== current.answer))
          }
          onClick={() => move(step + 1)}
        >
          {tr(lang, "ไปต่อ", "Continue", "继续")}
        </button>
      </div>
      <p className="micro">
        {tr(
          lang,
          "การตรวจความจำใช้ข้อฝึก ส่วนความเห็นเป็นของคุณเอง ใช้คีย์บอร์ดเสียงของอุปกรณ์ในช่องบันทึกได้",
          "Recall checks are practice; your opinions remain your own. Device keyboard dictation can fill the note fields.",
          "回忆题用于练习，意见属于你自己。可用设备键盘听写填写笔记。",
        )}
      </p>
    </div>
  );
}
