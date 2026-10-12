import { Review } from "@/components/Review";
export const metadata = {
  title: "ทบทวน · Review",
  description: "ทบทวนข้อที่ถึงกำหนดตามหลักการเว้นระยะ",
  alternates: { canonical: "/review/" },
};

export default function Page() {
  return <Review />;
}
