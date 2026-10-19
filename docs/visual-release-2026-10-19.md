# Tikky visual learning release — 19 October 2026

## Intent and scope

Redraw the existing female protagonist using the user's supplied likeness reference. Retain pastel crayon texture, visual jokes and the established Palette layout. Do not publish source photographs. Add visible post-feedback visual pauses at least every third question, with extra exact-rule mnemonics where available. Preserve blind-test and concealed-retry integrity.

## Asset production

Built-in image_gen; eleven project assets in `public/illustrations/`: reading/listening/review-pastel.webp, palace-1 through palace-4.webp civic-palace-pastel.webp, thinking-pastel.webp, term-clock-pastel.webp and core-lock-pastel.webp. These contain 26 scenes across the study and memory-house surfaces. Replacements retain existing filenames and original scene layout; original files remain recoverable in Git history. WebP encoding only after generation; no photo copied into the public directory.

Prompt set: redraw each original educational scene, preserving its objects, visual joke, counts and panel layout; use Tikky's dark shoulder-length side-parted bob, smiling eyes and broad toothy smile from the supplied reference; adult crayon caricature, pale sage/dusty blue/butter yellow/blush on white paper, visible imperfect strokes. No glossy vectors, gradients, added words or watermarks. Four-panel assets retain four equal-width quarters in a horizontal 3:1 atlas. Study assets remain square. Three new scenes show Tikky tracing a reasoning path while a duck walks in circles, an eight-tick clock that a duck tries to reset by swapping clocks, and a locked constitutional core which a banana cannot unlock. These are memory metaphors; the HTML text carries the legal rule.

## Learning integration

QuestionVisual is shown only after feedback in lesson Quiz, PracticeArena, mock-exam results, BlindExam answer review, and Pokklong practice. Generic maps use the actual item's reasoning and correct choice, with a separate selected distractor when wrong. They do not infer rules from chapter membership. Matched mnemonics reuse the existing rule-aware cue matcher, which distinguishes cabinet size from the prime-minister term despite their shared section158. Pokklong ordinary-law references never become Constitution section links. Cadence uses the displayed queue position, not shuffled answer positions.

## Release audit

Pending: full release gate, independent diff review, browser journeys at phone/tablet/desktop, deploy and exact-byte verification. Initial independent review identified active-round reload loss in ordinary Practice and timed Exam (answered Practice mastery persists, but active score/round does not; Exam selections are transient). Blind checkpoints already persist. Timed Exam now restores a validated deterministic paper, exact choice order, selections, question index and original deadline. Refresh never extends the deadline. Ordinary Practice records each answer, but a reload starts a new round; round score remains transient.

## Verified result

- Full `npm run release` passes 190 tests, typecheck, corpus/translation/question validators, production export, generated indexes, live-asset integrity, contrast and design gates. Layout: 140 measurements across 28 routes at 390/721/860/1024/1440px, no horizontal overflow.
- Independent review found and closed two integration errors: section256 questions about readings/votes/court review must not receive the petition mnemonic, including the legacy MemoryCue; Blind remediation cadence must use the stable owed queue rather than original sitting positions. Actual component tests cover concealed retries and the mixed-correctness cadence case.
- Browser: visual absent before answering; cabinet mnemonic appears after feedback; generic map appears on third question; native details control hides the map for recall. TH/EN/ZH labels inspected. Phone revision removed repeated full explanations and gives answer comparison full width. Independent review passed cabinet feedback at1440/1024/390, phone home and final390 general map.
- Timed Exam: selected an answer, moved to question2, refreshed, recovered question2 and the selected answer with the original deadline counting down; submitted and verified reload does not resume or record it twice. Review showed ten visual pauses for that paper's missed/unanswered items.
- Production dependency audit: zero reported vulnerabilities (`npm audit --omit=dev`), not a penetration test. Existing Worker boundaries remain tested. Live news API returned HTTP200 with72 headlines and three healthy feed statuses.
- No source photographs were copied into the repository or public assets. Built-in generation outputs were converted to WebP for runtime delivery.

Limits: physical-iPad dictation and native PWA installation still require a device check. This audit does not freshly recertify every legal question. Ordinary Practice preserves saved learning records but not a round's in-memory score across refresh; timed Exam and Blind sittings have checkpoints.

Evidence: `.openai/qa/oct19-release-ship.log`, `oct19-visual-1440.png`, `oct19-visual-1024.png`, `oct19-visual-390.png`, `oct19-map-390-final.png`, `oct19-home-390.png`, `oct19-dependency-audit.json`. Deployment verification follows after publication.
