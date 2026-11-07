# Rokehan backgrounds — working plan

## The tool
https://tools.oyasumi-gamedev.com/rokehan/ — "どこでもロケハン / Location Scout".
Turns any real street block into 3D from OpenStreetMap + elevation tiles and
draws it as a manga background (line art + screentone). Free, browser-only.

### URL contract (read from the page's own JS)
`#ll=LAT,LON&s=SIZE_M&ex=LOOK&mode=FINISH&far=KM&tod=day|late|night&n=NAME&cam=posX,posY,posZ,tgtX,tgtY,tgtZ,lens`

- `ex` (look): `color` | `gray` | `clay` | `fog`
- `mode` (finish): `color` | `colorline` | `line` | `linetone`
- `far`: distant view in KM (0 = none)
- `s`: near area width in metres (100/200/300/400/600/800/1000)
- `cam`: camera position, target, lens

**House look = `ex=gray&mode=linetone`** — greyscale manga screentone, which is
the house's own language.

### Terms (read from the page's footer, Japanese)
- The picture and the 3D model MAY be used **inside a work**, commercial or
  non-commercial.
- When the work is published, the credit shown at the bottom-right of the
  picture MUST be written near the picture or in the colophon:
  `© OpenStreetMap contributors`, the elevation source, and `© OpenMapTiles`
  when the distant view is used. For print: openstreetmap.org/copyright.
- The exported file may NOT be distributed or sold as-is, or with only slight
  modification.
- The OSM data itself is ODbL and its rights are not restricted by those terms.

### Consequences for this codebase
- Ship the backgrounds as part of a composed scene, never as a bare asset.
- The PNG export already burns the credit into the bottom-right → keep it.
- Record the credit in the repo (data/sources/) and in the app.

## Locations (Bangkok)
| key | place | lat,lon | s | kind |
|---|---|---|---|---|
| ratchadamnoen | ถนนราชดำเนิน | 13.75670,100.50170 | 300 | civic avenue |
| grandpalace | วัดพระแก้ว / พระราชวัง | 13.75000,100.49130 | 400 | temple |
| yaowarat | เยาวราช / ไชน่าทาวน์ | 13.73960,100.51000 | 200 | alleyways |
| sukhumvit | สุขุมวิท / อโศก | 13.73700,100.56000 | 200 | city |
| khlongtoei | คลองเตย | 13.71000,100.56000 | 200 | waterside |
| chatuchak | จตุจักร | 13.79970,100.55030 | 300 | market |

## Steps
1. Render each in the browser: navigate the hash URL, wait for the load, export PNG.
2. Process: house paper ground, greyscale tone, webp, web-sized.
3. Wire: Tikki in colour over a greyscaled background, on strategic pages.
4. Credit: repo + app.
5. Verify: illustration gate, layout gate, spatial gate, screenshots.

## State
- [x] tool understood, terms read, URL contract extracted
- [x] renders captured (five scenes; raw masters in design/illustrations/streets/)
- [x] processed (scripts/illustrations/build_streets.py)
- [x] wired (STUDY_ART: amend, exam, news, read, topics)
- [x] credited (data/sources/streets.json, Sources page card 06)
- [x] verified 2026-11-07: verify, build, slop, layout, hierarchy, illustrations, streets and the full spatial sweep (run in chunks of ten routes)
- Not drawn: khlongtoei, chatuchak (listed above, no page needs them yet)
