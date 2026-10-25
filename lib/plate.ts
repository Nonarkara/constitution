import type { CSSProperties } from "react";
import { PLATE } from "@/lib/illustration-ratios";

/**
 * The proportions of a plate, in the form the stylesheet reads.
 *
 * A plate is drawn at the height of the title it stands beside, and its width
 * follows from its own proportions. Those proportions are measured from the
 * file that ships and live in `illustration-ratios.ts`, beside the file — the
 * release gate checks the two against each other, so a plate can never be
 * drawn at a shape the file does not have.
 */
export function plateStyle(src: string): CSSProperties {
  const shape = PLATE[src];
  return { "--plate-ratio": shape ? shape.ratio : "1" } as CSSProperties;
}

/**
 * The size the file actually is.
 *
 * The `width` and `height` on an image are the browser's promise about the
 * shape of the box before the bytes arrive. A plate used to be a flat
 * 900x900 sheet of paper; the files that ship are cropped to the drawing, so
 * the promise has to be the drawing's own size or the page jumps when the
 * image lands.
 */
export function plateSize(src: string): { width: number; height: number } {
  const shape = PLATE[src];
  return { width: shape ? shape.width : 900, height: shape ? shape.height : 900 };
}
