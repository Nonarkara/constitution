# The round the drawings were redrawn — Found / Changed / Verified / Remaining

**Repo:** `/Users/nonarkara/Projects/constitution` · **Date:** 2026-10-25
**Law:** `docs/MSH-LAW.md` (Dr Non's text, verbatim) · **House style:** `STYLE.md`

---

## What was asked

Two things, in the same message:

1. **The drawings.** Three reference strips attached, with: *"Use this style of cartoon of Tikki (these
   ones do look like Tikki enough and they are objectively cute — can turn into stickers easily for
   people to share since they're so cute.) — the one I recently saw isn't as cute."*
2. **The journey.** *"Further audit the system to make sure the user's experience from opening the
   system for the first time → taking the real test after using our system is to learn is seamless,
   fun, effective, and useful to the real-world too (not just for the exam) through our design of
   memory palace systems that make people effectively remember graphics/charts/cartoons so that they'd
   recall the clues to the answers."*

### The first finding was that the attachments were already in the product

The three strips Dr Non sent are not references to something new. They are the memory palace's own
panoramas, picture for picture:

| attachment | the file it is | mean abs pixel difference |
|---|---|---|
| strip 12-02-04 | `public/illustrations/palace-1.webp` | **2.8** |
| strip 12-02-12 | `public/illustrations/palace-2.webp` | **2.4** |
| strip 12-02-26 | `public/illustrations/palace-4.webp` | **3.4** |

(The comparison resized both to 1400×467 and took the mean absolute difference over the three channels.
Anything above about 40 means a different picture; the unused fourth panorama scores 47.8 against the
same strips, which is how the matching was made in the first place.)

So the style he approved already shipped, in the four wide scenes the sixteen rooms are cut from. The
drawings that were *not* like Tikki — the thirty-five plates with a lone girl at a desk, rebuilt at
2026-10-25 09:52 — were the ones to replace. **Those four panoramas were left untouched**, and the
release gate checks that: every plate in the manifest is checked against the master it names, and the
five scenes that keep their own ground are listed separately with their own hashes.

---

## Found

1. **The drawings did not look like Tikki.** The thirty-five plates were crayon scenes of a girl alone
   at a desk: no duck, no animal friends, a harder and flatter palette than the house's own
   panoramas. Dr Non's phrase *"the one I recently saw isn't as cute"* pointed at exactly these.
2. **The memory house's first screen contradicted its own instruction.** The page's own instruction
   reads *"see the picture, recall the rule, then answer"* — and the page put the **answer button**
   first and the picture almost two screens down, with all sixteen room thumbnails in between.
   Measured on the build that shipped before this round, at 390×844:

   | | the answer button | the sixteen tiles | the room's picture |
   |---|---|---|---|
   | before | y=456 | y=586–1878 | **y=2052** |
   | after | y=607 | y=1499 | **y=728** |

   The picture sat **1,596 px below the button** that told the learner to look at it, and the
   sixteen tiles came between them. The learner was told to see a picture that was not there.
3. **The memory palace's picture reaches one question in ten.** Measured over the bank of 470
   questions in `data/questions.json`, through the shipped cue code (`lib/cues.ts`,
   `memoryCueFor`): the recall test shows a palace picture for **49 (10.4%)** of them. For the
   questions that turn on a counted number — the exam's traps — it is **8 of 84 (9.5%)**.

   The gap is the rule doing its job, and it has to be counted against the right set. The shipped
   rule matches **62** questions — a question whose sections contain *all* of some room's sections —
   and refuses **13** of them: **eleven on §256 and two on §158**. Those rooms teach the
   *amendment* rule and the *cabinet* rule, and a question about the signature count is not that
   rule, so showing the room would put a picture of one rule beside a question about another. The
   cue is refused instead. 62 − 13 = 49.

   *(Two counts of "the questions a picture could reach" exist, and they are not the same
   measurement. A question that contains **all** of some room's sections matches **62** — that is
   the set the 13 refusals come from. A question that merely **shares one section** with some room
   matches **86**, and the gap from 49 there is **37**: the same rule refusing over a bigger set.
   The earlier draft of this report quoted 49 and 86 in one breath and credited 13 with the gap,
   and said 62 and 15 where the shipped code's own numbers are 49 and 8. Both were wrong, and both
   were caught by a reviewer who ran the shipped code instead of trusting a count of mine.)*

   The count-trap figure is low for the same reason: 25 of the 84 sit in a room's sections, but only
   8 are questions the room's own rule answers. The other 17 are in a room that teaches a
   neighbouring rule — the section is shared, the rule is not.
4. **Forty-eight of the eighty-four count-traps have no picture anywhere in the app.** Counting the
   palace's sixteen rooms and the cram sheet's numbers together, **48 of the 84 (57%)**
   count-answer questions are covered by neither. The uncovered ones are specific and nameable:
   19 Privy Council members (§10), 60 years (§48), 15 days (§49), 51 percent (§56), minimum age 35
   (§160), 400 constituency MPs (§86), 467 votes (§177), at least 20,000 signatures (§236).

   *A caveat on the 84 itself, because the denominator is a definition:* the set is "the English
   answer states a number", and **9 of the 84 are answers that merely cite a section** — "Section
   65", "Section 149", "Section 255". Those are not counts. On the 75 that are real counts, the
   uncovered share is **39 of 75 (52%)**. Both numbers are given so neither can be quoted alone.
5. **Five links left their arrow alone on a line.** Measured at 390 px: the arrow fell to its own
   15 px line on the two home doors, on the civic notebook's amendment link, on the fine-print link,
   and on the research citations.
6. **The home page's "41 numbers" claim is true**, and is pinned by a test
   (`tests/facts.test.ts`): 20 facts + 13 time limits + 8 votes = 41, plus 7 traps. Checked, not
   assumed — it looked false at first, because the cram page renders the same 41 in three tables.
7. **Five of the thirty-five plates were sliced by the frame.** Measured on the alpha channel —
   the share of a plate's border that is a straight, fully opaque run — five plates carried a cut:
   `tikki-story-cover` had **93%** of its bottom edge cut straight across the stack of books,
   `tikki-bible-guide` **45%** down the right edge, `tikki-flashcards` **39%**, `tikki-games` **24%**
   and `tikki-exam` **23%** along the bottom. A drawing sliced by a straight line is not a drawing
   that can be cut out, and Dr Non's reason for these plates was exactly that: *"can turn into
   stickers easily for people to share since they're so cute."* The other thirty carry a torn
   watercolour edge, and those five did not.

---

## Changed

1. **Thirty-five plates redrawn in the house's own style.** Same girl (dark wavy bob, pale yellow
   sweater, blue jeans, white sneakers), same white duckling with an orange beak, same friends (brown
   bear, white rabbit, grey cat, brown owl, young deer), soft watercolour and coloured pencil on
   white paper. Every plate was generated from Dr Non's own strips as the character reference, so
   the cast is one cast and not thirty-five guesses. Each scene is built to be a **handle**, not
   decoration: three card piles for review, four coloured boxes for topics, a jigsaw piece for
   amendment, a tea service for the cabinet, a stepping-stone path for the district exam.
