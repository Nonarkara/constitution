<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- non-slop:start -->
## Design quality: Non-Slop
Before any UI, page, dashboard, deck or visual work, read `.non-slop/AGENTS.md` and follow it.
`STYLE.md` lists this repo's deliberate choices: it wins over every generic rule, and nothing listed there is stripped.
Check with `node .non-slop/bin/non-slop.mjs scan .` (and `render <url>` when Playwright is installed). A different agent or person reviews; never self-review.
<!-- non-slop:end -->

<!-- spatial-law:start -->
## Design quality: the spatial law (MSH)

**The law is `docs/MSH-LAW.md`** — Dr Non's own text, copied verbatim, and the canonical statement of the law for every agent and every project. Read it before designing, building or reviewing any interface.

> **When you find SH, massacre.**

Spatial hallucination (SH) is when an interface invents a reason for things to occupy space, instead of arranging them around how people read, choose and act. The test, for every region of every page: **"Why is this here, why this size, and why this far from that?"** If the answer is "the grid put it there", the layout has failed.

- The instrument lives in `scripts/spatial/` (vendored, hash-verified against the shared copy by `npm run check:spatial-sync`). It measures the eight failures the law can be measured against: unjustified gaps, orphan elements, scattered actions, false hierarchy, accidental wrapping, spatially expensive information, **chrome cost** and **overlapping chrome**.
- The receipt lives in `design/spatial-baseline.json`: every hole, orphan, scattered pair, accidental wrap and overlap, the **chrome** of every page, and a **written reason** per decision. A decision with no reason fails the gate, because no reason is what "the grid put it there" sounds like when you write it down. A reason that states a fact the measurements contradict is worse than a missing one.
- `npm run check:spatial` measures every route the build ships — including the ones nested a level down — at every width where the layout changes: the project's own widths plus every cliff the CSS declares, media queries **and container queries**, and the pixel on either side of it. **Every measurement is a fresh page load at the width being measured, on a real clock**, so the geometry recorded is the geometry a reader gets. A fix written at a breakpoint the gate never sweeps is a fix nobody checked. `npm run falsify:spatial` injects one real defect per mode, breaks the baseline on purpose, and requires the gate to catch each one — a gate that has never failed protects nothing.

**When you change a layout, the baseline diff is the review surface.** Read it. If a new hole appears, fix it or write down why it is there. A reason that names a mechanism ("the grid put it there", "it looked fine") is not a reason, and a sentence that would fit the next reason too was written for neither. Never re-baseline without reading the diff, and never leave a reason behind for a decision that is gone.

**Before you call a layout done, the law's evidence is required:** the real interface captured at 390, 1024 and 1440 px — 390 × 844 and 1440 × 900 for the first screen — recording the chrome cost, the task visibility, the geometry failures, the hierarchy and what was preserved. A source scan and a green build cannot prove a visual pass; if rendering was unavailable, say **unverified**. Then report it in the law's four lines: **Found · Changed · Verified · Remaining**, and never claim a clean pass while anything remains.
<!-- spatial-law:end -->

