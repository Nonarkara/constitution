# Release integration · 14 November 2026

Reader: Thai civil-service learners, including those using enlarged text on a phone.
Task: read a complete question or heading, then reach its existing next action.
Grid: existing quiet column. Attention: heading or question → relevant illustration or text → action.
Constraints: TH/EN/ZH, 390/1024/1440, truthful labels, unchanged accessible header controls.
Direction: retain the study notebook and the Bangkok street margins; put the figure back in the street.

The four items the previous round left open are closed. The HTTPS redirect was
closed by the Worker, because the zone's own toggle is not reachable from this
project's token. The spatial sweep's hang was not a hang: `--routes` splits on
commas, every sweep script in this project's history passed spaces, and the
gate was therefore measuring one page whose path was the whole command line.
The 44 px header controls were already 44 px — the owner's own commit had
done it — and the header does not grow, because the brand mark already sets
its height. The independent review of the 13 November release is on record.

Plain HTTP used to answer 200 with the whole study application. It now
answers 308, and the path and the query string survive the redirect. The
Worker runs first for every request, not only for `/api/*`, which is what
lets it reach the pages at all. Four tests prove the behaviour before it can
reach the public domain; the suite is 295 tests and all of them pass.

The street plates were measured at the size the house actually renders them —
100 × 110.7 px on the desktop, 72 × 79.7 px on a phone, from a source of
760 × 841 — and at that size the cue printed inside each picture is 2.8 px and
the credit burned into the bottom of each is about 1.3 px. The Ratchadamnoen
plate was a girl at a school desk pasted over the corner of the road, 44% of
the picture's height, with the pastel's white aura around it. She is now at
the street's own scale — the size of the pedestrian the drawing already
contains, standing where that pedestrian stands — and the street keeps its own
people. The other four plates were looked at the same way, at full size and at
100 px, and they read.

The receipt now says which build it is a receipt of: 2,046 files, finger-
printed path-and-bytes in order. It also no longer deletes the pages it did
not measure. Recording six routes at a time, on a machine that reboots between
chunks, wrote a receipt of six routes over a receipt of forty-three; the
instrument promised an assembly that carried the unmeasured routes over and
did not do it. It does now, and it says plainly that it is an assembly and
names what it carried.

The export no longer carries Finder metadata. The release gate caught a
`.DS_Store` in the export — macOS writes one into any folder a person opens
in Finder, and the export copies `public/` wholesale — and the gate catching
it after the build means every build on a machine with a Finder open is a
build that has to be rebuilt somewhere else.

The full sweep recorded 2,709 fresh route-width cells (43 routes × 63 widths)
for build `034e2316b9b7f4c4`, measured together, with no grown, shrunk, gone
or unexplained finding. It finished in one attempt with no stall at all; the
browser was retired three times during the run, on purpose, at routes 12, 24
and 36. The sweep that preceded it, on the same build, stalled nine times.
[Receipt](../design/spatial-baseline.json) · [Live receipt](../design/msh-evidence/2026-11-14/live-release.json)

Deployed as Worker `e2eef6d6-2eb2-47d5-97cc-6b911ccc1aba`. The public domain
matches the build: 43 of 43 page bodies and 361 of 361 assets byte for byte.
Plain HTTP answers 308 to `https://constitution.nonarkara.org/read/?section=99`
with the query string kept. The re-spaced Thai is in the served bundle and the
pre-re-spacing text is not. The edge cache still reports `CF-Cache-Status:
HIT` for assets served through the Worker, and HSTS, CSP and
`X-Content-Type-Options` are all still on the response.

The 295-test suite, the illustration gate (35 plates, 10 re-derived byte for
byte, 10 scenes keeping their own ground), the street gate, the release gate,
the rules, Thai-phrase, data, layout, hierarchy and sentence gates and the
spatial sync gate all pass. `scripts/verify-live.mjs` is the release check
now: it compares the public domain against the build and writes the evidence
record, and it retries, because a machine under load runs out of ephemeral
ports and a release check that dies of a socket error reports nothing about
the release.

Real-device Safari, touch gestures and a complete keyboard walkthrough across
all routes remain outside the browser audit.
