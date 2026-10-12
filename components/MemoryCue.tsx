"use client";
import Image from "next/image";
import { palaceFor } from "@/lib/palace";
import { tr } from "@/lib/i18n";
import { useStudy } from "./Provider";
export function PalacePicture({
  chapter,
  small = false,
}: {
  chapter: number;
  small?: boolean;
}) {
  const { lang } = useStudy();
  const p = palaceFor(chapter);
  if (!p) return null;
  return (
    <span className={"palace-picture" + (small ? " palace-picture-small" : "")}>
      <Image
        src={`/illustrations/palace-${p.atlas}.webp`}
        alt={small ? "" : p.joke[lang]}
        width={2172}
        height={724}
        sizes={small ? "90px" : "(max-width:720px) 1200px, 1600px"}
        style={{ left: `-${p.panel * 100}%` }}
      />
    </span>
  );
}
export function MemoryCue({ chapter }: { chapter: number }) {
  const { lang } = useStudy();
  const p = palaceFor(chapter);
  if (!p) return null;
  return (
    <details className="memory-cue">
      <summary>
        {tr(
          lang,
          "ภาพขำ ๆ ช่วยจำ",
          "A little joke to remember it",
          "用小笑话帮助记忆",
        )}{" "}
        · {p.number}
      </summary>
      <figure>
        <PalacePicture chapter={chapter} />
        <figcaption>
          <strong className="palace-number">{p.number}</strong>
          <p>{p.meaning[lang]}</p>
          <p className="micro">{p.joke[lang]}</p>
        </figcaption>
      </figure>
      <a href={`/memory/#room-${chapter}`}>
        {tr(
          lang,
          "เดินต่อในบ้านความจำ",
          "Walk through the memory house",
          "继续走进记忆屋",
        )}{" "}
        →
      </a>
    </details>
  );
}
