"use client";
import { useStudy } from "./Provider";
import { meta } from "@/lib/outline";
import { tr } from "@/lib/i18n";
export function Sources() {
  const { lang } = useStudy();
  return (
    <>
      <span className="page-kicker mono">
        {tr(lang, "อ่านต้นฉบับ · 05", "Read the original · 05", "阅读原文 · 05")}
      </span>
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
          "ตัวบทภาษาไทยเป็นหลักเสมอ คำอธิบาย ข้อฝึก และคำแปลเพื่อศึกษามีไว้ช่วยเรียน ไม่ใช้แทนตัวบท",
          "The Thai text governs. Explanations, practice questions and Chinese study translations help you study; they cannot replace the law.",
          "请以泰文原文为准。解析、练习题与学习译文用于学习，不能代替法律文本。",
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
            "คำแปลของสำนักงานคณะกรรมการกฤษฎีกา เผยแพร่โดย ก.พ.ร. เป็นฉบับ พ.ศ. 2560 ส่วนมาตรา 83, 86 และ 91 ใช้คำแปลฉบับแก้ไขเพื่อศึกษา มาตรา 37, 98, 101, 134 และ 256 ปรับคำแปลตามตัวบทไทย ฉบับแปลเดิมยังเปิดเทียบได้",
            "Council of State translation published by OPDC for 2017. Sections 83, 86 and 91 use current study translations; 37, 98, 101, 134 and 256 include corrections against Thai. Original English passages remain available for comparison.",
            "2017年国务委员会英文译文，由公共部门发展委员会发布。第83、86、91条采用修订后的学习译文，第37、98、101、134、256条按泰文纠正。原英文保留供对照。",
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
            "คำแปลจีนเพื่อเรียน",
            "Chinese study translations",
            "中文学习译文",
          )}
        </h2>
        <p>
          {tr(
            lang,
            "คำแปลเพื่อศึกษาครบทั้ง 279 มาตรา พร้อมสรุปสั้น ไม่ใช่ฉบับทางการหรือคำแปลที่ได้รับการรับรอง ตรวจรายละเอียดจากตัวบทภาษาไทย",
            "Full study translations of all 279 sections, with short summaries retained. These are not official or certified legal translations. Check details against the Thai original.",
            "全部279条的完整学习译文，并保留简明摘要。译文并非官方或经认证的法律译文。请核对泰文原文。",
          )}
        </p>
      </div>
      <div className="source-card">
        <span className="mono">05 / LEARNING</span>
        <h2>
          {tr(
            lang,
            "ทำไมต้องลองตอบและกลับมาทบทวน",
            "Why recall and spaced review?",
            "为什么要回忆并间隔复习？",
          )}
        </h2>
        <p>
          {tr(
            lang,
            "งานวิจัยด้านความจำสนับสนุนการฝึกดึงคำตอบจากความจำและการเว้นช่วงทบทวน แอปใช้หลักนี้ แต่ช่วงเวลา 1/3/7/14 วันและเกณฑ์ 80% เป็นตัวเลือกออกแบบ ไม่ใช่สูตรที่พิสูจน์แล้วว่าจะสอบผ่าน",
            "Memory research supports retrieval practice and spaced study. This app uses those principles; its 1/3/7/14-day schedule and 80% practice threshold are design choices, not a proven formula for passing the exam.",
            "记忆研究支持提取练习与间隔学习。本应用采用这些原则；1、3、7、14天间隔及80%练习标准是设计选择，并非已证明能保证考试通过的公式。",
          )}
        </p>
        <p className="micro">
          <a
            href="https://doi.org/10.1126/science.1152408"
            target="_blank"
            rel="noreferrer"
          >
            Karpicke &amp; Roediger (2008) · Retrieval practice ↗
          </a>
          <br />
          <a
            href="https://laplab.ucsd.edu/articles/Cepeda_etal_2006.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Cepeda et al. (2006) · Distributed practice ↗
          </a>
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
