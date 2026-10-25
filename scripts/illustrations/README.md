# Reproducing the transparent illustration plates

Use Python3.12 with the pinned dependencies in `requirements.txt`. Pillow’s
WebP encoder affects the byte comparison, so an arbitrary system image stack
is not equivalent to the recorded one.

```sh
python3.12 -m venv .venv
.venv/bin/python -m pip install -r scripts/illustrations/requirements.txt
npm run check:illustrations
```

The gate and its falsifier tests use an explicit `PYTHON` override when set,
otherwise the project’s `.venv`, then `python3` from PATH (as in CI).

The gate measures all35 transparent plates, checks their masters and ratios,
and re-derives ten byte-for-byte. Five panoramic scenes deliberately retain
their paper ground. It never regenerates or accepts a new manifest during a
check. Changes to masters, extraction code, plates or the manifest still need
visual review in the reading themes.

CI installs this same Python3.12 dependency set before the tests. The
October25 release audit verified it in a fresh Python3.12 virtual environment
with Pillow13.0.0 and NumPy1.26.4. A Linux CI result remains a separate
check. The codec update preserves every image’s dimensions and exact alpha
plane. All40 decoded RGBA images are pixel-identical before/after; the
encoded-byte changes are recorded in the release audit.
