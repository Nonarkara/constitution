# MSH — Massacre Spatial Hallucination

**Canonical for every agent on every Non codebase.**  
Aliases: MSH · massacre spatial hallucination · design spatial hallucination.  
Companion laws: [ANTI-SPATIAL-HALLUCINATION.md](ANTI-SPATIAL-HALLUCINATION.md) · [AGENTS.md](AGENTS.md) · MoMA Rules (`Nonarkara/moma-rules`) · map pins (`FloodDash` spatial playbook).  
**Shipability benchmark: no slop.** Language slop is largely cured; the larger demon is **design AI slop** — samey, page-bleeding, unbalanced UI. MSH is the root.

> Every unnecessary scroll through empty space trains users to stop caring. Gradual, or last straw. Compact first. Scroll only for interesting detail. Prefer symbols to words when the meaning is clear. MoMA + MSH. One agent builds; a different agent audits.

---

## 0. Two meanings of “spatial hallucination” (both banned)

| Kind | What it invents | Honest failure |
|---|---|---|
| **Layout MSH** (this file) | Empty space, oversized boxes, stretch-to-fill, forever-scroll chrome | Fix the first unnecessary expansion |
| **Map MSH** (FloodDash / geo) | Fake lat/lng, centroids, guessed depth | Leave unpinned / `tip_cm` null |

This document is **layout MSH**. Map rules stay in the FloodDash spatial playbook and the `anti-spatial-hallucination` / `spatial-hallucination-kill` skills. Both apply when a product has a map **and** a UI.

---

## 1. Why MSH is the root of design slop

1. An element expands without a task reason (fat padding, fixed height, equal grid tracks, hero void).
2. Its row / header / panel grows to match.
3. Useful content drops below the first screen.
4. Related evidence and actions lose each other.
5. The user scrolls through **mostly empty space** to reconstruct what the layout should have shown.
6. Equal-weight blocks flatten hierarchy → page looks “AI default” even if fonts were fixed.

**Massacre the first expansion.** Do not decorate the consequences.

---

## 2. Hard laws (never break)

1. **Boxes fit content.** Padding ≈ 0.5–1.5× line-height. No fixed/`min-height` that leaves a void under short text. A control/chip/stat is ≤ **2×** content width and ≤ **1.6×** content height.
2. **No void.** No flat empty region over ~⅓ of the first screen. No phone-width column floating on desktop. No blank half while loading (skeleton or last-good data + timestamp).
3. **Compact first.** If the task fits one screen at 390×844 and 1440×900, make it fit. Scroll is for **interesting depth**, not for recovering from fat chrome.
4. **Symbols over prose** when the meaning is unambiguous (status dots, gauge marks, ↑↓, icons with `aria-label`). Never emoji-as-icon decoration.
5. **Logos never boxed.** No chip, border, shadow, or backing panel around a logo.
6. **Something must win.** One focal point; real contrast (≥1.5–2× type step). No equal card grids by default.
7. **Subtract before you add.** Before a new box/shadow/radius/badge, remove one. House caps unless `STYLE.md` overrides: ≤15 cards (composition discipline), ≤3 shadows, one radius system, ≤5 pills, ≤8 font sizes, no decorative gradient/glass, no first-load modal, light by default.
8. **Map-first surgical table** (map/data products): map ≥60% of first desktop and first phone screen; panels are edge instruments; nothing covers the map on load.
9. **MoMA alignment.** No loose edges that advertise amateur layout. Use `Nonarkara/moma-rules` spacing/type/grid numbers where the repo has adopted them; otherwise follow this house grid: spacing from a stated scale, hairline 1px without stealing layout, radius 0 unless `STYLE.md` says otherwise.
10. **Never self-review.** Builder ≠ auditor.

Banned AI-slop faces as primary: Inter, Poppins, Montserrat, Roboto, Open Sans, Lato, DM Sans, Space Grotesk, Geist, Plus Jakarta Sans, Manrope, Nunito, naked `system-ui` as the design face. Prefer Jost / Josefin / League Spartan; Thai Prompt or Kanit; ≤2 families.

---

## 3. Frontend shipability auditor checklist

**Role:** a different agent or human walks the live (or PR preview) UI. Score each row. Any **FAIL** blocks ship unless Non waives in writing.

### A. Capture

