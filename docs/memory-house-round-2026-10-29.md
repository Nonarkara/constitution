# The round the house learned the numbers — Found / Changed / Verified / Remaining

## What was asked

*Every question must be answerable in one read, however hard — and in Thai the
eye needs short phrases to take the letters apart and get the meaning.*
*Tikki's pictures must not look like afterthoughts: they are the memory palace,
so they have to be intrinsic to what the learner is asked to notice.*
*Nothing may fail; the system is a showcase with a future.*

The previous round ended with seven items. Two were about the gate that
measures this codebase; one was the product's own gap, and it was the largest
thing anyone had found in this codebase in a year:

> The house still teaches sixteen rules, and the exam traps on more than that.

This round took all of it, and in the course of taking it found the trap the
gate itself was hiding.

---

## Found

### 1. The house taught no number at all

Measured with the shipped code, not estimated:

| | before |
|---|---|
| questions carrying any cue | 55 of 470 (11.7%) |
| …of which carry a picture | 49 of 470 (10.4%) |
| questions whose answer states a number | 75 |
| …of those carrying any cue | 10 of 75 (13.3%) |
| numbers the app teaches | 41 |
| numbers with a handle — a memorable image | **0** |

The forty-one numbers were reference entries: a number, a label, a section
link. They could be looked up. They could not be remembered. The house's
sixteen rooms each carried a § label, a scene and a joke, and nothing joined
the two halves.

### 2. A cue could not name a rule

A cue was a room, and a room was a chapter. Sixteen loci cannot cover 279
sections, so the old rule fired only when a question cited *exactly* a room's
own section, and refused whenever that section appeared beside another rule's.
The picture's reach was an accident of the section list rather than of what
the exam asked.

### 3. A number is ambiguous without its unit

"Five" is five percent of the House, five years, or five judges. The first
matcher compared bare digits, and duly put the five-percent rule beside a
question about a five-year limit.

### 4. A reference is not a count

"Chapter 15" is a chapter; "15 days" is a wait. The first matcher read the
chapter as the wait.

### 5. "Two hundred and fifty" is not fifty

The number a rule is about and the number an answer states have to be the
same number. The first matcher compared them as substrings.

### 6. The gate could not tell one navigation from the next

The harness identified the frame by a query token. The app rewrites its own
URL when it hydrates and drops the query string, so the token went with it:
the measurement became a race with the hydration, and winning that race early
is how a cell comes to measure a page that has not painted.

### 7. The gate measured a directory that was being rewritten underneath it

**A build that rewrites `out/` while a sweep is running replaces the HTML
before the chunks that HTML names. The page then renders but never hydrates:
the title is there, the first action is there, and every button does nothing.**

The gate cannot see that failure. It compares holes and drift, and a page that
never became interactive is neither — so the receipt recorded a route that
answered, at a width, with no complaint. Two agents found this independently:
the previous round's "dead cell" was a cell of exactly this kind.

### 8. The sweep died from the state it had accumulated

The same sweep hung at the fifteenth route when run in one go, and every route
passed alone. Forty pages in one frame keep their JavaScript, their timers,
their canvases and their WebGL contexts; the sweep died on state it had
accumulated rather than on anything to do with the page in front of it.

### 9. A question written as one sentence is a question read twice

Thai is written without spaces between words, so a stretch of glyphs has to be
segmented into words before it can be read at all. The corpus writes its
clauses separated by spaces and the house's own copy does the same — "หยุดวาดความเข้าใจสักภาพ", "ดูตัวเลือกและตรวจความคิด" — but the question banks were written as sentences, because that is how the exam writes them, and the reader has to do by hand the segmentation the house does everywhere else.

### 10. The content had to be fact-checked, not just written

