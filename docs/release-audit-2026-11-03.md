# November integration and spatial audit

Who: Tikky and public learners using Thai, English or Chinese on phone and tablet.
Job: recall the right constitutional rule and check its citation without losing the current study task.
Hierarchy: rule and answer together, mnemonic below them, source available beside the label.
Constraints: preserve all illustrations, saved progress, complete legal qualifications, readable type and usable controls.
Direction: a compact study notebook, using the existing Jost/IBM Plex Thai, amber and pastel drawings.

## Found

Nine local commits after the last pushed revision contained MiniMax's illustration repairs, prior Escape fixes and the new rule catalogue. No open PRs were found; the current checkout is main. The only other registered worktree is an already missing detached historical checkout; no unique work was deleted.

The new cram mnemonics stretched a half-width answer column. Independent review measured the long final-reading row at 206.17 px at 1024 × 900, with a 29.70 px label beside 185.17 px of answer/mnemonic. The blank area came from unrelated content sharing a row height.

A cue for the 15-day wait between second and third readings appeared on `civic-06`, which asks about the separate 15-day wait after final approval. Equal section and number are insufficient evidence of the same rule. A no-confidence mnemonic also called empty desks part of the denominator, leaving absent members and legally vacant seats ambiguous.

## Changed

- Mnemonics use a second full-width definition below the label/number pair. Complete text, sources and cover/reveal behavior remain.
- The between-readings cue requires explicit procedural context. An ambiguous question receives no such cue; the original explanation still teaches the relevant rule.
- The no-confidence image counts serving members, including absentees, and explicitly excludes unfilled seats in all three languages. Authoring data regenerates the handles.
- Statutory proof tests now check transitional rules as well as the sixteen numbered chapters.
- Preserved the inherited instrument snapshot and owned Chrome process-group cleanup, and checked its hashes against the canonical copy. Builds finish before sweeps: copying a build directory does not itself make a concurrent rewrite atomic.
- Corrected the inherited audit's universal cue claim and unproven attribution of browser deaths.
- Fixed both overflow and hierarchy gate discovery: they previously stopped at top-level folders (29 routes), missing fourteen nested routes. Shared recursive discovery now finds all 43. Its regression fixture includes a page three levels deep without an intermediate index.
- The expanded hierarchy sweep exposed 13 guide pages with no visually distinct next step. Their existing first recall disclosure now carries the house amber; no additional action, wrapper or instruction was added. The gate now recognizes native `summary` controls as interactive.

## Verification

- Inherited full suite: 267/267 passed, including twelve illustration/reconstruction and adversarial tests. Final functional run: 257/257 passed, including the two new regressions. Targeted cue/visual tests: 13/13. Typecheck and generated data checks pass.
- Production dependency audit reports zero known vulnerabilities. This is dependency evidence, not a universal security certification. The live news endpoint returned 200 headlines and three source-health entries, checked on 2 November.
- Independent reviewer approved the cue fix, wording, recursive discovery and cram layout. At 1024 × 900 the final-reading row changed from 206.17 to 185.38 px. Header 77.49 px (8.61%). Its label, complete threshold, source and mnemonic remain. Cover mode hides all 79 answers and their cues; one reveal restores one answer and its cue. TH/EN/ZH switch and reflow work.
- Root captures at 390 × 844 and 1440 × 900: zero horizontal overflow, header 63 px (7.46%) and 77.49 px (8.61%) respectively. Full-width mnemonic preserved. The first study group and cover action are on screen; the long list earns scrolling with 79 distinct rules and supporting cues. The page title wins, then the recall control, then the first rule.
- At 320 px in Chinese, header remains 63 px, no overflow; the long §256 sheet fits the viewport and Close remains 44 px tall. Escape closes the display menu while preserving the sheet; another Escape closes the sheet and restores citation focus. Prior Escape fixes were retained through integration.
- Expanded overflow gate: 215 measurements across all 43 routes pass. Final post-guide hierarchy: 172 measurements across all 43 routes pass. Final overflow: 215 measurements across all 43 routes pass. Release CSS/theme contrast, built links, image references and encoding checks pass.

