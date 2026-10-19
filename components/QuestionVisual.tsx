import Image from "next/image";
import { tr, type Lang } from "@/lib/i18n";
import { questionVisualFor, type VisualQuestion } from "@/lib/question-visual";
import { PalacePicture } from "./MemoryCue";

/** Mount only after feedback. Never mount in a blind sitting or a concealed retry. */
export function QuestionVisual({ question: q, position, selected, lang }: {
  question: VisualQuestion; position: number; selected?: number; lang: Lang;
}) {
  const model = questionVisualFor(q, position);
  if (!model) return null;
  const { answer, cue } = model;
  const wrong = selected !== undefined && selected !== q.answer ? q.choices[selected] : null;
  return (
    <details open key={q.id} className="question-visual" data-visual-topic={cue?.topic ?? "answer-map"}>
      <summary>{tr(lang, "หยุดวาดความเข้าใจสักภาพ", "Pause and picture the rule", "停一下，把规则画在脑海里")}</summary>
      {cue ? <>
        <div className="visual-mnemonic">
          {cue.image && cue.chapter ? <PalacePicture chapter={cue.chapter} /> : <Image src={cue.topic === "pm-term" ? "/illustrations/term-clock-pastel.webp" : "/illustrations/core-lock-pastel.webp"} alt="" width={720} height={720} sizes="100px" />}
          <div><strong className="visual-number">{cue.number}</strong><p>{cue.meaning[lang]}</p></div>
        </div>
        {cue.topic === "cabinet-size" && <div className="visual-seats" aria-hidden="true"><b>1</b><span>+</span><div>{Array.from({length: 35}, (_, i) => <i key={i} />)}</div><span>≤35</span></div>}
        {cue.topic === "amendment-petition" && <ol className="visual-route">
          <li><b>50,000</b>{tr(lang,"เสนอร่าง","Propose","提案")}</li>
          <li>{tr(lang,"ผ่านขั้นตอนรัฐสภา","Parliamentary stages","议会程序")}</li>
          <li>{tr(lang,"ประชามติเมื่อเข้าเงื่อนไข","Referendum when required","依法需公投时公投")}</li>
          <li>{tr(lang,"นำขึ้นทูลเกล้าฯ","Submit for royal assent","呈请御准")}</li>
        </ol>}
        <p className="micro">{cue.joke[lang]}</p>
      </> : <>
        <div className="visual-answer-map">
          <Image src="/illustrations/thinking-pastel.webp" alt="" width={720} height={720} sizes="90px" />
          <div className="visual-decision"><span className="micro">{q.logic ? tr(lang,"กฎที่ใช้ตัดสิน","The deciding rule","判断依据") : tr(lang,"เริ่มจากตัวบท","Start with the text","从条文出发")}</span>{q.logic ? <p>{q.logic[lang]}</p> : <strong className="visual-number">{q.sections.map(n => "§" + n).join(" · ")}</strong>}</div>
          <span className="visual-arrow" aria-hidden="true">↓</span>
          <div className="visual-conclusion"><span className="micro">{tr(lang,"จึงเลือก","So choose","因此选择")}</span><p>{answer[lang]}</p></div>
          {wrong && <div className="visual-detour"><span className="micro">{tr(lang,"ทางที่ลองแล้วไม่ตรงกฎ","The option that did not fit","不符合规则的选项")}</span><p>{wrong[lang]}</p></div>}
        </div>
        <p className="micro">{tr(lang,"ปิดภาพ แล้วลองเล่าเส้นทางเหตุผลด้วยคำของคุณ","Hide the picture. Trace the reasoning in your own words.","收起图，用自己的话说一遍推理过程。")}</p>
      </>}
      {q.sections.length > 0 && <p className="micro">{tr(lang,"ตรวจตัวบท","Check the text","核对条文")}: {q.sections.map(n => <a key={n} href={`/section/?n=${n}`}>§{n} </a>)}</p>}
    </details>
  );
}
