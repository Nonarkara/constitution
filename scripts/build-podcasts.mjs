import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
const records = JSON.parse(
  await readFile("data/audio-recordings.json", "utf8"),
);
const corpus = JSON.parse(await readFile("data/constitution.json", "utf8"));
const english = {
  ...JSON.parse(await readFile("data/translations/en-amendments.json", "utf8")),
  ...JSON.parse(await readFile("data/translations/en-corrections.json", "utf8")),
};
const chinese = {
  ...JSON.parse(await readFile("data/translations/zh-001-139.json", "utf8")),
  ...JSON.parse(await readFile("data/translations/zh-140-279.json", "utf8")),
};
const voices = { th: "Kanya (Thai (Thailand))", en: "Samantha (English (US))", zh: "Tingting (Chinese (China mainland))" };
function transcript(section, lang) {
  let intro = { th: `มาตรา ${section.number}. `, en: `Section ${section.number}. `, zh: `第${section.number}条。` }[lang];
  if (lang === "en" && [83, 86, 91].includes(section.number)) intro += "Study translation of the 2021 amendment. Thai text prevails. ";
  if (lang === "en" && section.number in english && ![83, 86, 91].includes(section.number)) intro += "Study translation corrected against the Thai source. Thai text prevails. ";
  if (lang === "zh") intro += "学习译文，以泰文原文为准。";
  if (section.chapter === 17) intro += { th: "บทเฉพาะกาล โปรดตรวจเงื่อนไขเวลาในตัวบท. ", en: "Transitory provision. Check the time limits in the legal text. ", zh: "过渡条款，请核对原文规定的期限。" }[lang];
  return intro + (lang === "th" ? section.th : lang === "en" ? (english[section.number]?.en ?? section.en) : chinese[section.number].zh);
}
const languages = ["th", "en", "zh"];
const origin = "https://constitution.nonarkara.org";
const escape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
await mkdir("public/podcast", { recursive: true });
// PDF line breaks had left a space inside these Thai sections. The cleaned
// text is what learners read. The mp3 still speaks the spaced text, so its
// stored text hash is the old one. Accept only that exact pair; any further
// edit fails until generate-audio.py is run on macOS.
const pdfSpaceJoins = new Map([
  ["th:5", ["77640aa3bcae2e7a343d1f7a1521a09f75ef17ec12fb723cc782d0318161a29c", "c375c6b5e8c01558699637d957d154fe208e23c7edde5e4c2850cf39c1d5c6a6"]],
  ["th:12", ["ac0605182974a53da576367cca7f2525b70811cb8f35d61a0bd4426a0dfbcfde", "ce203c318b4d442e9d7812cccb23ff43c3187006ec6cccf1a28e0360b2ef11a1"]],
  ["th:27", ["08353e754cdacd6a3c855b2f496755329e6964b8d1a3d72087d548e9b281ff44", "ba47f9b4a25d1883b8cff742deef7b63ea30f5f1771fdcc1a3ac462a5cef5da3"]],
  ["th:43", ["c09d9833f86ad55d20945640a74e54241ce4a1168f92b95e02c73d26f729e89b", "9ec62407a76640fa5f281a708afb79d5cb22ef8276d59949ff8ccfff3b21683e"]],
  ["th:49", ["01807d70296325c5fb49f8e2cd3e63d0cf18dd2a1823bb5023e88f2681601810", "23dd113dc4ba2de4fdd79f5c83df50fee0a2eee4047e1835f3e8800a28b9e189"]],
  ["th:50", ["7800d74910f622e6dbf229a516c0111bf1b929f1399196271e2909aa389a3503", "d18766abf00a8eeb8a4f38704be2017dbbe3bf631e9509c165e35435bc3b7162"]],
  ["th:54", ["a786409c5428bd5f67bbefb80050fe3bb5c482033d5125035803c6ec56e488e8", "a2af53a0ad79fa3fada9f4670a928f3c2f9a5d1647790406692bf9844e5af744"]],
  ["th:63", ["7c8299f7edb580e61ca4ddc8d9840c2dbb88a42e865ac4feee747bfd28cbde53", "046d6de48fdfb066c4cf97a268b7cc91d2b524f1a4238f243d417b847ca89fec"]],
  ["th:72", ["3b478e4fd5fe565702b87c401ba8798b90966ab6ab26e8ec2e5c3bb39780f515", "c5d1ab69c9407efe1e1340441abda37868e218c0d6e10fbde1c5d090dbc20190"]],
  ["th:83", ["c1f14278f3adde778ef770753a9ab2c8ec341e0a791758a88143a50198b814f0", "9834859afa4e61e570cabb00e0700142eda182e6eed3e4bfb28f84d2a173778c"]],
  ["th:130", ["2b36a5137fcab19699ebccf3dd2b7555f7c6b7bf72cc8154401d1a103496f099", "a37304d04a1d8a21c0d6d1f6214570f615a16926a3e874aeb08ff2ae7b054b3d"]],
  ["th:158", ["acc9f8797e129676a0688d8728e70a84c10181a1e9f7eb02c23d10139063e613", "6492c3a8495fef1e49e9e22ef71bc855ac1614c357e2826d286b8ae8d8eac49f"]],
  ["th:195", ["32fe9cfb75a0faf4d2ace105809e899a6365f94b7370ec79c778fe0a387b36b5", "4f27363caa3e239c26100ee5531e2e140b4e13dfcd066d98489db1d413cb92fb"]],
  ["th:237", ["4f599cdd1d2fb9fd7634428080308ce1443918fef3103c8b7eeaec823b850744", "3dfee91cb91c902e3b6f92e3bde0f241a81fdce6494affaa7a5227537632b32b"]],
  ["th:248", ["a2b8bc3fe62d7c577e5b1d1d31e543f785f8ae157a736f6a6175b9ad84253011", "394ca15ad6558ea814145bbdeed5f28f9e47b9a6639ac9a79c01c857ce104f8e"]],
  ["th:255", ["fcab4bb49ec3aa6a4136950a2d2c94f5dbc9d57d31f50d744d8cbc0372ebe8a1", "256684542593e9106e64b94c738d56c59c8014d150a94e51035d3c07a16ebd14"]],
  ["th:258", ["c9f8d3c4fa756ab8125e7530145fcf8d7c83d104193f56fcdf23f2df866e5747", "797bcf5ef351d4ccf8f1b74233fdc94c2fc702a4a3bd1824fd5d01f8ff6ad048"]],
  ["th:272", ["177a881c531b4ec3e21adb0721ff893ad6cdfaeff9956b879a8066c10b3b487a", "221b1526402589f02dcb8128eb2074786906c60f522a34fad5995ba45cc40d88"]],
]);
for (const lang of languages) {
  const entries = records
    .filter((record) => record.lang === lang)
    .sort((a, b) => a.section - b.section);
  if (
    entries.length !== 279 ||
    new Set(entries.map((r) => r.section)).size !== 279
  )
    throw Error(`Missing ${lang} section recordings: ${entries.length}/279`);
  for (const record of entries) {
    const section = corpus.sections.find((section) => section.number === record.section);
    const expectedTextHash = createHash("sha256").update(voices[lang] + "|rate=175|" + transcript(section, lang)).digest("hex");
    const spaceJoin = pdfSpaceJoins.get(`${lang}:${record.section}`);
    const knownSpaceJoin = spaceJoin && record.textSha256 === spaceJoin[0] && expectedTextHash === spaceJoin[1];
    if ((record.textSha256 !== expectedTextHash && !knownSpaceJoin) || record.voice !== voices[lang] || record.rate !== 175 || record.bitRate !== 40000 || JSON.stringify(record.source) !== JSON.stringify(section.source.th))
      throw Error(`Recording needs regeneration for current source: ${record.url}`);
    const bytes = await readFile("public" + record.url);
    if (
      bytes.length !== record.bytes ||
      createHash("sha256").update(bytes).digest("hex") !== record.audioSha256
    )
      throw Error(`Stale or corrupt ${record.url}`);
  }
  const titles = {
    th: "รัฐธรรมนูญ • เสียงอ่านรายมาตรา",
    en: "Thai Constitution • Section Readings",
    zh: "泰国宪法 • 条文录音",
  };
  const descriptions = {
    th: "เสียงสังเคราะห์สำหรับเรียนรัฐธรรมนูญ พ.ศ.2560 รวมแก้ไข พ.ศ.2564 ตัวบทไทยเป็นหลัก บทเฉพาะกาลมีเงื่อนไขเวลา",
    en: "Synthetic study readings of the Thai Constitution, including current study translations of amendments. Thai text prevails; transitional powers have time limits.",
    zh: "泰国宪法条文合成录音。中文为完整学习译文，并非官方译文，请以泰文原文为准。过渡条款有期限。",
  };
  const items = entries
    .map((r) => {
      const title =
        lang === "th"
          ? `มาตรา ${r.section}`
          : lang === "en"
            ? `Section ${r.section}`
            : `第${r.section}条`;
      return `<item><title>${title}</title><link>${origin}/section/?n=${r.section}</link><guid isPermaLink="false">constitution-${lang}-${r.section}-${r.audioSha256.slice(0, 16)}</guid><description>${escape(descriptions[lang])}</description><enclosure url="${origin}${r.url}" length="${r.bytes}" type="audio/mpeg"/><itunes:duration>${Math.round(r.durationSeconds)}</itunes:duration><itunes:episode>${r.section}</itunes:episode><itunes:episodeType>full</itunes:episodeType></item>`;
    })
    .join("\n");
  // the channel points at the home page: /learn/ is a forwarder, not a page, and a
  // podcast client would store that address as the feed's permanent home.
  const feed = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${titles[lang]}</title><link>${origin}/</link><description>${escape(descriptions[lang])}</description><language>${lang}</language><itunes:author>Constitution Study</itunes:author><itunes:explicit>false</itunes:explicit><itunes:type>serial</itunes:type><itunes:image href="${origin}/podcast-cover.png"/><atom:link href="${origin}/podcast/${lang}.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  await writeFile(`public/podcast/${lang}.xml`, feed + "\n");
}
await writeFile("public/audio-recordings.json", JSON.stringify(records) + "\n");
console.log(
  "Podcast feeds: 279 individually recorded sections in each of TH/EN/ZH; checksums verified.",
);
