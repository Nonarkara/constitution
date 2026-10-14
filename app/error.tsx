"use client";
import Link from "next/link";
export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <section role="alert">
      <span className="page-kicker mono">ERROR</span>
      <h1>หน้านี้สะดุด</h1>
      <p>
        ความก้าวหน้าที่บันทึกไว้ยังอยู่ครบ · Your saved progress is safe. · 已保存的进度不受影响。
      </p>
      <button className="primary" onClick={() => retry()}>
        ลองอีกครั้ง · Try again →
      </button>{" "}
      <Link href="/">← กลับไปหน้าแรก · Back to home</Link>
    </section>
  );
}
