// Small generated views of the big data files, so pages that only list chapters
// or count progress do not ship the full trilingual corpus and question bank.
import { readFile, writeFile } from "node:fs/promises";
const read = async (path) => JSON.parse(await readFile(path, "utf8"));
const corpus = await read("data/constitution.json");
const questions = await read("data/questions.json");
const write = (path, value) => writeFile(path, JSON.stringify(value) + "\n");
await write("data/outline.json", { meta: corpus.meta, chapters: corpus.chapters });
await write(
  "data/question-index.json",
  questions.map(({ id, chapter, sections }) => ({ id, chapter, sections })),
);
console.log(`Indexes: ${corpus.chapters.length} chapters, ${questions.length} questions.`);

// The dots: every link between sections comes from the data itself, never invented.
// xref = the Thai text of one section names another; groups = a topic, glossary
// term or question that lists several sections together (editorial, and labelled so).
const topics = await read("data/topics.json");
const glossary = await read("data/glossary.json");
const cases = await read("data/cases.json");
const arabic = (t) => t.replace(/[๐-๙]/g, (d) => String("๐๑๒๓๔๕๖๗๘๙".indexOf(d)));
const xref = [];
for (const s of corpus.sections) {
  const seen = new Set();
  for (const m of arabic(s.th).matchAll(/มาตรา\s*(\d+)/g)) {
    const n = Number(m[1]);
    if (n >= 1 && n <= 279 && n !== s.number && !seen.has(n)) seen.add(n), xref.push([s.number, n]);
  }
}
const label = (o) => ({ th: o.th, en: o.en, zh: o.zh });
const groups = [
  ...topics.filter((t) => t.sections.length > 1).map((t) => ["topic", t.id, label(t.topic), t.sections]),
  ...glossary.filter((g) => g.sections.length > 1).map((g) => ["term", g.id, label(g.term), g.sections]),
  ...questions
    .filter((q) => new Set(q.sections).size > 1)
    .map((q) => ["question", q.id, label(q.prompt), [...new Set(q.sections)]]),
];
// A short Thai opening per section for the dig panel; Thai is the legal source.
const lead = corpus.sections.map((s) => {
  const t = s.th.replace(/\s+/g, " ").trim();
  return t.length > 90 ? t.slice(0, 88) + "…" : t;
});
const caseRefs = cases.map((c) => [c.id, c.sections, label(c.prompt)]);
await write("data/graph.json", { xref, groups, lead, cases: caseRefs });
console.log(`Graph: ${xref.length} cross-references, ${groups.length} groups.`);
