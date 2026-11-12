#!/usr/bin/env python3
"""Put Tikki into a Bangkok street.

What this does
--------------
The house had two halves that never met: crayon drawings of a girl and her
duck, on white paper, and — now — real Bangkok streets drawn as manga line
art and screentone. A plate is the drawing's own silhouette with the paper
lifted off, so a plate can stand on a street without a rectangular seam:
what is pasted is the drawing, and the drawing's edge is its own edge.

The street comes from "どこでもロケハン" (Location Scout), which builds a
block of a real city from OpenStreetMap and elevation data and draws it as
a manga background. Its terms allow the picture to be used inside a work,
with the credit it prints in the corner; the credit is burned into these
files and is repeated in the app and in data/sources/.

The house's discipline is that the page's own ground shows through, so the
street keeps its paper and the drawing keeps its colour.

Usage
-----
    python3 scripts/illustrations/build_streets.py            # rebuild
    python3 scripts/illustrations/build_streets.py --check    # verify

The masters are the raw captures in design/illustrations/streets/. The
served files are public/illustrations/scene-*.webp, and
design/illustrations/street-manifest.json records what each one is and
what it is made of, so the gate can measure the bytes that ship.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
MASTERS = ROOT / "design" / "illustrations" / "streets"
SERVED = ROOT / "public" / "illustrations"
MANIFEST = ROOT / "design" / "illustrations" / "street-manifest.json"

# The paper of the house and the ink of the house. The street is drawn on the
# same paper the plate is drawn on, so a plate standing on it belongs to it.
PAPER = (255, 255, 255)
INK = (36, 37, 31)

# One street, one figure, and where the figure stands in it.
#
# The figures are the house's own plates: the drawing is pasted whole, so a
# girl who is reading still reads, and a duck is still her duck. The street
# is what changes, which is the point — the same girl in a different place
# is a different picture, and a learner who has seen her on the avenue
# meets her again in a lane without recognising the drawing.
#
#   scale  — how tall the figure is, as a fraction of the street's height
#   left   — the figure's centre, as a fraction of the street's width
#   ground — the line she stands on, as a fraction of the street's height
SCENES = [
    {
        "name": "scene-ratchadamnoen",
        "street": "raw-ratchadamnoen-street.png",
        "figure": "tikki-exam-pastel.webp",
        "scale": 0.44,
        "left": 0.26,
        "ground": 0.92,
        "place": "Ratchadamnoen Avenue",
        "note": "the civic avenue, seen at eye level",
    },
    {
        "name": "scene-wat-phra-kaew",
        "street": "raw-wat-phra-kaew.png",
        "figure": "tikki-amend-pastel.webp",
        "scale": 0.40,
        "left": 0.74,
        "ground": 0.70,
        "place": "Wat Phra Kaew",
        "note": "the temple wall and the gate",
    },
    {
        "name": "scene-yaowarat",
        "street": "raw-yaowarat.png",
        "figure": "tikki-read-pastel.webp",
        "scale": 0.40,
        "left": 0.22,
        "ground": 0.94,
        "place": "Yaowarat",
        "note": "the shophouse lane",
    },
    {
        "name": "scene-sukhumvit",
        "street": "raw-sukhumvit.png",
        "figure": "tikki-news-pastel.webp",
        "scale": 0.42,
        "left": 0.70,
        "ground": 0.92,
        "place": "Sukhumvit Soi 11",
        "note": "the modern lane under the towers",
    },
    {
        "name": "scene-democracy-aerial",
        "street": "raw-democracy-aerial.png",
        "figure": "tikki-topics-pastel.webp",
        "scale": 0.26,
        "left": 0.80,
        "ground": 0.95,
        "place": "The Democracy Monument from the air",
        "note": "the city read from above",
    },
]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def paperise(street: Image.Image) -> Image.Image:
    """The street's white is the house's paper; its black stays the house's ink."""
    rgb = street.convert("RGB")
    a = np.asarray(rgb).astype(np.float32)
    # The render is black ink on white. Anything that is not white is ink, and
    # its darkness is how much of it there is.
    lum = a.mean(axis=2)
    ink = np.clip((255.0 - lum) / 255.0, 0.0, 1.0)
    out = np.zeros(a.shape, dtype=np.uint8)
    for c in range(3):
        out[:, :, c] = np.round(PAPER[c] * (1 - ink) + INK[c] * ink).astype(np.uint8)
    return Image.fromarray(out, "RGB")


