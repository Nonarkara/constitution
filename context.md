# Constitution study

Audience: Tikky on iPad plus Thai civil-service aspirants. Public, anonymous, device-local progress. Constitution first.

Invariant: every section has one Thai legal source; translations and teaching notes never override it. Mastery counts distinct questions answered correctly, not repeated taps.

Design read: a Thai exam notebook with an open chapter index and a generous margin for listening and review.
Reference: the Vignelli-designed New York subway map (1972), for numbered routes and clear progression; the Thai Senate printed constitution for reading hierarchy.
Register: Civic. White paper, black ink, amber #f59e0b for the next action. Jost (Latin) / IBM Plex Sans Thai (Thai) / JetBrains Mono (numbers and labels). Three text sizes. No gradients, shadows, rounded rectangles or decoration. Each section has one dominant element: learning route, legal text, or quiz question. 3px chapter boundary, 1px row rules.

Stack: Next.js 16 static export. No account or paid service required. Browser speech is device dependent; missing voices and recognition have explicit fallbacks. iPad dictation works through the search keyboard even without Web Speech recognition. PWA shell caches same-origin successful requests only.

Content: Thai and English official PDFs with amendment metadata. Chinese has full, clearly marked study translations, never an official legal text. No invented exam-frequency rankings: relevance ranks use text matches and named editorial priorities.

## Illustration direction — 12 October 2026

User-authorized original AI-generated crayon drawings: scratchy wax texture, uneven outlines, warm adult study scenes, a recurring amber-sweater character. References are the six user-supplied illustration photos. Preserve the precise civic interface; drawings provide a friendly marker for reading, listening and review.

Named palette exception: **illustrated study scenes** may contain natural plant greens, skin tones and small card marks. These belong inside the artwork and distinguish objects; amber remains the only UI accent. This exception follows the user’s illustrated references and never applies to controls or legal text.

Original PNGs and full prompts are in `design/illustrations/`; lightweight WebP assets are in `public/illustrations/`. These are generated images with a handmade visual style, not claimed to be hand-drawn. No decorative animation or repeating motion.

## Ship audit

Full Chinese translations and current English study overlays retain original government text for comparison. Prepared per-section MP3s in all three languages and podcast feeds supplement device speech. Offline installation must precache every dependency of the exported app before claiming readiness. Idle players must never cancel another player; language changes invalidate old recognition callbacks; imported progress must preserve review-state invariants.

## Life-first learning and Non-Laws — 12 October 2026

Live: https://constitution.nonarkara.org (Cloudflare Worker static assets, `wrangler deploy`; account 74ad6bf8…). The OpenAI Sites edition remains for old links.

Each chapter lesson opens with a real-life puzzle from `data/cases.json` (20 cases, every chapter): guess first, then a story answer, verbatim Thai quotes and a think-first "why". Pretesting and elaborative interrogation; guesses are never scored or stored, so mastery and spaced review stay pure retrieval. `scripts/validate-cases.mjs` blocks any quote that is not byte-identical to `constitution.json`. The same cases form the Your rights shelf (`/rights/`).

Ask (`components/Ask.tsx`) sends questions the notebook cannot answer to Non-Laws (nonwriter.nonarkara.org, `/api/laws` + `/api/ask/:id`, CORS allow-listed for this origin). Only section numbers travel; the Non-Writer quotes its own vendored copy (`server/ask/constitution-th.json`, refresh with `npm run constitution <path>` there), and this app re-renders constitution rows from its own corpus. Fallback is `#laws?q=…&s=…`, a fragment that never reaches a server log.

## Civic expansion — 12 October 2026

`/amend/` is a fictional Senate-qualification proposal through the real255/256 gates: short reading, retrieval, vacancy-aware vote lab, referendum limits, opportunity-cost exercise and private reflection. Opinions earn no XP. Reflection has its own versioned local key and JSON export; Notes links back to it. Doorways/clocks are memory cues, not claims of proven learning efficacy.

`/news/` is a headline-only bulletin, harvested from fixed Matichon politics/constitution-tag and The Active/ThaiPBS RSSfeeds into Cloudflare D1. WorkerGET `/api/news`, cron every6 hours; publisher bodies are never stored. At most200 headlines shown,90-day history,7-day distinct-title keyword counts. Snapshot survives partial source failure. Native publisher language is retained. Source health and dates are visible; no public mutation endpoint.

