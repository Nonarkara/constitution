import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
const records = JSON.parse(
  await readFile("data/audio-recordings.json", "utf8"),
);
const corpus = JSON.parse(await readFile("data/constitution.json", "utf8"));
const languages = ["th", "en", "zh"];
const origin = "https://constitution-study.nonsmartcity.chatgpt.site";
const escape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
await mkdir("public/podcast", { recursive: true });
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
  const feed = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${titles[lang]}</title><link>${origin}/learn/</link><description>${escape(descriptions[lang])}</description><language>${lang}</language><itunes:author>Constitution Study</itunes:author><itunes:explicit>false</itunes:explicit><itunes:type>serial</itunes:type><itunes:image href="${origin}/podcast-cover.png"/><atom:link href="${origin}/podcast/${lang}.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  await writeFile(`public/podcast/${lang}.xml`, feed + "\n");
}
await writeFile("public/audio-recordings.json", JSON.stringify(records) + "\n");
console.log(
  "Podcast feeds: 279 individually recorded sections in each of TH/EN/ZH; checksums verified.",
);