2. **The ground lifted off all thirty-five, for real.** The border flood fill (luma + chroma paper
   mask, grow 1, feather 3), the crop to the ink, the alpha channel — the house's own pipeline, run
   over the new drawings. The watercolour's softer edges leak more than crayon did (9,627 px in 419
   regions on `tikki-officer-pastel`); every leak was repaired from the master's own pixels, so
   **every plate ends with zero interior holes**.
3. **The memory house now shows the room first.** The room — its name, its chapter's extent, its own
   recall action, its picture, its number, its joke and its law — comes before the sixteen tiles,
   which are now the house's plan. The action sits directly under the room's name, so the learner
   meets the room and the way into it before the thumbnails.
4. **The arrows are bound to their labels** with a non-breaking space, so no arrow can start a line.
5. **Those five plates were drawn again, and the pipeline learned to lift what the flood could not.**
   The five scenes were re-drawn with the whole subject inside the sheet — the stack of books with
   the girl still standing on it, the table with its legs ending inside the picture — and with no
   floor or ground plane running to the edge. The remaining straight cuts are gone: the worst
   border on the five is now **0.6% / 1.0% / 1.6% / 0.1% / 0.7%**, against 93% / 45% / 39% / 24% /
   23% before.

   Two of the five still came back with a pale slab in a corner — paper the flood could not reach,
   because the drawing's own wash had cut it off from the edge of the sheet. Measured, that slab
   was bright and neutral (chroma 0.008–0.032) at a luma of 232–233: paper, three units under the
   pipeline's 236 threshold. So the pipeline now lifts a detached region that is **90% paper-like
   under a relaxed mask and at least 2% of the plate** — a slab, not a speck, and not part of the
   drawing. The white page of a notebook, the duckling, the rabbit and the teacup are all bright
   and neutral too, and none of them is touched: each is enclosed by the drawing's outline or
   carries a beak, an eye or a rim, so it is either the drawing's body or not paper-like.

   The rule was proved rather than hoped for: re-deriving all thirty-five plates with it changed
   **exactly two** of them — the two that had the slab — and left the other thirty-three
   **byte-identical**.

---

## Verified

| check | result |
|---|---|
| `npm test` | **pass** — 251 tests, 0 failures |
| `npm run typecheck` | **clean** |
| `npm run check:illustrations` | **pass** — 35 plates measured for real transparency, 10 re-derived from their masters byte for byte, no interior holes, no frame painted behind them; 5 scenes keep their own ground |
| `npm run check:layout` | **pass** — 145 measurements across 29 routes at 390/721/860/1024/1440 px; no horizontal overflow, no all-zero readouts, no empty labelled regions |
| `npm run check:hierarchy` | **pass** — 116 measurements across 29 routes; one title, title wins, competing actions capped |
| `npm run check:release` | **PASS** — CSS comment integrity, undefined vars, theme contrast, built links, runtime images, text encoding, anti-slop design laws |
| `npm run check:slop` | **0 points** (P0 0 · P1 0 · P2 0) |
| `npm run check:sentences` | **pass** — 9,745 passages measured, every one under 32 words |
| `npm run check:data` | **pass** — 5,102 fields carry a fact |
| `npm run check:spatial-sync` | **pass** — 3 files verified against the canonical copy and the manifest |
| `npm run check:spatial` | the receipt, re-recorded on this build — see below |

