import { Notes } from "@/components/Notes";
export const metadata = {
  title: "บันทึกของคุณ · Your notes",
  description: "ไฮไลต์ โน้ต และที่คั่นหน้าทั้งหมดของคุณ เรียงตามรัฐธรรมนูญ",
  alternates: { canonical: "/notes/" },
};
export default function Page() {
  return <Notes />;
}
