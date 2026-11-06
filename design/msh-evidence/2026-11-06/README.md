# Operability evidence — 6 November 2026

`header-before-*` records the original live enlarged-text defects. `header-before.json` is supplemented with the actual overlapping brand bounds from `brand-overlap-before.json`; the saved geometry validator fails those same observations.

`header-after-*` and `header-after.json`: 24 default/enlarged TH/EN/ZH states at actual 320/390/1024/1440 CSS widths, captured in the in-app browser at 100%. They precede the recall-action-only change; the header code and geometry stay identical in the final build.

`independent-header-matrix.json`: independent retest of the final visual candidate. Chrome host zoom was 80%; viewport requests were corrected and actual CSS widths asserted. The associated screenshots therefore have transport dimensions different from their CSS viewport. The reviewer also inspected the builder's 100% captures. Earlier incorrectly sized independent frames are superseded, as the independent report states.

`quiz-after-*` records the real entry after native question-focus scrolling. `independent-quiz-final-*` explicitly returns to scrollY=0 before capturing the first screen. `independent-quiz-final.json` supplies the top-of-page task budgets. Both are real observations, with their different scroll states disclosed.

The independent report covers the final UI, actual exit/reload interactions, and the subsequent parser-only preservation repair. That final parser change does not alter screen geometry.

`regressions-before.txt`, `exit-before.txt`, `recall-action-before.txt` and `geometry-falsifier.txt` retain failures from the old behaviors; passing unit tests exercise the actual mounted provider/quiz or data parsers. `scripts/check-operability-geometry.mjs` checks the captured observations; it does not render an unseen future build. The 40-cell default-state comparison is not a fresh full-estate spatial sweep.
