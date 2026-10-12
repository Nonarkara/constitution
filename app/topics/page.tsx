import { Topics } from "@/components/Topics";
export const metadata = {
  title: "ดัชนีเรื่อง · Subject index",
  description: "ค้นรัฐธรรมนูญตามเรื่องในชีวิต ภาษี การชุมนุม การศึกษา สิ่งแวดล้อม และอีกมาก",
  alternates: { canonical: "/topics/" },
};
export default function Page() {
  return <Topics />;
}