# The width a street ships at. The house's own plates are 680 wide; a street
# is a wider picture and sits in the same column, so it is a little larger —
# and no larger, because a street that weighs half a megabyte is a street
# that makes the page wait.
STREET_WIDTH = 760


# The cue each street carries.
#
# A picture that does not name what it is for is decoration. The house's own
# rule is that one picture has to cue one place, or it cues none — so each
# street carries the number its page turns on, printed into the scene the way
# a sign is printed into a street. The place is named too, because that is
# what the learner is being asked to recall: not a drawing, but a place.
CUE = {
    "scene-ratchadamnoen": ("ถนนราชดำเนิน", "16 หมวด · 279 มาตรา"),
    "scene-wat-phra-kaew": ("วัดพระแก้ว", "มาตรา 255"),
    "scene-yaowarat": ("เยาวราช", "มาตรา 1–279"),
    "scene-sukhumvit": ("สุขุมวิท", "3 แหล่งข่าว"),
    "scene-democracy-aerial": ("อนุสาวรีย์ประชาธิปไตย", "16 หมวด"),
}

PAPER_TINT = (247, 243, 233)
INK_TINT = (36, 37, 31)


def load_font(size: int, bold: bool = False):
    """The house's own type, so the sign reads as part of the drawing."""
    root = ROOT / "design" / "fonts"
    candidates = (
        sorted(root.glob("ibm-plex-sans-thai-*.ttf")) + sorted(root.glob("jetbrains-mono-*.ttf"))
    )
    if not candidates:
        return None
    for path in candidates:
        if bold and "bold" in path.name:
            continue
        try:
            return ImageFont.truetype(str(path), size)
        except OSError:
            continue
    return None


def stamp(scene: dict, image: Image.Image) -> Image.Image:
    """Print the place and its cue into the street."""
    cue = CUE.get(scene["name"])
    if not cue:
        return image
    place, number = cue
    font = load_font(21)
    if font is None:
        return image
    draw = ImageDraw.Draw(image)
    lines = [(place, font), (number, font)]
    widths = [draw.textlength(t, font=f) for t, f in lines]
    pad_x, pad_y, gap = 14, 10, 6
    box_w = int(max(widths)) + pad_x * 2
    box_h = 21 * len(lines) + gap + pad_y * 2
    x = 20
    # Above the credit, which the tool printed into the bottom of the
    # picture. The credit has to stay readable: it is the licence. The
    # aerial has no clear ground at the bottom, so its tag goes to the top.
    y = 20 if scene["name"] == "scene-democracy-aerial" else image.height - box_h - 46
    # A paper tag, laid on the street, with the ink of the house.
    draw.rectangle([x, y, x + box_w, y + box_h], fill=PAPER_TINT, outline=INK_TINT, width=2)
    ty = y + pad_y
    for (text, f), in zip(((t, ff) for t, ff in lines)):
        draw.text((x + pad_x, ty), text, font=f, fill=INK_TINT)
        ty += 21 + gap
    return image


