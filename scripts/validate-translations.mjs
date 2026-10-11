import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const read = async (path) => JSON.parse(await readFile(path, "utf8"));
const corpus = await read("data/constitution.json");
const chinese = {
  ...(await read("data/translations/zh-001-139.json")),
  ...(await read("data/translations/zh-140-279.json")),
};
assert.equal(Object.keys(chinese).length, 279);
for (const section of corpus.sections) {
  const entry = chinese[section.number];
  assert.ok(entry, `Missing Chinese section ${section.number}`);
  assert.equal(entry.kind, "translation");
  assert.equal(entry.reviewStatus, "study-translation-not-official");
  assert.ok(entry.zh.trim());
  assert.ok(!entry.zh.includes("\\"), `Escaping artifact ${section.number}`);
  assert.equal(entry.source.th, section.source.th.url);
  assert.deepEqual(entry.source.pages, section.source.th.pages);
  const references = [...section.th.matchAll(/มาตรา\s*([๐-๙0-9]+)/g)].map(
    (match) =>
      Number(
        match[1].replace(/[๐-๙]/g, (char) =>
          String("๐๑๒๓๔๕๖๗๘๙".indexOf(char)),
        ),
      ),
  );
  for (const reference of references)
    assert.match(
      entry.zh,
      new RegExp(String(reference)),
      `Missing cross-reference ${section.number}->${reference}`,
    );
}
const amendments = await read("data/translations/en-amendments.json"),
  corrections = await read("data/translations/en-corrections.json");
assert.match(amendments[83].en, /four hundred/);
assert.match(amendments[83].en, /one hundred/);
assert.match(amendments[83].en, /one ballot paper for each type/);
assert.match(amendments[86].en, /four hundred/);
assert.ok(!amendments[91].en.includes("divided by the number of five hundred"));
assert.match(corrections[37].en, /acquisition of natural resources/);
assert.match(corrections[134].en, /use of loan funds/);
assert.match(corrections[256].en, /representatives of the people signing/);
assert.match(corrections[98].en, /no more than two years/);
assert.match(corrections[101].en, /except where the sentence is suspended/);
assert.match(chinese[37].zh, /自然资源/);
assert.match(chinese[256].zh, /联署人民的代表/);
console.log(
  "279 full Chinese translations with exact Thai citations/cross-references; current English amendments and boundary corrections verified structurally.",
);
