import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const LANGS = ["th", "en", "zh"];
const arabic = (text) =>
  text.replace(/[๐-๙]/g, (char) => String("๐๑๒๓๔๕๖๗๘๙".indexOf(char)));
const mentioned = (text) =>
  [...arabic(text).matchAll(/(?:มาตรา\s*|section\s+|第)(\d+)(?:条)?/gi)]
    .filter((m) => !m[0].startsWith("第") || m[0].endsWith("条"))
    .map((m) => Number(m[1]));

// Puzzle answers teach the law, so every quote must be the legal text itself, byte for byte.
export function checkCases(cases, corpus) {
  const errors = [],
    ids = new Set();
  const filled = (value, where) => {
    for (const lang of LANGS)
      if (typeof value?.[lang] !== "string" || !value[lang].trim())
        errors.push(`${where} missing ${lang}`);
  };
  for (const c of cases) {
    const at = c.id ?? "(no id)";
    if (!/^[a-z0-9-]+$/.test(c.id ?? "") || ids.has(c.id))
      errors.push(`${at}: id must be unique kebab-case`);
    ids.add(c.id);
    const chapter = corpus.chapters.find((h) => h.number === c.chapter);
    if (!chapter) errors.push(`${at}: unknown chapter ${c.chapter}`);
    const sections = Array.isArray(c.sections) ? c.sections : [];
    if (!sections.length) errors.push(`${at}: cites no section`);
    for (const n of sections)
      if (!corpus.sections[n - 1] || corpus.sections[n - 1].number !== n)
        errors.push(`${at}: section ${n} does not exist`);
    if (chapter && corpus.sections[sections[0] - 1]?.chapter !== c.chapter)
      errors.push(`${at}: first section is outside chapter ${c.chapter}`);
    filled(c.prompt, `${at}.prompt`);
    filled(c.story, `${at}.story`);
    filled(c.why, `${at}.why`);
    const choices = Array.isArray(c.choices) ? c.choices : [];
    if (choices.length < 2 || choices.length > 4)
      errors.push(`${at}: needs 2-4 choices`);
    choices.forEach((choice, i) => filled(choice, `${at}.choices[${i}]`));
    if (!Number.isInteger(c.answer) || !choices[c.answer])
      errors.push(`${at}: answer is not a choice`);
    const quotes = Array.isArray(c.quotes) ? c.quotes : [];
    if (!quotes.length) errors.push(`${at}: needs a verbatim quote`);
    for (const q of quotes) {
      if (!sections.includes(q.section))
        errors.push(`${at}: quote from uncited section ${q.section}`);
      else if ((q.th?.length ?? 0) < 10 || !corpus.sections[q.section - 1].th.includes(q.th))
        errors.push(`${at}: quote is not verbatim in section ${q.section}`);
    }
    for (const lang of LANGS)
      for (const text of [c.story?.[lang] ?? "", c.why?.[lang] ?? ""])
        for (const n of mentioned(text))
          if (!sections.includes(n))
            errors.push(`${at}: ${lang} mentions uncited section ${n}`);
    const legal = sections.map((n) => corpus.sections[n - 1]?.th ?? "");
    for (const m of (c.story?.th ?? "").matchAll(/[“"]([^”"]{6,})[”"]/g))
      if (!legal.some((text) => text.includes(m[1])))
        errors.push(`${at}: quoted Thai is not in a cited section`);
  }
  for (const h of corpus.chapters)
    if (!cases.some((c) => c.chapter === h.number))
      errors.push(`chapter ${h.number} has no case`);
  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const read = async (path) => JSON.parse(await readFile(path, "utf8"));
  const errors = checkCases(await read("data/cases.json"), await read("data/constitution.json"));
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  console.log("Cases: every quote is verbatim Thai law; every chapter opens with one.");
}
