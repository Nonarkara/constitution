# Constitution study

A notebook for Tikky and Thai civil-service aspirants. Public, anonymous study with device-local progress. Built with Next.js 16, React 19 and a static export.

## Run

```sh
npm ci
npm run dev
npm run verify
npm run build
```

The deployable static site is `out/`, served from https://constitution.nonarkara.org as Cloudflare Worker assets (`wrangler.jsonc`). Deploy with `npm run build && wrangler deploy`. The earlier OpenAI Sites edition (`.openai/hosting.json`) stays up for existing links; progress moves between them through Settings export/import.

## What works

- 279 Thai sections with exact PDF citations, incorporating the 2021 amendments to 83, 86 and 91.
- Council of State English translation. Current amended English study translations are supplied; original government passages remain available. Sections 37/98/101/134/256 have study corrections against Thai.
- 279 full Chinese study translations plus retained short summaries; exact Thai source citations and explicit unofficial status.
- 51 original trilingual practice questions across all 16 chapters and transitory provisions; explanatory feedback and citations.
- Distinct-question mastery (80%), missed-question review after 10 minutes, correct-question review after 1/3/7/14 days, Bangkok-day streaks and supportive energy.
- Full-text search in Thai/current English/full Chinese text and summaries and section-number search including Thai digits. Ranked by relevance, with no invented exam-frequency claims.
- 837 individually recorded TH/EN/ZH readings, MP3 downloads, three podcast feeds, optional saved offline audio with seeking; device voices remain an alternative. Browser voice search has keyboard-dictation fallback.
- 29 Senate recording links covering every section. Embedded Google Drive players require internet; recording edition has not been independently verified.
- PWA install on iPad, complete versioned offline shell with local fonts, larger text, progress export/import.
- Interactive institution, bill and amendment overviews, with textual equivalents and reduced-motion support.
- 20 trilingual real-life puzzles, one or more per chapter: guess, then a story answer with verbatim Thai quotes and a think-first "why". Never scored. Also browsable on the Your rights shelf.
- Ask: questions beyond the notebook go to Non-Laws (real statutes and Supreme Court rulings) with the section being read; answers render inline, with an open-in-Non-Laws fallback.

## Limits

Study translations and generated practice questions have not received independent legal/editorial certification. Targeted translation fidelity review and structural source checks are recorded in data/translations/. The optional Senate player covers ranges of sections; prepared recordings cover individual sections. 837 prepared recordings avoid dependence on installed device voices. The alternative device speech still varies by platform. The quiz bank is an introductory practice set, not coverage of every detail or an actual exam bank. OCSC adjacent material is outside this edition.

Progress is browser-local: no automatic device synchronization. Clearing browser data clears progress unless exported. No PIN access mode is implemented for the public edition.

See `data/README.md`, `context.md` and the corpus source metadata for provenance and extraction limitations.

## Recorded audio rebuild

On macOS with the installed Kanya, Samantha and Tingting voices plus ffmpeg:

```sh
python3 scripts/generate-audio.py --languages th,en,zh --workers 2
```

Generation is resumable by text and audio hashes. `npm run build` validates all 837 recordings, creates the podcast feeds, exports the app and generates the exact offline asset manifest. The audio cache has a content revision so corrected recordings cannot leave stale legal wording offline. Audio is downloaded to the PWA cache only when requested; the 837 files are not forced onto a phone.
