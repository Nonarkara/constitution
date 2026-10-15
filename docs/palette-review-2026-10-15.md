# Palette composition review — 15 October 2026

## Intent and scope

The learner should see the next lesson before making a menu decision. The previous composition put four theme swatches, civic shortcuts and a large drawing ahead of that task. This pass revises the shared shell and learning path, preserving the corpus, exams, illustrations, diagrams and browser progress code.

Design read and palette roles were recorded in `context.md` before editing. References: the printed Senate Constitution's hierarchy and Vignelli's 1972 subway map's continuous route. Civic register; variance 4, motion 1, density 4. These are composition references, not copied artwork or a claim of using a historical Wada plate.

## Decisions and purpose

- Keep paper and ink dominant, amber for the next lesson and focus. Existing answer-state colours retain their meaning. No new palette, font, gradient, shadow or animation.
- Reduce the shared header and align its width with the main content. Language selection uses an underline; four reading themes sit in a labelled native disclosure. Keyboard activation, button labels and pressed states remain available.
- Put the lesson text first and keep the pastel drawing beside it at a smaller size. On a phone the picture sits beside the heading, leaving the description and action full width.
- Put the lesson method in a disclosure, exam resources in a labelled navigation, and civic links after the learner's continuation links. All destinations remain available.
- Keep the chapter map as a continuous list with small memory pictures, readable names, progress and practice actions. No repeated decorative card grid.
- Load the existing public font stylesheet through the document head. Turbopack could not resolve its former absolute CSS import; the document link works with the public font paths in development and production.

## Rendered review

Local browser checks at 375×812, 768×1024 and 1280×720. Thai, English and Chinese were exercised. On the Thai phone view, the complete next-lesson button ends around y=540 and document width equals viewport width (375). The 768px dark view has no horizontal overflow. Large text plus high contrast at 375px also has no horizontal overflow; the complete lesson button remains visible near the bottom of the first screen.

Second-pass corrections: align memory pictures with the start of each chapter row, remove a redundant route border, remove separator dots that floated between wrapped resource links, and shorten the English heading to “Learn the Constitution.” after its previous wording broke into four phone lines. This is a study product: the lesson button deliberately carries a small chapter label above its destination, rather than applying a marketing rule requiring a single-line CTA.

The Chinese next-lesson button opened the initial real-life puzzle with native answer controls. Reading themes were switched through their visible controls. Large text was enabled through Settings and then restored. No learner progress was reset or imported.

## Verification and limits

`npm run verify` passed: corpus/question/drill/case/translation validation, 114 tests and TypeScript. Existing theme tests verify contrast across the four reading themes. No new packages or state schema changes.

`npx --yes axiom-audit . --strict` could not run: the npm registry returned E404 for `axiom-audit`. No automated anti-slop score or strict scanner pass is claimed. This review uses source inspection, existing contrast tests and rendered browser checks. It does not claim a new exhaustive accessibility audit or human usability study.

Production build and live release evidence follow below after deployment.
