# รัฐธรรมนูญ · The Thai Constitution, read slowly

A study notebook for the Constitution of the Kingdom of Thailand B.E. 2560 (2017), as amended in 2021. It was made for Tikky, for people preparing for Thai civil-service exams (ก.พ., ปลัดอำเภอ, นิติกร), and for anyone who wants to understand the supreme law through situations from ordinary life.

Live at [constitution.nonarkara.org](https://constitution.nonarkara.org). Other languages: [ภาษาไทย](./README.th.md) · [中文](./README.zh.md)

Everything a learner does stays on her own device: no account, no server copy of her notes.

## What is in it

- **The whole text, in three languages.** All 279 sections in Thai, including the 2021 amendments to sections 83, 86 and 91. English is the Council of State translation, with study corrections against the Thai Gazette for sections 37, 98, 101, 134 and 256. Chinese is a full study translation, clearly marked as such.
- **What you know** (`/notes/`). Everything she reads, highlights, notes and practises is drawn on one map. Each chapter is a line and each section is a station. Lines join her sections wherever the law itself connects them. A written thread explains each connection in plain words, and a panel lets her dig from one section to the next.
- **470 practice questions** covering every section, in three languages. Each question cites its sections and explains the answer. Missed questions return after 10 minutes; correct ones come back after 1, 3, 7 and 14 days. A chapter counts as passed at 80% of its distinct questions.
- **20 real-life puzzles** (`/rights/`). She guesses first, without a score, then reads the answer. Every quote is checked byte for byte against the Thai text.
- **Diagrams** (`/cheatsheet/`): the hierarchy of laws, the amendment gates, emergency decrees and proportionality.
- **Audio.** 837 recorded section readings, three podcast feeds (`/podcast/th.xml`, `en.xml`, `zh.xml`) and links to the Senate's own recordings.
- **Four reading themes**: light, mild (warm paper for a lamp at night), dark, and high contrast. The default follows the device. Every theme is checked for WCAG contrast in `tests/theme.test.ts`.

## How the dots are connected

Nothing on the map is invented. A link between two sections comes from one of two kinds of source, and the interface always says which:

1. **The text.** The Thai text of one section names another. There are 220 of these links.
2. **The index.** This notebook's own subject index, glossary or a practice question groups the sections together. These links are labelled as the index's grouping, not the law's.

`scripts/build-indexes.mjs` writes `data/graph.json` from the data files. `tests/dots.test.ts` checks two things: that every text link appears in the cited section's Thai text, and that every grouping points to a real topic, term or question.

## Three rules worth drawing

### Algorithm 1: Constitutional Supremacy & Nullity (มาตรา 5)
```
          ┌──────────────────────────────────────┐
          │     Any Statutory Rule or Act        │
          └──────────────────┬───────────────────┘
                             │
                  Is it in conflict with
                   the Constitution?
                    /             \
                 [YES]            [NO]
                  /                 \
        ┌───────────────────┐    ┌─────────────────────┐
        │ VOID & UNENFORCEABLE│  │ LAWFUL & ENFORCEABLE│
        │ Certified to Court│    └─────────────────────┘
        │   under Sec 212   │
        └───────────────────┘
```


---

### Algorithm 2: The Three-Reading Constitutional Amendment (มาตรา 255–256)
```
┌──────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│  PROPOSAL    │ ──> │ READING 1: ACCEPTANCE│ ──> │ READING 2: SECTIONS  │
│ Cabinet /    │     │ ≥ 1/2 of both Houses │     │ Simple Majority of   │
│ 1/5 MPs /    │     │ AND ≥ 1/3 of Senate  │     │ votes cast           │
│ Joint 1/5 /  │     │ (≥ 67 of 200)        │     └──────────┬───────────┘
│ 50,000 Voters│     │                      │                │
└──────────────┘     └──────────────────────┘                │
                                                       WAIT 15 DAYS
                                                             │
┌──────────────┐     ┌──────────────────────┐     ┌──────────▼───────────┐
│ ROYAL ASSENT │ <── │  MANDATORY REFERENDUM│ <── │ READING 3: APPROVAL  │
│ PM submits   │     │ Required when the   │     │ > 1/2 of both Houses │
│ after 15 d   │     │ conditions in       │     │ AND ≥ 1/3 of Senate  │
└──────────────┘     │ section 256(8) apply │     │ AND ≥ 20% eligible MPs│
                     └──────────────────────┘     └──────────────────────┘
```



---

All proposal and voting fractions use **existing members**, not nominal seats. The joint proposal route requires MPs and Senators together numbering at least one fifth of existing members of both Houses. With all 500 House seats and 200 Senate seats filled, the proposal thresholds are 100 MPs or 140 joint signatories; Reading 1 needs at least 350 votes and Reading 3 needs at least 351, each including at least 67 Senators. The 20% threshold uses the combined MPs of all parties whose members hold no minister, House President or House Vice-President office.

Section 256(8) requires referendum approval for amendments to Chapters 1, 2 or 15; qualifications or disqualifications of holders of any constitutional office; duties or powers of Courts or Independent Organs; or matters preventing those bodies from performing their duties or exercising their powers. Approval must precede proceeding under (7). After final approval, section 256(7) requires a **second 15-day wait** before presentation to the King, applying section 81 mutatis mutandis. A pending section 256(9) petition blocks presentation while the Constitutional Court considers it.

### Algorithm 3: Emergency Decrees (พระราชกำหนด - มาตรา 172)
```
                ┌───────────────────────────────────┐
                │ Urgent Inevitable Necessity (ม.172)│
                └─────────────────┬─────────────────┘
                                  │
         Must satisfy one of 4 Protected Grounds:
         • National Security       • Public Safety
         • Economic Stability      • Public Calamity
                                  │
                ┌─────────────────▼─────────────────┐
                │       King Issues Decree         │
                │    (Immediate Force of an Act)    │
                └─────────────────┬─────────────────┘
                                  │
                ┌─────────────────▼─────────────────┐
                │   Submit to Parliament Next Session│
                └─────────────────┬─────────────────┘
                                 / \
                        [APPROVED] [REJECTED]
                           /             \
             ┌─────────────────┐     ┌─────────────────┐
             │Force of an Act │     │ LAPSES (Void for│
             │     (พ.ร.บ.)     │     │     future)     │
             └─────────────────┘     └─────────────────┘
```

---

Section 172 parliamentary disapproval takes effect the day after Gazette publication, preserving acts done during enforcement. Approval means the decree continues with the force of an Act; Senate rejection may be overridden by more than half of existing MPs. If waiting for an ordinary session would delay consideration, an extraordinary session must be convened.

The optional section 173 referral occurs **before the referring House approves**: at least one fifth of its existing members submits an opinion through its President. Review concerns section 172 **paragraph one** (the four permitted purposes), rather than paragraph two's urgent-necessity assessment. Referral is within three days, the Court decides within sixty days, and parliamentary consideration pauses pending notification. A finding of noncompliance requires at least two thirds of existing judges and makes the decree ineffective from the outset, unlike parliamentary rejection.

## Run it

```bash
npm ci
npm run dev       # development server
npm run verify    # corpus, translations, cases, questions, tests, types
npm run build     # static export to out/
npx wrangler deploy
```

The site is a static Next.js export served by a Cloudflare Worker. The Worker also serves `/api/news` from D1.

## Which text is the law

- The Thai text published in the Royal Thai Government Gazette (ราชกิจจานุเบกษา) is the sole authoritative legal source.
- English (Office of the Council of State + amended study overlays) and Chinese translations are provided strictly for educational study and comparative analysis.
- Thai statutory laws and court judgments are public domain materials under Section 7 of the Thai Copyright Act B.E. 2537.

## Civic learning, headlines and research

- `/amend/`: a fictional amendment journey, recall checks, vacancy-aware vote lab, opportunity costs and private, downloadable reflection.
- `/news/`: headline-only publisher RSS collection, D1 persistence, six-hour harvesting and transparent7-day keyword counts. Full stories open at their publisher; article bodies are not stored.
- `/research/`: Dr. Non Arkaraprasertkul's purpose, learning research, design hypotheses and testing limits. Tikky may be an imagined companion.

The Worker now serves `/api/news` with the `NEWS` D1 binding; learning pages remain static/offline. `wrangler d1 migrations apply constitution-headlines --remote` applies the new schema. `npm run news:harvest` refreshes the build snapshot and prepares `.openai/news-seed.sql`; `wrangler d1 execute constitution-headlines --remote --file .openai/news-seed.sql` can seed it. Deployment config schedules the harvester every6 hours. Reflections never go to this database and have their own download in the journey.

See `docs/civic-expansion-plan.md` and `docs/civic-expansion-verification.md` for scope and evidence. Native iPad/microphone and learner outcomes still require human testing.
