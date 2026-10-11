import fs from 'node:fs';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const data = JSON.parse(fs.readFileSync(fileURLToPath(new URL('../data/constitution.json', import.meta.url)), 'utf8'));
assert.equal(data.sections.length, 279);
assert.deepEqual(data.sections.map(s => s.number), Array.from({length:279}, (_,i)=>i+1));
assert.equal(data.chapters.filter(c => !c.transitory).length, 16);
assert.equal(data.chapters.at(-1).end,279);
for (const section of data.sections) {
  assert.equal(data.chapters.filter(c=>section.number>=c.start && section.number<=c.end).length,1);
  for (const language of ['th','en']) {
    assert.ok(section[language].length>20,`Missing ${language} section ${section.number}`);
    assert.ok(!section[language].includes('\ufffd'),`Corrupt glyph in ${language} ${section.number}`);
    assert.ok(section.source[language].url.startsWith('https://'));
    assert.ok(section.source[language].pages.every(n => Number.isInteger(n)&&n>0));
  }
}
assert.deepEqual(data.sections.filter(s=>s.amended).map(s=>s.number),[83,86,91]);
assert.ok(data.sections[82].th.includes('สี่ร้อยคน'));
assert.ok(data.sections[82].th.includes('หนึ่งร้อยคน'));
assert.ok(data.sections[85].th.includes('สี่ร้อยคน'));
assert.ok(!data.sections[85].th.includes('สามร้อยห้าสิบ'));
assert.ok(data.sections[90].th.includes('สัดส่วน'));
for (const n of [83,86,91]) assert.equal(data.sections[n-1].englishStatus,'historical-2017-replaced-in-2021');
assert.ok(!data.sections.at(-1).th.includes('ผู้รับสนองพระราชโองการ'));
assert.ok(!data.sections.at(-1).en.includes('Countersigned'));
console.log('Corpus integrity verified: 279 numbered bilingual sections, 16 chapters + transitory, current Thai amendments and historical English labels.');
