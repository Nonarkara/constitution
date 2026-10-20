"use client";
import Link from "next/link";
import { useStudy } from "./Provider";
import type { Text } from "@/lib/i18n";
import { StudyArt } from "./StudyArt";
export type HubItem = { href: string; title: Text; text: Text };
// A destination page: one ruled row per place to go; the whole row is the link.
export function Hub({ title, intro, items }: { title: Text; intro: Text; items: HubItem[] }) {
  const { lang } = useStudy();
  return (
    <>
      <div className="intro-copy">
        <StudyArt scene="library" />
        <div className="intro-text">
          <h1>{title[lang]}</h1>
          <p>{intro[lang]}</p>
        </div>
      </div>
      <nav className="hub-list">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <strong>{item.title[lang]}</strong>
            <span className="micro">{item.text[lang]}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
