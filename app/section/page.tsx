import { Suspense } from "react";
import { Reader } from "@/components/Reader";
export const metadata = {
  title: "ค้นมาตรา · Find a section",
  description: "ค้นและอ่านรัฐธรรมนูญทั้ง 279 มาตรา ภาษาไทย อังกฤษ จีน พร้อมเสียงอ่าน",
  alternates: { canonical: "/section/" },
};

export default function Page() {
  return (
    <Suspense fallback={<p>กำลังเปิดมาตรา… / Loading… / 正在加载…</p>}>
      <Reader />
    </Suspense>
  );
}
