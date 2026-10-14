# Whole-system review — 14 October 2026

Reviewed additions since f94ff88: the13-chapter TH/EN guide, cram sheet, UI changes and90 district-chief/local-government supplementary questions. Full existing Constitution bank remains470; numerical drills4230; timed papers30; private polls10. These counts describe different materials, not interchangeable official exam papers.

## Confirmed repairs

- The Organic Act source fixture contained an incorrect quotation labelled section46(2), with the wrong Gazette issue/date. Verified against the Senate-hosted official Act, PDF pages26–27 (printed20–21): section46(1) supplies the court-filing90-day clock; sections48(1)–(2) supply the60-day consideration/referral and non-referral/direct-filing rules. Replaced the fixture with verified excerpts and corrected metadata. Preserved the full official PDF and pinned its SHA256 in a regression check. The existing tests had only compared a claim with that incorrect local fixture; passing tests alone did not establish source authenticity.
- The court guide conflated section82's respective-House threshold with section148's combined-existing-membership threshold. Now separates them, with70signatories when500MPs+200senators exist.
- Court guide limits section173 review to section172 paragraphone. The amendment cram entry now uses the statutory specified-party MP group, including minister/House Speaker/Deputy Speaker exclusions, instead of the shorthand “opposition”.
- Guide explanations include separate90–60–90 clocks, earlier non-referral and continuing-violation/section47 qualification. Each clock has a distinct trigger; they are not a guaranteed210-day wait.
- New90-question `/along/` route was not published and returned404 at the start. This release includes it and explicitly distinguishes unscored supplemental topics from30timed Constitution papers. Seen-history remains browser-local and outside the scored-progress backup.
- Along initial randomisation now waits for client readiness, keeping the server/client initial render deterministic.
- All13guide routes now have shortTH/EN/ZH ideas, recall questions, answers, authoritative section links and links into a five-question chapter lesson. Chinese navigation is translated. FullTH/EN chapters are preserved behind a labelled reading disclosure; Chinese summaries do not claim to translate the entire deep guide.
- Cram “revealed” count no longer claims the learner remembered a fact merely by opening it. Organic Act tags open the official source. Sitemap includes the guide index and all13chapters; README practice count corrected.

## Coverage and boundaries

| Intended job | Surface / evidence | Boundary |
|---|---|---|
| Read/search the whole Constitution | Read, Section, Topics, Glossary; corpus/translation tests; number-search browser path |279sections; Thai authoritative; EN/ZH study corrections labelled |
| Small learning steps | Learn; chapter warm-up, optional reading,5questions, feedback, teach-back | Chapter mastery stays on470authored IDs |
| Understand/amend/check promises | Amend, Civic, Rights, Cheat sheets | Fiction/scenarios and opinions are distinguished from law |
| Exams and revision |30timed papers, Practice, Review, Flashcards, Cram, Drills, Along |470authored+4230generated;90supplementary questions are separate and not official past papers |
| Retain and connect understanding | Memory, Notes, bookmarks, annotations, Teach-back |16rooms/pastel drawings/maps preserved; no measured learning-effect claim |
| Follow relevant reporting | News, live `/api/news` dated headlines/source links | Headlines only; external reporting is not legal authority |
| Listen / speak | Section recordings,837recordings/podcasts, voice-search controls/dictation guidance | Physical microphone and iPad home-screen behavior require device testing |
| Return on own device | Provider records, due queues, Settings export/import; persistence/rollback tests | No accounts; shared browser shares records; polls export separately; supplemental seen-history excluded |
| Explain authorship and research | Research, Sources | Dr.Non attribution retained; human efficacy not measured |

## Source and independent review

Official Act: https://www.senate.go.th/assets/portals/93/fileups/257/files/rk/47_62/2561/217.pdf
Local archive: `data/sources/constitutional-court-procedure-2018.pdf`
SHA256: `b11fbbb8db99266a5b62cd77185511116059bc4073cc6e911a6a1019a8bbed87`

Fresh independent agent identified the legal/source issues, visually checked official pages and rechecked fixes. Independent suite passed104tests. No further material issue confirmed in the inspected changes. This is not a native-speaker certification or a complete human proofread of every historical narrative.

Verification and publication closeout follows below.

## Browser finding and final checks

A phone continuation test found that the supplementary Next button left focus onBODY and the next heading202pxabove the viewport. SideQuestion now focuses its own keyed heading on each question. Independent source review confirmed the focus/ref setup and deterministic initialisation; live confirmation follows.

All43exported indexHTMLpages returned200and matched the build byte-for-byte after initial publication `eac1dd1` / Worker `82083ac3-041d-4749-8434-90028c5c7880`. Live representative paths: Chinese guide→recall→chapter11warm-up; supplemental answer→datedsource→next; section-number158search→recordingplay/pause (50secondrecording, noaudioelementerror); amendment eligibilitycheck→reasoning; Chinese cramcover→onefactreveal; English amendmentpaper→blanksubmission (0wrong/25unanswered, authored due countunchanged). No horizontal overflow onguide/supplement375, cram768, examresults1280. Remaining surfaces were route/source/store/test checked, not all manually completed end-to-end in every language.
