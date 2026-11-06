# Operability repair — 6 November 2026

Reader: Tikky and public learners using their own browser, including enlarged text and multiple tabs.
Job: leave practice freely, keep progress truthful, and restore backups without losing data or crashing Notes.
Grid: quiet column; the question is the entry, with its counter and exit together before it. Header identity and display/language controls stay in one compact band; no new motion or decorative structure.
Attention: question → recall/answer action → explanation; leaving is a small adjacent control. Illustrations, full legal text, palettes, stored notes and retrieval rules stay intact.
Responsive: 320/390 phone, 1024 tablet, 1440 desktop; TH/EN/ZH and enlarged text. No new default-state breakpoint or palette change.

## Recovery

Main is clean at `2705eff`; fetch finds no unmerged remote branches, no additional worktrees and no open PRs. The previously pending CI run 41557216625 completed successfully. The task list is historical October work, not proof of unfinished November code. No newer MiniMax handoff was found in the checked project/session records.

## Reproduced issues

- At 320px with enlarged text, the Chinese header control ends at x323.63, outside the viewport. The default text-size receipt never exercised this state.
- Another tab removing progress or bookmarks leaves the old in-memory state active because the storage listener ignores null values. A later save can resurrect erased progress.
- A backup highlight with createdAt `1e100` passes validation but causes Notes' date formatting to throw. Import also silently drops malformed highlight entries through a parser intended for local recovery.
- Shared Quiz exposes its exit only after completion, including when opened inside the memory house or chapter lesson. Verify the real journey and cover all its intermediate stages before changing it.

## Work and evidence

Repair the exact causes, protect the old failures with meaningful regression tests, run the appropriate data/build/release gates, then obtain independent review and verify the deployed bytes and real study flows. Saved screenshots and measured bounds will be recorded in `design/msh-evidence/2026-11-06/`.

## Changed

- Storage deletion events now reset the mounted progress and bookmark state. A global clear resets all four learner stores. Session storage cannot replace local learner records; text-size and theme clear events stay consistent. Per-key learner reset retains device preferences.
- Backup import validates highlight structure, bookmarks and representable dates before replacement. Local recovery preserves the usable note with a safe unknown timestamp. Complete quotations and merged notes are preserved on both local loading and import. The first stricter candidate incorrectly rejected a legitimate long selection; independent review blocked it. The real 6,974-character Thai section258 plus a 10,002-character merged note now round-trip in a regression test.
- Shared practice exposes Leave practice on the story, reading, question and side-question screens. The question counter and exit share a compact row. Leaving does not record an unchecked choice or add a result to already checked answers. The current Recall action is amber; a disabled future Check no longer competes before options exist.
- Enlarged phone headers use the shorter native View label and omit redundant visible brand words while retaining the full accessible home name. All controls remain available at44px, with a53px zero-inset header. Default-state layout, the palette, typefaces, drawings and learning rules are preserved.

## Verification

272 functional tests pass, including actual mounted Provider storage events, Quiz transitions/exit, malformed imports, valid old-version imports and full long-section/merged-note roundtrips. The unchanged raster reconstruction suite was not rerun in this repair pass. Typecheck, build and generated-file consistency pass. Production dependency audit: zero reported vulnerabilities.

All43 routes pass the overflow gate (215 cells) and hierarchy gate (172 cells). Release CSS/theme contrast, links, image existence and encoding checks pass. Non-Slop reports zero unapproved points. Fact-integrity still verifies5,102 fields; rule and sentence checks pass.

The normal spatial gate matches the existing baseline at40 fresh cells (five routes/eight widths). No default-state finding geometry, reason, exemption or threshold was changed. The baseline remains the truthful November3 default-state receipt; it is not relabeled as a fresh full-estate November6 sweep. New enlarged-state and active-practice evidence is recorded separately because those are the states the old default-only gate did not cover.

The saved-observation geometry validator passes24 header states and3 top-of-page practice scenes. The old header observations fail the same limits: TH/EN320 overflow and English390 painted-brand overlap. Header chrome stays53px; the largest home action bottom is661px at320px/enlarged English. Independent top-of-page practice captures place the actual Reveal action at705/689/689px for390/1024/1440, together with the question and a44px exit. These budgets validate recorded observations, not a future unrendered UI.

Independent auditor `/root/operability_review_nov6` approved the final repaired scope. It checked keyboard focus, Display Escape, exit/return, no extra answer on exit, checked-answer persistence after reload, all24 actual CSS header states, all3 practice widths, source boundaries and20 targeted tests. Its report discloses Chrome's80% host zoom and the corrected viewport requests; the builder's100% in-app screenshots were independently viewed too. Root practice-entry captures retain native focus scrolling, while the independent first-screen captures explicitly reset to scrollY0. Those states are not conflated.

Read-only backend evidence: the live news endpoint returns200 headlines with healthy checks from all three publishers. No news scrape configuration, database migration, legal text or question-answer content changed.

## Remaining

Native iPad/Safari, dictation/PWA installation, a fluent human review and learner efficacy trials remain unverified. This is an operability repair of the reproduced failures, not a claim that every possible device/state/content combination was exercised. Full-estate CI results and live release proof are recorded below when available.

## Live release

Source commit `d5fe2a8` is pushed to main. Worker `0fc37738-b27f-4054-98dc-8e5bdb79b725` serves offline revision `d60be1027e1a11bf` at https://constitution.nonarkara.org. Database bindings and the six-hour news schedule are unchanged; no migration was needed.

Three HTTP rounds each match63 selected HTML/JS/CSS/service-worker/manifest/art bodies. All43 route bodies match the export too. Full hashes and security headers are retained in `live-byte-verification.json`. Live API checks return GET200 with200 headlines/all3 source checks healthy, HEAD200 with an empty body, and POST405.

Live390×844 practice is captured at scrollY0: exit is44px high and ends214px; the sole current Reveal action ends707px. Check is absent until choices exist. Leaving returns to the memory house without recording an answer; observed runtime error log is empty. Live320px enlarged English has no horizontal overflow and a53px zero-inset header. Language and text size are restored to their original Thai/default preferences; no user note or answer was edited during this live trial.

The earlier release's CI is confirmed green. This release's full workflow is running separately; its eventual result is not claimed as completed here. All changes in the follow-up evidence commit are repository-only and do not alter served assets.

Found · Narrow enlarged headers clipped or overlapped text; practice lacked an early exit and emphasized a future disabled action; cross-tab erasure retained stale data; malformed imports could erase highlights or crash Notes.
Changed · Content-fitting header labels, one current practice action and a visible exit, deletion-aware state synchronization, and preserving strict-import/local-recovery boundaries.
Verified ·272 functional tests; independent24-state/3-viewport UI review; all-route overflow/hierarchy gates;40-cell default baseline comparison; matching live bytes, practice return and read-only news API.
Remaining · Full CI completion, native iPad/Safari/dictation/PWA and human learner/language trials; no universal every-state clearance is claimed.
