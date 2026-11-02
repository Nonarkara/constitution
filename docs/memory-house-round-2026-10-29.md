# The round the house learned the numbers — Found / Changed / Verified / Remaining

## What was asked

The previous round ended with seven items. Two of them were about the gate
that measures this codebase; one of them was the product's own gap, and it
identified a gap between the memory rooms and the exam numbers:

> The house still teaches sixteen rules, and the exam traps on more than that.

This round took all three, and in the course of taking them found the trap
the gate itself was hiding.

The product's thesis is that a learner remembers a picture and the picture
carries the answer. The house had sixteen rooms, one per numbered chapter,
each with a scene and a joke. The cram sheet had forty-one numbers, the ones
the exam asks about. **Nothing joined the two.** A learner could see a
picture of a chapter and a list of numbers, and no handle existed for either:
the house taught no number at all.

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
| numbers with a handle (a memorable image) | **0** |

The forty-one numbers were reference entries: a number, a label, a section
link. They could be looked up, but they offered no explicit mnemonic.

### 2. The match rule could not name a rule

A cue was a room, and a room was a chapter. Sixteen loci cannot cover 279
sections. The old rule fired only when a question cited *exactly* a room's own
section or sections, and refused whenever the room's section appeared
alongside another rule's section. So the picture's reach was an accident of
the section list rather than of what the exam asked — and it reached one
question in ten.

### 3. A number is ambiguous without its unit

"Five" is five percent of the House, five years, or five judges. The first
draft of the matcher compared bare digits, and duly put the five-percent rule
beside a question about a five-year limit. The unit is part of the number.

### 4. A reference is not a count

"Chapter 15" is a chapter. "15 days" is a wait. The first draft read the
chapter as the wait and put the fifteen-day rule beside a question about which
chapters an amendment must touch.

### 5. "Two hundred and fifty" is not fifty

The number a rule is about and the number an answer states have to be the same
number. The first draft compared them as substrings, so a rule about fifty was
satisfied by "two hundred and fifty".

### 6. The gate could not tell one navigation from the next

The harness identified the frame by a query token. The app rewrites its own
URL when it hydrates and drops the query string, so the token went with it:
the measurement became a race with the hydration, and winning that race early
is how a cell comes to measure a page that has not painted.

### 7. The gate measured a directory that was being rewritten underneath it

This is the finding that cost the previous round its receipt cell, and it was
found twice — independently, by two agents on this codebase.

**A build that rewrites `out/` while a sweep is running replaces the HTML
before the chunks that HTML names. The page then renders but never hydrates:
the title is there, the first action is there, and every button does nothing.**

The gate cannot see that failure. It compares holes and drift, and a page
that never became interactive is neither a hole nor a drift — so the receipt
recorded a route that answered, at a width, with no complaint. The previous
round's "dead cell" was a cell of exactly this kind: a route that answered
and had nothing in it.

### 8. The retry budget was five

A broad browser-kill command on a shared machine could take the gate's browser out from under it. This is a possible failure mechanism, not evidence that another agent issued that command during this run. A sweep killed at the twentieth minute
should try again rather than report a collision as a design failure. Five was
barely enough; a budget that is barely enough is a budget that produces a
false failure on the next busy afternoon.

### 9. The content had to be fact-checked, not just written

A second agent audited the first draft of the catalogue against the statute
and found real errors in it: the House's and the Senate's terms counted from
the wrong day, the budget's 105 days belonged to the House and not to
Parliament, a rule claimed a section cross-reference the section never makes,
a mnemonic made seven judges into the King, and the Chinese drifted from the
corpus's own vocabulary. **Every one of those was checked against the Thai
text again before this round was signed** — §99 counts from the election,
§109 from the announcement of results, §143 gives the 105 days to the House,
§83 never mentions §86, and the corpus says 众议院 and 监察专员, so the
catalogue says 众议院 and 监察专员 too.

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

The catalogue is **generated**, not hand-edited: `scripts/authoring/build-rules.mjs`
builds it from the authoring sources, and `npm run check:rules` fails if the
committed data has drifted from the build. It is wired into `verify` and
`release`.

### The cue now names the rule, and proves it before it shows itself

`lib/rules.ts` is the join. A cue is only shown when **the answer states that
rule's number** — the number compared as a number, with its unit, with
fractions treated as fractions and "Chapter 15" treated as a reference. The
app shows its cues only after the learner has answered, so the answer is known
by then and nothing is spoiled.

The room stays the locus. A rule in chapter 7 shows chapter 7's picture; a
rule in chapter 17, the transitional provisions, has no room and shows the
number and the handle without a picture, because the house's own design keeps
the transitory chapter in an attic rather than in a room.

