"use client";
import Image from "next/image";
import { plateSize, plateStyle } from "@/lib/plate";
import { useStudy } from "./Provider";
import { streetCueFor, type StreetCue } from "@/lib/street-cues";

/**
 * The crayon drawings, and the page each one belongs to.
 *
 * These are memory-palace mnemonics: a learner who remembers "the girl with the
 * green lamp sorting index cards" can call up the Review page without reading it.
 * So a scene is named for the *activity*, not for the file, and the file it points
 * at is listed here explicitly — one map, so the site and the release gate that
 * watches for missing runtime images can never disagree about what exists.
 *
 * The three older scenes predate the Tikki series and keep their original files.
 */
export const STUDY_ART = {
  reading: "/illustrations/tikki-read-pastel.webp",
  listening: "/illustrations/listening-pastel.webp",
  review: "/illustrations/tikki-review-pastel.webp",
  along: "/illustrations/tikki-along-pastel.webp",
  amend: "/illustrations/scene-wat-phra-kaew.webp",
  bible: "/illustrations/tikki-bible-pastel.webp",
  // The guide index and a guide chapter are two different pages, so they get
  // two different drawings. One picture has to cue one place, or it cues
  // none: a drawing a learner sees on the chapter list AND on every chapter
  // tells them nothing they can navigate by.
  bibleGuide: "/illustrations/tikki-bible-guide-pastel.webp",
  cheatsheet: "/illustrations/tikki-cheatsheet-pastel.webp",
  cram: "/illustrations/tikki-cram-pastel.webp",
  drills: "/illustrations/tikki-drills-pastel.webp",
  exam: "/illustrations/tikki-exam-pastel.webp",
  examStreet: "/illustrations/scene-ratchadamnoen.webp",
  flashcards: "/illustrations/tikki-flashcards-pastel.webp",
  games: "/illustrations/tikki-games-pastel.webp",
  glossary: "/illustrations/tikki-glossary-pastel.webp",
  library: "/illustrations/tikki-library-pastel.webp",
  news: "/illustrations/scene-sukhumvit.webp",
  notes: "/illustrations/tikki-notes-pastel.webp",
  notebook: "/illustrations/tikki-notebook-pastel.webp",
  polls: "/illustrations/tikki-polls-pastel.webp",
  practice: "/illustrations/tikki-practice-pastel.webp",
  read: "/illustrations/scene-yaowarat.webp",
  rights: "/illustrations/tikki-rights-pastel.webp",
  section: "/illustrations/tikki-section-pastel.webp",
  settings: "/illustrations/tikki-settings-pastel.webp",
  sources: "/illustrations/tikki-sources-pastel.webp",
  topics: "/illustrations/scene-democracy-aerial.webp",
} as const;

export type StudyArtScene = keyof typeof STUDY_ART;

/**
 * The plate is drawn at the height of the title it stands beside, so its width
 * follows from its own proportions. Those proportions are measured from the
 * file that ships and live in `lib/illustration-ratios.ts`, beside the file;
 * the release gate checks the two against each other.
 */

/** These drawings echo the surrounding text; screen readers can skip them. */
export function StudyArt({
  scene,
  compact = false,
}: {
  scene: StudyArtScene;
  compact?: boolean;
}) {
  const src = STUDY_ART[scene];
  const cue = streetCueFor(src);
  return (
    <figure
      className={
        "study-art" +
        (compact ? " study-art-compact" : "") +
        (cue ? " study-art--street" : "")
      }
      style={plateStyle(src)}
      aria-hidden={cue ? undefined : "true"}
    >
      <Image
        src={src}
        alt=""
        {...plateSize(src)}
        sizes={
          compact
            ? "(max-width:720px) 100px, 150px"
            : "(max-width:720px) 150px, 340px"
        }
        priority={!compact}
      />
      {cue ? <StreetCaption cue={cue} /> : null}
    </figure>
  );
}

/**
 * THE NAME OF THE PLACE, IN TEXT.
 *
 * A street picture shows a place; the caption says which one. The name used
 * to be printed INTO the picture, and that failed for two reasons that
 * arithmetic settles: these plates are shown 64 to 224 pixels wide, and 21
 * points of type in a 760-point picture arrives at 1.8 to 6.2 points on the
 * screen — a grey smudge in the corner of a street. And a name inside a
 * picture is not text at all: a screen reader had nothing to say about
 * Ratchadamnoen.
 *
 * So the name is text, in the house's own type, under the picture it belongs
 * to — legible at every size, and readable aloud.
 *
 * Only the PLACE is printed. The number the plate turns on — sixteen
 * chapters, two hundred and seventy-nine sections — is already in each of
 * these pages' own text, and a second copy of a number the reader has just
 * read is noise. It stays in `data/street-cues.json`, where the release gate
 * can check it against the picture.
 */
function StreetCaption({ cue }: { cue: StreetCue }) {
  const { lang } = useStudy();
  return (
    <figcaption className="study-art-caption">
      <span className="study-art-caption-place">{cue.place[lang]}</span>
    </figcaption>
  );
}
