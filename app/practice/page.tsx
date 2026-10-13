import { PracticeArena } from "@/components/PracticeArena";

export const metadata = {
  title: "ฝึกตอบ · Practice",
  description: "4,700 ข้อฝึกที่เขียนจากตัวบทและชุดเจาะตัวเลข ทบทวนตามรอบ สอบจำลอง การ์ดความจำ และเรื่องที่คุณพลาดบ่อย",
  alternates: { canonical: "/practice/" },
};

export default function PracticePage() {
  return <PracticeArena />;
}
