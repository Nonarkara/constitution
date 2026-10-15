# Public learning release — 15 October 2026

Scope: the public Constitution learning application and its owned Cloudflare headline backend. Preserve the independently fact-checked exam commit a733c3a and incoming three-check guide lessons. This is a browser-local learning product, not a learning-effectiveness study or a certified legal adviser.

## Findings resolved

- AI POST, queue polling and streamed response bodies now have request and total deadlines, cancellation and size limits. Stopping waiting preserves the question and explains that a submitted request remains with the external service.
- AI responses are validated before rendering. Missing citation entries retain their original numbers; malformed rows and unsafe links cannot become another source's citation. A reference to Civil Code section 429 is no longer mistaken for an HTTP rate-limit error.
- Repeating a wrong/right correction cannot farm XP. Previously earned XP is preserved; a correct unseen or due retrieval can earn XP. Immediate correction still records learning progress.
- Timed exams share one starting timestamp so a 30-minute paper starts at 30:00.
- All 13 guide chapters have three short TH/EN/ZH checks, with deeper reading and source/practice links. Full long-form guides remain Thai/English; this distinction is disclosed.
- The new section 212 lesson includes the prior-ruling condition and the distinction between continuing a trial and withholding judgment. Selection summaries identify the EC and NHRC exceptions instead of presenting one universal route.

## Release evidence

`npm run verify`: 114 tests pass, no failures, corpus/translation/question validation and TypeScript pass. `npm run build` generates the static application and offline shell. Tests include hanging requests and bodies, cancellation, malformed queue responses, source-number holes, unsafe links, response limits and repeated XP cycling.

An independent read-only reviewer checked the changes and new legal checks against the official Constitution PDF: https://www.opdc.go.th/wp-content/uploads/2024/05/CONSTITUTION.pdf (sections 212, 217, 222 and 246).

`npm audit --omit=dev` reported zero known production dependency vulnerabilities. This is a dependency check, not proof of absence of all vulnerabilities. No credentials were added; the owned Worker has NEWS and ASSETS bindings and no paid model key.

The remote D1 database passed `PRAGMA quick_check`. A real export restored into a fresh SQLite database with 48 headlines and three feed-health records. All three harvest sources reported success at the checked harvest; an empty relevant result is not fabricated as news. Existing ingestion has fixed feeds, bounded downloads, publisher URL validation, parameterized SQL, retention and public read-only API access. Learner progress is not stored in D1.

Ignored evidence is under `.openai/qa/release-*`; the SQL backup contains public headline data. No production database mutation or migration was required.

## Operating the release

1. Run `npm run verify` and `npm run build`; review the diff and preserve other agents' changes.
2. Commit and push the source. Deploy with `npx wrangler deploy`. Record the Worker version and offline revision below.
3. Verify published HTML against `out`, security headers, GET headlines, rejection of non-read methods, and real browser journeys. Existing installed clients may need a reload to adopt the updated offline shell.
4. Before a future database migration, export with `npx wrangler d1 export constitution-headlines --remote --output <private-backup-path>` and restore/test the export locally. Keep old exports outside the public asset directory.
5. If a deployment breaks, use Cloudflare Worker version rollback to the previously verified version, then verify the same live routes and API. A Worker rollback does not undo D1 migrations; this release has none.

## Boundaries and remaining human checks

Core progress and notes stay in each browser; clearing browser storage loses them unless exported. Poll answers have a separate export. The UI explains these boundaries. Existing data is preserved by this release.

The optional Non-Laws service is separately operated. CORS preflight was checked. Its private server authentication, billing controls, rate limits, retention implementation and model quality cannot be certified from this repository. Client failure tests do not establish those server guarantees. Core learning, recorded audio, authored exams and news do not require that AI service.

Physical iPad microphone, Safari home-screen installation and real learner retention remain human/device checks. No claim is made that Tikky has tested this release or that gamification proves improved memory. Political reflections and polls do not grade a learner's opinions.

## Published verification

Source commits: `6e0d8af` (release hardening and incoming guide integration), `f3b29ea` (reading instructions after skipping). Final Worker version: `b9035d69-4cae-41f0-ac3d-1dd05fbd8465`; offline revision `4e3f4cb0a7f98e4b` (315 shell assets).

- All 42 normal published HTML routes match the final local build byte-for-byte. The separate 404 page is excluded from this count. The published offline manifest matches the build.
- Live `/api/news` returned 200; POST returned 405. CSP, content-type protection, referrer policy and permissions policy are present.
- Real browser: new guide answers reveal the corrected section 212 condition; Chinese entry shows three checks and accurately discloses the long-guide translation boundary. Its practice link enters guess → optional reading → answer. A skip-path copy error discovered during this walkthrough was corrected in TH/EN/ZH and confirmed on the final deployment.
- Phone width 375 and tablet width 768 had matching document/scroll widths. The temporary viewport was reset to desktop. Amendment paper 19 opened with 25 questions and 30:00; no paper was submitted merely to manufacture a test score.
- Existing learner state survived navigation and deployment. Reading section 5 was recorded (3 to 4 sections met). Settings exported a parseable version-4 backup with progress, marks, annotations, reflection and read fields; import did not overwrite existing learner data during this audit. Offline-ready status was visible.
- Optional AI form: unchecked retention consent and disabled submission verified. No learner question or personal information was sent to Non-Laws during this audit. Timeouts, cancellation and malformed-response cases were exercised with test transports, not claimed as an external-service success.
- No application console errors captured in the reviewed browser journey. The browser automation tool itself emitted blocked telemetry requests; these were separate from application logs.

Final verification and production build passed after the last copy edit. Independent reviewer confirmed both final copy corrections and reported no remaining material finding in the reviewed changes.
