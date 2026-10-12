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
