import { AmendmentJourney } from "@/components/AmendmentJourney";
export const metadata = {
  title: "ถ้าเราอยากแก้รัฐธรรมนูญ · Amendment journey",
  description:
    "A fictional, trilingual journey through real constitutional amendment rules and your own reflection.",
  alternates: { canonical: "/amend/" },
};
export default function Page() {
  return <AmendmentJourney />;
}
