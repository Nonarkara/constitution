# Integration and release audit — 25 October 2026

## Brief

Who: Tikki and public learners studying the Thai Constitution in TH/EN/ZH.
Job: read a relevant headline, find a clearly labelled starting point for constitutional study, and return to study without misleading results or lost progress.
Hierarchy: topic/headline, source and date, then the next study action; the illustration is a guide, not a separate task.
Constraints: phone 390 × 844, tablet 1024px, desktop 1440 × 900; browser-local records; preserve the other agent's artwork, source material and STYLE.md decisions.
Direction: a study notebook with sourced headlines, a sixteen-room memory house and the existing pastel crayon companion; reuse Palette tokens.

## Starting state and territory

Started at `7c060a6` with uncommitted illustration, homepage, news and shared-style work. Isolated backend cache repair is committed as `10ffeea`. No worktree was removed and no other agent's changes were reset. The reviewed source integration is now committed as `31a926e`; the final receipt is reviewed; live release verification is recorded below.

## Confirmed defects

- Optional edge cache read/write errors could turn healthy D1 news into an outage. Reproduced two failing tests, repaired with database fallback; real database failures still return 503.
- A news search with zero matches promotes an unrelated headline as matching (`shown[0] ?? all[0]`). Remove the fallback, preserve the explicit no-results message and verify recovery when the search is cleared.
- New news explanatory text calls the Transitory Provisions a seventeenth chapter. The source corpus records sixteen numbered chapters plus separately titled Transitory Provisions. Correct the explanation without removing those provisions or adding a fictional memory room.

## Repairs and integration review

