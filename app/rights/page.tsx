import { Rights } from "@/components/Rights";
export const metadata = {
  title: "สิทธิของคุณ · Your rights",
  description: "โทรศัพท์ บ้าน ใบอนุญาต การชุมนุม รัฐธรรมนูญว่าอย่างไรในเรื่องธรรมดาของชีวิต",
  alternates: { canonical: "/rights/" },
};

export default function Page() {
  return <Rights />;
}
