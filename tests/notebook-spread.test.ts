/**
 * The notebook's two-page spread broke in a way no link, contrast or overflow
 * check could see, so it is guarded here by the thing that actually broke:
 * the DOM order of the grid's children versus the grid's declared columns.
 *
 * `.open-spread-book` is `grid-template-columns: 1fr 12px 1fr` — a left page,
 * a 12px spine, a right page. The spine was the FIRST child, so auto-placement
 * handed it the left page's entire 1fr column (488px of empty paper) and
 * crushed the left page into the 12px track (57px wide, overlapping the right
 * page). The spread had been broken since the notebook was first built.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const reader = readFileSync(new URL("components/DoublePageReader.tsx", root), "utf8");
const css = readFileSync(new URL("app/globals.css", root), "utf8");

test("the spread's grid columns are page | spine | page", () => {
  const rule = /\.open-spread-book\s*\{([^}]*)\}/.exec(css);
  assert.ok(rule, ".open-spread-book rule not found");
  const cols = /grid-template-columns:\s*([^;]+);/.exec(rule[1]);
  assert.ok(cols, "no grid-template-columns on .open-spread-book");
  // three tracks: two page columns around a narrow spine track
  const parts = cols[1].trim().split(/\s+/);
  assert.equal(parts.length, 3, `expected 3 grid tracks, got "${cols[1]}"`);
  assert.match(parts[1], /^\d+px$/, "the middle track must be the fixed-width spine");
});

test("the spine is the SECOND child of the spread, between the two pages", () => {
  // The order the grid will see, in source order. The class names are built
  // with template literals, so match the marker inside the className value.
  const at = (marker: string) => {
    const i = reader.indexOf(marker);
    if (i < 0) return -1;
    // walk back to the enclosing className= so a hit in a comment or a
    // stylesheet reference cannot masquerade as the element.
    const head = reader.lastIndexOf("className=", i);
    if (head < 0) return -1;
    return reader.slice(head, i + marker.length).includes(marker) ? i : -1;
  };
  const spineAt = at('book-spine');
  const leftAt = at('page-left');
  const rightAt = at('page-right');
  assert.ok(spineAt > 0, "no .book-spine element found");
  assert.ok(leftAt > 0, "no .page-left element found");
  assert.ok(rightAt > 0, "no .page-right element found");

  const order: string[] = [];
  if (leftAt < spineAt && spineAt < rightAt) order.push("page-left", "book-spine", "page-right");
  else if (spineAt < leftAt && leftAt < rightAt) order.push("book-spine", "page-left", "page-right");
  else if (leftAt < rightAt && rightAt < spineAt) order.push("page-left", "page-right", "book-spine");
  else order.push("unrecognised order");

  assert.deepEqual(
    order,
    ["page-left", "book-spine", "page-right"],
    `the spread renders its children as [${order.join(", ")}] but the grid is ` +
      `1fr 12px 1fr — the spine must be the middle child or it takes a whole page column`,
  );
});

test("the spine is hidden on one-column layouts, so the pages stack in order", () => {
  // At <=900px the grid becomes a single column and the spine is removed, so
  // the remaining children must be page-left then page-right.
  const mobile = /@media \(max-width: 900px\)\s*\{([\s\S]*?)\n\}/.exec(css);
  assert.ok(mobile, "no 900px media block for the spread");
  assert.match(mobile[1], /\.book-spine\s*\{[^}]*display:\s*none/, "the spine must be hidden on phones");
});
