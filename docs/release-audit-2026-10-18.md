# Release audit — 18 October 2026

Baseline: clean working tree at `e330187`. Scope: the recent agents' integration, learner journeys, persistence, backend response boundaries, Palette/anti-slop presentation and deployment. Preserve authored content and existing study records.

## Confirmed issues to repair

1. Section-specific repair generates arbitrary number drills, including section 256 questions when repairing section 158. Select only questions whose citation includes the requested section.
2. Pokklong's storage read can throw on mount when storage access is blocked. Its answer handler also ignores failed writes. Keep practice usable and explicitly warn when records cannot persist.
3. The homepage labels `known.met` as sections read, although it includes sections encountered through practice or marks. Use language that matches the computed measure.

## Release checks

Baseline `npm run release`: content validators, tests, typecheck, production build, generated-asset integrity and release gate passed; layout measured 140 views across 28 routes at 390/721/860/1024/1440px without overflow, all-zero strips or empty labelled regions. Independent review reproduced the first two issues above despite the green gate.

After repairs: rerun the release pipeline; exercise fresh and returning learner flows, targeted practice, notebook, mock exam, news and settings; review actual screenshots at 390/1024/1440px; deploy and compare live bytes. Device-native iPad voice input/PWA checks and exhaustive legal recertification remain separate from browser release verification.

## Verified result

- Repaired all three findings above; added regression coverage against real question data and actual Pokklong component interactions under blocked storage and quota failure.
- Full `npm run release` passes: 183 tests, typecheck, corpus/content validators, production export, asset/link/contrast/design gates and 140 layout measurements across 28 routes at five widths.
- `npm audit --omit=dev`: zero reported production dependency vulnerabilities. This is a dependency check, not a penetration test.
- Browser: completed all five section-158 repair questions with matching citations; reached the score handoff; saved a notebook note/highlight and verified both after reload; submitted a mock exam with one answer and 24 blanks, verified blank/wrong separation and the repair handoff; checked Chinese settings, amendment story entry and source link. Existing blind-loop tests exercise all 90 questions.
- Phone and tablet compositions reviewed at 390/1024px; desktop recaptured at actual 1440px, with all language controls and content inside the viewport. Independent review confirmed the storage and citation fixes.
- Live news API returned HTTP 200 with 66 headlines and three healthy feed statuses. Worker response boundaries remain covered by the release tests.
- A local ChunkLoadError occurred while the export directory was being replaced during a rebuild; the settled build reloaded and completed the flow. Browser verification uses completed exports.

Limits: no physical-iPad dictation, native PWA-install or human learner study in this audit. Legal content validators are not a fresh primary-source recertification of every question. Production deployment and byte verification are recorded below after release.
