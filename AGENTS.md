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
## Design quality: the spatial law
An interface that invents a reason for things to occupy space — instead of arranging them around how people read, choose and act — is the failure this repo now gates.

The test, for every region of every page: **"Why is this here, why this size, and why this far from that?"** If the answer is "the grid put it there", the layout has failed.

- The instrument lives in `scripts/spatial/` (vendored, hash-verified against the shared copy by `npm run check:spatial-sync`).
- The receipt lives in `design/spatial-baseline.json`: every hole, orphan, scattered pair and accidental wrap, with a **written reason** per decision. A decision with no reason fails the gate, because no reason is what "the grid put it there" sounds like when you write it down.
- `npm run check:spatial` measures 29 routes at six widths. `npm run falsify:spatial` injects one real defect per mode and requires the gate to catch each one — a gate that has never failed protects nothing.

**When you change a layout, the baseline diff is the review surface.** Read it. If a new hole appears, fix it or write down why it is there. A reason that names a mechanism ("the grid put it there", "it looked fine") is not a reason. Never re-baseline without reading the diff.
<!-- spatial-law:end -->

