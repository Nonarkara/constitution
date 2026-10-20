"use client";
import Image from "next/image";
import Link from "next/link";
import { useStudy } from "./Provider";
import { tr } from "@/lib/i18n";

type StoryScene = {
  id: string;
  image: string;
  title: { th: string; en: string; zh: string };
  role: { th: string; en: string; zh: string };
  narrative: { th: string; en: string; zh: string };
  lesson: { th: string; en: string; zh: string };
};

const SCENES: StoryScene[] = [
  {
    id: "student",
    image: "/illustrations/tikki-student-pastel.webp",
    title: {
      th: "1. ความฝันและความตั้งใจ",
      en: "1. The Dream and Calling",
      zh: "1. 梦想与初衷",
    },
    role: {
      th: "ติ๊กกี้ในชุดนักศึกษา · กำลังเตรียมตัวสอบ ก.พ.",
      en: "Tikki in student uniform · Preparing for the civil service exam",
      zh: "穿学生制服的蒂基 · 正在备考公务员",
    },
    narrative: {
      th: "ติ๊กกี้มีความฝันอันแน่วแน่ที่จะทำงานรับราชการ เพื่อเป็นส่วนหนึ่งในการพัฒนาบ้านเมืองและดูแลประชาชน แต่การจะสอบผ่านภาค ก และเข้าทำงานในระบบราชการได้นั้น ต้องผ่านด่านทดสอบความรู้กฎหมายและรัฐธรรมนูญ",
      en: "Tikki holds an earnest dream of joining public service to contribute to society and help citizens. But passing the civil service examination demands a clear grasp of constitutional law.",
      zh: "蒂基怀着加入公务员队伍、服务社会的真诚梦想。但要通过公务员考试，必须掌握宪法与公共行政法律知识。",
    },
    lesson: {
      th: "จุดเริ่มต้น: มีเป้าหมายที่ชัดเจน และรู้ว่าทำไมเราถึงต้องเรียนรู้",
      en: "Starting point: a clear purpose and knowing why we learn.",
      zh: "起点：明确的目标，以及懂得为何而学。",
    },
  },
  {
    id: "overwhelmed",
    image: "/illustrations/tikki-overwhelmed-pastel.webp",
    title: {
      th: "2. ภูเขากฎหมาย 279 มาตรา",
      en: "2. The Mountain of 279 Sections",
      zh: "2. 279条法律的高山",
    },
    role: {
      th: "ติ๊กกี้กับกองหนังสือกฎหมายสูงท่วมหัว",
      en: "Tikki overwhelmed by towering stacks of law books",
      zh: "被堆叠如山的法律书包围的蒂基",
    },
    narrative: {
      th: "เมื่อกางตำราอ่าน ติ๊กกี้พบกับหนังสือหนาเตอะ ตัวบทกฎหมายยาวเหยียด ถ้อยคำซับซ้อน และตัวเลขกำหนดวันนับร้อยจุด การนั่งท่องจำแบบเดิมทำให้ตาเมื่อย สมองล้า และรู้สึกว่ายิ่งอ่านยิ่งสับสน",
      en: "Opening traditional textbooks, Tikki faced mountains of heavy volumes, dense legal jargon, and hundreds of statutory deadlines. Rote memorization caused eye strain, cognitive fatigue, and growing confusion.",
      zh: "翻开传统教科书，蒂基面对的是厚重的书本、晦涩的法律术语以及数百个法定日期。死记硬背带来了眼疲劳与困惑。",
    },
    lesson: {
      th: "อุปสรรค: กฎหมายไม่ได้ถูกเขียนมาให้ท่องจำ แต่ต้องมีวิธีจัดระเบียบความคิด",
      en: "The hurdle: laws are not meant for raw memorisation; we need structure.",
      zh: "瓶颈：法律不是用来死背的，我们需要清晰的认知框架。",
    },
  },
  {
    id: "smart",
    image: "/illustrations/tikki-smart-pastel.webp",
    title: {
      th: "3. กำเนิดสมุดเรียนรู้คู่หู",
      en: "3. The Companion Notebook is Born",
      zh: "3. 伴学笔记本的诞生",
    },
    role: {
      th: "ติ๊กกี้เรียนอย่างมีความสุขด้วยระบบไฮไลต์และทบทวนเว้นระยะ",
      en: "Tikki studying joyfully with smart spaced review",
      zh: "通过智能间隔复习与双页笔记快乐学习的蒂基",
    },
    narrative: {
      th: "ดร. นนท์ อัครประเสริฐกุล จึงได้ออกแบบระบบสมุดบันทึกนี้ขึ้นมาเพื่อติ๊กกี้ โดยนำหลักวิทยาศาสตร์สมองและ Cognitive Science มาใช้: อ่านทีละ 2 มาตราในมุมมองสมุดเปิดโต๊ะ, ระบายสีแยกสิทธิกับหน้าที่, จัดตัวเลขลงในวังความจำ 16 ห้อง และทบทวนด้วย Spaced Repetition",
      en: "Dr. Non Arkaraprasertkul designed this notebook companion specifically for Tikki, incorporating cognitive science: two sections at a time on an open-desk view, colour-coding rights versus duties, anchoring numbers into a 16-room memory palace, and active spaced recall.",
      zh: "Dr. Non Arkaraprasertkul 专为蒂基设计了这套伴学笔记系统，结合认知科学：双页对开阅读、权利与义务分色高亮、十六间记忆宫殿锚定数字，以及自适应间隔复习。",
    },
    lesson: {
      th: "วิธีแก้: เปลี่ยนการอ่านซ้ำเป็น Active Recall และการทบทวนตามเวลาที่เหมาะสม",
      en: "The solution: turn passive re-reading into active recall and spaced practice.",
      zh: "解法：将被动重读转化为主动回忆与自适应间隔练习。",
    },
  },
  {
    id: "pass",
    image: "/illustrations/tikki-pass-pastel.webp",
    title: {
      th: "4. วันที่สอบผ่านด้วยความมั่นใจ",
      en: "4. Acing the Exam with Confidence",
      zh: "4. 充满信心地通过考试",
    },
    role: {
      th: "ติ๊กกี้ฉลองสอบผ่านข้อสอบภาค ก และกฎหมายรัฐธรรมนูญ",
      en: "Tikki celebrating passing the civil service examination",
      zh: "蒂基庆祝顺利通过公务员宪法法律科目考试",
    },
    narrative: {
      th: "เมื่อความรู้ตกผลึกเป็นภาพจำและเหตุผล ติ๊กกี้สามารถทำข้อสอบจำลองได้คะแนนยอดเยี่ยม และสอบผ่านได้อย่างภาคภูมิใจ ข้อสอบที่เคยดูยากกลายเป็นคำถามที่ตอบได้อย่างมั่นใจเพราะเข้าใจหลักการเบื้องหลัง",
      en: "With knowledge crystallized into vivid mental models and statutory reasons, Tikki excelled in mock papers and passed the exam with flying colours. Once-intimidating questions became natural and clear.",
      zh: "当知识凝聚为生动的记忆模型与法理逻辑，蒂基在模拟考试中脱颖而出，以优异成绩顺利通关。曾经令人望而生畏的题目变得清晰自明。",
    },
    lesson: {
      th: "ผลลัพธ์: การเรียนรู้อย่างถูกวิธี ทำให้ความพยายามออกดอกผลเป็นความสำเร็จ",
      en: "The outcome: learning effectively turns dedicated effort into genuine triumph.",
      zh: "收获：科学的学习方法让每一次专注努力都结出自信的硕果。",
    },
  },
  {
    id: "officer",
    image: "/illustrations/tikki-officer-pastel.webp",
    title: {
      th: "5. ปฏิบัติหน้าที่ด้วยเกียรติและหัวใจ",
      en: "5. Serving with Honour and Heart",
      zh: "5. 带着荣光与温情履职",
    },
    role: {
      th: "ติ๊กกี้ในชุดข้าราชการ ยิ้มต้อนรับและช่วยเหลือประชาชน",
      en: "Tikki in civil service attire, warmly serving the public",
      zh: "身着公务员制服、热情接待群众的蒂基",
    },
    narrative: {
      th: "วันนี้ ติ๊กกี้ได้สวมชุดข้าราชการที่ตั้งใจ และก้าวเข้าสู่การทำงานเพื่อสาธารณะอย่างเต็มภาคภูมิ และสมุดเล่มนี้ก็เปิดกว้างให้คนไทยทุกคนได้เข้ามาเรียนรู้ฟรี เพื่อให้ทุกคนได้เข้าใจสิทธิหน้าที่ และทำตามความฝันได้เหมือนกัน",
      en: "Today, Tikki proudly wears her civil service attire, serving the public with integrity. This study notebook remains completely open and free for every learner preparing for exams or exploring their civic rights.",
      zh: "如今，蒂基自豪地穿上了心怀已久的制服，带着专业与善意服务大众。这本笔记也向所有学习者永久免费开放，助力每一位追梦人。",
    },
    lesson: {
      th: "ส่งต่อ: ความรู้รัฐธรรมนูญเป็นของประชาชนทุกคน ยิ่งแบ่งปัน สังคมยิ่งเข้มแข็ง",
      en: "Passing forward: constitutional knowledge belongs to all citizens.",
      zh: "传递：宪法知识属于每一位公民，理解越深，社会越充满信任。",
    },
  },
];

