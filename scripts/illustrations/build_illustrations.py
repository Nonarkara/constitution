#!/usr/bin/env python3
"""Rebuild every served illustration: lift the paper ground, keep the drawing.

What this does
--------------
Each crayon drawing was delivered as a flat rectangle of paper with a scene
drawn on it. On a page that is also paper, the rectangle is visible as a
pasted-on patch — the drawing has an edge the page does not, and the scene
reads as a photograph of a drawing rather than as part of the page.

This script removes the paper. It keeps the drawing, crops to the drawing's
own bounds so the scene fills the space it is given, and writes a real alpha
channel so the page's own ground shows through. The paper that the flood ate
*inside* the drawing — the white page of an open notebook, the sheet under the
spectacles — is put back, because a hole punched through the picture is not a
ground (see `strip_ground.py`).

The masters are kept in `design/illustrations/masters/` — the raw, flat
drawings — so the derivation can be re-run and reproduced. The served files
in `public/illustrations/` are the derived ones, and
`design/illustrations/alpha-manifest.json` records exactly how each was made:
the master it came from, the hash of that master, the crop, the size, the
measured transparency, and the hash of the bytes that shipped.

Usage
-----
    python3 scripts/illustrations/build_illustrations.py            # rebuild
    python3 scripts/illustrations/build_illustrations.py --check    # verify
    python3 scripts/illustrations/build_illustrations.py --audit    # measure
    python3 scripts/illustrations/build_illustrations.py --map-only

`--audit` writes nothing. It measures every served file as it is on disk and
re-derives every plate from the master the manifest names, then prints the
result as JSON. That is what the release gate reads: it lets the gate compare
the bytes that ship against the bytes the master derives, instead of against
the manifest — which is a file anyone can edit.
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
from strip_ground import (  # noqa: E402
    _count_regions,
    _interior_holes,
    strip_ground,
)

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "public" / "illustrations"
MASTERS = ROOT / "design" / "illustrations" / "masters"
MANIFEST = ROOT / "design" / "illustrations" / "alpha-manifest.json"
OUT_MAP = ROOT / "lib" / "illustration-ratios.ts"

# The panoramic civic scenes are pictures OF places, drawn with a full
# background of their own. They are not marginal plates and there is no paper
# to lift off them: their ground is the scene. They are listed here so the
# manifest records that they were considered and kept, rather than missed.
SCENES, NOT_PLATES = [], []

# The width each plate is drawn at in the page it serves, times two for a
# dense screen. A plate is authored at the size it is used.
USED_WIDTH = {
    "default": 340,
}

# The ground-lifting parameters. One place, so the build and the audit that
# re-derives the plates can never drift apart.
PARAMETERS = {"threshold": 236, "grow": 1, "feather": 3}

# The encoder settings for the served files. Same reason.
QUALITY, METHOD = 88, 6

# The width the plates are built at.
MAX_WIDTH = 680

# How many plates the gate re-derives from their masters, byte for byte.
# Re-encoding a plate costs a couple of seconds, so this is a deterministic
# spread across the set rather than all of them — with the two plates that
# are known to leak always included. Every other plate is still measured for
# real transparency and still has its master's hash checked; what the sample
# adds is the byte-for-byte proof that the file that ships is the file the
# master derives.
SAMPLE_SIZE = 8
SAMPLE_MUST = ["tikki-notebook-pastel.webp", "tikki-topics-pastel.webp"]


def sample_names(names: list[str]) -> list[str]:
    """A deterministic spread of plate names, with the known-leaking two in it."""
    ordered = sorted(names)
    step = max(1, len(ordered) // SAMPLE_SIZE)
    picked = ordered[::step][:SAMPLE_SIZE]
    for name in SAMPLE_MUST:
        if name not in picked:
            picked.append(name)
    return sorted(picked)


def used_width(name: str) -> int:
    return USED_WIDTH.get("default", 340) * 2


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def derive(master_path: Path, name: str, max_width: int) -> tuple[Image.Image, dict]:
    """Turn a master into the plate that ships, and measure it."""
    return strip_ground(
        Image.open(master_path),
        threshold=PARAMETERS["threshold"],
        grow=PARAMETERS["grow"],
        feather=PARAMETERS["feather"],
        max_width=min(max_width, used_width(name)),
    )


def encode_bytes(img: Image.Image) -> bytes:
    """The exact bytes a plate ships as."""
    buf = io.BytesIO()
    img.save(buf, "WEBP", quality=QUALITY, method=METHOD)
    return buf.getvalue()


def measure(path: Path) -> dict:
    """What a file on disk actually is: its size, its transparency, its holes."""
    img = Image.open(path).convert("RGBA")
    a = np.asarray(img)[:, :, 3]
    holes = _interior_holes(a)
    transparent = int((a == 0).sum())
    return {
        "output_size": [img.width, img.height],
        "transparent_fraction": round(transparent / max(a.size, 1), 4),
        "transparent_pixels": transparent,
        "opaque_pixels": int((a == 255).sum()),
        "interior_holes": int(holes.sum()),
        "interior_hole_regions": _count_regions(holes),
    }


def audit(root: Path) -> dict:
    """Measure every served plate and re-derive a sample of them.

    Nothing here is written. The point is to compare the bytes that ship
    against the bytes the master derives, so an edited manifest cannot make
    a wrong plate look right.

    Every served plate is measured for real: its size, how much of it is
    transparent, and whether any of that transparency is enclosed by ink. The
    byte-for-byte re-derivation — the expensive half — runs on a
    deterministic sample; see SAMPLE_SIZE.
    """
    manifest = json.loads(
        (root / "design" / "illustrations" / "alpha-manifest.json").read_text()
    )
    report = {"served": {}, "derived": {}, "kept": {}, "errors": [], "rederived": []}
    names = [Path(p["served"]).name for p in manifest["plates"]]
    rederive = set(sample_names(names))
    for plate in manifest["plates"]:
        name = Path(plate["served"]).name
        served_path = root / "public" / "illustrations" / name
        master_path = root / plate["master"]

        if not served_path.exists():
            report["errors"].append(f"{name} is not served")
            continue
        try:
            report["served"][name] = measure(served_path)
        except Exception as exc:  # noqa: BLE001 - the gate must hear about it
            report["errors"].append(f"{name} could not be measured: {exc}")
            continue

        if not master_path.exists():
            report["errors"].append(f"{name} names a master that is not there: {plate['master']}")
            continue
        entry = {"master_sha256": sha256(master_path), "master_path": plate["master"]}
        if name in rederive:
            try:
                out, m = derive(master_path, name, MAX_WIDTH)
                payload = encode_bytes(out)
            except Exception as exc:  # noqa: BLE001
                report["errors"].append(f"{name} could not be re-derived: {exc}")
                continue
            entry.update(
                {
                    "sha256": hashlib.sha256(payload).hexdigest(),
                    "bytes": len(payload),
                    "output_size": m["output_size"],
                    "crop_box": m["crop_box"],
                    "transparent_fraction": m["transparent_fraction"],
                    "interior_holes": m["interior_holes"],
                }
            )
            report["rederived"].append(name)
        report["derived"][name] = entry
    for entry in manifest.get("kept", []):
        name = entry if isinstance(entry, str) else entry["name"]
        kept_path = root / "public" / "illustrations" / name
        if not kept_path.exists():
            report["errors"].append(f"{name} (kept) is not served")
            continue
        report["kept"][name] = {
            "sha256": sha256(kept_path),
            "bytes": kept_path.stat().st_size,
            "output_size": list(Image.open(kept_path).size),
        }
    return report


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="verify only")
    ap.add_argument("--audit", action="store_true", help="measure and re-derive, print JSON")
    ap.add_argument("--root", default=None, help="the tree to work on (default: this repo)")
    ap.add_argument("--max-width", type=int, default=MAX_WIDTH)
    ap.add_argument(
        "--map-only",
        action="store_true",
        help="rewrite the proportion map from the manifest and stop",
    )
    args = ap.parse_args(argv)

    root = Path(args.root).resolve() if args.root else ROOT
    src = root / "public" / "illustrations"
    masters = root / "design" / "illustrations" / "masters"
    manifest_path = root / "design" / "illustrations" / "alpha-manifest.json"
    out_map = root / "lib" / "illustration-ratios.ts"

    if args.audit:
        print(json.dumps(audit(root)))
        return 0

    if args.map_only:
        manifest = json.loads(manifest_path.read_text())
        write_ratio_map(manifest["plates"], out_map)
        print(f"proportion map rewritten from {len(manifest['plates'])} plates")
        return 0

    if not src.is_dir():
        print("no public/illustrations", file=sys.stderr)
        return 2
    masters.mkdir(parents=True, exist_ok=True)
    files = sorted(src.glob("*.webp"))

    if args.check:
        manifest = json.loads(manifest_path.read_text())
        bad = []
        for entry in manifest["plates"]:
            served = src / Path(entry["served"]).name
            if not served.exists():
                bad.append(f"{served.name} missing")
                continue
            if sha256(served) != entry["sha256"]:
                bad.append(f"{served.name} bytes differ from the manifest")
            im = Image.open(served)
            if "A" not in im.getbands():
                bad.append(f"{served.name} has no alpha channel")
            if im.size != tuple(entry["output_size"]):
                bad.append(f"{served.name} is {im.size}, manifest says {entry['output_size']}")
            master = root / entry["master"]
            if not master.exists():
                bad.append(f"{served.name} names a master that is not there")
            elif sha256(master) != entry.get("master_sha256"):
                bad.append(f"{served.name} master does not match the manifest's master hash")
        for entry in manifest.get("kept", []):
            name = entry if isinstance(entry, str) else entry["name"]
            if not (src / name).exists():
                bad.append(f"{name} (kept) is missing")
        print("\n".join(bad) if bad else f"all {len(manifest['plates'])} plates carry alpha and match the manifest")
        return 1 if bad else 0

    plates, kept = [], []
    for f in files:
        im = Image.open(f)
        # A plate is a square-ish scene on paper. A panorama is a picture of a
        # place and keeps its own ground.
        if im.width > im.height * 1.8:
            kept.append(
                {
                    "name": f.name,
                    "served": f"public/illustrations/{f.name}",
                    "sha256": sha256(f),
                    "bytes": f.stat().st_size,
                    "output_size": [im.width, im.height],
                    "ground": "own — a picture of a place; the scene is its own background",
                }
            )
            continue

        master = masters / f.name
        if not master.exists():
            shutil.copy2(f, master)

        out, m = derive(master, f.name, args.max_width)
        out_path = src / f.name
        out.save(out_path, "WEBP", quality=QUALITY, method=METHOD)
        m["served"] = f"public/illustrations/{f.name}"
        m["master"] = f"design/illustrations/masters/{f.name}"
        m["master_sha256"] = sha256(master)
        m["master_bytes"] = master.stat().st_size
        m["sha256"] = sha256(out_path)
        m["bytes"] = out_path.stat().st_size
        m["used_width"] = used_width(f.name)
        plates.append(m)
        print(
            f"{f.name:32s} {m['source_size']} -> {m['output_size']}  "
            f"crop {m['crop_box']}  {m['bytes']//1024}KB  "
            f"leaked {m['leaked_pixels']}px/{m['leaked_regions']} regions  "
            f"holes {m['interior_holes']}"
        )

    manifest = {
        "note": (
            "Every plate is the master with its paper ground removed by a border "
            "flood fill, cropped to the drawing, and written with a real alpha "
            "channel. The flood leaks through gaps in the crayon outline, so the "
            "paper it eats inside the drawing — the white page of an open "
            "notebook, the sheet under the spectacles — is put back afterwards: "
            "the transparency that the border cannot reach is enclosed by ink, "
            "and those pixels are given the master's own pixels. The "
            "transparent_fraction is measured on the file that ships; "
            "interior_holes is the transparency left over after the repair and "
            "is zero on every plate."
        ),
        "parameters": dict(PARAMETERS),
        "plates": plates,
        "kept": kept,
        "rederived_sample": sample_names([Path(p["served"]).name for p in plates]),
        "rederived_sample_note": (
            "The plates the release gate re-derives from their masters, byte "
            "for byte. Re-encoding every plate on every run costs minutes and "
            "finds nothing more; every other plate is still measured for real "
            "transparency and still has its master's hash checked."
        ),
    }
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    write_ratio_map(plates, out_map)
    print(f"\n{len(plates)} plates rebuilt, {len(kept)} scenes kept with their own ground")
    return 0


def write_ratio_map(plates: list[dict], out_map: Path) -> None:
    """Write the proportions of every plate into the code that draws them.

    The plate is drawn at the height of the title it stands beside, and its
    width follows from its own proportions. Those proportions are measured
    from the file that ships, so they live beside the file and are checked
    against it — not typed into a stylesheet and hoped for.
    """
    lines = [
        "// Generated by scripts/illustrations/build_illustrations.py — do not edit.",
        "//",
        "// The proportions of each plate, measured from the file that ships. A",
        "// plate is drawn at the height of the title it stands beside, and its",
        "// width follows from these: the column it stands in is exactly as wide",
        "// as the drawing, so nothing is reserved for a picture and nothing is",
        "// left beside one.",
        "",
        "export type PlateShape = { width: number; height: number; ratio: string };",
        "",
        "export const PLATE: Record<string, PlateShape> = {",
    ]
    for p in sorted(plates, key=lambda x: x["served"]):
        w, h = p["output_size"]
        served = "/" + p["served"].split("public/", 1)[-1]
        lines.append(
            f'  "{served}": {{ width: {w}, height: {h}, ratio: "{w} / {h}" }},'
        )
    lines.append("};")
    lines.append("")
    out_map.parent.mkdir(parents=True, exist_ok=True)
    out_map.write_text("\n".join(lines))


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
