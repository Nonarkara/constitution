# Release integration · 13 November 2026

Reader: Thai civil-service learners, including those using enlarged text on a phone.
Task: read a complete question or heading, then reach its existing next action.
Grid: existing quiet column. Attention: heading or question → relevant illustration or text → action.
Constraints: TH/EN/ZH, 390/1024/1440, truthful labels, and unchanged accessible header controls.
Direction: retain the study notebook and existing Bangkok illustrations; balance heading lines without adding a band.

The shared tree was captured into an isolated release worktree. The branch includes the unpushed Thai and illustration work, the working corrections, and Dependabot's parser update. The 44px header controls stay: the existing two rows fit the phone budget, and shrinking targets is a separate design decision.

Compared 6,132 Thai fields against the pre-spacing banks. Only whitespace differs in 1,687 fields; every original letter and protected quotation/reference survives. The comparison caught one truncated word in the incoming commit. The authoring guard now refuses any non-whitespace difference, and the literal-mask regression exercises restoration of a quotation and a section reference.

Five illustrated street margins remain. The Democracy Monument caption now reads อนุสาวรีย์ประชาธิปไตย ([Phra Nakhon district source](https://webportal.bangkok.go.th/upload/user/00000086/ITA%2520Data/23-11-63.pdf)); the same Python recipe regenerated the scene and its manifests.

At 390 × 844, the top bar and the navigation strip total 98 px (11.6%). At 1024 and 1440, navigation is a side column. The original Notes title stranded คุณ at 390 and broke into three lines at enlarged size. The new Thai heading ความคืบหน้า stays on one line. Notes section controls fill their existing 44 px tracks. Memory's enlarged Thai recall action and its arrow share one line. Cram keeps the House count attached to its label; its figures and sources are unchanged.

[Independent review](../design/msh-evidence/2026-11-13/independent-review.md) · [Browser geometry](../design/msh-evidence/2026-11-13/final-browser.json) · [Keyboard and pointer exercise](../design/msh-evidence/2026-11-13/candidate-interactions.json)

The 390 px enlarged exercise used a fresh browser profile: Notes advanced from section 98 to 99 with Enter; Cram covered its answers and revealed the selected House fact; Memory began recall and returned to its room on exit. The regular Notes, Memory and Cram states were captured at 390 × 844, 1024 × 768 and 1440 × 900. Enlarged English and Chinese Notes were also checked.

At enlarged size the display menu fits on a 390 px phone in Thai, English and Chinese; Escape closes it and restores focus. [Menu interaction receipt](../design/msh-evidence/2026-11-13/display-interactions.json)

The prior live offline shell listed `/illustrations/.DS_Store`. The isolated export omits it, and the release gate rejects both Finder metadata and AppleDouble files in the export. An injected Finder file was the sole failure in a copy of the clean export. The news parser is pinned by the lockfile at 5.12.0, and both dependency audits reported zero advisories.

The full sweep recorded 2,709 fresh route-width cells (43 routes × 63 widths) for offline revision `91c18b3e10612240`, including all four container boundaries. Seventeen incomplete readings were rejected and the four affected routes were remeasured at every width. The project gate now rejects untitled receipts without changing the shared instrument. The final receipt has no missing cells, document overflow, unexplained findings or stale reasons. The Notes action moved 45–62 px earlier where its heading was shortened. [Measurement comparison and raw receipts](../design/msh-evidence/2026-11-13/spatial/)

The 291-test suite, the 18 focused checks on the revised screens and authoring guard, the static build, data and citation guards, street and illustration checks, release checks, hierarchy, responsive layout, and independent review passed. The concurrent release commits were merged without changing the measured source tree. Dependabot [PR #8](https://github.com/Nonarkara/constitution/pull/8) was closed in the parallel session; its commit and the equivalent parallel patch are both ancestors of this release.