- Cache failures fall back to D1; an actual database failure still returns 503. The news endpoint remains read-only (GET/HEAD); writes use the scheduled harvester and parameterized SQL.
- An empty search no longer promotes an unrelated story. The actual NewsDesk component test enters a missing query, checks that the featured publisher link disappears, then clears the query and checks recovery.
- The featured action now names its headline in the publisher’s original language. Sources and dates remain beside the action and each row. Topic counts equal the actual filtered list; they are not a claim about public opinion or all Thai news.
- Room links are visibly labelled as suggestions from broad keyword matches, not legal classifications of each article. The detailed disclosure notes that a story can involve other chapters/laws. No curated study content was removed.
- The constitutional structure is sixteen numbered chapters plus separately titled Transitory Provisions. Corrected the guide practice link, section/practice breadcrumbs and adaptive recommendation; internal unit 17 keys remain stable so saved progress is preserved. Three regression tests cover the display name, actual navigation and a missed-answer recommendation. Removed “first sixteen” wording that implied another numbered chapter; retained all Transitory material. Checked against the [official English Constitution PDF](https://www.opdc.go.th/wp-content/uploads/2024/05/CONSTITUTION.pdf), which titles the last numbered chapter XVI and then the separate Transitory Provisions.
- The inherited transparent plates, measured aspect ratios, shared artwork layouts and memory-room anchors are integrated. All 35 plates are checked for actual alpha and interior holes; ten are re-derived byte-for-byte from their masters. Five panoramic scenes retain their ground deliberately.
- Fixed test isolation: the data falsifier had been temporarily rewriting the working question bank during parallel tests. It now mutates a scratch copy and passes that root through the validator. No legal answer was changed to satisfy the spurious failure.
- Illustration falsifier fixtures now include the CSS its validator inspects. Replaced a copy assertion that simultaneously forbade a phrase and required its longer form.

## Rendered MSH evidence

Evidence: `design/msh-evidence/2026-10-25/` (news at 390×844, 1024×900 and 1440×900; home at 390×844 and 1440×900). `news-geometry.json` records final DOM geometry. Existing October24 images are retained as inherited before/intermediate evidence, not presented as this build’s final result.

Found: at 390 × 844, a floating illustration constrained the entire featured action panel even after the image ended. The headline had190.6px of width and five lines; the CTA wrapped into two lines (83.4px high), leaving usable width empty on its right.

Changed: clear the float before the action panel on phones only. The guide’s topic buttons and room links have44px minimum targets; the phone room link shares the topic’s first row, with its subject/sections directly below.

Verified: the headline is334px wide and89.1px high; the CTA is53.7px high and ends at607.7px, compared with670.8px before. At1024 and1440, the headline and CTA are visible together (CTA bottom556.9px at both widths). No horizontal overflow was observed. The desktop study table now fits its427.7px content with shared columns, keeping room links near the citations instead of at the far edge of a992px row. Phone chrome is116px:63px header plus53px main navigation (13.7% of844). Both are in normal flow, with no fixed/sticky overlap. Desktop/tablet top header is77.5px (8.6% of900); their study navigation occupies the left rail instead of stacking above the task. The study guide earns scrolling through actual topic/section/room choices after the featured headline. Title, sourced headline/amber action, then study links remain the reading order. Fonts, themes, Tikki art and learning content are preserved.

The first complete candidate receipt exposed74 intro-column gaps, up to475px on desktop Settings. Its old retained reason described62 earlier cases and no longer matched the geometry. Fixed the cause: generic intro artwork stays in the reading margin and caps its height at180px above720px; it no longer dictates a tall48% grid row. A24-measurement sample across four routes and six widths showed no intro-column gap finding after this repair. At 1440, settled Settings has33px between the intro-text bottom and art bottom instead of the prior475px finding. Home and Tikki’s separate compositions are preserved.

The current small research-page cue is retained deliberately: at six measured phone widths its72px drawing sits beside a173px two-line title and named-author credit. The101px below the drawing is beside real text, not a full-width spacer. Independent review confirmed that enlarging this identity cue would add decorative demand. The obsolete179-occurrence explanation is replaced with these specific measurements. The number-gutter reason also now distinguishes Bible’s reading-order marks (no connector) from Rights’ actual joined timeline; the earlier wording incorrectly claimed both had hairlines.

## Independent review

Reviewer: `/root/integration_review_oct25`, separate from the builder. Verdict: **PASS WITH NOTES** after re-rendering the phone repair. Reviewed final390/1024/1440 news images, Home/Practice phone layouts, TH/EN/ZH switching, visible keyboard focus,44px map targets and320px reflow.

Real task: the saved local edition had no referendum headline, which correctly produced a no-results state. The alternative Constitution filter → Room 15 → Back completed without hints; the amendment-room heading received focus. Settings → export progress/notes → Back completed, with a real backup file downloaded. The local static server has no Worker API, and its saved-edition/error disclosure was visible. This is an automated agent trial, not a human or native-language review.

A separate bounded blind-exam trial closes the earlier report’s unclicked-button gap: the independent reviewer started the90-question sitting through visible controls, submitted three answers without seeing correctness/explanation/rule feedback, and reloaded into the same fourth question at04/90. Its choices were unselected and submission disabled; the heading received focus. The reviewer did not complete90 questions or exercise final scoring/retry in the browser. Those are covered by the actual-component/jsdom full-sitting test, not claimed as a human pass.

## Verification and release

- Full Node24 suite:250/250 pass, including an ordinary `npm test` without a `PYTHON` override after installing the pinned project `.venv`. The patched Python environment also passed245/245 with an explicit interpreter before the final handler fix (245/245). Latest targeted component/data/map/navigation tests pass.
- Production build: successful;279 sections, validated translations/cases/questions,837 podcast integrity checks, offline shell356 assets. Offline revision: `4a3ea3d13af45d75`.
- Latest layout gate:145 measurements across29 routes at390/721/860/1024/1440px; no horizontal overflow, all-zero readouts or empty labelled regions.
- Latest hierarchy gate:116 measurements across29 routes; one title, title wins, competing actions capped.
- The optional Non-Slop render CLI could not resolve Playwright in this repo; no dependency was installed. CUA screenshots, the independent real-browser trial, and the project’s own real-Chrome layout/spatial instruments supply the rendered evidence.
- Non-Slop source scan: OK,0 points,136 deliberate allowances. Release contrast/theme/link/image/encoding checks pass. Sentence gate measures9,745 passages. Generated indexes match a fresh build. Typecheck passes.
- All npm dependencies (including build/test packages):0 known vulnerabilities (October25). The new Python image checks initially lacked declared dependencies in CI. Added Python 3.12 setup and pinned image requirements. OSV reported advisories in Pillow 11.3.0; upgraded build-time Pillow to13.0.0, with0 returned advisories for that release and NumPy 1.26.4. Re-encoded the plates from preserved masters: all 40 decoded RGBA images, including transparent pixels, are exactly identical before/after. Encoded hashes and comparison method are recorded in `design/illustrations/codec-upgrade-2026-10-25.json`. All 35 transparency checks and ten master re-derivations pass in the clean patched environment. Ubuntu CI passed `npm run verify`, including the actual image reproduction tests, after push. The later browser gates remain in progress.
- Live API before deployment:200,120 headlines, three sources; HSTS and nosniff present. Post-deployment verification is recorded below.
- Spatial falsification passed:10 injected page defects,12 broken-baseline cases and one instrument case, covering all eight modes. The canonical instrument’s three files still match their shared-copy hashes.
- Wrangler 4.81.1 deployment dry run validates the Worker bundle (154.74KiB /39.70KiB gzip),2139 assets and unchanged NEWS/ASSETS bindings.
- Final canonical spatial gate passed: 2,623 measurements, 43 routes, 61 widths. Preserved five justified finding signatures (four dead-space signatures and the small research cue), removed three stale reasons, and removed the obsolete Along first-action exemption. No new exemptions. Final live byte checks follow deployment below. Intermediate sweeps stopped for repairs or browser stalls are not claimed as passes.

### Spatial browser invocation

The isolated long-running headless browser repeatedly became idle after several minutes. Background timer throttling is a suspected cause, not an established root cause. For the final foreground layout verification, the existing `CHROME_PATH` override points to a temporary launcher that adds only:

```
--disable-background-timer-throttling
--disable-backgrounding-occluded-windows
--disable-renderer-backgrounding
```

These are [documented Chrome testing flags](https://github.com/GoogleChrome/chrome-launcher/blob/main/docs/chrome-flags-for-tools.md) also used by [Playwright’s Chromium launcher](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/chromium/chromiumSwitches.ts). They keep timers on the real clock and preserve fresh loads, fonts, DOM measurement and all widths; they remove background/occlusion scheduling penalties only. No user browser preferences or canonical instrument files are changed. Some stalls recurred under these flags, so background throttling is not established as the cause. The instrument’s resume mechanism retained only completed routes when its own idle browser was restarted; unfinished route cells were measured again. Eighteen overlapping route/width measurements compare exactly, field-for-field, against the default-browser sample. The final receipt must come from one complete new sweep under this invocation; no cells from the partial default runs are carried into it. Minimized/background-tab behavior is outside this foreground layout result.

## Repository trust and setup

Removed the unsupported “12,000 exam takers” count from the English/Chinese readmes and the unverified claim that the creator personally sat these exams. The origin now follows the user’s stated purpose: a companion for Tikky and other learners. Removed the unmeasured promise that four minutes of reading would save weeks. Other authorial prose and the learning/research material remain intact.

Added `.nvmrc` for the tested Node24 runtime and synchronized setup instructions across TH/EN/ZH, including the declared Python image dependencies. Corrected “no database” documentation: core learning needs no account/API key, while the online headline feed uses the Worker and D1. These are documentation/setup changes; no site rebuild is required for them.

## Limits

Native iPad dictation/PWA behavior, fluent-reader review and exhaustive fresh legal certification remain unverified by this software release audit. Legal content validators protect existing numbers, citations and modal verbs; they do not independently establish that every legal proposition is current. No question answer or statutory text was edited in this integration.

## Final integration inventory and recovery

GitHub has no open PRs. All five merged PRs are ancestors of main. Closed PR #5 is also incorporated: its final commit `749ae44` is an ancestor through integration `fe9be50`; its Pokklong practice page, bank and learning flow remain present. There are no stashes, alternate local branches, unmerged remote branches or extra worktrees. The initial uncommitted art/layout/news work is preserved in `31a926e`; the remaining README/setup/receipt/evidence changes are included in this release. No blind merge or duplicate cherry-pick was needed.

The final browser trial found that a failed JavaScript chunk left “Try again” unable to recover, while a full reload restored the page. The initial fetch failure's cause is unproven; the file existed and matched the served bytes. The button now performs a learner-requested full reload only for recognized chunk/module-load errors. Other errors use the current Next16 `retry` API, with `error: unknown`. No automatic reload is introduced. Three actual-component regressions failed before the fix; all five recovery cases now pass. Independent review found no blocker. No layout, legal content or saved-progress schema changed in this repair.

### Reading the final receipt honestly

The canonical final raw sweep is preserved in `design/msh-evidence/2026-10-25/canonical-spatial-measurements.json.gz`. It resumed after 16 completed routes once. Its refreshed receipt differs from the earlier candidate in 37 cells; `receipt-cell-diff.json` preserves the review surface. No finding or chrome geometry changed in those 37 cells. Changes are first-action positions, hierarchy counts and text-share rounding during hydration: eleven candidate loading cells now have titles/tasks; two final cells captured loading instead. Remaining action shifts are 41–42px (nine Tikki shifts 83–84px), with titles unchanged and actions within the844px budget. The notes page peer count fell 20→10 while its title remained 44px and action moved 512→470px. These are not presented as measured learning improvements.

Two cells, `/flashcards/` at 859px and `/section/` at 640px, recorded no title/action before React settled. The instrument waits for fonts/images, not application readiness. Their raw cells are retained rather than silently replaced. Separate fresh CUA loads after the final build show their headings, working task controls and no horizontal overflow; screenshots and timestamps are stored alongside the raw sweep. This is a documented measurement limit, not a claim that all 2,623 were settled-title checks. The separate 145-measurement layout and 116-measurement hierarchy gates passed. Independent review accepted this treatment with notes.

## Shipped and verified

- Pushed source/integration commits `10ffeea`, `31a926e` and `e96978d` to main. Deployment used the tested production export and the documented `wrangler deploy` command; no D1 migration or binding change.
- Cloudflare Worker version `aa949f38-5203-49c3-bc15-1afec9c8afa3`; offline build revision `4a3ea3d13af45d75`. Wrangler returned the custom domain only, so no alternate alias was guessed.
- Three consecutive unique-query rounds matched all63 selected HTML/JS/CSS/service-worker/manifest/art bodies against local SHA256. All43 route HTML bodies match. All40 served WebP images are included. Results and response headers are in `live-byte-verification.json` beside the screenshots.
- Live `/api/news`: GET200 with JSON, HEAD200 with zero body, POST405 with `Allow: GET, HEAD`; HSTS and nosniff present. The live news browser received the25 October edition.
- Live browser: no-match query removed the featured action; clearing restored it. The Constitution filter showed3 stories; Room15 opened the amendment room and focused its heading. Back returned to news. A fresh390×844 navigation showed the title, compact Tikki drawing, sourced headline and publisher action together without horizontal overflow. Existing4/279 progress remained unchanged. See `live-journey.json` and `live-news-390.png`.
- GitHub Actions run40172952802 passed dependency setup, Python requirements, `npm run verify`, build, generated-file, release and Non-Slop checks on Ubuntu. This verifies Linux plate reproduction, not just the Mac environment. Its longer layout/spatial/falsifier jobs were still running when this release record was written; they are not reported as completed. Local full spatial and falsification evidence is recorded above.

The final documentation/evidence commit records this deployment; it changes no served application bytes. Native iPad dictation/PWA, fluent human-language review and exhaustive legal recertification remain outside the verified scope.