### The instrument, at its canonical home

Three changes in `~/.minimax/skills/spatial-law/bin/spatial-check.mjs`, which
four other projects copy:

1. **The frame is identified by its path, and by being fresh.** The path
   survives a URL rewrite; freshness is proved by the document's own clock
   (`performance.timeOrigin`). The token is no longer load-bearing.
2. **The page must be rendered before it is measured** — the same rule the
   hierarchy gate already follows: a title with a real box, a main that is not
   standing at `data-study-ready="false"`, the fonts loaded.
3. **The gate measures a snapshot of the directory.** The copy is made once,
   before the first measurement, and every route, every stylesheet and every
   chunk is read from it. A build that rewrites the directory mid-sweep can no
   longer serve one sweep two different sites.
4. **The retry budget is twelve,** not five.

The canonical copy was then vendored back into this repository. The November integration verified `npm run check:spatial-sync` against both the canonical copy and committed hashes. The snapshot copy is not atomic against a simultaneous build during the copy itself; release verification must finish the build before starting a sweep.

---

## Verified

### The suite

`npm test` — **267 tests, 267 passed, 0 failed** (the previous round's 259,
plus eight new ones for the rule catalogue). `npm run typecheck` clean.
`npm run build` succeeds.

The eight new tests are the proof of the cue rule:

- every rule carries a handle in all three languages;
- every rule's number is proved by the statute, and its room is a real room;
- **no cue is shown unless the answer states that rule's number** — checked
  over all 470 questions through the shipped `memoryCueFor`;
- the house reaches the numbers the exam traps on;
- a number the rule does not teach is not read as the rule's number
  ("five years" does not satisfy the five-percent rule; "two hundred and
  fifty" does not satisfy the fifty rule; "Chapter 15" does not satisfy the
  fifteen-day wait);
- every number the cram sheet shows has a handle;
- the catalogue is the build's output, not an edited copy;
- the district exam topics still carry a rule where one applies.

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

Every one of the seventy-two rule cues was read against the question it
would stand next to — the prompt, the answer and the rule's own meaning,
side by side. The subsequent independent review on 3 November found one wrong association: `civic-06` matched the between-readings 15-day wait despite asking about the wait after final approval. The November release fixes this; the original universal claim is withdrawn.

### The study journey, in a real browser

The built site was served and driven: open the house → pick room 7 → "try up
to five recall questions" → recall first (write before you see the choices) →
choose → check → the rule, the answer map, the joke, the citation, the cue
card and the walk-onto link. The cue card reads:

> ภาพขำ ๆ ช่วยจำ · 1 — เป็ดดึงจิ๊กซอว์จนเหนื่อย แต่ชิ้นเดียวก็ยังเป็นชิ้นเดียว → มาตรา 1

and the room 7 shelf carries its numbers with their labels, folding when a
room holds more than eight.

### The receipt, re-recorded

See the section below; the sweep was run against a snapshot of the final build
with the fixed instrument.

---

## Remaining

1. **Chapter 17 has no picture.** Nine rules — the transitory numbers, the
   first Senate's 250, the first election's 150 days — live in the attic,
   because the house's own design keeps the transitional chapter out of the
   rooms. Their cues carry the number and the handle and no picture. Making
   the attic a place with a picture is an art job, not a code job.

2. **Twenty-five rules are never reached by a question.** They are taught and
   reviewable in the house and on the cram sheet, but no question in the
   470 turns on them. That is not a defect — it is the catalogue being wider
   than the exam — but the reach figure would move if the bank grew.

3. **The handles have not been evaluated with learners.** The house says so
   on the page, and it is still true. The app can now measure the thing
   itself: the review queue knows which questions were missed, and a cue
   could be compared against the same question answered without one. That is
   a study, not a feature.

4. **The canonical instrument has not been propagated to the other four
   projects that carry a byte-identical copy** (horizon assessment,
   Jakarta-dashboard, each, nonarkara-org). The canonical copy is fixed and
   this repository is synced; the five projects that deliberately diverged
   were left alone, and so were these four — **on purpose**. The
   Jakarta-dashboard manifest says it plainly: "When the skill package
   moves, copy the files again, update the hashes here, and re-baseline — and
   READ the diff, because a new instrument finds things the old one could not
   see." Copying the new bytes without re-baselining those four receipts would
   break four gates; re-baselining them is four more sweeps and four more
   rounds of fixing whatever the new instrument finds, which is each project's
   own work and not this session's. The fix is in the canonical copy, which
   is where the next copy comes from.

5. **The spatial receipt covers 43 routes and 61 widths.** The sweep records
   what it measured. It is not a substitute for a second reviewer, and this
   round's author is not a second reviewer.