### The spatial receipt, re-recorded

`design/spatial-baseline.json` was re-recorded on this build with one full sweep:

| | |
|---|---|
| routes | **43** |
| measurements | **2,623** (43 routes × 61 widths) |
| measured at | `2026-10-26T01:35:00.033Z` |
| `measuredTogether` | **true** — one sweep, not an assembly |
| `carriedOver` | **[]** — nothing was carried over from an earlier sweep |
| decisions | **5**, each still carrying its reason |

The five decisions the receipt keeps, and why they are decisions and not defects:

| signature | the reason it keeps |
|---|---|
| `orphan` · `figure.study-art` | on `/research/` at 360–436 px the 90 px identity drawing is top-aligned beside a taller column — it is an identity mark, not a card |
| `dead` · `figcaption` | the caption is the label of a picture and stands beside it; the column it sits in is centred against the picture |
| `dead` · `p.law-text` | the statute is followed by a margin note — a second thing, not a continuation of the article |
| `dead` · `div.route-number.mono` | on `/bible/` each compact number marks reading order beside a chapter heading and its variable-length title |
| `dead` · `div.anchor-features.mono` | at 721 px and 722 px, where the rail comes back and squeezes the reading column, the three figures on the rail are a stacked group, not three stranded cells |

Getting here took three attempts. The sweep wedged twice on a single route — once on
`/cheatsheet/`, once on `/research/` — each time with the browser idle at 0% CPU rather than
busy. The root cause was not established. An idle browser is not enough evidence to rule out a page issue or identify another agent as the cause. The instrument's own watchdog killed the wedged browser, restarted it, and
**resumed from the route it had reached** (17, then 35), so no route was measured twice and none
was skipped. The run ended with the receipt written by one sweep, and `carriedOver` empty —
because it was one sweep, not three glued together.

**The memory house, measured after the change** (real browser, true device-metrics viewport):

| viewport | the room's action | the room's picture | the sixteen tiles | overflow |
|---|---|---|---|---|
| 390×844 | y=607–662 — **inside the first screen** | y=728–1021 | y=1499 | 0 |
| 1440×900 | y=540–596 — **inside the first screen** | y=661–992 | y=1355 | 0 |

The "before" row in *Found* #2 was measured the same way, on a separate build of the previous
commit (`d0843c4`) served on its own port — not on the page that was shipped.

*One measurement note, because two different numbers were reported for the 390 px row.* A render
taken against a **partially served page** — the local server had stopped answering mid-response,
so the sidebar and breadcrumbs were missing — reads 30 px higher throughout (action 577–633,
picture 698–992, tiles 1469). Against a page that was served whole, the numbers above are what
the browser reports, and they are the same at 700 ms and at 3000 ms after load, and they are what
the spatial receipt recorded independently (`firstAction` y=607 on `/memory/`). The 1440 px row
never moved, because at that width the sidebar sits in a side column and a partial page does not
move the title. The settled numbers are the ones above.

The first attempt at this change (the room first, the action *under* the picture) failed the hierarchy
gate at 390 px with a measured button at y=1033 — below the fold. It was not argued with; the action
was moved and the gate re-run.

---

## Remaining

1. **The house still teaches sixteen rules, and the exam traps on more than that.** The palace's
   picture reaches 10.4% of the 470 questions and 9.5% of the 84 count-traps; 57% of the count-traps
   have no picture in the palace or on the cram sheet. The list of what is missing is in *Found* #4.
   Growing the house is a content job, not a code job: each new room needs a rule, a meaning, a joke,
   a check question — and a panel in a panorama, because the sixteen rooms are cut from four scenes.
   The thirty-five new plates prove the pipeline can draw them; the house's structure, not the art,
   is what has to change.
2. **The cues have not been evaluated with learners.** The memory house says so on its own page, and
   it is still true. Nothing in this round measures whether a picture makes a number stick.
3. **The first screen of a phone spends 176 px on the site's chrome before the page title.** On
   `/memory/` at 390×844 the h1 starts at y=176 — **20.9% of the 844 px first screen** spent
   before the page says what the page is. The picture and the action both live below that line.
   The chrome was not reworked in this round; it is measured here so the next one sees it.
4. **The Thai heading widows.** A scan of all 43 routes at **390 / 721 / 1440 px** found headings
   whose last line carries a single short word. These are Thai line-breaking artefacts — the last
   word is one dictionary word that will not fit — not invented space, so they were left alone
   rather than "fixed" by shrinking type the law forbids. (1024 px was not in that scan; the
   spatial receipt does measure 1024 and 1025, but for holes and overflow, not for widows.)
5. **The shared spatial instrument tolerates a hole up to 50% of a cell.** Its thresholds were not
   changed, because four other projects' receipts depend on them; the product was fixed instead.
