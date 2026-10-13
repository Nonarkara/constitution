# Audit of audits — 13 October 2026

Historical audit documents remain evidence of their own revision and test scope. They do not establish the current customer journey. A fresh independent reviewer inspected the earlier audit claims against the implementation and the expansion diff.

## Confirmed failures and repairs

1. Backup import could report success after Provider swallowed a storage failure. Settings now persists the complete import before adopting React state or reporting success. It creates a pre-import recovery copy, attempts rollback, and distinguishes incomplete rollback. Fault-injected storage tests prove abort/rollback behavior.
2. Blank exam answers appeared among misses but were not scheduled despite copy promising all misses would return. Results now separate wrong answers from blanks. Blanks stay unattempted; learners explicitly start repair practice for wrong/unanswered questions.
3. Timed exam answer positions were predictable. Thirty reproducible papers shuffle choices and remap answer identity; localized letters replace Thai-only option labels.
4. EN/ZH quiz law disclosures showed Thai-only text. They now use the selected study translation, with Thai source authority retained.
5. Weak/annotated queues could repeat the first eight cards indefinitely. Due cards, errors and unseen cards now precede already-correct cards.
6. Independent review caught generated records inflating authored attempt totals (475/470). Bank-filtered counters and a regression fixture fix this without changing chapter mastery.
7. Independent review caught a teach-back instruction without its field in exam feedback. Exam and Arena now render the field. Each field has a unique label target; drafts reset between Arena questions.

## Expansion and limits

470 authored questions are preserved. 4,230 labelled numerical application cases across ten rule families bring the catalogue to 4,700 exercises. These are parameter-generated practice, not 4,230 authored stories or official exam questions. They retain separate progress IDs, backup validation and a due-drill queue; they do not enlarge authored chapter mastery.

Thirty named paper blueprints use the authored bank: ten themes × 25/50/100 questions with 30/60/120 minutes. Papers reuse questions and include mixed supplements. Ten private polls have no public totals or graded opinions; their separate export is disclosed on Polls and Settings.

The chapter path uses one unscored scenario warm-up, optional reading, five-question practice, reasoning feedback/teach-back and spaced return. Ten progressively disclosed explanation views cover the answer, reasoning, rule, alternatives, conditions, application, changed facts, numbers, memory imagery and teach-back. This is a teaching structure, not evidence of a tenfold learning effect or a claim that all existing legal explanations received native-speaker review.

## Verification

- Full verification: 97 tests passed; corpus, translation, question, case and drill validators pass; TypeScript and static production build pass.
- Independent arithmetic: all 846 combined first/final gate cases match separately calculated thresholds. All 4,230 prompts have matching numeral multisets in TH/EN/ZH. Across 1,750 paper slots, correct answer positions are 449/415/465/421 and answer meaning is retained.
- Real local browser: English drill recall→choices→correct feedback→ten views; private poll answer/note survives reload; Chinese promise-check poll; Chinese amendment paper with localized numeric labels; blank submission displays 0 wrong/25 unanswered with no added authored review records; exam teach-back appends a note. At 375px the result has no horizontal overflow.
- Production publication and live checks are recorded in the deployment closeout below.

Browser storage is shared by anyone using the same browser profile. Polls are separate from the standard progress backup. Learning effectiveness, physical iPad home-screen behavior and microphone input still need human/device testing.

Rule sources: [Senate consolidated Constitution](https://www.senate.go.th/assets/portals/420/fileups/507/files/con2560%20edition5_4%20july%202567.pdf), [Senate amendment explanation](https://www.senate.go.th/view/386/News/Latest/368/TH-TH). The application retains section-level citations and the authoritative Thai corpus.

## Publication closeout

Source commit `063d476` pushed to `origin/main`. Cloudflare version `61729abe-2a06-422c-8138-c3e0c4e6a083` deployed to https://constitution.nonarkara.org; offline revision `3f2f41fab506c5dc` includes241shellassets. Live Learn, Drills, Polls, Exam HTML and offline-manifest bytes match the local production build exactly. Standard browser User-Agent requests returned200; Python's default urllib agent was rejected403, so that rejection is not reported as successful verification.

Live browser: hydrated Learn button enabled; new4700exercise link navigates; the three-final-gate drill opens a five-question session; no captured console errors. Local result widths375/768 have no horizontal overflow; Chinese chapter entry confirms one optional warm-up→reading→fivequestions, and exam repair opens explicitly. Live screenshot: `.openai/qa/expansion-live.png` (ignored QA evidence). Human efficacy, physical iPad/PWA/microphone checks remain unverified.
