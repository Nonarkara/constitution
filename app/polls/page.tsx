import { PollNotebook } from "@/components/PollNotebook";
export const metadata = {
  title: "คำถามที่ไม่มีคะแนน · Your views",
  alternates: { canonical: "/polls/" },
};
export default function Page() {
  return <PollNotebook />;
}
