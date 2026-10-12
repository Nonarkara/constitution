import { PracticeArena } from "@/components/PracticeArena";

export const metadata = {
  title: "ฝึกตอบ · Practice",
  description: "454 ข้อฝึกที่เขียนจากตัวบท ทบทวนตามรอบ สอบจำลอง การ์ดความจำ และเรื่องที่คุณพลาดบ่อย",
  alternates: { canonical: "/practice/" },
};

export default function PracticePage() {
  return <PracticeArena />;
}
