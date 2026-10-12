import { NewsDesk } from "@/components/NewsDesk";
export const metadata = {
  title: "ข่าวสั้น · Constitutional headlines",
  description:
    "Publisher headlines and transparent keyword counts about Thai law and constitutional institutions.",
  alternates: { canonical: "/news/" },
};
export default function Page() {
  return <NewsDesk />;
}
