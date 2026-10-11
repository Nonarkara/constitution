# Constitution study

A notebook for Tikky and Thai civil-service aspirants. Public, anonymous study with device-local progress. Built with Next.js 16, React 19 and a static export.

## Run

```sh
npm ci
npm run dev
npm run verify
npm run build
```

The deployable static site is `out/`. Hosting identity lives in `.openai/hosting.json`. Never create a second Site for this checkout.

## What works

- 279 Thai sections with exact PDF citations, incorporating the 2021 amendments to 83, 86 and 91.
- Council of State English translation. The three amended English sections are historical and labeled.
- 279 Chinese editorial study summaries, not full legal translations.
- 51 original trilingual practice questions across all 16 chapters and transitory provisions; explanatory feedback and citations.
- Distinct-question mastery (80%), missed-question review after 10 minutes, correct-question review after 1/3/7/14 days, Bangkok-day streaks and supportive energy.
- Full-text search in Thai/English/Chinese summaries and section-number search including Thai digits. Ranked by relevance, with no invented exam-frequency claims.
- Available device voices, adjustable playback speed and browser voice search with keyboard-dictation fallback.
- 29 Senate recording links covering every section. Embedded Google Drive players require internet; recording edition has not been independently verified.
- PWA install on iPad, caching previously opened same-origin pages, larger text, progress export/import.
- Interactive bill and amendment overviews, with textual equivalents and reduced-motion support.

## Limits

Chinese summaries and generated practice questions have not received independent legal/editorial certification. English amended passages need a current full translation. The audio player covers ranges of sections, not individual timestamped sections. Device speech availability varies; this app does not generate downloadable EN/ZH podcasts. The quiz bank is an introductory practice set, not coverage of every detail or an actual exam bank. OCSC adjacent material is outside this edition.

Progress is browser-local: no automatic device synchronization. Clearing browser data clears progress unless exported. No PIN access mode is implemented for the public edition.

See `data/README.md`, `context.md` and the corpus source metadata for provenance and extraction limitations.
