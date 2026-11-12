# Independent release review

Auditor: Codex operability review, separate from the builder. Preview `http://127.0.0.1:3063`, revision `54bf03637bc7401a`. Verdict: **REVISE** for the specific enlarged-text and touch-target issues below.

Reviewed real Chromium pixels at 390 × 844, 1024 × 768 and 1440 × 900 for Notes, Cram and Memory. Enlarged 390 × 844 reviewed in Thai on those routes and in English and Chinese on Notes. The five changed street plates were also tested in a separate clean-profile Chromium run at 390 × 844. The 53px identity band takes 6.3%, 6.9% and 5.9% of the three viewports. At 390, the extra navigation row brings the two-band total to 98px (11.6%). At tablet and desktop the navigation is in the left rail.

| Check | Observation |
| --- | --- |
| B1 | The Notes read action, Cram hide/print controls and Memory recall action were visible with their content at all three normal widths and enlarged Thai 390. The street routes expose their first activity at 390. |
| B2 | Top band 53px in every measured state. The compact phone navigation clears the breadcrumb and content. |
| B3 | Normal controls hug their contents. Enlarged Thai Memory recall is 354 × 98.59px with an arrow isolated on its second line. |
| B4 | The reader measure and rail provide margins and keep controls aligned. No first-screen dead band displaces the primary action. The Notes graph occupies the larger desktop measure. |
| B5 | Cram scroll reveals new facts and cited sections. Memory scroll carries the exercise and more rooms. Notes scroll continues the study map and its detail. |
| B6 | Arrows and small status marks have clear jobs. The arrow orphan above increases height without carrying new information. |
| B7 | One clear heading, one primary activity, supporting copy and secondary links. Artwork remains smaller than the activity. |
| B8 | Reading controls, Cram modes and Memory recall are grouped. The Memory section link and bookmark share one item footer. |
| B9 | No geographic map is asserted by these plates. The Notes chapter map is an existing study visualization, visible on each first screen at normal text. |
| B10 | The constitutional wordmark remains on the surface. |
| B11 | Heading, breadcrumbs, controls and following content share the column edge. The 390 Amendment step strip intentionally scrolls in a contained row and shows the beginning of the next step at the edge. |
| B12 | Standard Thai Notes changes from ความก้าวหน้าของ / คุณ to ความก้าวหน้า / ของคุณ. Enlarged Thai Notes still splits the compound as ความ / ก้าวหน้า / ของคุณ. Cram enlarged leaves the final 100) alone in the first answer, with all digits visible. English and Chinese Notes preserve their actions and have no horizontal overflow. |
| B13 | Header language controls measure at least 44 × 44px; Cram primary controls exceed 44px high and no audited first-screen control clips. In the off-fold Notes section detail, the arrow button measures 16.03 × 44px while its grid track reserves 44px. |
| B14 | Existing Notes graph, Memory illustration, recall and citation controls, Cram facts, print control, and street illustrations still render. All five plates loaded at natural width 760 and rendered at 72 × 79.67px. |

Scanner: source Non-Slop gate reports zero points. Browser measurements are in `candidate-browser.json`, `independent-browser.json` and `streets-browser.json`. The latter two use isolated clean Chromium profiles. The interactive desktop browser connection timed out, so direct keyboard and touch operation of every route were not established by this review. The route audit verifies geometry and visibility with rendered captures; no production data or user records were used. Tiny place stamps in the thumbnails are illustrative. The full-size corrected Democracy Monument WebP was reviewed separately.

Found · Standard Notes heading orphan cleared; enlarged Thai headings and recall still need reflow; Notes detail arrow has a 16px hit width.
Changed · This audit made no product changes. It recorded clean-profile captures for all five street routes and the remaining language and viewport states.
Verified · Exact viewport widths, one main heading and first useful actions on the reviewed routes, loaded street WebPs, and no document overflow.
Remaining · Retest enlarged Thai wraps and arrow hit width after fixes. Keyboard and touch interaction beyond the existing test evidence remains unverified.

## Revised candidate — 91c18b3e10612240

**Verdict: PASS for the reviewed release surfaces.** The enlarged Thai Notes heading stays on one line, the Memory recall control is 270.86 × 62.30px with its arrow on the same line, and the second Cram line keeps the 100 figure with its party-list label. Both Notes detail arrows measure 44 × 44px in every tested Notes state.

I exercised the Notes detail next arrow in a separate clean Chromium profile at 390 × 844 with enlarged Thai. A pointer click advanced section 98 to 99. Shift+Tab and Tab returned keyboard focus to the control with a visible outline, and Space advanced to section 100 with focus retained. The pointer/keyboard measurements and resulting screen are in `interaction-notes-detail.json` and `interaction-notes-detail-390-th-large.png`.

The revised browser matrix recorded 19 states, including normal Thai Notes, Cram and Memory at 390 × 844, 1024 × 768 and 1440 × 900. The 390 matrix also covers enlarged Thai on those three routes, enlarged English and Chinese on Notes, and the five street routes. All 19 document widths equal their viewport widths. The top band stays at 53px, with the enlarged Thai Cram/Memory phone navigation measuring 46.39px and the other phone cases 45px. Each of the five street plates loaded at the expected natural width of 760px. The Notes map and article detail, Memory card and retrieval affordance, and Cram facts and citation links remain in place.

Found · The previous enlarged-text and touch-target defects reproduced on 54bf03637bc7401a.
Changed · The revised candidate shortened the Thai heading and recall label, balanced Cram figures and filled the reserved Notes arrow tracks.
Verified · The four targeted fixes, 19 responsive render states, and pointer and keyboard section navigation in enlarged Thai.
Remaining · Real-device Safari, touch gestures and a complete keyboard walkthrough across all routes were outside this retest. Production delivery and the full spatial sweep are separate release checks.
