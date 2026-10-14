import { Cram } from "@/components/Cram";
export const metadata = {
  title: "สรุปก่อนเข้าห้องสอบ · The night before",
  description: "ตัวเลข ระยะเวลา คะแนนเสียง และกับดักในรัฐธรรมนูญ 2560 หน้าเดียว ตรวจกับตัวบทแล้ว ใช้ออฟไลน์ได้",
  alternates: { canonical: "/cram/" },
};
export default function Page() {
  return <Cram />;
}
