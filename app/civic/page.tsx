import { CivicNotebook } from "@/components/CivicNotebook";
export const metadata = {
  title: "ตรวจคำสัญญา · Check the promise · 核查承诺",
  description:
    "Fictional promises, real constitutional checks and a four-room memory palace.",
  alternates: { canonical: "/civic/" },
};
export default function Page() {
  return <CivicNotebook />;
}
