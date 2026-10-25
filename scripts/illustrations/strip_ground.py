#!/usr/bin/env python3
"""Lift the paper ground off a crayon drawing, leaving real alpha behind.

Why this exists
---------------
Every illustration in this repository was delivered as a flat rectangle of
paper with a drawing on it. On a page that is also paper, that rectangle is
visible as a pasted-on patch: the drawing has an edge that the page does not.
Dr Non's instruction was to remove the background so the drawing sits *on* the
page as an intrinsic part of it.

Why a flood fill and not a threshold
------------------------------------
The drawings contain white *inside* the drawing — the newspaper in
`news-pastel`, the sheet of paper under the spectacles, the open book on the
desk. A global "white becomes transparent" threshold punches holes through
those and leaves the drawing as a lace of outlines. The ground is only the
paper that is *connected to the edge of the image*. So the ground is found by
flooding a "paper-like" mask inward from the border.

The flood leaks
---------------
A crayon outline is not a wall. The drawn line has gaps — a stroke that lifts
before it closes, a corner where the line thins to nothing — and the flood
walks straight through the gap. When it does, it eats a region of paper that
belongs to the *drawing*: the white page of the open notebook comes out as a
transparent rectangle, and on a dark page that rectangle is a hole punched
through the book.

So the leak is repaired rather than ignored. After the plate is cropped and
sized, the transparency that cannot be reached from the border of the plate is
*enclosed by ink* — it is a hole the flood made, not ground. Those pixels are
given back the master's own pixels (paper, and any crayon inside it), so the
paper the drawing is made of survives. The master's pixels are pasted, not a
flat colour, so ink that was inside a hole survives with it.

The output is cropped to the drawing's bounds, so the asset carries no margin
and no ground: it is sized to the art, and the page's own white shows through.

Usage
-----
    python3 scripts/illustrations/strip_ground.py <in.png|webp> <out.webp> \
        [--max-width N] [--threshold N] [--grow N] [--feather N]

The parameters were chosen by measurement on the real drawings; see
`design/illustrations/alpha-manifest.json` for what each output was measured
to be.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


def _luma(rgb: np.ndarray) -> np.ndarray:
    """Rec. 709 luma, the way the eye reads crayon on paper."""
    return 0.2126 * rgb[:, :, 0] + 0.7152 * rgb[:, :, 1] + 0.0722 * rgb[:, :, 2]


def _chroma(rgb: np.ndarray) -> np.ndarray:
    """How far the pixel is from neutral grey. Paper is neutral; crayon is not."""
    mx = rgb.max(axis=2).astype(np.float32)
    mn = rgb.min(axis=2).astype(np.float32)
    return (mx - mn) / np.maximum(mx, 1.0)


def _flood_from_border(mask: np.ndarray) -> np.ndarray:
    """Return the connected region of `mask` that touches the image border.

    Implemented as an iterative binary dilation constrained to `mask`, which
    is the standard BFS flood fill over a boolean grid without needing scipy.
    """
    h, w = mask.shape
    region = np.zeros_like(mask, dtype=bool)
    region[0, :] |= mask[0, :]
    region[-1, :] |= mask[-1, :]
    region[:, 0] |= mask[:, 0]
    region[:, -1] |= mask[:, -1]

    # Propagate inward one row/column at a time; every iteration grows the
    # region by one pixel in each direction, so the loop runs until stable.
    while True:
        grown = region.copy()
        grown[1:, :] |= region[:-1, :]
        grown[:-1, :] |= region[1:, :]
        grown[:, 1:] |= region[:, :-1]
        grown[:, :-1] |= region[:, 1:]
        grown &= mask
        if np.array_equal(grown, region):
            return region
        region = grown


def _grow(mask: np.ndarray, n: int) -> np.ndarray:
    """Dilate a boolean mask by n pixels (8-connected)."""
    if n <= 0:
        return mask
    out = mask
    for _ in range(n):
        grown = out.copy()
        grown[1:, :] |= out[:-1, :]
        grown[:-1, :] |= out[1:, :]
        grown[:, 1:] |= out[:, :-1]
        grown[:, :-1] |= out[:, 1:]
        out = grown
    return out


def _interior_holes(alpha: np.ndarray) -> np.ndarray:
    """The transparent pixels that the border cannot reach.

    A region of alpha==0 that is not connected to the edge of the image is
    enclosed by ink. That is not ground the flood was *meant* to remove — it
    is ground the flood reached through a gap in the crayon outline, and it
    belongs to the drawing (the white page of an open notebook, the sheet
    under the spectacles). It is the hole in the picture.
    """
    transparent = alpha == 0
    if not transparent.any():
        return np.zeros_like(transparent)
    reachable = _flood_from_border(transparent)
    return transparent & ~reachable


def _count_regions(mask: np.ndarray) -> int:
    """How many separate 8-connected regions a boolean mask holds."""
    ys, xs = np.nonzero(mask)
    if len(ys) == 0:
        return 0
    h, w = mask.shape
    seen = np.zeros(mask.shape, dtype=bool)
    count = 0
    for y0, x0 in zip(ys.tolist(), xs.tolist()):
        if seen[y0, x0]:
            continue
        count += 1
        seen[y0, x0] = True
        stack = [(y0, x0)]
        while stack:
            y, x = stack.pop()
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        stack.append((ny, nx))
    return count


def _ink_bounds(alpha: np.ndarray, cut: float = 0.35) -> tuple[int, int, int, int]:
    """The bounding box of everything that is still visible."""
    ys, xs = np.nonzero(alpha > cut)
    if len(xs) == 0:
        return (0, 0, alpha.shape[1], alpha.shape[0])
    return (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)


def strip_ground(
    src: Image.Image,
    threshold: int = 236,
    grow: int = 1,
    feather: int = 3,
    max_width: int | None = None,
) -> tuple[Image.Image, dict]:
    """Return (RGBA image cropped to the drawing, measurements)."""
    master = src.convert("RGBA")
    m_arr = np.asarray(master)
    rgb = np.asarray(src.convert("RGB")).astype(np.float32)
    arr = rgb
    luma = _luma(arr)
    chroma = _chroma(arr)

    # "Paper-like": bright and neutral. Crayon is bright but chromatic; the
    # pencil lettering inside the drawings is not bright.
    paper = (luma >= threshold) & (chroma <= 0.055)

    ground = _flood_from_border(paper)

    # The paper is not perfectly flat: there is a faint grain and a soft
    # shadow near the edges of the sheet. Those grains are darker than the
    # threshold, so the flood would stop around them and leave the sheet
    # visible as speckle. Growing the ground by a pixel or two swallows the
    # grain; the cost is a sliver of the drawing's own soft edge, which at
    # the size these are displayed is a fraction of a pixel.
    grown = _grow(ground, grow)

    # Feather: the visible edge is a blend, not a cut. Pixels at the edge of
    # the drawing get an alpha proportional to how far they are from paper,
    # so a crayon stroke fades into the page instead of ending in a jag.
    alpha = np.where(grown, 0.0, 1.0).astype(np.float32)
    if feather > 0:
        edge = _grow(grown, feather) & (~grown)
        lo, hi = float(threshold), 255.0
        ramp = np.clip((hi - luma) / max(hi - lo, 1.0), 0.0, 1.0)
        alpha = np.where(edge, ramp, alpha)

    out = np.dstack([arr, alpha * 255.0]).astype(np.uint8)
    img = Image.fromarray(out)

    box = _ink_bounds(alpha)
    img = img.crop(box)

    size = None
    if max_width and img.width > max_width:
        # Draw at the size it is used, with room for a dense screen.
        h = max(1, round(img.height * max_width / img.width))
        img = img.resize((max_width, h), Image.LANCZOS)
        size = (max_width, h)

    # The flood leaks through gaps in the crayon outline. Whatever it ate
    # inside the drawing is enclosed by ink, so it is found here — in the
    # plate's own geometry, where the crop has closed off the path the flood
    # took — and the master's pixels are put back.
    pixels = np.asarray(img).copy()
    holes = _interior_holes(pixels[:, :, 3])
    hole_pixels = int(holes.sum())
    hole_regions = _count_regions(holes) if hole_pixels else 0
    if hole_pixels:
        master_img = Image.fromarray(m_arr).crop(box)
        if size is not None:
            master_img = master_img.resize(size, Image.LANCZOS)
        m_pixels = np.asarray(master_img)
        m_alpha = m_pixels[:, :, 3].astype(np.float32) / 255.0
        m_rgb = m_pixels[:, :, :3].astype(np.float32)
        if m_alpha.min() < 1.0:
            # The master is not fully opaque: lay it on white so the paper
            # that is restored is the paper the drawing was made on.
            m_rgb = m_rgb * m_alpha[:, :, None] + 255.0 * (1.0 - m_alpha[:, :, None])
        pixels[:, :, :3] = np.where(
            holes[:, :, None], m_rgb.astype(np.uint8), pixels[:, :, :3]
        )
        pixels[:, :, 3] = np.where(holes, 255, pixels[:, :, 3])
        img = Image.fromarray(pixels)

    a = np.asarray(img)[:, :, 3]
    transparent = int((a == 0).sum())
    opaque = int((a == 255).sum())
    holes_left = int(_interior_holes(a).sum())
    measurements = {
        "source_size": [src.width, src.height],
        "output_size": [img.width, img.height],
        "crop_box": [box[0], box[1], box[2], box[3]],
        "transparent_fraction": round(transparent / max(a.size, 1), 4),
        "opaque_fraction": round(opaque / max(a.size, 1), 4),
        "corner_alpha": [
            int(a[0, 0]), int(a[0, -1]), int(a[-1, 0]), int(a[-1, -1])
        ],
        "leaked_pixels": hole_pixels,
        "leaked_regions": hole_regions,
        "interior_holes": holes_left,
        "threshold": threshold,
        "grow": grow,
        "feather": feather,
    }
    return img, measurements


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--max-width", type=int, default=None)
    ap.add_argument("--threshold", type=int, default=236)
    ap.add_argument("--grow", type=int, default=1)
    ap.add_argument("--feather", type=int, default=3)
    ap.add_argument("--json", default=None, help="write the measurements here")
    args = ap.parse_args(argv)

    src = Image.open(args.src)
    img, m = strip_ground(
        src,
        threshold=args.threshold,
        grow=args.grow,
        feather=args.feather,
        max_width=args.max_width,
    )
    Path(args.dst).parent.mkdir(parents=True, exist_ok=True)
    img.save(args.dst, "WEBP", quality=92, method=6)
    m["source"] = str(args.src)
    m["output"] = str(args.dst)
    m["bytes"] = Path(args.dst).stat().st_size
    if args.json:
        Path(args.json).write_text(json.dumps(m, indent=2) + "\n")
    print(json.dumps(m))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
