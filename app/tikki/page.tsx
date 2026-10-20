import { TikkiStory } from "@/components/TikkiStory";

export const metadata = {
  title: "เรื่องราวของติ๊กกี้ • Tikki's Story",
  description: "จากภูเขากฎหมาย สู่สมุดเรียนรู้รัฐธรรมนูญที่อ่านง่ายและสอบผ่านได้จริง พร้อมภาพวาดพาสเทลสำหรับดาวน์โหลด",
  alternates: { canonical: "/tikki/" },
};

export default function Page() {
  return <TikkiStory />;
}
