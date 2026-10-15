import { BlindExam } from "@/components/BlindExam";
export const metadata = {
  title: "สอบจริง แล้วค่อยเรียน · Sit the test",
  description: "ข้อสอบนายอำเภอและท้องถิ่น ปี 2568 ทั้ง 80 หัวข้อ ไม่มีเอกสารให้เปิดล่วงหน้า ทุกข้อที่ตอบผิดจะกลับมาจนกว่าคุณจะตัดตัวเลือกที่เหลือออกได้ด้วยเหตุผล",
  alternates: { canonical: "/along/" },
};
export default function Page() {
  return <BlindExam />;
}
