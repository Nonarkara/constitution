import { Games } from "@/components/Games";
export const metadata = {
  title: "เกม · Games",
  description: "จับคู่ตัวเลขสำคัญในรัฐธรรมนูญ และเกมทายมาตรา 60 วินาที",
  alternates: { canonical: "/games/" },
};
export default function Page() {
  return <Games />;
}