export function TikkiStory() {
  const { lang } = useStudy();

  return (
    <article className="tikki-story-page">
      {/* 1. Header with Mascot */}
      <header className="tikki-hero">
        <div className="tikki-hero-copy">
          <span className="mono micro text-accent font-bold">
            {tr(lang, "เรื่องราวของติ๊กกี้", "Tikki's Story", "蒂基的故事")}
          </span>
          <h1>
            {tr(
              lang,
              "จากภูเขากฎหมาย\nสู่การเรียนรู้อย่างฉลาดและมีความสุข",
              "From a mountain of books\nto joyful, smarter learning.",
              "从堆积如山的书海，\n到快乐聪明的学习法。"
            )}
          </h1>
          <p>
            {tr(
              lang,
              "ติ๊กกี้คือตัวแทนของทุกคนที่กำลังเตรียมสอบรับราชการ ท่ามกลาง 279 มาตราที่ดูซับซ้อน สมุดเล่มนี้ถูกสร้างขึ้นมาเพื่อให้การอ่านกฎหมายกลายเป็นเรื่องสนุก เข้าใจง่าย และสอบผ่านได้จริง",
              "Tikki represents every earnest learner preparing for public service. Faced with 279 daunting sections, this notebook was created to make constitutional study visual, engaging, and genuinely effective.",
              "蒂基是每一位认真备考公务员的学习者的缩影。面对279条繁复的法条，本系统应运而生，让学法变得生动可视化、条理清晰且切实见效。"
            )}
          </p>
          <div className="tikki-hero-action">
            <Link className="primary" href="/bible/">
              <span>{tr(lang, "เริ่มเรียนรู้คู่มือ", "Start the study guide", "开始阅读学习指南")}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        {/* The cover is its own drawing, not scene 1. The story's arc — from a
            mountain of law to joyful learning — is the page's subject, so the
            hero has to show the arc; repeating scene 1 here would put the same
            picture on the page twice and shrink both copies. */}
        <figure className="tikki-hero-art" aria-hidden="true">
          <Image
            src="/illustrations/tikki-story-cover-pastel.webp"
            alt=""
            width={720}
            height={720}
            priority
            sizes="(max-width: 720px) 150px, 340px"
          />
        </figure>
      </header>

      {/* 2. Story Narrative Timeline */}
      <section className="tikki-episodes" aria-label={tr(lang, "ตอนต่าง ๆ ของติ๊กกี้", "Tikki's Episodes", "故事章节")}>
        {SCENES.map((scene, idx) => (
          <div key={scene.id} className="tikki-episode-row">
            <div className="tikki-episode-art">
              <Image
                src={scene.image}
                alt={scene.title[lang]}
                width={720}
                height={720}
                sizes="(max-width: 720px) 180px, 260px"
              />
              <div className="art-download-bar">
                <a
                  href={scene.image}
                  download
                  className="download-pill micro"
                  title={tr(lang, "ดาวน์โหลดภาพวาด", "Download art", "下载插画")}
                >
                  ↓ {tr(lang, "ดาวน์โหลด", "Download", "下载")}
                </a>
              </div>
            </div>
            <div className="tikki-episode-copy">
              <h2>{scene.title[lang]}</h2>
              <p className="micro text-accent font-bold">{scene.role[lang]}</p>
              <p>{scene.narrative[lang]}</p>
              <blockquote className="tikki-lesson-callout">
                <span className="micro font-bold">{tr(lang, "ข้อคิดการเรียน:", "Study Key:", "学习要点:")}</span>
                {" "}{scene.lesson[lang]}
              </blockquote>
            </div>
          </div>
        ))}
      </section>

      {/* 3. Downloadable Art & Wallpapers Section */}
      <section className="tikki-wallpapers" aria-label={tr(lang, "การ์ดและภาพพื้นหลังสำหรับดาวน์โหลด", "Downloadable Art Cards & Wallpapers", "下载插画卡片与壁纸")}>
        <div className="tikki-section-head">
          <h2>{tr(lang, "การ์ดภาพวาดพาสเทลสำหรับดาวน์โหลด", "Pastel Art Cards for Download", "下载粉彩学习插画卡片")}</h2>
          <p>
            {tr(
              lang,
              "บันทึกภาพวาดน่ารัก ๆ ของติ๊กกี้ไว้เป็นกำลังใจในการอ่านหนังสือ ตั้งเป็นภาพหน้าจอมือถือ หรือพิมพ์ติดโต๊ะอ่านหนังสือได้ฟรี",
              "Save these pastel study drawings as phone wallpapers or print study flashcards to keep your spirits bright.",
              "免费下载蒂基的可爱粉彩插画，设置为手机壁纸或打印贴在书桌前，随时为备考加油打气。"
            )}
          </p>
        </div>

        <div className="wallpaper-grid">
          {SCENES.map((scene) => (
            <div key={`card-${scene.id}`} className="wallpaper-card">
              <figure className="wallpaper-thumb">
                <Image
                  src={scene.image}
                  alt={scene.title[lang]}
                  width={720}
                  height={720}
                  sizes="(max-width: 720px) 140px, 220px"
                />
              </figure>
              <div className="wallpaper-meta">
                <strong className="micro">{scene.title[lang]}</strong>
                <a
                  href={scene.image}
                  download
                  className="wallpaper-dl-btn"
                >
                  ↓ {tr(lang, "บันทึกภาพ (720px)", "Save Image (720px)", "保存图片 (720px)")}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Negligible Fine Print */}
      <footer className="tikki-fine-print">
        <p className="micro text-muted">
          {tr(
            lang,
            "ภาพประกอบชุดนี้สร้างสรรค์ด้วยสีชอล์กพาสเทลและสีไม้ เพื่อเป็นสื่อเสริมสร้างแรงบันดาลใจในการศึกษา รัฐธรรมนูญแห่งราชอาณาจักรไทย พุทธศักราช ๒๕๖๐ จัดทำขึ้นเพื่อการศึกษาโดยไม่คิดมูลค่า",
            "These pastel drawings are created with coloured pencils and chalk crayons to inspire learners of the 2017 Constitution of the Kingdom of Thailand. Prepared freely for educational purposes.",
            "本系列插画以粉彩蜡笔与彩铅风格创作，旨在为泰国二五六零年宪法学习者提供温暖启迪。纯公益教育用途。"
          )}
        </p>
      </footer>
    </article>
  );
}
