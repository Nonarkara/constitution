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
  const room = cue?.chapter ?? chapter;
  const palaceEntry = room ? palaceFor(room) : undefined;
  if (!cue && !palaceEntry) return null;
  const showImage = cue ? cue.image && Boolean(room) : Boolean(room);
  // A rule's number is written in the reader's language; a room's number is
  // the same in every language, because it is a section label.
  const number = cue?.numberText ? cue.numberText[lang] : (cue?.number ?? palaceEntry?.number ?? "");
  const meaning = cue?.meaning ?? palaceEntry?.meaning;
  const joke = cue?.joke ?? palaceEntry?.joke;
  if (!meaning || !joke) return null;
  return (
    <details className="memory-cue">
      <summary>
        {tr(
          lang,
          "ภาพขำ ๆ ช่วยจำ",
          "A little joke to remember it",
          "用小笑话帮助记忆",
        )}{" "}
        · {number}
      </summary>
      <figure>
        {showImage && room ? <PalacePicture chapter={room} /> : null}
        <figcaption>
          <strong className="palace-number">{number}</strong>
          <p>{meaning[lang]}</p>
          <p className="micro">{joke[lang]}</p>
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
