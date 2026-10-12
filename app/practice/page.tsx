import { PracticeArena } from "@/components/PracticeArena";

export const metadata = {
  title: "คลังฝึกทำข้อสอบ · Exam Practice Arena",
  description: "ฝึกทำข้อสอบแข่งขันตอบปัญหากฎหมายรัฐธรรมนูญและข้อฝึกจากตัวบท พร้อมระบบตรวจจับและเรียนรู้จุดอ่อน",
  alternates: { canonical: "/practice/" },
};

export default function PracticePage() {
  return <PracticeArena />;
}
