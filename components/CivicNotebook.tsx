"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStudy } from "./Provider";
import dynamic from "next/dynamic";
const Quiz = dynamic(() => import("./Quiz").then((m) => m.Quiz));
import {
  civicRooms,
  civicQueue,
  roomIds,
  RESUME_COOKIE,
  resumedRoom,
  text,
} from "@/lib/civic";
import { toggleBookmark } from "@/lib/marks";
import { tr, sectionLabel } from "@/lib/i18n";
export function CivicNotebook() {
  const { lang, progress, marks, saveMarks, ready, storageError } = useStudy();
  const [room, setRoom] = useState("door");
  const [exercise, setExercise] = useState<string[] | null>(null);
  const [recall, setRecall] = useState(false);
  const [savedCookie, setSavedCookie] = useState(true);
  useEffect(() => {
    try {
      const saved = resumedRoom(document.cookie);
      if (saved) setRoom(saved);
    } catch {
      setSavedCookie(false);
    }
  }, []);
  const current = civicRooms.find((r) => r.id === room)!;
  const ids = roomIds(current);
  const choose = (id: string) => {
    setRoom(id);
    setRecall(false);
    try {
      document.cookie = `${RESUME_COOKIE}=${id}; Max-Age=31536000; Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
      setSavedCookie(resumedRoom(document.cookie) === id);
    } catch {
      setSavedCookie(false);
    }
  };
  if (exercise) return <Quiz ids={exercise} onExit={() => setExercise(null)} />;
  return (
    <section className="civic-notebook">
      <h1>
        {tr(
          lang,
          "คำสัญญา ผ่านประตูไหน?",
          "Which door does the promise need?",
          "承诺要经过哪扇门？",
        )}
      </h1>
      <p>
        {tr(
          lang,
          "เรื่องสมมติให้ลองจับคำสัญญากับกติกา ตรวจทุกฝ่ายด้วยหลักเดียวกัน คำตอบด้านกฎหมายมีเฉลย ความเห็นทางการเมืองเป็นของคุณ",
          "Match fictional promises to real rules. Apply the same checks to every side. Legal questions have answers; political judgments are yours.",
          "把虚构承诺与真实规则对应起来，对各方使用同样的标准。法律题有答案，政治判断由你自己作出。",
        )}
      </p>
      <figure className="civic-panorama">
        <Image
          src="/illustrations/civic-palace.webp"
          alt={tr(
            lang,
            "ติ๊กกี้เดินผ่านประตู โต๊ะบัตรเลือกตั้ง จัตุรัส และโต๊ะเงิน สี่จุดช่วยจำ",
            "Tikky visits a door, ballot table, public square and budget desk: four memory cues",
            "蒂琪走过门、选票桌、公共广场与预算桌：四个记忆线索",
          )}
          width={2172}
          height={724}
          sizes="(max-width:720px) 100vw, 900px"
        />
        <figcaption className="micro">
          {tr(
            lang,
            "บ้านความจำ: ใช้ภาพช่วยเรียกกฎกลับมา ไม่ใช่ตัวบทกฎหมาย",
            "Memory house: use the pictures to recall rules; the pictures are not the law.",
            "记忆屋：用图像唤回规则；图像不是法律。",
          )}
        </figcaption>
      </figure>
      <nav
        className="civic-rooms"
        aria-label={tr(lang, "ห้องความจำ", "Memory rooms", "记忆房间")}
      >
        {civicRooms.map((r) => {
          const own = roomIds(r);
          const known = own.filter(
            (id) => progress.questions[id]?.correct,
          ).length;
          return (
            <button
              key={r.id}
              aria-pressed={room === r.id}
              onClick={() => choose(r.id)}
            >
              <strong>{r.name[lang]}</strong>
              <span>
                {known}/{own.length}{" "}
                {tr(
                  lang,
                  "ตอบถูกล่าสุด",
                  "last answered correctly",
                  "最近答对",
                )}
              </span>
            </button>
          );
        })}
      </nav>
      <article className="civic-room">
        <h2>{current.name[lang]}</h2>
        <p>{current.story[lang]}</p>
        <p className="notice">{current.fact[lang]}</p>
        <details>
          <summary>
            {tr(
              lang,
              "ปิดตาแล้วเดินในบ้าน",
              "Walk through the house in your mind",
              "闭眼在记忆屋里走一遍",
            )}
          </summary>
          <p>
            {tr(
              lang,
              "ลองนึกถึงวัตถุในห้องนี้โดยไม่อ่าน แล้วพูดกฎที่วัตถุนั้นช่วยจำออกมา จากนั้นเปิดดูเรื่องอีกครั้ง ถ้าจำไม่ได้ยังไม่เป็นไร การเรียกคืนคือการฝึก",
              "Recall the objects without reading, then say the rule each one cues. Reopen the story to check. Forgetting is useful feedback, not a failure.",
              "不看文字，回忆房间里的物品，说出每件物品提示的规则。再打开故事核对。遗忘提供反馈，不是失败。",
            )}
          </p>
          <button onClick={() => setRecall((v) => !v)} aria-expanded={recall}>
            {tr(lang, "เปิดคำช่วยจำ", "Reveal the cues", "显示记忆提示")}
          </button>
          {recall && (
            <p>
              {
                text(
                  "ประตู = ผู้เสนอและเสียง · โต๊ะบัตร = มอบอำนาจที่มีขอบเขต · จัตุรัส = สิทธิและการมีส่วนร่วม · โต๊ะเงิน = อำนาจจ่าย แหล่งเงิน ผลกระทบ",
                  "Door = proposer and votes · Ballot = bounded authority · Square = rights and participation · Desk = spending authority, funding and impacts",
                  "门＝提案人与票数 · 选票＝有边界的授权 · 广场＝权利与参与 · 桌＝支出授权、资金及影响",
                )[lang]
              }
            </p>
          )}
        </details>
        <div className="civic-law-list">
          {current.sections.map((n) => (
            <div key={n}>
              <Link href={`/section/?n=${n}`}>{sectionLabel(lang, n)} →</Link>
              <button
                disabled={!ready}
                aria-pressed={marks.bookmarks.includes(n)}
                onClick={() => saveMarks(toggleBookmark(marks, n))}
              >
                {marks.bookmarks.includes(n)
                  ? tr(lang, "คั่นไว้แล้ว", "Bookmarked", "已收藏")
                  : tr(lang, "กลับมาอ่าน", "Save for later", "留待重读")}
              </button>
            </div>
          ))}
        </div>
        <button
          className="primary"
          disabled={!ready}
          onClick={() => setExercise(civicQueue(ids, progress, Date.now()))}
        >
          {tr(
            lang,
            `ลองตรวจ ${ids.length} คำสัญญา`,
            `Check ${ids.length} promises`,
            `核查${ids.length}个承诺`,
          )}{" "}
          →
        </button>
        <p className="micro">
          {tr(
            lang,
            "ข้อที่ถึงเวลาทบทวนและข้อที่พลาดจะมาก่อน เฉลยพร้อมมาตรา ทบทวนอีกครั้งหลัง 10 นาทีเมื่อพลาด หรือ 1/3/7/14 วันเมื่อจำได้ คะแนนไม่วัดว่าคุณเลือกฝ่ายไหน",
            "Due questions and mistakes come first, with feedback and citations. Mistakes return after 10 minutes; successful retrieval is spaced at 1/3/7/14 days. Scores never measure political allegiance.",
            "优先复习到期题与错题，并提供反馈和条文。错题10分钟后再来；成功回忆按1/3/7/14天安排。分数不衡量政治立场。",
          )}
        </p>
      </article>
      <p className="micro">
        {tr(
          lang,
          "ความก้าวหน้าและคั่นหน้าอยู่ในเบราว์เซอร์นี้ คุกกี้จำเฉพาะห้องล่าสุด ใช้เครื่องร่วมกันก็ใช้บันทึกเดียวกัน สำรองได้ที่หน้าอุปกรณ์",
          "Progress and bookmarks stay in this browser. A cookie remembers only the last room. A shared browser shares the notebook; export a backup from Your device.",
          "进度与收藏保存在本浏览器。Cookie只记住最后一个房间。共用浏览器就共用笔记；可在设备设置导出备份。",
        )}
      </p>
      {(storageError || !savedCookie) && (
        <p role="status" className="notice">
          {tr(
            lang,
            "เบราว์เซอร์บันทึกบางส่วนไม่ได้ อย่าถือว่าการเรียนครั้งนี้เก็บถาวรแล้ว",
            "The browser could not save some data. Do not assume this session is permanently saved.",
            "浏览器无法保存部分数据，请勿假定本次学习已永久保存。",
          )}
        </p>
      )}
      <p>
        <Link href="/notes/">
          {tr(
            lang,
            "กลับมาหาสิ่งที่คั่นไว้",
            "Return to your bookmarks",
            "回到收藏",
          )}{" "}
          →
        </Link>{" "}
        ·{" "}
        <Link href="/review/">
          {tr(lang, "ทบทวนที่ถึงเวลา", "Due review", "到期复习")} →
        </Link>{" "}
        ·{" "}
        <Link href="/amend/">
          {tr(
            lang,
            "ทดลองเสียงแก้ไขและต้นทุน",
            "Explore amendment votes and costs",
            "探索修宪票数与成本",
          )}{" "}
          →
        </Link>
      </p>
      <aside className="civic-resources">
        <h2>
          {tr(
            lang,
            "ก่อนเชื่อ ก่อนสอบ",
            "Before believing; before the exam",
            "相信之前，考试之前",
          )}
        </h2>
        <p>
          {tr(
            lang,
            "โจทย์ 16 ข้อนี้เขียนขึ้นเพื่อฝึก ไม่ใช่ข้อสอบจริงหรือข้อสอบหลุด ภาค ก. ทั่วไปมีคิดวิเคราะห์ ภาษาอังกฤษ และความรู้การเป็นข้าราชการที่ดี ซึ่งกว้างกว่ารัฐธรรมนูญ ตรวจประกาศของหน่วยงานที่คุณสมัครด้วย",
            "These 16 questions are original practice, not actual or leaked exam papers. General Part A covers analytical ability, English and civil-service knowledge, which extends beyond the Constitution. Check your recruiting agency’s notice.",
            "这16题是原创练习，不是真题或泄题。通用甲类考试涵盖分析能力、英语及公务员知识，范围超过宪法。请核对报考机关的公告。",
          )}
        </p>
        <ul>
          <li>
            <a
              href="https://www.ocsc.go.th/general-exam/general-exam-intro/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {tr(
                lang,
                "ก.พ.: ขอบเขตการสอบ ภาค ก.",
                "OCSC: Part A exam scope",
                "OCSC：甲类考试范围",
              )}{" "}
              ↗
            </a>
          </li>
          <li>
            <a
              href="https://jobapp.ocsc.go.th/portal/mock-exam/test1.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              {tr(
                lang,
                "ก.พ.: ตัวอย่างข้อสอบทางการ",
                "OCSC: official sample questions",
                "OCSC：官方样题",
              )}{" "}
              ↗
            </a>
          </li>
          <li>
            <a
              href="https://www.ocsc.go.th/laws/search/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {tr(
                lang,
                "ก.พ.: คลังกฎหมายเพื่ออ่านต่อ",
                "OCSC: legal library for further study",
                "OCSC：继续学习的法律资料库",
              )}{" "}
              ↗
            </a>
          </li>
          <li>
            <a
              href="https://www.ect.go.th/ect_th/th/db_119_ect_th_cms_1/7540"
              target="_blank"
              rel="noopener noreferrer"
            >
              {tr(
                lang,
                "กกต.: นโยบายใช้เงินต้องชี้แหล่งเงิน ความคุ้มค่าและความเสี่ยง",
                "ECT: spending policies—funding, benefits and risks",
                "ECT：支出政策的资金、效益与风险",
              )}{" "}
              ↗
            </a>{" "}
            <span className="micro">
              {tr(
                lang,
                "กฎหมายพรรคการเมือง มาตรา 57 ไม่ใช่มาตรา 57 ของรัฐธรรมนูญ",
                "Political Parties Act section 57, not Constitution section 57",
                "政党法第57条，不是宪法第57条",
              )}
            </span>
          </li>
          <li>
            <a
              href="https://www.ect.go.th/ect_th/th/db_119_ect_th_cms_1/7662"
              target="_blank"
              rel="noopener noreferrer"
            >
              {tr(
                lang,
                "กกต.: การจัดทำฉบับใหม่มีประเด็นต่างจากแก้รายมาตรา",
                "ECT: replacing the Constitution differs from amending clauses",
                "ECT：制定新宪法不同于修改条文",
              )}{" "}
              ↗
            </a>
          </li>
        </ul>
        <p className="micro">
          {tr(
            lang,
            "ตรวจแหล่งอ้างอิง 12 ตุลาคม 2569 แหล่งภายนอกเป็นภาษาไทย อ่านประกาศล่าสุดก่อนสอบหรืออ้างกระบวนการจริง",
            "Sources checked 12 October 2026. External resources are in Thai. Read current notices before an exam or a real proposal.",
            "来源核查于2026年10月12日。外部资料为泰语，考试或实际提案前请查看最新公告。",
          )}
        </p>
      </aside>
    </section>
  );
}
