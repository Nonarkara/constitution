import { notFound } from "next/navigation";
import { bibleChapters } from "@/lib/bible";
import { BibleChapterView } from "@/components/BibleChapter";

export function generateStaticParams() {
  const list = bibleChapters();
  if (!list.length) return [{ id: "general-provisions" }];
  return list.map((c) => ({ id: c.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = bibleChapters().find((x) => x.slug === id);
  return c
    ? { title: `${c.title.th} · ${c.title.en}`, description: c.lede.th, alternates: { canonical: `/bible/${id}/` } }
    : {};
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const all = bibleChapters();
  const i = all.findIndex((c) => c.slug === id);
  if (i < 0) notFound();
  const link = (c?: (typeof all)[number]) => (c ? { slug: c.slug, title: c.title } : null);
  return <BibleChapterView chapter={all[i]} prev={link(all[i - 1])} next={link(all[i + 1])} />;
}
