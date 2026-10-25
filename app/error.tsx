"use client";
import Link from "next/link";
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  function recover() {
    // Retrying a rejected module promise cannot fetch the chunk again. Reload only
    // after the learner asks, so a persistent network failure cannot loop reloads.
    const chunkFailed = error instanceof Error && (error.name === "ChunkLoadError" ||
      /Loading chunk .+ failed|Failed to fetch dynamically imported module|Importing a module script failed/i.test(error.message));
    if (chunkFailed) location.reload();
    else retry();
  }
  return (
    <section role="alert">
      <span className="page-kicker mono">ERROR</span>
      <h1>หน้านี้สะดุด</h1>
      <p>
        ความก้าวหน้าที่บันทึกไว้ยังอยู่ครบ · Your saved progress is safe. · 已保存的进度不受影响。
      </p>
      <button className="primary" onClick={recover}>
        ลองอีกครั้ง · Try again →
      </button>{" "}
      <Link href="/">← กลับไปหน้าแรก · Back to home</Link>
    </section>
  );
}
