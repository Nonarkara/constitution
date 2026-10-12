"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useStudy } from "./Provider";
import { tr } from "@/lib/i18n";
import {
  REFLECTION_KEY,
  parseReflection,
  type Reflection,
} from "@/lib/amendment";
export function ReflectionSummary() {
  const { lang } = useStudy();
  const [note, setNote] = useState<Reflection | null>(null),
    [error, setError] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(REFLECTION_KEY);
      if (raw) {
        const value = parseReflection(JSON.parse(raw));
        if (value) setNote(value);
        else setError(true);
      }
    } catch {
      setError(true);
    }
  }, []);
  return (
    <section className="reflection-summary">
      <h2>
        {tr(
          lang,
          "คำตอบเรื่องแก้รัฐธรรมนูญของคุณ",
          "Your amendment reflection",
          "你的修宪思考",
        )}
      </h2>
      {note ? (
        <>
          <p>
            {note.proposal ||
              tr(
                lang,
                "เก็บความเห็นไว้แล้ว",
                "Your position is saved.",
                "已保存你的观点。",
              )}
          </p>
          <p className="micro">
            {tr(
              lang,
              "ต้นทุนที่คุณยอมรับได้",
              "Your acceptable costs",
              "你可接受的成本",
            )}
            : {note.cost || "—"}
          </p>
          <p className="micro">
            {note.savedAt.slice(0, 10)} ·{" "}
            {tr(
              lang,
              "อยู่ในเครื่องนี้เท่านั้น",
              "Only on this device",
              "仅存于本设备",
            )}
          </p>
        </>
      ) : (
        <p>
          {error
            ? tr(
                lang,
                "อ่านบันทึกเดิมไม่ได้ ข้อมูลเดิมยังอยู่",
                "The saved note could not be read; it has been preserved.",
                "无法读取原笔记，原数据仍保留。",
              )
            : tr(
                lang,
                "เดินเรื่องสมมติแล้วเก็บความคิดไว้ ไม่มีคะแนนสำหรับความเห็น",
                "Walk through the fictional story and leave a thought. Opinions earn no points.",
                "走过虚构故事，留下想法。意见没有分数。",
              )}
        </p>
      )}
      <Link href="/amend/">
        {tr(
          lang,
          "เปิดเรื่องและบันทึก",
          "Open the story and note",
          "打开故事与笔记",
        )}{" "}
        →
      </Link>
    </section>
  );
}
