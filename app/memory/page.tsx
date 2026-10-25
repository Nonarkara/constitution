import { MemoryHouse } from "@/components/MemoryHouse";
export const metadata = {
  title: "บ้านความจำ 16 ห้อง · Memory house",
  description:
    "Pastel cartoons, meaningful numbers and recall practice across the sixteen numbered constitutional chapters.",
  alternates: { canonical: "/memory/" },
};
export default function Page() {
  return <MemoryHouse />;
}
