# Home navigation spacing

The learner should read a topic heading, understand its short description, and choose a destination within one group. The home page uses a reading column on phones and columns for the two study topics on larger screens. The first link names the main action. The two secondary destinations share a quieter row.

The old CSS forced each link into a separate 44px row with an additional 8px gap. Description padding and section gaps enlarged the stack. Footer rules also forced three separate rows on phones. The revised grid fits the three links in two rows, puts the action 6px after its description, and groups the footer credit, country and source link. All content and routes remain available, including the notebook and Tikky cover.

The independent reviewer measured the Thai home page at 390 × 844. Page height fell from 1,970px to 1,672px. Each practice/memory section fell from 289px to 208px, the reference section from 289px to 215px, and the footer from 150px to 113px. At enlarged Thai, page height fell from 2,244px to 1,968px. Desktop height fell by 99px. Header height remained 53px. Every link remained at least 44px high. The whole-page walk included 320, 390, 1024 and 1440px, plus enlarged Thai, English and Chinese.

The browser gate now checks the full link-group height, the shared secondary row, the distance from description to action and the phone footer height. Restoring the original vertical link stack in a scratch export makes the gate fail at every checked width. Keyboard traversal reached all nine study destinations and both footer links with visible focus.

[Before measurements](../design/msh-evidence/2026-11-24-navigation-spacing/before.json) · [After measurements](../design/msh-evidence/2026-11-24-navigation-spacing/after.json) · [Keyboard check](../design/msh-evidence/2026-11-24-navigation-spacing/keyboard.json) · [Phone](../design/msh-evidence/2026-11-24-navigation-spacing/390-lower.png) · [Tablet](../design/msh-evidence/2026-11-24-navigation-spacing/1024-lower.png) · [Desktop](../design/msh-evidence/2026-11-24-navigation-spacing/1440-lower.png)

The shared site footer now has its own class. An intermediate whole-site sweep caught the generic footer rule wrapping the notebook controls; the final build scopes the compact layout to the site footer and preserves the working reader. The final receipt records 2,562 fresh loads across 42 routes and 61 widths on one export, with no new exceptions. All 299 tests, the rendered layout/hierarchy gates and source checks passed.

Real-device Safari, touch and an exhaustive review of every interactive state were outside this layout check.
