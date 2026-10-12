import Link from "next/link";
export const metadata = { title: "ไม่พบหน้านี้ · Page not found · 未找到页面" };
// Rendered as 404.html inside the root layout, so the notebook shell stays.
export default function NotFound() {
  return (
    <section>
      <span className="page-kicker mono">404</span>
      <h1>ไม่พบหน้านี้</h1>
      <p>
        ลิงก์อาจพิมพ์ผิดหรือหน้าถูกย้ายแล้ว · This page doesn&apos;t exist or has moved. · 页面不存在或已移动。
      </p>
      <Link className="button primary" href="/learn/">
        กลับสู่เส้นทางเรียน · Back to learning →
      </Link>
    </section>
  );
}
