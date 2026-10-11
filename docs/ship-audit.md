# Ship audit — 12 October 2026

This release is a public, anonymous Constitution study notebook. OCSC adjacent material remains outside the agreed scope.

| Requirement | Evidence | Status / limits |
|---|---|---|
| Actual Constitution, 279 sections | Corpus integrity validator; exact PDF URL/page citations; source hashes | Thai consolidated through 2021 amendment; later enacted amendments not found in this build's primary-source research |
| TH / EN / ZH section reading | 279 full Chinese translations; current English amendments; targeted English corrections; citation/cross-reference validation | Study translations are explicitly unofficial; targeted fidelity review is not independent legal certification |
| Chapter learning and mastery | 51 distinct trilingual questions covering all 16 chapters and transitory provisions; correct-answer/mastery tests | Introductory practice set, not a comprehensive or official exam bank |
| Retrieval, spacing, energy, streak | Scheduling, early-answer, Bangkok-midnight and energy tests | Research supports retrieval/spacing; exact schedule and threshold are design choices |
| Three-language search | Thai, English and Chinese queries exercised; Thai-digit section lookup | Relevance ranking. Actual exam-frequency ranking remains unimplemented without a verified past-paper corpus |
| Listen per section and as podcast | 837 MP3s verified against source text digests, checksums, size and duration; three feeds of 279 enclosures | Synthetic voices; Senate human tracks retained separately with edition uncertainty |
| Offline | Full export precache audit: all HTML dependencies included; first-install ready UI; worker tests for dependencies, range seeking and recording revision eviction | Real browser reload, Thai-number search, saved recording playback, practice feedback and progress persistence passed with the preview server stopped; native iPad verification remains outstanding |
| Voice input | Recognition-language stale callback test; search UI; keyboard dictation fallback | Actual microphone recognition and iPad keyboard dictation require device verification |
| Phone / iPad layout | Browser checks at 320 and 1366 pixels with large text; no horizontal overflow | Viewport checks do not certify native iPad Safari or home-screen installation |
| Handmade-looking illustration | Original generated reading/listening/review scenes, prompts retained | User-authorized crayon-style images, not claimed to be hand drawn |
| Meaningful interaction | Institution branch selection exercised; bill/amendment overviews retained; reduced-motion styling | Text equivalents retain legal caveats and citations |
| Anonymous progress | Immutable learning-state tests; import rejects inconsistent levels, impossible dates and unknown IDs | Browser-local; export/import, no automatic cross-device sync |

Validation: `npm run verify` passes 22 tests plus TypeScript and corpus/translation validators. `npm run build` validates every recording and produces a versioned complete offline export. A fresh independent review found and reproduced offline-save lifecycle/cache defects; both were fixed with regression tests. Browser preview plays all three recordings, pauses the previous player on takeover, and confirms a selected recording save.

Publication evidence belongs to the Sites saved version and its pushed commit. Do not call the complete original brief verified merely because the automated suite passes; the device checks and exam-frequency limitation above remain explicit.

Real offline check: a fresh origin on localhost:3053 installed the kit and saved English section 27 without prior playback. The preview server then exited. Settings and learning pages reloaded, Thai-digit ๒๗ search worked, the saved recording played (duration 70.619 seconds), and a correct practice answer remained 1/3 mastered with 10 XP after reload. No browser console errors were observed.
