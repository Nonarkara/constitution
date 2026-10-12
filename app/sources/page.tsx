import { Sources } from "@/components/Sources";
export const metadata = {
  title: "แหล่งอ้างอิง · Sources",
  description: "ต้นฉบับราชกิจจานุเบกษาและวุฒิสภา ที่มาของคำแปลและหลักการเรียนรู้",
  alternates: { canonical: "/sources/" },
};

export default function Page() {
  return <Sources />;
}
