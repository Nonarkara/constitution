import { Suspense } from "react";
import { Reader } from "@/components/Reader";
export default function Page() {
  return (
    <Suspense fallback={<p>กำลังเปิดมาตรา… / Loading… / 正在加载…</p>}>
      <Reader />
    </Suspense>
  );
}
