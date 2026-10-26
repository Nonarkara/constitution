# Reading controls — 26 October 2026

Who: Tikky and other Thai, English and Chinese readers on phones and tablets.
Job: inspect a cited law, then return to the explanation or open its chapter.
Hierarchy: section/term, readable evidence, nearby close/read actions; preview chrome stays quiet.
Constraints: preserve complete law and notes, 44px controls, keyboard return, 320px reflow and enlarged text.
Direction: a compact margin reference in the existing study notebook, using Palette tokens and the current Tikki drawings.

Found: at390×844, Section256's preview is590.8px tall with2725px of scroll content; its44px action row starts aty2925.5, outside the visible sheet. The heading already uses18px and is not falsely described as oversized. Preserve full text; keep actions reachable during reading. Evidence: `design/msh-evidence/2026-10-26/sheet-before-390.png`.

MiniMax's uncommitted round-three report is preserved. Its artwork and room-first flow are already committed in006bb0b/951bb55, with receipt9d15072; no art is replaced in this repair.

The inherited round-three receipt changed the research cue to85px high (49% of173px, leaving88px), but retained the old explanation claiming72px/42%/101px. Corrected only the written reason to match the existing six measured cells. No geometry was overwritten or exemption added. Fresh rendering is checked below.

## Verification checkpoint

- 246 functional tests pass (two workers, excluding the unchanged illustration reconstruction suite); this includes three trilingual Peek focus/text tests and four hydration-readiness cases. Typecheck passes. The repeated image suite was stopped under heavy machine load and is not reported as passed in this round; the artwork is unchanged from MiniMax's verified round.
- First production build failed on a test timer return-type inference; corrected it and the subsequent build passed, offline revision625d45148c83e56b. Source release checks and generated indexes pass; Non-Slop has0 unapproved points.
- Expanded §256 at390×844: both44px controls now occupy y788–832; footer y779–832, full3194-character law preserved, no horizontal overflow, heading18px, actual saved-state markertrue. Tablet1024×900 capture saved. Independent reviewer confirmed reachable controls and preserved prose from both images.
- Reviewer found prose visible in the12px bottom-padding strip below the sticky footer. A follow-up extends the footer background into that existing safe-area inset with matching padding/negative inset and margin; new build/render verification is pending. No text is removed.
- The browser bridge stopped responding during1440px capture. The local layout/hierarchy Chrome processes also failed to measure, with network-service crashes/allocator/display-link errors. Those runs are failures, not visual passes. Independent native-Chrome fallback is in progress. The new footer patch is not deployed at this checkpoint.
- The default closed layouts gain no new geometric rule or breakpoint; the existing round-three2623-cell receipt is retained. Its written research-cue rationale is corrected to match its own85px measurement. Open panels require separate evidence because the closed-route sweep does not exercise them.
