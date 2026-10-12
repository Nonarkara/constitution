import { Settings } from "@/components/Settings";
export const metadata = {
  title: "อุปกรณ์ · Your device",
  description: "ติดตั้งบน iPad ใช้ออฟไลน์ และสำรองความก้าวหน้า",
  alternates: { canonical: "/settings/" },
};

export default function Page() {
  return <Settings />;
}