A second agent audited the first draft of the catalogue against the statute and
found real errors: the House's and the Senate's terms counted from the wrong
day, the budget's 105 days belonged to the House and not to Parliament, a rule
claimed a cross-reference the section never makes, a mnemonic made seven
judges into the King, and the Chinese drifted from the corpus's own
vocabulary. **Every one of those was checked again against the Thai text
before this round was signed** — §99 counts from the election, §109 from the
announcement of results, §143 gives the 105 days to the House, §83 never
mentions §86, and the corpus says 众议院 and 监察专员, so the catalogue says
众议院 and 监察专员 too.

---

## Changed

### The rule catalogue — 86 rules, every number with a handle

`data/handles.json` gives every rule a **meaning** (the rule the number
decides) and a **joke** (one concrete image to carry it by), in Thai, English
and Chinese. `data/facts.json` grew from 20 facts to 58: the count-rules the
exam traps on and the app had never registered — nineteen Privy Council
members, sixty years, fifteen days, fifty-one percent, ninety-five percent,
four hundred constituency seats, four hundred and sixty-seven votes, twenty
thousand signatures, the two hundred and fifty of the first Senate — each
proved by the Thai words of its own section, so the statute checks the data
rather than an author's memory.

The catalogue is **generated**, not hand-edited:
`scripts/authoring/build-rules.mjs` builds it from the authoring sources and
`npm run check:rules` fails if the committed data has drifted from the build.

### The cue now names the rule, and proves it before it shows itself

`lib/rules.ts` is the join. A cue is only shown when **the answer states that
rule's number** — compared as a number, with its unit, with fractions treated
as fractions and "Chapter 15" treated as a reference. The app shows its cues
only after the learner has answered, so the answer is known by then and
nothing is spoiled.

The room stays the locus. A rule in chapter 7 shows chapter 7's picture; a
rule in chapter 17, the transitional provisions, has no room and shows the
number and the handle without a picture — which is what the evidence says,
rather than a picture of another chapter's room.

### The questions, in phrases the eye can take in

`scripts/authoring/space-thai.mjs` breaks the question banks' Thai into
short phrases, and it inserts spaces and nothing else: a space in Thai does
not change a word, so it cannot change the law. `scripts/check-data-integrity.mjs`
proves it — **5,102 fields carry a fact, and every number, section reference
and modal verb is unchanged.**

Two things are never broken: a section reference ("มาตรา 30" is one thing),
and a word the statute writes whole — checked against the statute itself, so
the rule is the law's own vocabulary rather than a list somebody wrote down
and forgot.

### The gate, at its canonical home

Four changes in `~/.minimax/skills/spatial-law/bin/spatial-check.mjs`, which
four other projects copy:

1. **The frame is identified by its path, and by being fresh.** The path
   survives a URL rewrite; freshness is proved by the document's own clock
   (`performance.timeOrigin`). The token is no longer load-bearing.
2. **The page must be rendered before it is measured** — the same rule the
   hierarchy gate already follows.
3. **The gate measures a snapshot of the directory**, copied once before the
   first measurement, so a build that rewrites the directory mid-sweep can no
   longer serve one sweep two different sites.
4. **A fresh frame for every route**, so the sweep cannot die on the state it
   accumulated — and the retry budget is twelve, not five.

### The streets

Five real Bangkok blocks, drawn by "どこでもロケハン" (Location Scout) from
OpenStreetMap and elevation data as manga line art and screentone — the
house's own language — with Tikki and her duck standing in the scene. Each
street carries a paper tag naming the place and the number its page turns on,
because a picture that does not name what it is for is decoration.

The credit is burned into the bottom of every picture by the tool itself, is
written out on the sources page, and is recorded in `data/sources/streets.json`
with the terms.

---

## Verified

### The suite

`npm test` — **267 tests, 267 passed, 0 failed** (the previous round's 259,
plus eight for the rule catalogue). `npm run typecheck` clean. `npm run build`
succeeds.

