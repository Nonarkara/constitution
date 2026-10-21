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

The instrument is shared and portable (`scripts/spatial/`, hash-verified against the canonical copy). It measures geometry; the project owns the judgment. It sweeps the project's widths **plus every breakpoint the CSS declares and the pixel on either side of it** — because a layout checked at 390 and 1440 is checked at the two widths where nothing breaks, and because a fix written at a breakpoint the gate never sweeps is a fix nobody checked.

**What the first sweep found.** Nineteen distinct decisions across 29 routes that nobody had justified. Twelve were rows that broke by accident — a row of three links wrapping two-and-one, a settings list of four, a tab row leaving a tab alone — and are now deliberate arrangements: a grid whose cells are even, or a column that is a list. Seven are compositions that were intentional and had never been said out loud: a plate in the margin, a caption centred against its picture, a statute followed by a margin note, a number column that is a timeline. Each now carries its reason.

**The instrument found three of its own bugs** while being built, all of them false confidence: a vertical menu read as a broken row, a vertical list read as a row that wrapped, and a picture cropped to a frame read as a row that lost its content. The falsifier had two more: a copy command that nested the site one level down, and fixtures pasted into markup that React hydration deleted before anything measured them. All five are fixed, and `npm run falsify:spatial` now proves every mode of the law fails at least once.

The gate, the falsifier and the instrument's own hash check are in the release chain and in CI.

**The independent review — 21 October 2026.** A second reviewer was given the fixed state and no permission to be kind. It split the verdict: the instrument **passes** (sound, portable, and its rules demonstrably bite in all four directions — a new hole with no reason fails, a reason with recorded numbers passes, a blanked reason fails, a grown hole fails), and the **fixes fail**. Three of the twelve fixes were broken, and the gate was green the whole time:

- `.reader-navigation` had been given a three-column grid at every width, but the phone rule set `order: 3` on the link — and `order` reorders grid placement too, so on a phone the title link was crushed into a 101px third column and "Next chapter" sat in the middle instead of at the right edge. The fix now gives the link a row of its own, and the grid has as many columns as the nav has items, so a two-button nav no longer leaves an empty third column.
- `.theme-choices` became a list below 560px, but the settings card is not 560px wide at a 560px window — it is 524px at an 800px window and 664px at a 700px window. The row broke across 561–900px. The **card** now decides, with a container query, because the space that matters is the card's and not the window's.
- `.dots-legend` and `.highlighter-palette` stopped one pixel too early, and the highlighter's "Highlighter:" label was stranded in the middle of the palette with the buttons scattered around it in rows of two, one and one.

Every one of them was invisible to the gate because the gate swept six widths and the fixes were written at 520, 560, 720, 900 and 1100. The instrument now derives its sweep from the CSS.

**What the review changed in the instrument.** Notes print (a page the baseline had never seen was being reviewed in silence). A reason for a decision that no longer exists now fails, because a reason that blesses nothing will bless the next thing that looks like it. Absolute limits apply to every measurement, seen or unseen, and can be exempted only in writing, in the baseline. The harness falls back to `document.body` when a project has no `<main>`. The browser's virtual-time budget is worked out from the number of measurements, after a 1,189-measurement sweep ran out of budget, dumped a half-finished page and **exited successfully with no measurement in it**.

**The other direction.** The first version of the stale-reason rule called every reason stale on a run over a few routes — it had not seen the routes the reason belongs to. The instrument was inventing a defect. The rule now only runs on a complete sweep, and the falsifier proves both directions: it must bite on a full sweep and stay quiet on a partial one.
