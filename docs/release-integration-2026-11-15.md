# Release integration · 15 November 2026

People following a chapter or section link need the title, reading controls and legal text in the existing reading column. The loading heading provides orientation while the browser prepares the study screen.

The release checks previously had two ways to sample unfinished content. The spatial instrument accepted a page without a heading and the receipt rejected it later. Adding a heading to the loading state allowed the receipt to accept that state. The loading headings now carry a machine-readable marker. Both the spatial and hierarchy checks wait for it to clear. The constitution spatial check also requires a visible main heading before sampling and checks readiness again after layout settles.

A browser fixture held the loading heading for 900 ms. The spatial measurement recorded the section control after it appeared. A second fixture held the fallback indefinitely and failed with a readiness error. The hierarchy test covers both delayed and permanent loading states.

The independent Chromium reviewer captured Section 256 and Chapter 15 at 390 × 844, 1024 × 768 and 1440 × 900, plus enlarged Thai at 390 px. The default Section route showed search and the default Read route showed Chapter 1. The header was 53 px and all header controls met 44 × 44 px. The existing enlarged Thai chapter selector truncates its selected option, while the full title appears directly above it. Section's comparison checkbox has a short touch target. Physical iPad Safari and touch still need a device check. [Independent screenshots and measurements](../design/msh-evidence/2026-11-15/independent-browser.json)
