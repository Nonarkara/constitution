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
