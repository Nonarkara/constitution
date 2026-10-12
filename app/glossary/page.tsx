import { Glossary } from "@/components/Glossary";
export const metadata = {
  title: "อภิธานศัพท์ · Glossary",
  description: "ศัพท์กฎหมายในรัฐธรรมนูญ อธิบายด้วยภาษาง่าย พร้อมมาตราที่ใช้คำนั้น",
  alternates: { canonical: "/glossary/" },
};
export default function Page() {
  return <Glossary />;
}