def compose(scene: dict) -> Image.Image:
    street = paperise(Image.open(MASTERS / scene["street"]))
    if street.width != STREET_WIDTH:
        height = round(street.height * STREET_WIDTH / street.width)
        street = street.resize((STREET_WIDTH, height), Image.LANCZOS)
    figure = Image.open(SERVED / scene["figure"]).convert("RGBA")
    sw, sh = street.size
    target_h = int(sh * scene["scale"])
    ratio = target_h / figure.height
    figure = figure.resize((max(1, int(figure.width * ratio)), target_h), Image.LANCZOS)
    x = int(sw * scene["left"] - figure.width / 2)
    y = int(sh * scene["ground"] - figure.height)
    base = street.convert("RGBA")
    base.alpha_composite(figure, (x, y))
    return stamp(scene, base.convert("RGB"))


def build() -> dict:
    SERVED.mkdir(parents=True, exist_ok=True)
    entries = []
    for scene in SCENES:
        out = compose(scene)
        served = SERVED / f"{scene['name']}.webp"
        out.save(served, "WEBP", quality=84, method=6)
        entries.append(
            {
                "name": served.name,
                "served": f"public/illustrations/{served.name}",
                "master": f"design/illustrations/streets/{scene['street']}",
                "figure": f"public/illustrations/{scene['figure']}",
                "sha256": sha256(served),
                "bytes": served.stat().st_size,
                "output_size": list(out.size),
                "place": scene["place"],
                "note": scene["note"],
                "ground": "own — a picture of a place; the scene is its own background",
                "credit": "© OpenStreetMap contributors · OpenFreeMap © OpenMapTiles · Elevation: Terrain Tiles",
                "source": "Location Scout (oyasumi-gamedev.com) — line art and screentone from OpenStreetMap and elevation data",
            }
        )
    manifest = {
        "note": (
            "The street scenes. Drawn from real city blocks by Location Scout "
            "(https://tools.oyasumi-gamedev.com/rokehan/), which builds a block "
            "of a city from OpenStreetMap and elevation data and draws it as a "
            "manga background in line art and screentone. The house's own "
            "figures are pasted into the streets, so the same girl appears in "
            "a different place on a different page."
        ),
        "credit": (
            "Map data © OpenStreetMap contributors (ODbL) · Elevation: Terrain Tiles · "
            "Surroundings: OpenFreeMap © OpenMapTiles. The credit is also burned "
            "into the bottom of every served picture."
        ),
        "scenes": entries,
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return manifest


def check() -> int:
    if not MANIFEST.exists():
        print("FAIL — no street manifest; run `npm run build:streets`", file=sys.stderr)
        return 1
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    problems = []
    for entry in manifest["scenes"]:
        served = ROOT / entry["served"]
        master = ROOT / entry["master"]
        if not served.exists():
            problems.append(f"{entry['name']}: served file missing")
            continue
        if sha256(served) != entry["sha256"]:
            problems.append(f"{entry['name']}: bytes on disk differ from the manifest")
        if not master.exists():
            problems.append(f"{entry['name']}: master missing")
        img = Image.open(served)
        if list(img.size) != entry["output_size"]:
            problems.append(f"{entry['name']}: size {img.size} != {entry['output_size']}")
        if img.mode not in ("RGB", "RGBA"):
            problems.append(f"{entry['name']}: mode {img.mode}")
        # The credit must be IN the picture, not only in a caption beside it.
        # The tool prints it into the bottom of every picture it makes, and
        # the terms ask for the credit to travel with the image.
        band = np.asarray(img.convert("L"))[-22:, :]
        if int((band < 128).sum()) < 200:
            problems.append(f"{entry['name']}: the credit band carries no ink — the credit is missing")
    if problems:
        print(f"FAIL — {len(problems)} problem(s):", file=sys.stderr)
        for p in problems:
            print(f"  ✗ {p}", file=sys.stderr)
        return 1
    print(
        f"  · street scenes: {len(manifest['scenes'])} measured — "
        f"bytes match the manifest, masters present, sizes as recorded"
    )
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    if args.check:
        return check()
    manifest = build()
    print(f"  · street scenes built: {len(manifest['scenes'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
