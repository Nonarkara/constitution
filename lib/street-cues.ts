import cues from "@/data/street-cues.json";
import type { Lang } from "./i18n";

/**
 * THE NAME OF THE PLACE A STREET PICTURE SHOWS.
 *
 * The street plates are drawn from real Bangkok blocks, and the learner is
 * asked to recall a PLACE, not a drawing — "Ratchadamnoen", "Yaowarat", the
 * Democracy Monument seen from the air. The name used to be printed into the
 * picture, and that failed twice over: the plates are shown 64 to 224 pixels
 * wide, and 21 points of type in a 760-point picture arrives at 1.8 to 6.2
 * points on the screen, which is a grey smudge and not a name; and a name
 * inside a picture is not text, so a screen reader had nothing to say.
 *
 * So the name is data, written by the script that draws the streets
 * (`scripts/illustrations/build_streets.py`), and the page prints it beside
 * the picture. The picture and the caption cannot disagree about which place
 * this is, because one script writes both.
 */
export type StreetCue = {
  served: string;
  place: Record<Lang, string>;
  number: Record<Lang, string>;
};

const byServed = new Map<string, StreetCue>(
  Object.values(cues.scenes as Record<string, StreetCue>).map((cue) => [
    cue.served,
    cue,
  ]),
);

/** The cue for a picture, or null when the picture is not a street. */
export function streetCueFor(src: string): StreetCue | null {
  return byServed.get(src) ?? null;
}

/** Every street the house knows, for the release gate. */
export const streetCues: StreetCue[] = Object.values(
  cues.scenes as Record<string, StreetCue>,
);
