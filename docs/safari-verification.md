# Native Safari verification — 12 October 2026

Application source tested: 553fec0 (the deployed practice-arena integration).

Tested in the native macOS Safari application through its visible controls, not a Chromium viewport emulation.

## Public production checks

- The live Settings page showed the complete offline kit ready on a fresh Safari visit.
- Section 27 rendered Thai, English and Chinese text with source links.
- Thai playback advanced to 0:12 of 1:33.
- Starting English playback stopped Thai playback; English audio advanced normally.
- Saving English section 27 changed the button to Saved and explained its offline availability.
- Starting Chinese playback stopped English playback; Chinese audio advanced to 0:56 of 1:05.
- With Chinese playback paused, clicking its actual slider moved it from 0:56 to 0:32. An accessibility value assignment alone was not counted as proof of seeking.

## Safari with the preview server stopped

A fresh localhost:3062 origin served the exact committed production export. Safari installed the kit and saved English section 27. The preview server then exited, with its terminal handle confirming completion.

- A full page reload retained the section and Saved state.
- The saved English recording played and the slider moved from 0:00 to 0:35 of 1:10.
- Entering Thai digits ๒๘ in the search field returned section 28; opening it rendered all three languages.
- Unsaved section 28 audio correctly reported unavailable and offered device speech.
- Navigation to the previously unvisited practice route loaded the arena.
- Answering competition question 1 correctly showed 100 percent and 10 XP.
- A full offline reload retained 10 XP, the one-day streak and one answered question in the study profile.

## Scope of this evidence

This confirms these flows in native desktop Safari/WebKit. It does not prove installation on a physical iPad, iPad keyboard dictation, microphone recognition, or every device/OS version. No microphone permission was granted and no real voice-input result is claimed. Those device checks still require user/device access.
