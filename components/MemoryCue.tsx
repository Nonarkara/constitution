"use client";
import Image from "next/image";
import { palaceFor } from "@/lib/palace";
import { memoryCueFor, type MemoryItem } from "@/lib/cues";
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
export function MemoryCue({ chapter, item }: { chapter?: number; item?: MemoryItem }) {
  const { lang } = useStudy();
  const cue = item ? memoryCueFor(item) : null;
  const p = cue ?? (chapter ? palaceFor(chapter) : undefined);
  if (!p) return null;
  const room = cue?.chapter ?? chapter;
  const showImage = cue ? cue.image && room : Boolean(room);
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
        {showImage && room ? <PalacePicture chapter={room} /> : null}
        <figcaption>
          <strong className="palace-number">{p.number}</strong>
          <p>{p.meaning[lang]}</p>
          <p className="micro">{p.joke[lang]}</p>
        </figcaption>
      </figure>
      {room ? (
        <a href={`/memory/#room-${room}`}>
          {tr(
            lang,
            "เดินต่อในบ้านความจำ",
            "Walk through the memory house",
            "继续走进记忆屋",
          )}{" "}
          →
        </a>
      ) : null}
    </details>
  );
}
