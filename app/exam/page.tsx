import { Exam } from "@/components/Exam";
export const metadata = {
  title: "ข้อสอบจำลอง · Mock exam",
  description: "ข้อสอบจำลองรัฐธรรมนูญ จับเวลา คละทุกหมวด แล้วดูคะแนนแยกตามหมวด",
  alternates: { canonical: "/exam/" },
};
export default function Page() {
  return <Exam />;
}
