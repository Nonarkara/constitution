"use client";
import Link from "next/link";
import { useStudy } from "./Provider";
import type { Text } from "@/lib/i18n";
export type HubItem = { href: string; title: Text; text: Text };
// A destination page: one ruled row per place to go; the whole row is the link.
export function Hub({ title, intro, items }: { title: Text; intro: Text; items: HubItem[] }) {
  const { lang } = useStudy();
  return (
    <>
      <h1>{title[lang]}</h1>
      <p>{intro[lang]}</p>
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
