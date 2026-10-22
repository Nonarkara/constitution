# STYLE.md: deliberate choices. Do not strip.

Owner: Dr. Non Arkaraprasertkul. Last checked: 2026-10-20.

Everything here was chosen on purpose. Agents and reviewers read this before any design review, never remove or "fix" what it lists, and ask the owner if a choice seems to cause a real problem (contrast, legibility, a broken layout). This file beats every generic rule, including Non-Slop's.

## Type
- Display: Jost, geometric and clean modern Bauhaus lookalike for headings, section numbers, and navigation.
- Body: Jost for Latin text; IBM Plex Sans Thai (loopless, modern, legible) for Thai; PingFang SC / Noto Sans SC for Chinese.
- Numbers/Code: Jost tabular figures for section numbers, citations, countdowns, and cram drills.

## Colour
Four reading themes ship: light (default), mild, dark and contrast. Amber is the only
UI accent in every theme — it marks the one next action, key milestones and the active tab.
- Light: ground #ffffff, ink #24251f, muted #65685c, line #d9dcd3, wash #f5f6f1.
- Mild (warm paper, desk lamp at night): ground #f3ecdc, ink #332e22, muted #615843, line #d9cdb3, wash #eae1cb.
- Dark: ground #15140f, ink #e6e1d3, muted #aba592, line #36332b, wash #1f1d17.
- Contrast: ground #ffffff, ink #000000, muted #1f1f1f, line #000000, wash #efefef.
- Accent #f59e0b (amber; the mild theme warms it to #f0a033), accent ink #24251f.
- Brick red / terracotta is NOT the house accent. It appears nowhere in the codebase and
  must not be introduced: the Non-Slop `cream-terracotta` rule exists to catch exactly that
  default, so it is deliberately left un-allowed.

## Devices
- Hand-drawn pastel crayon Tikki illustrations serve as the friendly guide throughout the study journey.
- Single dominant purpose per screen with content-fitting primary action.
- Parallel three-language reading column (TH / EN / ZH) for constitutional cross-comparison.
- Micro-fine print at page bottoms for statutory citations and metadata.

## Layout
- Single reading column (max 68ch) that fits human eye line-length without fatiguing return sweeps.
- Content-hugging buttons and boxes: zero oversized empty textboxes, zero lazy padding, zero arbitrary min-height.
- Clear rhythmic hierarchy: Menu → Cute Tikki Cartoon → One Purpose → Next Action → Negligible Fine Print.
- Chrome earns its pixels: the header, navigation and sticky bands take the first screen only to the height they need, and a fixed region never covers the work. See `docs/MSH-LAW.md`.
- One band per message: two stacked rows carrying one message are one band. Merge them and let scale and negative space do the grouping.

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
- colour #f59e0b: house accent colour (amber, the next action)
