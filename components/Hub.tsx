"use client";
import Link from "next/link";
import { useStudy } from "./Provider";
import { tr, type Text } from "@/lib/i18n";
import { StudyArt } from "./StudyArt";
import { PageAction } from "./PageAction";
export type HubItem = { href: string; title: Text; text: Text };
// A destination page: one ruled row per place to go; the whole row is the link.
// The first destination is the way in and gets the one prominent panel; the
// rest stay a quiet list, because a shelf of eight equal handles is a shelf,
// not a set of eight things competing for the eye.
export function Hub({
  title,
  intro,
  items,
  reason,
}: {
  title: Text;
  intro: Text;
  items: HubItem[];
  reason: Text;
}) {
  const { lang } = useStudy();
  const [first, ...rest] = items;
  return (
    <>
      <div className="intro-copy">
        <StudyArt scene="library" />
        <div className="intro-text">
          <h1>{title[lang]}</h1>
          <p>{intro[lang]}</p>
        </div>
      </div>
      <PageAction
        href={first.href}
        label={first.title[lang]}
        reason={reason[lang]}
        kicker={tr(lang, "เริ่มที่นี่", "Start here", "从这里开始")}
      />
      <h2 className="hub-others-title">
        {tr(lang, "หรือสำรวจเรื่องอื่น", "Or explore something else", "或探索其他")}
      </h2>
      <nav className="hub-list">
        {rest.map((item) => (
          <Link key={item.href} href={item.href}>
            <strong>{item.title[lang]}</strong>
            <span className="micro">{item.text[lang]}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
