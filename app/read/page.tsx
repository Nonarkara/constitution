import { Suspense } from "react";
import { ReadAll } from "@/components/ReadAll";
export const metadata = {
  title: "อ่านทั้งฉบับ · Read the whole text",
  description: "อ่านรัฐธรรมนูญทั้ง 279 มาตราทีละหมวด ไฮไลต์ จดโน้ต คั่นหน้า และแตะเลขมาตราเพื่อเปิดดู",
  alternates: { canonical: "/read/" },
};
export default function Page() {
  return (
    <Suspense fallback={<h1 data-page-loading="">กำลังเปิดหมวด… / Loading… / 正在加载…</h1>}>
      <ReadAll />
    </Suspense>
  );
}