The eight new tests are the proof of the cue rule: every rule carries a handle
in all three languages; every rule's number is proved by the statute and its
room is a real room; **no cue is shown unless the answer states that rule's
number** (checked over all 470 questions through the shipped `memoryCueFor`);
the house reaches the numbers the exam traps on; a number the rule does not
teach is not read as the rule's number ("five years" does not satisfy the
five-percent rule, "two hundred and fifty" does not satisfy the fifty rule,
"Chapter 15" does not satisfy the fifteen-day wait); every number the cram
sheet shows has a handle; the catalogue is the build's output, not an edited
copy; and the district exam topics still carry a rule where one applies.

### The reach, measured

| | before | after |
|---|---|---|
| questions carrying any cue | 55 (11.7%) | **118 (25.1%)** |
| …carrying a picture | 49 (10.4%) | **105 (22.3%)** |
| …carrying a named *rule* | — | **72 (15.3%)** |
| count-answer questions with any cue | 10 of 75 (13.3%) | **64 of 75 (85.3%)** |
| count-answer questions with a picture | — | **55 of 75 (73.3%)** |
| count-answer questions with a named rule | — | **61 of 75 (81.3%)** |
| numbers the app teaches | 41 | **79** |
| numbers with a handle | 0 | **79** |
| rules reachable from a question | — | **61 of 86** |

Every one of the seventy-two rule cues was read against the question it would
stand next to — the prompt, the answer and the rule's own meaning, side by
side. Not one of them was wrong.

### The reader's load

`npm run check:thai-phrases` — **6,132 Thai fields re-spaced, 23,573 stretches
measured**, and every one of them is what the re-spacer produces, so the file
and the tool that wrote it cannot disagree. The longest stretch left is
94 characters, and it is a clause with no joint in it to break at.

### The facts

`npm run check:data-integrity` — **5,102 fields carry a fact — every number,
section reference and modal verb unchanged.** The re-spacing changed what the
eye has to do, and nothing else.

---

## Remaining

1. **The spatial receipt has not been re-recorded on the final build.** The
   instrument is fixed — frame by path, rendered before it is measured, a
   snapshot of the directory, a fresh frame per route, twelve attempts — but
   the receipt in `design/spatial-baseline.json` still describes the build
   before the rule catalogue, the streets and the re-spacing. Until it is
   re-recorded, the receipt and the site disagree, and the gate will say so.
2. **Chapter 17 has no picture.** Nine rules — the transitory numbers, the
   first Senate's 250, the first election's 150 days — live in the attic,
   because the house's own design keeps the transitional chapter out of the
   rooms. Their cues carry the number and the handle and no picture. Making
   the attic a place with a picture is an art job, not a code job.
3. **Twenty-five rules are never reached by a question.** They are taught and
   reviewable in the house and on the cram sheet, but no question in the 470
   turns on them. That is the catalogue being wider than the exam, not a
   defect — but the reach figure would move if the bank grew.
4. **The handles have not been evaluated with learners.** The house says so on
   the page, and it is still true. The app can now measure the thing itself:
   the review queue knows which questions were missed, and a cue could be
   compared against the same question answered without one.
5. **The canonical instrument has not been propagated to the other four
   projects that carry a byte-identical copy** (horizon assessment,
   Jakarta-dashboard, each, nonarkara-org). The canonical copy is fixed and
   this repository is synced; the five projects that deliberately diverged
   were left alone, and so were these four — on purpose. The
   Jakarta-dashboard manifest says it plainly: "When the skill package moves,
   copy the files again, update the hashes here, and re-baseline — and READ
   the diff, because a new instrument finds things the old one could not see."
   Copying the new bytes without re-baselining those four receipts would break
   four gates; re-baselining them is four more sweeps and four more rounds of
   fixing whatever the new instrument finds, which is each project's own work.
6. **The receipt covers 43 routes and 61 widths.** It records what it measured.
   It is not a substitute for a second reviewer, and this round's author is
   not a second reviewer.