`/research/` gives Dr. Non Arkaraprasertkul's purpose and design/testing account. Tikky may be an imagined narrative companion. Published learning research, design hypotheses, automated checks and future human/iPad testing are distinct. The actual legal text establishes institutions; their fairness or value remains a question for readers.

Design reference: the existing exam notebook and a newspaper's ruled bulletin. Story path, headline rows and research prose are different layouts because they support different tasks. Moderate variance, low motion, medium story density/high bulletin density. All earned diagrams preserved; phone360 px/tablet768 px checked.

## What you know, themes and the human pass — 12 October 2026

Themes: light, mild (warm paper, lower blue), dark (warm near-black #15140f, drawings dimmed via `--art`) and high contrast. `html[data-theme]` is set before first paint by `lib/theme.ts` (inline head script); `auto` follows prefers-color-scheme / prefers-contrast. Every colour in globals.css is a token; `tests/theme.test.ts` checks WCAG pairs per theme and that the no-JS dark fallback and swatches match. Never add a raw hex outside the theme blocks.

Dots: `/notes/` is "What you know". Invariant: every section is in exactly one state (due > known > practising > read > unseen), counts sum to 279 (`lib/knowledge.ts`). Links come only from data (`data/graph.json` via build-indexes): `cites` = the Thai text names the section (220); topic/term/question = the notebook's index, always labelled "index". Text links outrank any mix of index links. Reading counts after 4 s on screen (`constitution-read-v1`, backup v4). XP/streak still stored, no longer shown.

Human pass: no numbered eyebrows, no tracking on Thai, ↗ only for links that leave the site, no emoji in UI, three font-size tokens only, practice modes and library as ruled lists. `InstitutionMap.tsx` and `LawFlow.tsx` are unused; left in place.

## Promise-checking memory house — 12 October 2026

User-authorized expansion: `/civic/` offers four illustrated stations (door, ballot table, public square, budget desk), sixteen original TH/EN/ZH questions with mnemonic hooks, source-linked feedback and bookmarks using the existing marks store. Fictional promises from any side face the same rules; lawful participation is not equated with wrongdoing. Existing scheduling records errors for ten-minute review and successful retrieval at 1/3/7/14 days; this is adaptive retrieval practice, not an AI trained on political views. Existing progress/marks remain in browser storage and export v4. A small SameSite cookie stores only the last room, with no identity or scores. Shared browsers share records; no account is implied.

OCSC official scope and sample questions are linked, not copied or presented as a Constitution-only syllabus. ECT links distinguish party-law spending disclosure from the Constitution and whole replacement from clause amendment. Artwork generated using built-in imagegen: original crayon panorama with four meaningful objects, saved in design/illustrations/civic-palace.png and served as lightweight WebP. Prompt recorded alongside source. Existing themes, maps, translations and legal diagrams retained.

## Pastel chapter memory house — 12 October 2026

User-directed lighter palette and visual jokes extend to all16chapters: `/memory/` has four crayon atlas strips with16stations, trilingual meaning/joke/recall prompts, exact number captions and section bookmarks. A duck/kitten supplies the surprising detail; jokes never stand in for legal conclusions. Counts have units and qualifications; §labels explicitly mean section numbers. Two15-day amendment waits are not a30-day completion guarantee. Five independent-organ categories are not five members per organ. The transitory-provision attic is separated from current rules.

Illustrated cues appear beside chapters in Learn, after case reveals, and in checked-question feedback. Practice uses existing questions/scheduling; artwork and memory-palace effectiveness remain design hypotheses. Original colorful files preserved; the civic panorama now serves a sibling pastel revision. Source prompts/PNGs in design/illustrations, lightweight WebPs in public/illustrations. CSS clips atlas panels without destructive asset edits. Soft colors are artwork only; UI theme tokens stay intact.

## Understanding-first coaching — 12 October 2026

Quiz now offers recall before options (default on, freely skippable), transient drafts shown beside feedback, optional confidence checks, and learner-authored teach-back explanations appended to existing section notes. No automatic free-text grading, no confidence-based score changes, no new progress schema. Only explicitly saved explanations persist and enter existing backups. Question changes clear drafts/confidence before rendering the next options. First-attempt calibration excludes retry rounds. Debrief separates immediate correction from delayed retention, links a repair list and shows the earliest actual due time in Bangkok time. Existing spaced scheduling, shuffled choices, mastery, law citations and timed exam remain intact.

Research distinguishes high-utility practice testing/spacing from task-dependent self-explanation/interleaving/imagery (Dunlosky2013; Carpenter2022). The app's specific1/3/7/14-day heuristic and memory cues are not advertised as universally optimal or learner-validated. No punitive streak or political persuasion mechanic added.

## Three checks per guide chapter — 14 October 2026

Each of the 13 guide routes still opens with one idea, then two more checks copied from that chapter's own self-test. Thai and English match those checks; Chinese follows the study translation's terms. The long literary guide stays Thai and English. The checks do not change mastery. A test rejects a check whose Thai is not in the chapter, and rejects a Chinese answer that drops a number present in the English.

## Palette composition pass — 15 October 2026

Design read: a working Thai Constitution notebook, with one open lesson, small pastel memory drawings and a chapter index that can be scanned without reading a dashboard. Reference: the Senate's printed Constitution for text hierarchy; Vignelli's 1972 route map for chapter continuity. Civic register; variance 4, motion 1, density 4. Motion confirms presses only.

Palette intent: make the next useful action obvious while legal reading stays quiet. Relationship: neutral white/charcoal carries the text; amber interrupts sparingly; the existing muted crayon scenes supply the bounded companion field. Roles: paper/ink for reading, line/ink for hierarchy, amber for the next action and focus, existing green/red for actual answer states. Budget: predominantly neutral, small art fields, sparse amber. This uses the Wada-inspired relationship method, not a claimed historical plate. Pastel artwork is explicitly requested by the user; it is preserved, not extended into UI controls. Risks: multi-script wrapping, long chapter names, theme/large-text shifts. Proof: existing contrast tests, real 375/768/1280 browser views, dark/contrast/large-text checks and a working lesson entry.

Preserve every route, chapter picture, diagram, source, exam, saved record and accessibility theme. Change composition/chrome only. No gradients, shadows, textures, new fonts, decorative movement or new packages. Theme controls remain available through a labelled disclosure; selected language uses an underline rather than competing with the lesson's amber action. Secondary study resources belong after the lesson invitation, not before it. Mono is for numbers, not the notebook's label voice.

## Blind sitting, and Pokklong beside it — 15–16 October 2026

User's premise: you learn fastest from the real test, not from reading. Sit it blind, miss most of it on purpose, and let each miss teach the rule that makes the next question solvable.

`/along/` was a walkthrough — each question arrived with its own answer and you walked past, so a wrong answer was marked seen and never returned. It is now four phases. The brief states that you will miss most of these and that this is the intended outcome, so an all-wrong sitting is not a failure state. The blind pass shows prompt and four options and nothing else; answers are withheld to the end, as in a real sitting. Each blind miss becomes a debt in `lib/blind.ts` (pure, unit-tested) and stays owed until answered correctly on the retry. The answers pass leads with the elimination rule, then the reasoning, then what you picked against the answer, then re-asks the same question; a correct retry holds on an interstitial restating the rule rather than jumping on, because that is the beat where the learner discovers the reasoning worked. Handoff points into the guide, the night-before sheet, practice and the sections.

Every question in `data/exam-topics.json` gained a `logic` field in th/en/zh: the discriminator that transfers to the next question of that kind, distinct from the existing explanation. Two tests guard it — no Thai may survive inside an en/zh string (one did), and no two questions may share a rule. A length-ratio check was tried and removed: it flagged good rules that are tight one-liners against wordy options, and obeying it would have degraded correct content.

Pokklong (`/practice/pokklong/`, 270 checked questions; 14 unconfirmed ones hidden) is the per-chapter guess-first drill and is a sibling of `/along/`, not a replacement for it: one is a single full sitting, the other is topic-by-topic within practice.

A jsdom test plays an entire sitting (`tests/blind-ui.test.ts`). It caught two real defects: the re-ask never rendered the question, and the earned confirmation was wiped by the per-question effect before it could be seen.

## Release gate — 16 October 2026

`scripts/check-release.mjs` fails a release on three things a learner actually trips over: a `var(--x)` that no theme defines (which silently falls back and produced the 2.47:1 cram tags), theme contrast measured per WCAG class rather than one bar for everything, and every internal link across all built pages plus the sitemap and all three podcast feeds. Contrast pairs are classified text 4.5 / ui 3.0 / decorative reported-only, because `--edge` is a border colour and `--line` is a hairline — one flat bar produced false failures on decoration.

`scripts/check-generated.mjs` fails when `data/outline.json`, `graph.json`, `question-index.json` or `audio-recordings.json` no longer match a fresh build. Both run in CI after the build and in `npm run release`.

The earlier "sitemap and feeds point at /learn/" report did not hold: `/learn/` is a real page and all 41 sitemap URLs and 837 episode links resolve. Likewise 837 is not a wrong number — it is 279 sections × 3 languages, the count of recordings. Only the Thai and Chinese READMEs conflated recordings with sections; both now say 279 sections, 837 recordings.

## Outstanding — 16 October 2026

**GitHub (done).** Dependabot vulnerability alerts and automated security fixes are enabled on the private repository; Dependabot currently reports zero alerts. **Secret scanning could not be enabled:** GitHub refuses with "Secret scanning is not available for this repository" (HTTP 422). On a private repository it requires GitHub Advanced Security, which is a paid licence rather than a setting. Push protection is likewise unavailable until then. If the repo is ever made public, secret scanning switches on by itself and needs no action.

**Cloudflare Always Use HTTPS (blocked, needs a credential).** Dr Non authorised this on 16 October. It cannot be set from this machine: the only Cloudflare credential present is wrangler's OAuth token, whose scopes are `account:read`, `user:read`, `workers:write` and similar — it includes `zone:read` but no scope that permits writing zone settings, and the settings API answers it with an authentication error. Changing `always_use_https` needs an API token with **Zone Settings: Edit** for the nonarkara.org zone (zone id `8809ee955a8edb681c34f45ed8f5b765`), or a dashboard toggle. Remember it is zone-wide: it affects every nonarkara.org site on the account, and anything still calling one of them over plain HTTP will start failing.

**Leftover.** Eight unreachable CSS rules remain inside `@media` blocks; the pruner deliberately does not recurse into at-rules, so they are untouched and harmless.

## The spatial law — 21 October 2026

Dr Non named the failure this site kept shipping: **spatial hallucination** — an interface that invents a reason for things to occupy space, instead of arranging them around how people read, choose and act. The test is *"why is this here, why this size, and why this far from that?"*, and "the grid put it there" is not an answer.

It is not a styling problem. It recurs because layouts are composed from components that each know their own box while nobody decides the reader's path, because invisible constraints (the grid, the column count, the `gap`) become the visible structure, and because nobody owns the empty space, so the leftover is whatever the last rule produced.

**The law is a receipt, not a threshold.** A limit on a count cannot tell a defect from correct design — the same project's hierarchy gate had "at most 12 bold things per page" written, never compared, and it turned out unmeetable by correct design, because a dictionary of 89 headwords is supposed to have 89 headwords. A limit on a size cannot tell a section break from a hole. So instead: every hole is measured, written into `design/spatial-baseline.json` with a **written reason**, and a decision with no reason fails the build — because no reason is what "the grid put it there" sounds like when you write it down.

The instrument is shared and portable (`scripts/spatial/`, hash-verified against the canonical copy). It measures geometry; the project owns the judgment. It sweeps the project's widths **plus every cliff the CSS declares — media queries and container queries — and the pixel on either side of it** — because a layout checked at 390 and 1440 is checked at the two widths where nothing breaks, and because a fix written at a breakpoint the gate never sweeps is a fix nobody checked.

**The third review — 21 October 2026, late.** A third reviewer was given the fixed state and the same permission to be unkind. It failed the instrument on three counts and the adoption on one, and the counts were right:

- `--base` (measuring a deployed site) injected a `<base href>` that broke the app's own asset paths, so the app router rendered its **error page** and the gate measured the error page while labelling it with the route it was asked to measure. A deployed site that errored on every route would have measured zero findings and passed. The proxy keeps every path, so the injection was both unnecessary and harmful; it is gone.
- Deleting **one route** from the build switched the stale-reason rule off for the whole project, and the gate still passed. A page the receipt records and the build no longer has is now a failure in its own right.
- The stale-reason rule was route-aware but **width-blind**: a narrowed sweep judged a live reason stale. Completeness now means both axes.
- The scanner read `@media` and **not `@container`** — and the four container queries in this stylesheet are exactly where the fixes were written. The house's container queries are now named, and the gate checks whether the sweep ever put a container on its cliff.

**And the adoption failed on the receipt itself, which is the deliverable's whole point.** Four of the eight written reasons stated a fact the measurements contradicted: the hero plate is 180px where the reason said 340px, the Tikki plate is 216–258px, the third chip on the home page counts **highlighters** and not recordings, and the intro row is as tall as a plate that is 312px at the narrow end and 340px at the wide end. Two more were ambiguous or arithmetically wrong: the study plate is the *shortest* thing in its row, not the tallest, and the caption's space above and below is the picture's height **minus** the caption's. A false reason is worse than a missing one — it blesses the next thing of that shape without anybody re-reading it. All six are rewritten to say what the measurements actually show.

**The instrument grew a cross-check, and it caught a real thing.** Measuring every width by loading the page again cost one page load per (route, width) — 1276 of them, about thirty minutes on a two-core CI runner, which is why the job was being killed. The sweep then loaded each route once and measured the other widths by **resizing** the loaded page: 75 seconds, and the whole fresh-load baseline reproduced exactly. That was an assumption, so the gate proved it on every run: a handful of widths were measured a second time from a fresh page load and the two were compared. The first thing the cross-check caught was the `/settings/` page saying *"saving the study kit…"* on a fresh load and *"ready"* on a resized one — a service-worker handshake caught mid-flight. The settle now waits for the page's text to stop changing, and a difference in **prose** is recorded as a note while a difference in **geometry** is a failure. The law is about geometry; what a page says is its own business.

**That cross-check is gone, and it was the right to remove it.** The fourth reviewer showed it proved its assumption at six widths out of fifty-seven — every width below 768px — and that a page deciding its layout once, from the width it was loaded at, passed the gate with a 260px hole in it at 900px. So the resize was removed entirely: **every (route, width) is a fresh page load at that width, on a real clock.** There is no assumption left to prove, because nothing is assumed. The cost is honest and it is paid: 43 routes x 58 widths = 2494 page loads, about seventy minutes on a clean runner. The CI job's budget was 75 minutes for the whole job, which killed the sweep before it finished every time — a job that dies at the last step reports nothing, so the budget is now 150. The sweep is the gate; a gate that is never finished is not a gate.

**What the first sweep found.** Nineteen distinct decisions across 29 routes that nobody had justified. Twelve were rows that broke by accident — a row of three links wrapping two-and-one, a settings list of four, a tab row leaving a tab alone — and are now deliberate arrangements: a grid whose cells are even, or a column that is a list. Seven are compositions that were intentional and had never been said out loud: a plate in the margin, a caption centred against its picture, a statute followed by a margin note, a number column that is a timeline. Each now carries its reason.

**The instrument found three of its own bugs** while being built, all of them false confidence: a vertical menu read as a broken row, a vertical list read as a row that wrapped, and a picture cropped to a frame read as a row that lost its content. The falsifier had two more: a copy command that nested the site one level down, and fixtures pasted into markup that React hydration deleted before anything measured them. All five are fixed, and `npm run falsify:spatial` now proves every mode of the law fails at least once.

The gate, the falsifier and the instrument's own hash check are in the release chain and in CI.

**The independent review — 21 October 2026.** A second reviewer was given the fixed state and no permission to be kind. It split the verdict: the instrument **passes** (sound, portable, and its rules demonstrably bite in all four directions — a new hole with no reason fails, a reason with recorded numbers passes, a blanked reason fails, a grown hole fails), and the **fixes fail**. Three of the twelve fixes were broken, and the gate was green the whole time:

- `.reader-navigation` had been given a three-column grid at every width, but the phone rule set `order: 3` on the link — and `order` reorders grid placement too, so on a phone the title link was crushed into a 101px third column and "Next chapter" sat in the middle instead of at the right edge. The fix now gives the link a row of its own, and the grid has as many columns as the nav has items, so a two-button nav no longer leaves an empty third column.
- `.theme-choices` became a list below 560px, but the settings card is not 560px wide at a 560px window — it is 524px at an 800px window and 664px at a 700px window. The row broke across 561–900px. The **card** now decides, with a container query, because the space that matters is the card's and not the window's.
- `.dots-legend` and `.highlighter-palette` stopped one pixel too early, and the highlighter's "Highlighter:" label was stranded in the middle of the palette with the buttons scattered around it in rows of two, one and one.

Every one of them was invisible to the gate because the gate swept six widths and the fixes were written at 520, 560, 720, 900 and 1100. The instrument now derives its sweep from the CSS.

**What the review changed in the instrument.** Notes print (a page the baseline had never seen was being reviewed in silence). A reason for a decision that no longer exists now fails, because a reason that blesses nothing will bless the next thing that looks like it. Absolute limits apply to every measurement, seen or unseen, and can be exempted only in writing, in the baseline. The harness falls back to `document.body` when a project has no `<main>`. The browser's virtual-time budget is worked out from the number of measurements, after a sweep of more than a thousand measurements ran out of budget, dumped a half-finished page and **exited successfully with no measurement in it**.

**The other direction.** The first version of the stale-reason rule called every reason stale on a run over a few routes — it had not seen the routes the reason belongs to. The instrument was inventing a defect. The rule now only runs on a complete sweep, and the falsifier proves both directions: it must bite on a full sweep and stay quiet on a partial one.

---

## The canonical law, and the fourth review — 22 October 2026

Dr Non sent the law itself: **MSH — Massacre Spatial Hallucination**, his own document, with the definition, the symptom table, **eight house laws**, the eight-step repair procedure, the evidence a pass requires (renders at 390, 1024 and 1440 px; 390 × 844 and 1440 × 900 for the first screen; chrome cost as top/bottom height and share of the viewport including stacked sticky regions; task visibility; geometry failures; hierarchy; preservation), the four-line report a pass ends with, and the standing order:

> **When you find SH, massacre.**

It is copied verbatim into `docs/MSH-LAW.md` and into the shared skill. The law is **not** paraphrased anywhere. An earlier version of this file described the law in our own words; that text is now a summary of a document that exists, and the document wins.

**A fourth reviewer was given the fixed state and the same permission to be unkind.** It failed the instrument on four counts and the adoption on three, and every count was right:

- **The verdict was not stable.** The same build, the same baseline, the same command: five passes, two failures, always `/notes/` at 721px scrolling sideways by 207px. The map on that page is drawn from a `ResizeObserver`; the gate measured it before the update landed. The gate ran the browser on a **virtual clock**, and a virtual clock produces no rendering opportunities — so the layout that catches up after a load never arrived. **A page that is still working is a page whose geometry is still moving.**
- **The cross-check proved its assumption at six widths out of fifty-seven**, all of them below 768px. Forty-four of the forty-five widths where the CSS changes were never loaded fresh. The reviewer built a page that decides its layout once, from the width it was loaded at, and the gate **passed** it with a 260px hole in it — a hole every reader opening the page at 900px would have seen.
- **Fourteen of the site's forty-three pages had no receipt at all.** The route discovery walked the built tree one level deep; `/bible/parliament/` and thirteen siblings were never measured, and they carry findings.
- **`--base` treated asset URLs as pages.** `/icon.svg` and `/fonts/fonts.css` were measured as routes, and the run failed measuring nothing.
- **A selector read `[object SVGAnimatedString]`**, so every finding on an SVG named an element no reviewer could find.
- **The gate measured `/news/` in its failure state.** The static export has no API, so the page rendered the error state and the receipt described that; the deployed page a reader actually gets was different, and broke the house ramp with a 26px chip beside a 32px title — a violation the gate could not see, because the local page had no chip at all.
- **Three written reasons were false.** A plate that fills "between a third and a half" of its row filled a fifth on one route; a row that was "312px at the narrow end" is 221px at the narrow end and 312px in the middle of the range; a drawing whose "space underneath is the title's own height" is centred, with the same 259px above it and below it. A false reason is worse than a missing one: a missing reason fails the build, a false reason passes it and blesses the next thing of that shape. All three are now rewritten from the measurements, and every number in them was checked against the rendered page one element at a time — the 120px plate in a 588px row on `/exam/` at 360px, the 216px Tikki drawing centred in a 734px row at 721px, the 146px paragraph beside a 294px drawing on `/amend/` at 1130px. The reviewer's own correction was itself partial — it read the narrow end of one route, not of all 62 occurrences — which is why the numbers were re-measured rather than adjusted.

**What changed, in the instrument.** Every measurement is now a **fresh page load at the width being measured**, on a **real clock**, so there is no resize assumption left to prove and no layout measured before it arrives. The settle waits for the fonts and the images as well as for a stable shape, and then looks once more. The route walk is recursive. The asset URLs are filtered out of the deployed-site route list, which is now the sitemap **and** the home page's links, because either one alone missed pages. The SVG selector reads the attribute.

**What changed, in the law's own terms.** The chrome is measured now: the top and bottom bands, stacked regions counted together, and the share of the viewport. A fixed region painted over the work is measured against the browser's own z-order, not against the stylesheet. The chrome of every page is in the receipt, so a header that grows takes height away from the work and the diff says so. And the sweep now includes **390px** — the phone width the law names — measured at 844px tall, with 1440 measured at 900px.

**And in the product.** `/news/` no longer changes shape with the calendar: the trends are the trends **of the edition being read**, so a snapshot that ages cannot empty a section by itself. A page whose shape depends on the date is a page whose receipt is true only on the day it was taken.

The topic filter was **two controls in two places**: a `<select>` in the filter bar, and a cloud of chips three screens below it at the bottom of the headlines. Both set the same state, so a reader could not tell which one was live — and the chips broke wherever the width ran out, leaving one chip alone on the last row with 380px of nothing beside it at nine widths between 436 and 722. That was accidental wrapping, which the law names: navigation that breaks wherever the width happens to run out.

There is now **one** topic control: a comparison index of this edition's topics, one topic per row, name on the left and the count of headlines on the right, sitting with the search box above the list it filters. One topic per row cannot break — a row has nothing to run out of — and the count, in a column, is the evidence the section promises; the size ramp the cloud used to carry is gone, because a size that contradicts the count beside it is decoration with a number attached. The busiest topics are set in ink, and the order is the ranking. The copy says so, in three languages.

---

## The fifth review, and the shipability audit — 23 October 2026

**A fifth reviewer was given the fixed state and the same permission to be unkind.** It could not break the determinism (five runs, byte-identical), the fresh load, the wall-clock budget, the two of the three rewritten reasons (checked element by element), or the law file itself (byte-identical to Dr Non's original). It found four instrument defects and three claims that were false. Two more instrument defects surfaced afterwards, both found by running the fixed state through its own gates rather than by reading it: the CI job's budget, and the falsifier's.

**The instrument.**

- **The overlap rule had a blind spot on the right.** It asked the browser what was painted on top at **one point**: twenty pixels in from the covered element's *left* edge. A fixed band that starts further right than that was never asked about — so a bar pinned to the right of the column, covering the reading, was measured as clean. The rule now asks across the width where the two actually meet. The same fixture proves it: the old probe finds the left-pinned bar and **zero** findings for the right-pinned one; the new probe finds both.
- **The gate could not tell a page from an error page.** `--base` never looked at the status the upstream answered. A route returning 404 or 500 renders an error page, and an error page has no spatial problems to find — so a broken route measured zero findings and passed. The status of the route's own document is now recorded and checked: a route that answers 404 is a measurement that could not be read, and the gate fails.
- **The falsifier was expecting a message the gate had deliberately deleted.** The rule for "a page whose layout depends on the width it was loaded at" waited for the resize cross-check, which the fourth review removed. It had been reporting *"1 rule(s) did not bite"* — and nobody read it as a failure, because the output was a list of successes with one line at the end. The rule is rewritten for the design that replaced it: a page whose gap exists at one width and nowhere else must be found at exactly that width, and must **not** be reported at the widths where it has no gap. The rule now also asserts absence, which no rule could before.
- **A report run could not fail.** `--report` printed the decisions, the findings and the notes, and then ended with `exit 0` — before the verdict. So a run with `--report` was incapable of failing: the findings were printed in full and the gate walked away green. It was found while using the instrument on another project, whose receipt held twenty decisions that were measured but recorded without numbers; the report showed every one of them, and the exit code said nothing was wrong. The report is now more output, not a way past the verdict.
- **The CI job was killing the gate.** The verify job's budget was 75 minutes. The sweep is 2494 fresh page loads and takes about seventy on a clean runner, so the job died **at the last step**, every time, and reported nothing. The budget is 150.
- **The falsifier was killing itself, and blaming the gate.** It gave its own estate sweep a fifteen-minute budget and read a killed child as "the gate answered no" — `spawnSync` hands back a null status when the child dies, and a null status is not a verdict. On a busy machine (load average 16, three agents' browsers at once) the sweep was killed mid-run and the falsifier printed *"FAIL — the gate could not write a baseline for the falsifier"*: a sentence about the gate that was really a sentence about the clock. The sweep had not failed to catch anything; it had never finished. The budget now covers the honest cost, and a killed child is named as a killed child — the falsifier says it did not learn, and why, instead of blaming the gate it was testing. The CI falsify job's own ceiling was tighter than the falsifier's new budget, so it was raised too.

**The claims that were false.**

- **A reason said the Tikki plate is "216px to 255px tall".** Measured at every width: 216, 255, 256, 258, 258. The upper bound was three pixels short. It is now 216–258, and the number was re-measured rather than adjusted.
- **The receipt claimed to be one sweep when it was two.** `/news/` was measured fresh after the change; the other 42 routes carry the cells from the sweep before it. That is sound for this change — the change touched `NewsDesk.tsx`, which only `app/news/page.tsx` imports — but it is an **argument**, not a measurement, and "the other pages are byte-identical" is false: one shared CSS bundle means every page carries a different link hash. The receipt now carries a `provenance` block that says what it is a receipt of, names the 42 routes it carried over, and says that the clean full sweep in CI is the arbiter. The instrument writes that block itself from now on, so a receipt always says where it came from.
- **The copy promised one leader and the rule marked every tie.** "The topic with the most headlines is set in ink" — but a tie sets several in ink, and the seed data ties four of five. The copy is now plural in all three languages, because the count column is the evidence and a tie is a real thing.

**And the deployed site was still the old build.** The fix was in the repository and not on the site, and nothing in the release chain measured what was actually deployed. There is now `npm run check:spatial:live`, which measures the deployed site against the instrument instead of the build directory, and the live `/news/` is measured after every deploy from here on.

**And then the instrument failed the deployment it had just made — on a route it had invented.** The first live sweep after the deploy returned:

> FAIL — the spatial gate could not read 3 page measurement(s): ✗ /manifest.webmanifest/ @390px — the route answered 404

The site was fine. `/manifest.webmanifest` answers 200, and the HTML asks for it correctly. The route was the instrument's own invention: when it discovers a deployed site's pages, it reads the links on the home page, and a link whose path has a file extension is an asset and not a page — a test it wrote as "a dot and two to five letters", which is fine for `.png` and useless for `.webmanifest`. So a resource reference was taken for a page, given the site's trailing slash, and the resulting URL was one the server had never heard of.

The gate did the right thing with it — a route that answers 404 is a measurement that could not be read, and the gate fails — but it failed a clean deployment over a URL nobody ever asked for. The test is now "a final segment with a dot and two or more letters, digits or hyphens after it", measured against every href the home page actually carries: exactly one changes class (`/manifest.webmanifest`), and no page is affected.

**And then it failed the site for the opposite reason.** The next live sweep said:

> FAIL — missing page — the baseline records "/learn/" but this build has no such page.

`/learn/` was answering 200 the whole time. It is a forwarder to `/` — a client-side `router.replace("/")` with a one-word body — and the sitemap deliberately does not advertise it. But measuring a deployed site has no directory to walk, so the instrument found the site's pages by reading the sitemap and the home page's links, and **that list replaced the receipt's**. Then the gate compared the two and called the difference a defect. A page the site was serving was reported as absent, because the instrument had not found it the way it happened to look.

The receipt is the contract of what the project ships. A live run now measures every route the receipt records, and adds the routes the site advertises — and both directions are then checked: a receipt route that cannot be measured still fails, and a page the site advertises that the receipt does not record now fails too, because a page a reader can reach that nobody has ever measured is a page nobody reviewed.

**And the sitemap had drifted from the site's own route list.** It was a second, hand-kept array, and it had already lost two pages: the home page was not in the site's own sitemap, and `/tikki/` — a real page, linked from the home page, built on every deploy — was not either. `APP_ROUTES`, which the navigation, the link check and the spatial receipt all use, holds exactly the 43 pages the receipt records. The sitemap is now built from it, minus the declared forwarders, so there is one description of what this site ships instead of two, and one of them was wrong.
