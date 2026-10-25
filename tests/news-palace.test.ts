import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { citeFor, citeSections, newsHomes, roomSections } from "../lib/news-palace.ts";
import { palace } from "../lib/palace.ts";
import { topics as newsTopics } from "../lib/news.ts";

const root = process.cwd();
const read = (p: string) => JSON.parse(readFileSync(path.join(root, p), "utf8"));

const subjects = read("data/topics.json") as {
  id: string;
  topic: { th: string; en: string; zh: string };
  sections: number[];
}[];
const outline = read("data/outline.json") as {
  chapters: {
    number: number;
    start: number;
    end: number;
    transitory?: boolean;
  }[];
};

const subjectById = new Map(subjects.map((s) => [s.id, s]));
const chapterOf = (section: number) =>
  outline.chapters.find((c) => section >= c.start && section <= c.end);

test("every news topic has a home in the constitution", () => {
  const missing = newsTopics.map((t) => t.id).filter((id) => !newsHomes[id]);
  assert.deepEqual(missing, [], `news topics with no home: ${missing.join(", ")}`);
});

test("every home names a real subject in the constitution's own index", () => {
  for (const [id, home] of Object.entries(newsHomes)) {
    const subject = subjectById.get(home.subject);
    assert.ok(
      subject,
      `${id}: no such subject "${home.subject}" in data/topics.json`,
    );
    assert.deepEqual(
      [...home.sections].sort((a, b) => a - b),
      [...subject.sections].sort((a, b) => a - b),
      `${id}: the sections do not match the subject "${home.subject}"`,
    );
    assert.equal(home.title.th, subject.topic.th, `${id}: Thai title drifted`);
    assert.equal(home.title.en, subject.topic.en, `${id}: English title drifted`);
    assert.equal(home.title.zh, subject.topic.zh, `${id}: Chinese title drifted`);
  }
});

test("every home sits in a chapter that carries its law", () => {
  for (const [id, home] of Object.entries(newsHomes)) {
    const inside = home.sections.filter((s) => chapterOf(s)?.number === home.chapter);
    assert.ok(
      inside.length > 0,
      `${id}: no section of "${home.subject}" is in chapter ${home.chapter}`,
    );
  }
});

test("every home cites only the sections that lie inside its own room's chapter", () => {
  for (const [id, home] of Object.entries(newsHomes)) {
    const range = outline.chapters.find((c) => c.number === home.chapter);
    assert.ok(range, `${id}: chapter ${home.chapter} is not in data/outline.json`);
    const cited = roomSections(home, outline.chapters);
    // Every section the row cites must lie inside the room's chapter. A row
    // that cited a section from another chapter would be claiming the room
    // holds it, and it does not.
    assert.ok(
      cited.length > 0,
      `${id}: the room of chapter ${home.chapter} cites no section of "${home.subject}"`,
    );
    for (const section of cited)
      assert.ok(
        section >= range.start && section <= range.end,
        `${id}: §${section} is not inside chapter ${home.chapter} (${range.start}-${range.end})`,
      );
    // And the cite must be exactly the sections of the subject that the
    // room holds: none dropped, none invented.
    assert.deepEqual(
      [...cited].sort((a, b) => a - b),
      home.sections
        .filter((s) => s >= range.start && s <= range.end)
        .sort((a, b) => a - b),
      `${id}: the cited sections are not the sections of "${home.subject}" that chapter ${home.chapter} holds`,
    );
  }
});

test("the citation under a row names no section from another chapter", () => {
  for (const [id, home] of Object.entries(newsHomes)) {
    const cite = citeFor(home, outline.chapters);
    const inside = new Set(roomSections(home, outline.chapters));
    assert.equal(cite, citeSections([...inside]), `${id}: the cite is not built from the room's sections`);
    for (const number of cite.match(/\d+/g) || [])
      assert.ok(
        inside.has(Number(number)),
        `${id}: the cite "${cite}" names §${number}, which is outside chapter ${home.chapter}`,
      );
  }
});

