import { DoublePageReader } from "@/components/DoublePageReader";
export const metadata = {
  title: "สมุดสองหน้า · Notebook",
  description: "อ่านรัฐธรรมนูญแบบหนังสือสองหน้า พร้อมไฮไลต์และโน้ต",
  alternates: { canonical: "/notebook/" },
};


export default function NotebookPage() {
  return <DoublePageReader />;
}
