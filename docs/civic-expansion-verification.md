# Civic expansion verification — 12 October 2026

New routes: `/amend/`, `/news/`, `/research/`. Learn and Library expose them; Your notes includes the saved amendment reflection. The footer attributes the work to Dr. Non Arkaraprasertkul.

## Evidence

- Full `npm run verify`: 65 tests passed; corpus, translation, case and question validators passed; TypeScript passed. Production build exported28 pages and precached203 assets. `npm audit --omit=dev`:0 vulnerabilities. Wrangler bundle dry-run succeeded with D1/ASSETS bindings.
- Fresh read-only legal review checked journey and debate citations against the Thai corpus. It independently checked70,536 vote combinations with no discrepancy. Research source links resolve and support the limited claims. No learner-efficacy or political-preference claim is made.
- News review reproduced300 headlines violating the200-row contract and partial-failure loss of static source history. Both fixed and covered by executable regression tests. The reviewer found no remaining confirmed issue in those fixes.
- Real browser: incorrect recall answer kept Continue unavailable and showed explanation/retry; correct answers progressed through all4 learning stages; lab350 failed final approval and351 passed. The cost slider at100 left0 for schools/health. Explicit slider labels verified in accessibility tree.
- A fictional “not now” answer saved without XP. Full reload preserved its choice/text; it appeared under Your notes. Export created `my-amendment-reflection.json` in Downloads with the matching choice, proposal and cost.
- News loaded the database, filtered Constitution to2 stories and Referendum to0 with a clear empty state. A publisher headline opened a separate browser tab. A static-only test origin with a failing API showed a warning and retained10 dated headlines.
- TH/EN/ZH controls and content exercised. Amendment, news and research pages showed no horizontal overflow at360 px and768 px. Phone story navigation became a horizontal stage strip; the bulletin puts headlines before detailed trend-method notes. Viewport restored.
- A real local scheduled handler fetched the3 publisher RSS feeds and updated D1 health timestamps: HTTP200 “Ran scheduled event”,3 successful feeds,10 stored headlines. The production schedule is every6 hours. Manual seed imported into the remote database; no public ingestion/write endpoint exists.

Local Wrangler4.81.1's runtime only supports compatibility dates through2026-04-16, so dev checks used that temporary override; the production config remains2026-10-01. The scheduled-test config used worker-first routing only locally so `/__scheduled` reached the dev middleware. It is ignored and not deployed.

## Design delivery gate

The authored direction is a civic notebook: numbered doorways explain sequence, a ruled headline bulletin supports scanning, and an author note separates evidence from hypothesis. Reused crayon study scenes give the narrative a companion; they do not represent a real person or claim human authorship. Amber marks the current stage/action. Motion is limited to existing action feedback. Table and definition-list semantics preserved. No new gradient, shadow, rounded corners, fake statistics, decorative loading delay or dead control. Screenshots reviewed at phone/tablet widths and revised to move headlines earlier. Existing legal diagrams and learning content retained. The standalone `axiom-audit` CLI was unavailable; source/output checks and rendered browser review supplied the evidence above.

Actual iPad installation, physical microphone input and human learning outcomes remain unverified. Scheduled local invocation proves the handler; a later production cron execution is separate evidence from the deployed trigger configuration.

Full 200-headline persistence also passed under enforced D1 limits: at most98 bindings per statement and19 queries including the3 source-health writes and retention delete, within the [documented D1 limits](https://developers.cloudflare.com/d1/platform/limits/).

Production verification: runtime feature commit `f9376c3`, first Cloudflare version `dde8f9fa-e62b-4d24-8f1f-36620014d2d7`; live GET API returned 200 with 12 retained headlines and 3 healthy feeds; POST returned 405. All 3 page bundles and the offline manifest matched the build. The deployed Thai story rendered and the live bulletin loaded D1 data. Screenshots in `.openai/qa/amendment-journey-live.png`. An offline-ready test origin was stopped: never-visited amendment and research routes opened, an amendment reflection saved, and the bulletin reloaded with 10 dated snapshot headlines. Desktop stage navigation was subsequently revised to 3 columns, keeping all 6 stages in 2 rows; phone retains its scrolling strip and tablet uses 2 columns.

Final deployment: `fe0c8b3`, Cloudflare version `6ae05650-c493-4eaf-a26a-f4c481f954c0`, offline revision `01090ab30a0c4a8e`. The live stage strip computed three equal desktop columns at1280px with no page overflow; final CSS and offline manifest matched `out/` exactly. Temporary test servers stopped; the published story tab retained as the deliverable.

## Integrated release check — 12 October 2026

The production six-hour schedule ran without manual invocation: all three source-health records report a successful fetch at `2026-10-12T12:00:32.767Z` (19:00 Bangkok), observed through the live `/api/news`. Matichon politics returned 10 relevant entries, the constitution feed 2, and The Active 0; a successful feed with no matching headline is not an outage.

Other agents added four reading themes, the legal-reference knowledge map, quieter notebook copy, and version-4 backups carrying amendment reflections and reading history (through `67c2ace`). These changes are retained. The integrated validation passed all 82 tests, corpus/translation/case/question checks, and TypeScript. The production build contains 454 questions, 837 verified recordings, 28 pages and 205 offline assets; offline revision `637b1cbaa3bf0d7f`.

An import regression was fixed: local reading-history recovery tolerates malformed entries, but importing that filtered result could erase valid history. Version-4 imports now reject invalid section keys and non-finite, fractional, negative or out-of-range timestamps before writes. Versions 1–3 remain compatible and preserve newer data absent from their format. Storage failures receive a storage-specific message. A real browser imported a valid fixture (XP 42 and one reading entry), rejected an invalid fixture (XP 99 and malformed history), then exported version 4 with XP 42 and the original reading timestamp intact.

Physical iPad home-screen installation and microphone input remain unverified; learner efficacy remains a research question. Search uses relevance rather than unsubstantiated exam-frequency weights.

Integrated release deployed from `b11ef3f`: Cloudflare version `13b4e995-4015-424a-9fce-5addac66876b`. All 16 settings HTML/script, service-worker and manifest files matched the local build byte for byte. The live settings page rendered the four themes and backup controls; the news API retained the verified automatic-run timestamps.
