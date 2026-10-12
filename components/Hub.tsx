"use client";
import Link from "next/link";
import { useStudy } from "./Provider";
import type { Text } from "@/lib/i18n";
export type HubItem = { href: string; mark: string; title: Text; text: Text };
// A destination page: one row per place to go, numbered like the chapter route.
export function Hub({ kicker, title, intro, items }: { kicker: string; title: Text; intro: Text; items: HubItem[] }) {
  const { lang } = useStudy();
  return (
    <>
      <span className="page-kicker mono">{kicker}</span>
      <h1>{title[lang]}</h1>
      <p>{intro[lang]}</p>
      <div className="chapter-route">
        {items.map((item) => (
          <article className="chapter-row" key={item.href}>
            <div className="route-number mono">{item.mark}</div>
            <div className="chapter-info">
              <h3>{item.title[lang]}</h3>
              <span className="micro">{item.text[lang]}</span>
            </div>
            <div className="chapter-actions">
              <Link href={item.href}>{lang === "th" ? "เปิด" : lang === "zh" ? "打开" : "Open"} ↗</Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
