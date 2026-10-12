# Civic learning expansion — 12 October 2026

Scope authorized by the user's feature request: a fictional amendment journey, headline-only news with keyword trends, and a research/author page. Public, trilingual and anonymous; existing study material, progress and drawings remain intact.

## Decisions

Amendment: one fictional proposal, staged reading/retrieval, exact section255/256 gates, an adjustable existing-members vote lab, explicit fictional opportunity costs rather than invented baht estimates, and device-local reflection with export. Historical2021 example is separate from fiction. Adjacent debates distinguish constitutional text, evaluative arguments and facts requiring external budget sources. No preferred political answer.

News: publisher-provided RSS first, Matichon politics, Matichon constitution tag and The Active/ThaiPBS feeds verified accessible. Store only title, canonical source link, publisher, publication/retrieval time and topic tags. Cloudflare D1 and a six-hour scheduled Worker harvest; static build snapshot remains usable offline. Trends count unique matching headlines in the last7days, not sentiment or popularity. Display source health, sample coverage and last successful harvest. No article bodies stored; outgoing links open a new tab. No arbitrary URL-fetch or public write API.

Research: first-person project purpose attributed to Dr. Non Arkaraprasertkul. Tikky is the narrative companion and may be imagined; no claims about a real person's identity. Distinguish established learning research, implementation hypotheses, automated tests, agent/browser checks and future human/iPad testing. Explain Claude Code/other practical tools without claiming any model itself proves learning outcomes.

## Targeted changes

New components/pages: AmendmentJourney (/amend), NewsDesk (/news), Research (/research). Shared domain logic/content in lib/amendment.ts, lib/journey-content.ts, lib/news.ts; RSS snapshot data/news.json. New harvesting script, Worker entry, D1 migration and domain tests. Surgical links in Library, Shell footer/navigation grouping, Notes, Learn shortcuts and sitemap; small scoped CSS extension. News Worker added to existing Wrangler static deployment, with /api/news routed to code and assets unchanged.

## Design and conservation

Civic notebook palette, existing type and crayon drawings. Story/path for amendment, ruled bulletin list for headlines, prose/evidence table for research. Variance moderate; motion low (state transitions only); density varies by task. Preserve all existing diagrams, routes, annotations, progress schema and offline assets. No file shrinks30%, no new account/analytics, no unsupported scores/frequency claims. Native headlines remain publisher language; interface and learning content TH/EN/ZH.

## Verification

Tests: vacancy-dependent vote thresholds, all256(8) triggers, reflection validation, hostile/duplicate/unrelated/missing-date news, source failures, trend window/unique counts, D1 persistence and worker read-only API. Full existing verify/build. Real browser complete journey, fail/retry retrieval, vote lab, save/reload/export reflection, feed filters/outgoing links/empty/error, languages, phone360px and iPad768px. Deploy, compare assets, inspect real API/DB. Bounded independent content and change review. Human learning efficacy and actual iPad microphone checks remain future evidence.
