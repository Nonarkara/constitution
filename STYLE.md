# STYLE.md: deliberate choices. Do not strip.

Owner: Dr. Non Arkaraprasertkul. Last checked: 2026-10-20.

Everything here was chosen on purpose. Agents and reviewers read this before any design review, never remove or "fix" what it lists, and ask the owner if a choice seems to cause a real problem (contrast, legibility, a broken layout). This file beats every generic rule, including Non-Slop's.

## Type
- Display: Jost, geometric and clean modern Bauhaus lookalike for headings, section numbers, and navigation.
- Body: Jost for Latin text; IBM Plex Sans Thai (loopless, modern, legible) for Thai; PingFang SC / Noto Sans SC for Chinese.
- Numbers/Code: Jost tabular figures for section numbers, citations, countdowns, and cram drills.

## Colour
- Light ground #ffffff, ink #1c1d1a, line #e5e5dc, wash #f4f3ed.
- Mild ground #fbf8f1 (warm paper), ink #22211b.
- Dark ground #121310, ink #f3f2ec.
- Contrast ground #000000, ink #ffffff.
- Accent #c84b31 (warm terracotta/brick red) for primary action states, key milestones, and active tab indicator.
- Muted ink #626459 for secondary breadcrumbs, annotations, and legal chapter headers.

## Devices
- Hand-drawn pastel crayon Tikki illustrations serve as the friendly guide throughout the study journey.
- Single dominant purpose per screen with content-fitting primary action.
- Parallel three-language reading column (TH / EN / ZH) for constitutional cross-comparison.
- Micro-fine print at page bottoms for statutory citations and metadata.

## Layout
- Single reading column (max 68ch) that fits human eye line-length without fatiguing return sweeps.
- Content-hugging buttons and boxes: zero oversized empty textboxes, zero lazy padding, zero arbitrary min-height.
- Clear rhythmic hierarchy: Menu → Cute Tikki Cartoon → One Purpose → Next Action → Negligible Fine Print.

## Voice
- EN: direct, educational, encouraging civic study companion.
- TH: warm, approachable (Tikki: cute, earnest student aiming for civil service exam; Dr. Non: authoritative, scholarly, respectful).
- ZH: clear, standardized legal study terminology (Simplified Chinese).

## Protected voice
- phrase "อ่านให้เข้าใจ": core application motto
- phrase "รัฐธรรมนูญแห่งราชอาณาจักรไทย": canonical official title
- phrase "Tikki study companion": beloved study mascot
- phrase "Dr. Non Arkaraprasertkul": creator and scholar
- phrase "ครูนายสังคมศึกษา": verified exam source attribution

## Allow
- rule card-grid-3 in app/globals.css: parallel comparative text columns for three study languages (TH / EN / ZH)
- rule accent-border-card in app/globals.css: sidebar nav active item marker stripe
- rule lang-th: dynamic trilingual switching sets language and font at runtime via context
- rule lang-zh: dynamic trilingual switching sets language and font at runtime via context
- rule heavy-image in design/**: raw master illustration art kept for reproduction, not served to web clients
- rule heavy-image in public/podcast-cover.png: Apple Podcasts directory specification requires high-resolution square cover art
- rule font-not-loaded in scripts/**: release validator testing against banned font names
- font "Jost": Bauhaus lookalike display and body font
- font "IBM Plex Sans Thai": loopless Thai sans-serif body font
- font "JetBrains Mono": monospace numbers and section citations
- colour #c84b31: house accent colour
- colour #fbf8f1: warm paper mild ground colour