The existing first guide check was independently exercised at `/bible/local-and-amendment/` at 390 × 844 and 1024 × 900. It fits in the first screen (75.4 px and 45.7 px tall), opens/closes with Enter and keeps visible focus. A separate phone check with saved progress still visible places the complete question at y745.77–821.16 in the 844 px screen. The header, navigation and progress consume 159 px plus an 8 px gap (167 px total, 19.79%); only the 63 px header is sticky. At desktop, header plus progress are 138.49 px plus a 38 px gap (176.49 px total, 19.61%); the side rail consumes horizontal space. The state remains visible rather than being removed to clear a budget.

Final production build: offline revision `de434d0e45bc37c8`. The spatial receipt combines 976 fresh cells (16 routes × 61 widths) from two sweeps of that frozen build, with 1,647 cells (27 routes) identical to the committed receipt at `52846bd`. It explicitly sets `measuredTogether: false`, lists fresh/carried routes and pins both original measurement time and commit. The 14 guide/cram routes have zero findings. Memory/flashcards add no finding geometry changes; the memory figure's centered caption retains its existing written reason. No limits, reasons or exemptions were added. The cram repair removes 45 formerly unreasoned `dt` findings from the inherited dirty receipt.

One additional two-route attempt was manually stopped before completing a route. The replacement completed all 122 cells; no failed or unfinished attempt is reported as a pass. The earlier full sweep was intentionally stopped to fix the newly exposed guide action issue; it is not a completed sweep. Its owned browser group was found still running and explicitly cleaned up using its verified PID/profile, without touching other browser sessions.

Hierarchy timeout now scales with requested cells (430 seconds at 43 routes) after the expanded local run approached the former five-minute ceiling. CI's falsification job receives 120 rather than 90 minutes for the expanded coverage; design thresholds and completeness checks stay intact.

## Remaining

The full fresh 43 × 61 estate sweep and falsifiers will run in CI after push. The local receipt is deliberately assembled. Native iPad dictation/PWA installation, a fluent human review of every translation and learner evidence for the mnemonic effect remain unverified. The long guide remains Thai/English, explicitly labeled for Chinese readers; short lessons, constitutional text and exercises are trilingual. Shared spatial-tool shutdown after parent interruption still needs upstream attention; it can leave an owned headless browser behind, as observed and cleaned above.

Deployment verification is recorded below.


## Shipped and verified

Integrated and pushed MiniMax's nine local commits plus `8542c5d`. No open PRs or other branches required merging. Pruned only the registry entry for the already missing detached worktree; its commit is an ancestor of main.

`wrangler deploy` completed to https://constitution.nonarkara.org, Worker version `a5e369dc-930f-4b03-a6f5-dc70af88c071`. NEWS/ASSETS bindings and the six-hour harvest schedule are unchanged; no database migration.

Three rounds matched 63 HTML/JS/CSS/service-worker/manifest/art bodies byte-for-byte with the production export. All 43 user-route bodies also matched. This includes the retained illustrations and the new offline revision `de434d0e45bc37c8`. Full SHA evidence is in `design/msh-evidence/2026-11-03/live-bytes.json`.

The live phone guide's amber recall question is fully visible at y745.77–821.16; Enter opens its real explanation and closes it again with visible focus. No console errors were observed. The live cram sheet has 79 full-width mnemonics and no overflow; cover hides all 79 answers and cues, and one reveal restores exactly one. Live screenshots are archived beside the local and independent captures.

The live news API returned 200 headlines, GET 200, HEAD 200 with an empty body, and POST 405 with `Allow: GET, HEAD`. HSTS and nosniff are present.

The expanded full CI run is still in progress; its full-estate sweep and falsifiers are not claimed as completed local checks. The final evidence commit changes no served application bytes.
