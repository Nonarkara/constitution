"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStudy } from "./Provider";
import { tr } from "@/lib/i18n";

export function PracticeTabs() {
  const { lang } = useStudy();
  const path = usePathname() || "/";
  const pokklong = path.includes("/practice/pokklong");
  const session = path.startsWith("/practice") && !pokklong;
  return (
    <nav className="practice-subnav" aria-label={tr(lang, "ฝึก", "Practise", "练习")}>
      <Link className="subnav-pill" href="/practice/" aria-current={session ? "page" : undefined}>
        {tr(lang, "รอบฝึก", "Session", "练习")}
      </Link>
      <Link
        className="subnav-pill"
        href="/practice/pokklong/"
        aria-current={pokklong ? "page" : undefined}
        aria-label={tr(lang, "ปกครอง (เบต้า)", "Pokklong (to govern), beta", "治理（测试版）")}
      >
        {tr(lang, "ปกครอง", "Pokklong (to govern)", "治理")}
        <span className="tree-badge">{tr(lang, "เบต้า", "beta", "测试版")}</span>
      </Link>
    </nav>
  );
}