- [ ] Screenshots at **1440**, **1024**, **390** (and 320 if claimed).
- [ ] Squint / silhouette: could this outline be any SaaS landing page? If yes → redesign hierarchy, not colours.
- [ ] Run `npx github:Nonarkara/Non-Slop scan .` and render when Playwright is available. Fix every **SLOP**; explain or fix every **REVIEW**.

### B. MSH geometry (first screen)

| # | Check | Pass if | Fail if |
|---|---|---|---|
| B1 | First-screen task | Primary info + primary action visible together at 390 and 1440 | User must scroll through empty chrome to act |
| B2 | Chrome cost | Top+bottom bands fit contents; sticky offsets counted | Gigantic / stacked identity+title+status rows |
| B3 | Box fit | Boxes hug text; no text floating in a much larger panel | Text ≪ box → page bleeds vertically |
| B4 | Void | Empty space has a named job (map, measure, pause) | Dead thirds, stretch-to-fill, orphan columns |
| B5 | Scroll honesty | Extra screens earn new facts or actions | Forever-scroll of padding / equal cards |
| B6 | Symbols | Status/metrics use compact marks where clear | Long labels repeated where a mark would do |
| B7 | Hierarchy | Obvious 1st / 2nd / 3rd | Equal-weight mush |
| B8 | Proximity | Related controls grouped; less space inside groups than between | Scattered actions / pager at opposite edges |
| B9 | Map/data | Map ≥60% when applicable; panels docked | Map buried / covered on load |
| B10 | Logos | Sit on the surface | Boxed / chipped logos |
| B11 | MoMA | Edges align; no amateur loose corners | Near-miss edges, ragged rows without intent |
| B12 | Language | `lang` set; Thai/ZH room; no filler copy | “Unlock / seamless / revolutionize”, fake stats |
| B13 | Access | Focus visible, ≥44px taps, contrast, no clip | Keyboard traps, tiny targets |
| B14 | Preservation | Earned content/features still work | “Fixed” by deleting the product |

### C. Five measurements (per viewport)

Record for 390 / 1024 / 1440:

1. **Chrome cost** — band height share of viewport  
2. **Task visibility** — evidence + action together?  
3. **Geometry failures** — voids, inflated boxes, orphans, wrap accidents  
4. **Hierarchy** — stated 1/2/3 vs screenshot  
5. **Preservation** — what stayed usable  

### D. Verdict

```text
Verdict: PASS / REVISE / BLOCK
Auditor (≠ builder):
URL / PR:
Widths / langs checked:
MSH fails (id → element → repair):
Scanner: clean / SLOP hits / REVIEW hits:
MoMA / Non-Slop notes:
Kept on purpose:
Unverified:
```

**PASS** = no B-fails, scanner clean or explained, independent auditor named.  
**REVISE** = fixable MSH without product loss.  
**BLOCK** = first-screen void/bleed, self-review only, or map/geo hallucination on a live pin.

---

## 4. Builder procedure (short)

1. Brief: who, one job, hierarchy, constraints, subject-world direction.  
2. Relationships before rectangles (proximity, scale, empty-space job).  
3. Real content (long Thai/DE, empty, error, 10× rows).  
4. Compact composition at 390 + 1440 before adding scroll.  
5. Symbols where meaning is clear; prose ≤65ch.  
6. Scan + screenshots + **different** auditor with §3.

---

## 5. Where this lives

| Place | Role |
|---|---|
| `Nonarkara/Non-Slop` → `MSH.md` + `AGENTS.md` | Canonical pack any agent is pointed at |
| `ANTI-SPATIAL-HALLUCINATION.md` | Full layout law (this file is the auditor front door) |
| `Nonarkara/moma-rules` | Executable alignment numbers |
| `Nonarkara/palette` · vibecoding skills | Pointers in `AGENTS.md` / `CLAUDE.md` |
| FloodDash `knowledge/spatial-hallucination.md` | **Map** MSH only |
| Grok Bot skills `anti-slop-design`, `msh-auditor` | Always-on for design/review turns |

When rules conflict: **human task and contrast win; decoration loses.** Named `STYLE.md` choices are style, not slop — protect them.

---

*Owner voice (2026-10-30): compact up; scroll for interesting detail; texts → symbols when we can; MoMA + MSH; no-slop is the ship bar; auditors need a checklist as they walk the system.*
