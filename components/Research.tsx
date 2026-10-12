"use client";
import Link from "next/link";
import { useStudy } from "./Provider";
import { tr } from "@/lib/i18n";
import { StudyArt } from "./StudyArt";
export function Research() {
  const { lang } = useStudy();
  return (
    <article className="research-note">
      <div className="civic-title">
        <div>
          <h1>
            {tr(
              lang,
              "ทำไมผมสร้างสมุดเล่มนี้",
              "Why I built this notebook",
              "我为何做这本笔记",
            )}
          </h1>
          <p>Dr. Non Arkaraprasertkul</p>
        </div>
        <StudyArt scene="listening" />
      </div>
      <p className="research-lead">
        {tr(
          lang,
          "ผมเริ่มจากคนหนึ่งคนที่อยากช่วย แล้วถามว่าเทคโนโลยีจะทำให้การอ่านเรื่องยากมีความหมายขึ้นได้ไหม",
          "I started with one person I wanted to help, then asked whether technology could make difficult reading more meaningful.",
          "我从想帮助一个人开始，然后问：技术能否让艰深的阅读更有意义？",
        )}
      </p>
      <h2>
        {tr(
          lang,
          "ติ๊กกี้: คนจริงหรือเพื่อนในจินตนาการ",
          "Tikky: a person, or an imagined companion",
          "Tikky：一个人，或想象中的伙伴",
        )}
      </h2>
      <p>
        {tr(
          lang,
          "ในเรื่องของสมุดเล่มนี้ ติ๊กกี้คือคนที่กำลังเตรียมสอบ และอาจเป็นเพื่อนในจินตนาการของผมก็ได้ เรื่องเล่าไม่ใช่หลักฐานยืนยันตัวตนของใคร จุดประสงค์คือช่วยให้คนอ่านประหยัดเวลา เข้าใจมากกว่าท่องจำ และอยากกลับมาเรียนอีก",
          "In this notebook’s story, Tikky is preparing for an exam. She may also be my imagined companion. The narrative establishes no one’s real identity. The purpose is to save readers time, help them understand beyond memorisation and make returning to study inviting.",
          "在笔记的故事中，Tikky 正在备考，也可能是我想象中的伙伴。故事不用于证明任何人的真实身份。目标是帮助读者节省时间、超越死记硬背，并愿意回来继续学习。",
        )}
      </p>
      <h2>
        {tr(
          lang,
          "เริ่มจากเครื่องมือที่ผมใช้ได้จริง",
          "Start with tools I can actually use",
          "从我真正会用的工具开始",
        )}
      </h2>
      <p>
        {tr(
          lang,
          "Claude Code และเครื่องมือ AI ที่ผมคุ้นเคยทำให้การลองสร้างเป็นไปได้ ผมอาจเลือกโมเดลอื่นหรือ Unreal Engine ได้ แต่เกมเต็มรูปแบบต้องใช้เวลาอีกมาก เว็บที่เปิดบนโทรศัพท์หรือ iPad จึงเป็นทางเลือกที่ทำและทดสอบได้ตอนนี้ AI ช่วยเขียน ไม่ได้เป็นผู้รับรองว่ากฎหมายถูกหรือคนเรียนรู้แล้ว",
          "Claude Code and familiar AI tools made experimentation practical. I could use other models or Unreal Engine, but a full game would demand a different time commitment. A phone-and-iPad website is something I can build and test now. AI helps author the system; it does not certify legal accuracy or learning.",
          "Claude Code 和熟悉的AI工具让实验可行。我也可以选其他模型或 Unreal Engine，但完整游戏需要另一种时间投入。手机与iPad网站是现在能搭建、检验的选择。AI参与编写，却不负责认证法律准确性或学习效果。",
        )}
      </p>
      <h2>
        {tr(
          lang,
          "เรียนรู้ด้วยภาพและการลองตอบ",
          "Learn by picturing and retrieving",
          "通过图像与回忆学习",
        )}
      </h2>
      <p>{tr(lang,"รอบฝึกเพิ่มการเรียกคืนก่อนเห็นตัวเลือก เช็กความมั่นใจ และอธิบายกลับด้วยคำของตนเอง ทั้งสามเลือกข้ามได้ ความมั่นใจไม่เพิ่มคะแนน และแอปไม่อ้างว่าตรวจเหตุผลที่เขียนได้แล้ว","Practice now offers recall before options, optional confidence checks and explanations in your own words. Confidence never raises a score, and written reasoning is not automatically verified.","练习加入看选项前回忆、可选信心检查与自我解释。信心不会提高分数，书面理由也不会自动核验。")}</p>
      <p><a href="https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html" target="_blank" rel="noopener noreferrer">Dunlosky et al. (2013) ↗</a> · <a href="https://www.nature.com/articles/s44159-022-00089-1" target="_blank" rel="noopener noreferrer">Carpenter et al. (2022) ↗</a></p>
      <p className="micro">{tr(lang,"หลักฐานสนับสนุนการทดสอบตนเองและเว้นระยะชัดกว่าการอ่านซ้ำหรือไฮไลต์อย่างเดียว การอธิบาย การสลับเรื่อง และภาพจำขึ้นกับงานและผู้เรียน ช่วง 1/3/7/14 วันเป็นค่าตั้งต้น ไม่ใช่สูตรที่ดีที่สุดสำหรับทุกคน ผลของแอปนี้ยังต้องทดสอบกับผู้เรียนจริง","Evidence is stronger for practice testing and spacing than rereading or highlighting alone. Explanation, interleaving and imagery depend on task and learner. The 1/3/7/14-day schedule is a starting heuristic, not a universal optimum. This app still needs learner evaluation.","练习测试与间隔学习的证据强于单纯重读或划重点。解释、交错练习和图像效果取决于任务与学习者。1/3/7/14天是初始经验安排，并非普遍最优公式。本应用仍需学习者评估。")}</p>
      <table className="research-table">
        <caption>
          {tr(
            lang,
            "หลักฐานกับสิ่งที่เราลอง",
            "Evidence and what we are trying",
            "研究证据与我们的尝试",
          )}
        </caption>
        <thead>
          <tr>
            <th>{tr(lang, "วิธี", "Method", "方法")}</th>
            <th>
              {tr(
                lang,
                "ใช้ในสมุดอย่างไร และข้อจำกัด",
                "Use here and limits",
                "在此如何使用及局限",
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              {tr(lang, "ดึงคำตอบจากความจำ", "Retrieval practice", "提取练习")}
            </th>
            <td>
              {tr(
                lang,
                "อ่านสั้นแล้วลองตอบ งานวิจัยสนับสนุนความจำระยะยาว แต่ยังไม่พิสูจน์ผลการสอบจากแอปนี้",
                "Read briefly, then recall. Research supports long-term retention; this app’s exam outcomes have not been established.",
                "简短阅读后回忆。研究支持长期记忆，但本应用的考试效果尚未证实。",
              )}{" "}
              <a
                href="https://doi.org/10.1111/j.1467-9280.2006.01693.x"
                target="_blank"
                rel="noreferrer"
              >
                Roediger &amp; Karpicke (2006) ↗
              </a>
            </td>
          </tr>
          <tr>
            <th>
              {tr(lang, "เว้นช่วงและทบทวน", "Spacing and review", "间隔复习")}
            </th>
            <td>
              {tr(
                lang,
                "ข้อที่เคยตอบกลับมาให้ฝึก เวลาทบทวนและเกณฑ์ 80% เป็นการเลือกออกแบบ ไม่ใช่สูตรรับประกันสอบผ่าน",
                "Answered questions return for practice. Review intervals and the 80% threshold are design choices, not a guaranteed passing formula.",
                "已答题会再次出现。复习间隔与80%门槛是设计选择，不保证通过考试。",
              )}{" "}
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/26173288/"
                target="_blank"
                rel="noreferrer"
              >
                Dunlosky et al. (2013) ↗
              </a>
            </td>
          </tr>
          <tr>
            <th>
              {tr(
                lang,
                "บ้านความจำและภาพเหตุผล",
                "Memory rooms and causal pictures",
                "记忆房间与因果图",
              )}
            </th>
            <td>
              {tr(
                lang,
                "ประตูและนาฬิกาในเรื่องช่วยผูกกติกากับตำแหน่งจำง่าย เป็นสมมติฐานการออกแบบของเรา ไม่ใช่หลักฐานว่าภาพน่ารักทำให้เข้าใจการเมืองดีขึ้น",
                "Doors and clocks connect rules with memorable locations. This is our design hypothesis, not proof that cute drawings improve political understanding.",
                "门与时钟把规则连到易记位置。这是设计假设，不证明可爱图画能提升政治理解。",
              )}
            </td>
          </tr>
          <tr>
            <th>
              {tr(
                lang,
                "เกมและการสลับคำตอบ",
                "Games and permutations",
                "游戏与排列",
              )}
            </th>
            <td>
              {tr(
                lang,
                "เกมตัวเลขและคำตอบที่สลับตำแหน่งช่วยให้ฝึกโดยไม่จำตำแหน่ง XP ไม่วัดความเป็นพลเมืองดี และความเห็นทางการเมืองไม่ให้คะแนน",
                "Number games and shuffled choices encourage practice without memorising answer positions. XP does not measure good citizenship; political opinions earn no points.",
                "数字游戏与选项洗牌用于练习，避免记住答案位置。XP不衡量公民优劣，政治意见没有分数。",
              )}
            </td>
          </tr>
        </tbody>
      </table>
      <h2>
        {tr(
          lang,
          "ทดสอบอะไรแล้ว และยังไม่รู้อะไร",
          "What is tested, and what we do not know",
          "测了什么，仍不知道什么",
        )}
      </h2>
      <p>
        {tr(
          lang,
          "เราใช้การตรวจข้อความกับแหล่งกฎหมาย การทดสอบโปรแกรม และการเดินผ่านเว็บจริงเพื่อตรวจว่าระบบทำงาน การตรวจโดย agent ไม่ใช่การทดลองกับผู้เรียน การลองใช้ด้วยตัวเองเป็นส่วนหนึ่งของกระบวนการ และติ๊กกี้หรือผู้เรียนจริงจะทดสอบภายหลัง การติดตั้งบน iPad จริงและไมโครโฟนยังต้องพิสูจน์",
          "We check source text, run software tests and exercise real browser flows to establish that the system works. Agent checks are not learner trials. Trying it myself is part of the process; Tikky or actual learners will test later. Actual iPad installation and microphone behavior still need evidence.",
          "我们核对法律来源、运行软件测试并走真实浏览器流程，以检查系统是否运作。Agent检查不等于学习者试验。亲自试用是过程的一部分，Tikky或真实学习者会在后续测试。真实iPad安装与麦克风表现仍待验证。",
        )}
      </p>
      <details>
        <summary>
          {tr(
            lang,
            "แผนทดสอบกับคน: ไม่วัดจากความรู้สึกอย่างเดียว",
            "Human test plan: more than how it feels",
            "真人测试计划：不只看感觉",
          )}
        </summary>
        <ol>
          <li>
            {tr(
              lang,
              "ลองอ่านข้อกฎหมายใหม่ จับเวลาที่หาแหล่งอ้างอิงได้โดยไม่ช่วย",
              "Read an unfamiliar rule; measure time to find its source without help.",
              "阅读陌生规则，记录独立找到来源的时间。",
            )}
          </li>
          <li>
            {tr(
              lang,
              "อธิบายเหตุผลด้วยคำตัวเอง แล้วทำโจทย์ใหม่ทันทีและอีกสัปดาห์",
              "Explain it in your own words, then try new questions now and a week later.",
              "用自己的话解释，立即及一周后做新题。",
            )}
          </li>
          <li>
            {tr(
              lang,
              "ถามว่าอะไรสนุก สับสน หรือทำให้ไม่อยากกลับมา ไม่เก็บความคิดเห็นการเมืองเพื่อจัดอันดับคน",
              "Ask what was enjoyable, confusing or discouraging. Do not collect political opinions to rank people.",
              "询问哪些有趣、困惑或令人不愿返回，不收集政治意见给人排名。",
            )}
          </li>
          <li>
            {tr(
              lang,
              "เปรียบเทียบกับการอ่าน PDF และรายงานข้อจำกัดของกลุ่มเล็ก",
              "Compare with reading the PDF and report the limits of a small sample.",
              "与阅读PDF比较，并报告小样本局限。",
            )}
          </li>
        </ol>
      </details>
      <h2>
        {tr(
          lang,
          "เข้าใจเหตุผลได้โดยไม่ต้องเห็นด้วย",
          "Understand a rationale without agreeing",
          "理解理由，不必同意",
        )}
      </h2>
      <p>
        {tr(
          lang,
          "รัฐธรรมนูญมีเหตุผลทางสถาบันที่อธิบายได้ แต่ความสอดคล้องของกติกาไม่พิสูจน์ว่ากติกานั้นยุติธรรมหรือดีที่สุด เราแยกตัวบท คำอธิบาย และคำถามคุณค่าออกจากกัน คนที่คิดต่างยังใช้พื้นที่เรียนเดียวกันได้ อ่านเหตุผลที่แข็งแรงของทั้งสองฝ่าย ก่อนถามว่าอะไรจะเปลี่ยนใจเรา",
          "Constitutional institutions have rationales we can examine. Internal logic does not prove that a rule is fair or optimal. We separate legal text, explanation and value judgments. People who disagree can share the same learning space: consider strong arguments on both sides, then ask what evidence would change our minds.",
          "宪法制度的理由可以分析，但内部逻辑不证明规则公平或最优。我们区分条文、解释与价值判断。意见不同的人仍可在同一空间学习：考虑双方有力论据，再问什么证据会改变自己。",
        )}
      </p>
      <p>
        <Link href="/amend/">
          {tr(
            lang,
            "ลองเดินเรื่องแก้รัฐธรรมนูญ",
            "Try the amendment story",
            "体验修宪故事",
          )}{" "}
          →
        </Link>{" "}
        ·{" "}
        <Link href="/sources/">
          {tr(
            lang,
            "แหล่งกฎหมายและคำแปล",
            "Legal sources and translations",
            "法律来源与译文",
          )}{" "}
          →
        </Link>
      </p>
    </article>
  );
}
