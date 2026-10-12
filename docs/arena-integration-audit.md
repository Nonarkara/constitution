# Practice arena integration — 12 October 2026

Baseline: faf9d51 was pushed but not live. The preceding Cursor changes were already squash-merged in ef9d9b0; their tree matches the branch tip, so no duplicate merge is needed.

Browser reproduction found the second correct answer showing 200% and all 30 competition questions offering their correct answer first. The arena now shuffles localized choices once per session with the existing Fisher–Yates utility and retains the correct answer mapping. Its score is derived from submitted question identities rather than a question cursor. Labels follow the learner's language.

A fully mastered repair queue previously opened an empty active session. It now keeps the mode picker visible and explains that nothing needs repair. Unverified claims that the generated study bank contains real exam questions were replaced with original-study-question wording.

Verification: 52 tests, corpus/translations/cases/question validators, TypeScript, and production export pass. Tests enumerate all 24 possible choice orders for every competition question and retain its correct text in TH/EN/ZH. Browser preview answered the first two correctly (100% each), with answers at different positions. A local imported fixture marking all 454 questions mastered produced the repair empty-state message, with no console errors.

The upgrade retains the existing whole-text reader, annotations, mock exams, games, flashcards, section audio, and new chapter collection. This integration audit does not certify every generated question's legal interpretation or replace actual iPad hardware verification.
