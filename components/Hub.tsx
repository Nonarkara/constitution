"use client";
import Link from "next/link";
import { useStudy } from "./Provider";
import { tr, type Text } from "@/lib/i18n";
import { StudyArt } from "./StudyArt";
export type HubItem = { href: string; title: Text; text: Text };

export function Hub({ title, items }: { title: Text; items: HubItem[] }) {
  const { lang } = useStudy();
  const [first, ...rest] = items;
  const groups = [
    { title: tr(lang, "รัฐธรรมนูญในชีวิตจริง", "The constitution in practice", "宪法与现实"), items: rest.slice(0, 4) },
    { title: tr(lang, "อ่านและจดจำ", "Study and reference", "学习与查阅"), items: rest.slice(4) },
  ];
  return (
    <div className="explore-index">
      <header className="study-opening">
        <StudyArt scene="library" />
        <div className="study-opening-copy">
          <h1>{title[lang]}</h1>
          <p>{tr(lang, "ลองใช้รัฐธรรมนูญกับเรื่องใกล้ตัว", "Try applying the constitution to everyday life.", "试着用宪法理解身边的事。")}</p>
          <Link href={first.href} className="button primary study-opening-link">
            {first.title[lang]} <span aria-hidden="true">→</span>
          </Link>
          <p className="micro">{first.text[lang]}</p>
        </div>
      </header>
      <nav className="explore-groups" aria-label={title[lang]}>
        {groups.map((group) => (
          <section key={group.title}>
            <h2>{group.title}</h2>
            <ul>
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <strong>{item.title[lang]}</strong>
                    <span className="micro">{item.text[lang]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </div>
  );
}
