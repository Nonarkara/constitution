import { CheatSheet } from "@/components/CheatSheet";
export const metadata = {
  title: "สรุปภาพ · Cheat sheets",
  description: "แผนภาพสรุปโครงสร้างอำนาจและขั้นตอนตามรัฐธรรมนูญ",
  alternates: { canonical: "/cheatsheet/" },
};


export default function CheatSheetPage() {
  return <CheatSheet />;
}
