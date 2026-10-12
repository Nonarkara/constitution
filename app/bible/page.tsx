import { bibleChapters } from "@/lib/bible";
import { BibleIndex } from "@/components/BibleChapter";
export const metadata = {
  title: "คัมภีร์รัฐธรรมนูญ · The study guide",
  description: "อธิบายรัฐธรรมนูญทั้งฉบับด้วยตรรกะของระบบ คดีจริง เทคนิคช่วยจำ ประวัติศาสตร์ และข้อวิจารณ์ ภาษาไทยและอังกฤษ",
  alternates: { canonical: "/bible/" },
};
export default function Page() {
  return <BibleIndex chapters={bibleChapters().map(({ slug, order, title, lede }) => ({ slug, order, title, lede }))} />;
}
