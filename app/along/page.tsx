import { BlindExam } from "@/components/BlindExam";
export const metadata = {
  title: "ลองสอบ แล้วค่อยเรียน · Try first",
  description: "แบบฝึก 90 ข้อ ครอบคลุม 80 หัวข้อ ลองตอบก่อน ดูหลักคิดของข้อที่พลาด แล้วซ่อนเฉลยเพื่อลองใหม่ บันทึกอัตโนมัติในเบราว์เซอร์",
  alternates: { canonical: "/along/" },
};
export default function Page() {
  return <BlindExam />;
}
