import { tr, type Lang } from "./i18n.ts";

/** Header and summary share one queue length, including items re-queued after a miss. */
export function sessionTotals(correct: number, queueLength: number) {
  return { correct, total: queueLength };
}

export function sessionSummary(correct: number, total: number, lang: Lang): string {
  if (correct === total) {
    return tr(
      lang,
      `ตอบถูกครบ ${total} ข้อในรอบนี้`,
      `${total} of ${total} correct.`,
      `${total}题全部答对。`,
    );
  }
  return tr(
    lang,
    `ตอบถูก ${correct} จาก ${total} ข้อ อ่านคำอธิบายของข้อที่พลาด แล้วกลับมาอีกครั้งได้`,
    `${correct} of ${total} correct. Read the explanations you missed, then come back.`,
    `${total}题中答对${correct}题。读一读错过的解析，下次再来。`,
  );
}
