"use client";
import { useStudy } from "./Provider";
import { meta } from "@/lib/corpus";
import { tr } from "@/lib/i18n";
export function Sources() {
  const { lang } = useStudy();
  return (
    <>
      <span className="page-kicker mono">READ THE ORIGINAL · 04</span>
      <h1>
        {tr(
          lang,
          "ทุกคำตอบ\nต้องมีที่มา",
          "Every answer\nhas a source.",
          "每一个答案，\n都有依据。",
        )}
      </h1>
      <p>
        {tr(
          lang,
          "ตัวบทภาษาไทยเป็นหลักเสมอ คำอธิบาย ข้อฝึก และสรุปภาษาจีนมีไว้ช่วยเรียน ไม่ใช้แทนตัวบท",
          "The Thai text governs. Explanations, practice questions and Chinese summaries help you study; they cannot replace the law.",
          "请以泰文原文为准。解析、练习题与中文摘要用于学习，不能代替法律文本。",
        )}
      </p>
      <div className="source-card">
        <span className="mono">01 / THAI</span>
        <h2>
          {tr(
            lang,
            "รัฐธรรมนูญ พ.ศ. 2560",
            "Constitution, B.E. 2560 (2017)",
            "2017年泰国宪法",
          )}
        </h2>
        <p>
          {tr(
            lang,
            "ราชกิจจานุเบกษา เล่ม 134 ตอนที่ 40 ก วันที่ 6 เมษายน 2560 สำเนาจากวุฒิสภา 279 มาตรา 16 หมวดและบทเฉพาะกาล",
            "Government Gazette, volume 134, part 40 A, 6 April 2017. Senate-hosted copy. 279 sections, 16 chapters and transitory provisions.",
            "政府公报第134卷第40A期，2017年4月6日。参议院提供原文，共279条、16章及过渡条款。",
          )}
        </p>
        <a target="_blank" rel="noreferrer" href={meta.sources.th2017.url}>
          PDF ↗
        </a>
      </div>
      <div className="source-card">
        <span className="mono">02 / AMENDMENT</span>
        <h2>
          {tr(
            lang,
            "ฉบับแก้ไขเพิ่มเติม พ.ศ. 2564",
            "2021 amendment",
            "2021年修正案",
          )}
        </h2>
        <p>
          {tr(
            lang,
            "ใช้ข้อความแก้ไขของมาตรา 83, 86 และ 91 จากฉบับรวมของวุฒิสภา มีผลวันที่ 22 พฤศจิกายน 2564",
            "Sections 83, 86 and 91 use the Senate consolidated amended text, effective 22 November 2021.",
            "第83、86、91条采用参议院合并修订文本，2021年11月22日生效。",
          )}
        </p>
        <a target="_blank" rel="noreferrer" href={meta.sources.th2021.url}>
          PDF ↗
        </a>
      </div>
      <div className="source-card">
        <span className="mono">03 / ENGLISH</span>
        <h2>
          {tr(
            lang,
            "คำแปลเพื่อข้อมูล",
            "Translation for information",
            "供参考的英文译文",
          )}
        </h2>
        <p>
          {tr(
            lang,
            "คำแปลของสำนักงานคณะกรรมการกฤษฎีกา เผยแพร่โดย ก.พ.ร. เป็นฉบับ พ.ศ. 2560 มาตรา 83, 86 และ 91 ภาษาอังกฤษยังเป็นฉบับเดิมและติดป้ายชัดเจน",
            "Council of State translation, published by OPDC, for the 2017 version. English sections 83, 86 and 91 remain historical and are labeled accordingly.",
            "国务委员会英文译文，由公共部门发展委员会发布，依据2017年版本。第83、86、91条英文为旧版本，已明确标注。",
          )}
        </p>
        <a target="_blank" rel="noreferrer" href={meta.sources.en2017.url}>
          PDF ↗
        </a>
      </div>
      <div className="source-card">
        <span className="mono">04 / CHINESE</span>
        <h2>
          {tr(
            lang,
            "สรุปภาษาจีนเพื่อเรียน",
            "Chinese study summaries",
            "中文学习摘要",
          )}
        </h2>
        <p>
          {tr(
            lang,
            "สรุปที่จัดทำเพื่อช่วยเรียนรู้ ไม่ใช่คำแปลทางกฎหมายฉบับเต็มหรือฉบับทางการ ตรวจรายละเอียดจากตัวบทภาษาไทย",
            "Prepared study summaries, not full legal translations or official text. Check details against the Thai original.",
            "为辅助学习整理的摘要，并非完整法律译文或官方文本。具体规定请核对泰文原文。",
          )}
        </p>
      </div>
      <div className="note">
        <h2>
          {tr(lang, "ขอบเขตของชุดเรียน", "Scope of this edition", "本版范围")}
        </h2>
        <p>
          {tr(
            lang,
            "ตรวจแหล่งข้อมูลวันที่ 12 ตุลาคม 2569 ถอดข้อความจาก PDF และปรับช่องว่างกับอักขระไทย ยังไม่ใช่การถอดที่ได้รับการรับรอง ถ้าพบข้อความผิด ให้ตรวจ PDF ที่ลิงก์ไว้ในแต่ละมาตรา",
            "Sources retrieved 12 October 2026. PDF text was extracted and whitespace and Thai characters normalized; this is not a certified transcription. Check the linked source page if you notice an error.",
            "资料获取日期：2026年10月12日。文本从PDF提取并整理空格与泰文字符，并非经认证的抄本。如发现疑问，请核对每条所附原文页面。",
          )}
        </p>
        <p>
          {tr(
            lang,
            "ข้อฝึกเป็นข้อที่เขียนขึ้นสำหรับแอปนี้ ไม่ใช่ข้อสอบ ก.พ. จริง การจัดอันดับค้นหาไม่ได้อ้างความถี่ข้อสอบ",
            "Questions are original practice material, not actual OCSC exam questions. Search ranking makes no exam-frequency claim.",
            "题目为本应用原创练习，并非公务员考试真题。搜索排序不代表考试出现频率。",
          )}
        </p>
      </div>
    </>
  );
}