test("the referendum's room is the amendment chapter, so its row cites only the section it holds", () => {
  const home = newsHomes.referendum;
  assert.equal(home.chapter, 15);
  assert.deepEqual(home.sections, [50, 166, 224, 256]);
  assert.deepEqual(roomSections(home, outline.chapters), [256]);
  assert.equal(citeFor(home, outline.chapters), "§256");
});

test("the memory house has sixteen rooms and the constitution seventeen chapters", () => {
  assert.equal(palace.length, 16, "the memory house's rooms");
  assert.equal(outline.chapters.length, 17, "the constitution's chapters");
  assert.deepEqual(
    palace.map((p) => p.chapter),
    Array.from({ length: 16 }, (_, i) => i + 1),
    "the house holds chapters one to sixteen, one room each",
  );
  const transitory = outline.chapters.find((c) => c.number === 17);
  assert.ok(transitory, "the outline entry for the separate Transitory Provisions");
  assert.equal(transitory.transitory, true);
  assert.equal(transitory.start, 262);
  assert.equal(transitory.end, 279);
  assert.equal(
    palace.find((p) => p.chapter === 17),
    undefined,
    "chapter 17 (Transitory Provisions) has no room, and no room was invented for it",
  );
});

test("every home has a room in the memory house", () => {
  for (const [id, home] of Object.entries(newsHomes)) {
    const room = palace.find((p) => p.chapter === home.chapter);
    assert.ok(
      room,
      `${id}: the memory house has no room for chapter ${home.chapter}`,
    );
  }
});

test("the citation writes a run of sections as a range and the rest in one line", () => {
  assert.equal(citeSections([50]), "§50");
  assert.equal(citeSections([140, 141, 142, 143, 144]), "§140–144");
  assert.equal(citeSections([25, 26]), "§25–26");
  assert.equal(citeSections([81, 133, 136]), "§81, 133, 136");
  assert.equal(citeSections([81, 133, 136, 137, 145, 146]), "§81…146");
  assert.equal(citeSections([]), "");
});

test("every home has a short form that stands inside its own title", () => {
  for (const [id, home] of Object.entries(newsHomes)) {
    for (const lang of ["th", "en", "zh"] as const) {
      const short = home.short[lang];
      const title = home.title[lang];
      assert.ok(short.length > 0, `${id}: no short ${lang} label`);
      assert.ok(
        short.length <= title.length,
        `${id}: the short ${lang} label is longer than the title`,
      );
    }
  }
});

/* WHAT THE PAGE PROMISES, AND WHAT IT DELIVERS.
 *
 * The number beside a topic is the subject's sections inside the room's
 * chapter — the room's own list is a shorter set of highlights inside that
 * chapter, not the whole of it. A page that calls those numbers "the section
 * numbers inside that room" claims the room holds them, and a reader who
 * opens the room finds a different, shorter list. The copy and the room's
 * own extent are checked here so that claim cannot come back. */
test("news links are suggested study entries rather than legal classifications", () => {
  const desk = readFileSync(path.join(root, "components", "NewsDesk.tsx"), "utf8");
  for (const phrase of ["broad keyword matches", "suggested study starting points", "not a legal classification", "จุดเริ่มอ่านที่แนะนำ", "并非对每篇报道的法律定性"]) {
    assert.ok(desk.includes(phrase), `missing scope disclosure: ${phrase}`);
  }
  assert.ok(!desk.includes("The seventeenth chapter"));
});

test("the memory house states each room's extent, so the claim can be checked", () => {
  const house = readFileSync(
    path.join(root, "components", "MemoryHouse.tsx"),
    "utf8",
  );
  assert.ok(
    house.includes("chapter.start") && house.includes("chapter.end"),
    "the room does not say which sections its chapter covers",
  );
  for (const chapter of outline.chapters) {
    if (chapter.number > 16) continue;
    assert.ok(
      chapter.end >= chapter.start,
      `chapter ${chapter.number} has no extent`,
    );
  }
});
