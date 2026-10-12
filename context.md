# Constitution study

Audience: Tikky on iPad plus Thai civil-service aspirants. Public, anonymous, device-local progress. Constitution first.

Invariant: every section has one Thai legal source; translations and teaching notes never override it. Mastery counts distinct questions answered correctly, not repeated taps.

Design read: a Thai exam notebook with an open chapter index and a generous margin for listening and review.
Reference: the Vignelli-designed New York subway map (1972), for numbered routes and clear progression; the Thai Senate printed constitution for reading hierarchy.
Register: Civic. White paper, black ink, amber #f59e0b for the next action. IBM Plex Sans Thai / Source Sans 3 / JetBrains Mono. Three text sizes. No gradients, shadows, rounded rectangles or decoration. Each section has one dominant element: learning route, legal text, or quiz question. 3px chapter boundary, 1px row rules.

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
