"use client";
// Replaces the root layout, so it carries its own document and no app styles.
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="th">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 24, color: "#24251f", background: "#fff" }}>
        <h1>หน้านี้สะดุด · Something went wrong</h1>
        <p>ความก้าวหน้าที่บันทึกไว้ยังอยู่ครบ · Your saved progress is safe.</p>
        <button onClick={() => retry()} style={{ minHeight: 44, padding: "8px 16px" }}>
          ลองอีกครั้ง · Try again
        </button>
      </body>
    </html>
  );
}
