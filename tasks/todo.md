# Go-live build — 12 October 2026

Decisions (Dr Non): highlights/notes on device (export/import covers them); question bank covers every section (~400–500, double-checked against Thai, labelled); extras: mock exam, clickable cross-references, glossary, my-notebook page, flashcards, games, indexes, memory palace.

## A. Launch blockers (audit)
- [ ] Progress load drops unknown question IDs instead of wiping everything; back up raw blob before overwrite; multi-tab `storage` sync
- [ ] Thai/EN/ZH 404, error and global-error pages inside the app shell
- [ ] `_headers`: CSP, nosniff, referrer, permissions; immutable cache for `/_next/static/*`; exclude `_headers` from precache
- [ ] Per-route titles/descriptions, OG image 1200×630, sitemap, robots, canonical
- [ ] Precache weight: drop 3.7 MB podcast cover from precache; WOFF2 fonts
- [ ] Corpus off the shared chunk where it is not needed (Sources, Settings, Rights/Ask)
- [ ] Remove invented exam weights from lib/adaptive.ts (context.md invariant: no invented exam-frequency rankings)

## B. Read the whole constitution
- [ ] `/read/` continuous chapter reader: all sections of a chapter in sequence, chapter index, TH/EN/ZH toggle
- [ ] Select-text highlighting (range-anchored on Thai/EN/ZH text) + notes per highlight; migrate whole-section highlights
- [ ] Bookmarks
- [ ] Clickable `มาตรา N` cross-references with an in-place peek
- [ ] Glossary: marked terms open a plain TH/EN/ZH definition

## C. Question bank to every section
- [ ] Draft per chapter (parallel), each question cites its sections
- [ ] Independent verification pass against Thai text; reject/fix
- [ ] Validator: every section 1–279 has ≥1 question; ids unique; trilingual; answer valid

## D. Practice modes
- [ ] Mock exam: timed mixed test, chapter score breakdown, no effect on gentle practice schedule unless answered
- [ ] Flashcards from bank + glossary
- [ ] Games: match section↔topic, speed "which section?"
- [ ] Subject index (A–Z topics → sections)
- [ ] Memory palace: chapters as rooms

## E. My notebook
- [ ] One page of highlights, notes, bookmarks, filter by chapter, jump back to text

## Verify each slice
`npm run verify && npm run build && wrangler deploy`, live URL check, phone 375px + iPad width, commit + push.
