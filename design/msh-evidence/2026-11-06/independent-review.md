# Independent operability review — 6 November 2026

Verdict: PASS for the repaired scope.
Auditor: /root/operability_review_nov6 (not the builder).
Preview: http://localhost:3057/; visual build f053df5294502427. The subsequent long-quote parser repair changes no UI geometry.

Grid: column. Entry is the question; the reveal/check action follows its instructions. Amber marks the one current primary action. No new decorative block or motion was introduced. Glance: pass. Existing crayon scenes, themes, statutory context, translations and saved-answer behavior are preserved.

## Browser evidence

- TH/EN/ZH × default/enlarged × actual CSS widths320/390/1024/1440:24 records, zero overflow or painted-control overlap, header about53px, dedicated controls about44px (43.994 due Chrome zoom rounding).
- Chrome host zoom is80%. Requested viewport sizes were scaled to obtain asserted exact CSS widths; screenshot transport pixels differ. This is disclosed in the raw record. Initial wrong-size captures were superseded. The builder's100% IAB screenshots were independently viewed as supplementary exact-pixel evidence.
- Display menu changes text size; Escape closes it and restores the summary's visible amber outline.
- Practice top-of-page captures at390/1024/1440 show question and the single primary Reveal action within the first screen. Reveal ends at705/689/689 respectively. No disabled Check appears before choices exist; after reveal, Check becomes the sole primary and awaits a selected choice.
- Shift+Tab from the focused question reaches Leave practice with a visible outline; Enter returns to the memory room without recording an answer.
- A checked answer survives leaving and reloading. The independent localhost trial progressed0→1/279, then1→2/279 on a second checked answer. Leaving added no answer. No storage was cleared and no existing note text was edited.

## Source and executable checks

20 targeted Provider/backup/marks/Quiz-exit tests pass independently. They execute the actual mounted components or parsers. Individual null storage events clear progress/bookmarks; global clear resets learner stores; sessionStorage cannot substitute local learner data. Strict imports reject malformed entries and impossible dates while local recovery preserves notes with a safe unknown date.

The first strict import candidate rejected a legitimate6974-character highlight from section258; this blocked approval. The corrected parser preserves the complete quotation and merged notes, including the10002-character combined note created by two valid edits. Both local loading and backup roundtrip are now verified by the real-data regression test. Per-edit limits remain in their creation/edit paths.

The read-only backend trial returned200 headlines and healthy source checks from all3 publishers. Eleven existing backup/local-data/news-resilience tests passed before the candidate changes.

## Limits

Native iPad/Safari, dictation/PWA installation and fluent human review are unverified. This approval covers the concrete repairs and observed journeys, not every possible page, state or device. No new source/content claim is made.
