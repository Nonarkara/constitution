import Image from "next/image";

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
  reading: "/illustrations/reading-pastel.webp",
  listening: "/illustrations/listening-pastel.webp",
  review: "/illustrations/tikki-review-pastel.webp",
  along: "/illustrations/tikki-along-pastel.webp",
  amend: "/illustrations/tikki-amend-pastel.webp",
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
  flashcards: "/illustrations/tikki-flashcards-pastel.webp",
  games: "/illustrations/tikki-games-pastel.webp",
  glossary: "/illustrations/tikki-glossary-pastel.webp",
  library: "/illustrations/tikki-library-pastel.webp",
  news: "/illustrations/tikki-news-pastel.webp",
  notes: "/illustrations/tikki-notes-pastel.webp",
  notebook: "/illustrations/tikki-notebook-pastel.webp",
  polls: "/illustrations/tikki-polls-pastel.webp",
  practice: "/illustrations/tikki-practice-pastel.webp",
  read: "/illustrations/tikki-read-pastel.webp",
  rights: "/illustrations/tikki-rights-pastel.webp",
  section: "/illustrations/tikki-section-pastel.webp",
  settings: "/illustrations/tikki-settings-pastel.webp",
  sources: "/illustrations/tikki-sources-pastel.webp",
  topics: "/illustrations/tikki-topics-pastel.webp",
} as const;

export type StudyArtScene = keyof typeof STUDY_ART;

/** These drawings echo the surrounding text; screen readers can skip them. */
export function StudyArt({
  scene,
  compact = false,
}: {
  scene: StudyArtScene;
  compact?: boolean;
}) {
  return (
    <figure
      className={"study-art" + (compact ? " study-art-compact" : "")}
      aria-hidden="true"
    >
      <Image
        src={STUDY_ART[scene]}
        alt=""
        width={900}
        height={900}
        sizes={
          compact
            ? "(max-width:720px) 100px, 150px"
            : "(max-width:720px) 150px, 340px"
        }
        priority={!compact}
      />
    </figure>
  );
}
