import { XMLParser, XMLValidator } from "fast-xml-parser";
export const feeds = [
  {
    id: "matichon",
    name: "Matichon",
    url: "https://www.matichon.co.th/politics/feed",
    host: "matichon.co.th",
  },
  {
    id: "theactive",
    name: "The Active · Thai PBS",
    url: "https://theactive.thaipbs.or.th/feed",
    host: "theactive.thaipbs.or.th",
  },
  {
    id: "matichon-constitution",
    name: "Matichon · Constitution",
    url: "https://www.matichon.co.th/tag/%E0%B8%A3%E0%B8%B1%E0%B8%90%E0%B8%98%E0%B8%A3%E0%B8%A3%E0%B8%A1%E0%B8%99%E0%B8%B9%E0%B8%8D/feed",
    host: "matichon.co.th",
  },
] as const;
export const topics = [
  {
    id: "constitution",
    th: "รัฐธรรมนูญ",
    en: "Constitution",
    zh: "宪法",
    terms: ["รัฐธรรมนูญ", "constitution"],
  },
  {
    id: "referendum",
    th: "ประชามติ",
    en: "Referendum",
    zh: "公投",
    terms: ["ประชามติ", "referendum"],
  },
  {
    id: "legislation",
    th: "กฎหมาย",
    en: "Legislation",
    zh: "立法",
    terms: ["กฎหมาย", "พ.ร.บ.", "พ.ร.ก.", "ร่างพรบ", "legislation"],
  },
  { id: "court", th: "ศาล", en: "Courts", zh: "法院", terms: ["ศาล", "court"] },
  {
    id: "parliament",
    th: "รัฐสภา",
    en: "Parliament",
    zh: "国会",
    terms: [
      "รัฐสภา",
      "สภาผู้แทน",
      "วุฒิสภา",
      "ส.ว.",
      "ส.ส.",
      "สส.",
      "สว.",
      "parliament",
    ],
  },
  {
    id: "election",
    th: "เลือกตั้ง",
    en: "Elections",
    zh: "选举",
    terms: ["เลือกตั้ง", "กกต.", "election"],
  },
  {
    id: "rights",
    th: "สิทธิ",
    en: "Rights",
    zh: "权利",
    terms: ["สิทธิ", "rights"],
  },
  {
    id: "budget",
    th: "งบประมาณ",
    en: "Budget",
    zh: "预算",
    terms: ["งบประมาณ", "budget"],
  },
  {
    id: "military",
    th: "กองทัพ",
    en: "Military",
    zh: "军队",
    terms: ["กองทัพ", "ทหาร", "military"],
  },
] as const;
export type Headline = {
  url: string;
  title: string;
  source: string;
  sourceId: string;
  publishedAt: string | null;
  retrievedAt: string;
  topics: string[];
};
export type FeedHealth = {
  id: string;
  name: string;
  url: string;
  checkedAt: string;
  lastSuccess: string | null;
  status: "ok" | "error";
  count: number;
};
export type NewsSnapshot = {
  generatedAt: string;
  headlines: Headline[];
  sources: FeedHealth[];
};
export function headlineTopics(title: string): string[] {
  return topics
    .filter((t) =>
      t.terms.some((word) => title.toLocaleLowerCase().includes(word)),
    )
    .map((t) => t.id);
}
export function publisherURL(raw: string, host: string): string | null {
  try {
    const u = new URL(raw);
    if (
      u.protocol !== "https:" ||
      u.username ||
      u.password ||
      !(u.hostname === host || u.hostname.endsWith("." + host))
    )
      return null;
    u.hash = "";
    for (const key of [...u.searchParams.keys()])
      if (/^(utm_|fbclid$|gclid$)/i.test(key)) u.searchParams.delete(key);
    return u.href;
  } catch {
    return null;
  }
}
const plain = (v: unknown): string =>
  typeof v === "string"
    ? v
        .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, n) => {
          const code =
            n[0].toLowerCase() === "x" ? parseInt(n.slice(1), 16) : Number(n);
          return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
        })
        .replace(
          /&(amp|quot|apos|lt|gt|nbsp);/g,
          (_, key) =>
            ({ amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " })[
              key as "amp"
            ],
        )
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "";
export function parseFeed(
  xml: string,
  feed: (typeof feeds)[number],
  now = new Date(),
): Headline[] {
  if (
    xml.length > 2_000_000 ||
    /<!DOCTYPE|<!ENTITY/i.test(xml) ||
    XMLValidator.validate(xml) !== true
  )
    throw new Error("Invalid or oversized feed");
  const parsed = new XMLParser({
    ignoreAttributes: true,
    parseTagValue: false,
  }).parse(xml);
  if (!parsed.rss?.channel) throw new Error("Expected RSS channel");
  const entries = parsed.rss.channel.item;
  const items: Record<string, unknown>[] = entries
    ? Array.isArray(entries)
      ? entries
      : [entries]
    : [];
  const byURL = new Map<string, Headline>();
  for (const item of items.slice(0, 200)) {
    const title = plain(item.title),
      url = publisherURL(plain(item.link), feed.host),
      tags = headlineTopics(title);
    if (!title || title.length > 500 || !url || !tags.length) continue;
    const date = Date.parse(plain(item.pubDate));
    if (
      Number.isFinite(date) &&
      (date > now.getTime() + 86400000 || date < now.getTime() - 90 * 86400000)
    )
      continue;
    byURL.set(url, {
      url,
      title,
      source: feed.name,
      sourceId: feed.id,
      publishedAt: Number.isFinite(date) ? new Date(date).toISOString() : null,
      retrievedAt: now.toISOString(),
      topics: tags,
    });
  }
  return [...byURL.values()];
}
export function headlineTrends(
  headlines: Headline[],
  now = new Date(),
  days = 7,
) {
  const unique = new Map<string, Headline>();
  for (const item of headlines) {
    const date = item.publishedAt ? Date.parse(item.publishedAt) : NaN;
    if (date <= now.getTime() && date >= now.getTime() - days * 86400000)
      unique.set(item.title.normalize("NFC").trim().toLowerCase(), item);
  }
  return topics
    .map((t) => ({
      ...t,
      count: [...unique.values()].filter((h) => h.topics.includes(t.id)).length,
    }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
}
export async function harvestNews(
  fetcher: typeof fetch = fetch,
  now = new Date(),
): Promise<NewsSnapshot> {
  const results = await Promise.all(
    feeds.map(async (feed) => {
      try {
        const response = await fetcher(feed.url, {
          headers: {
            "User-Agent":
              "ConstitutionNotebook/1.0 (+https://constitution.nonarkara.org/research/)",
          },
          signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) throw new Error("Publisher unavailable");
        // A redirect may only land on the publisher's own https host.
        if (response.url && !publisherURL(response.url, feed.host)) throw new Error("Redirected off the publisher");
        // Read with a bounded stream; ignore all article bodies/descriptions.
        const reader = response.body?.getReader();
        if (!reader) throw new Error("Empty feed");
        const chunks: Uint8Array[] = [];
        let bytes = 0;
        while (true) {
          const part = await reader.read();
          if (part.done) break;
          bytes += part.value.length;
          if (bytes > 2_000_000) {
            await reader.cancel();
            throw new Error("Oversized feed");
          }
          chunks.push(part.value);
        }
        const joined = new Uint8Array(bytes);
        let offset = 0;
        for (const chunk of chunks) {
          joined.set(chunk, offset);
          offset += chunk.length;
        }
        const headlines = parseFeed(
          new TextDecoder().decode(joined),
          feed,
          now,
        );
        return {
          headlines,
          health: {
            id: feed.id,
            name: feed.name,
            url: feed.url,
            checkedAt: now.toISOString(),
            lastSuccess: now.toISOString(),
            status: "ok" as const,
            count: headlines.length,
          },
        };
      } catch {
        return {
          headlines: [],
          health: {
            id: feed.id,
            name: feed.name,
            url: feed.url,
            checkedAt: now.toISOString(),
            lastSuccess: null,
            status: "error" as const,
            count: 0,
          },
        };
      }
    }),
  );
  const unique = new Map<string, Headline>();
  for (const r of results)
    for (const h of r.headlines) if (!unique.has(h.url)) unique.set(h.url, h);
  return {
    generatedAt: now.toISOString(),
    headlines: [...unique.values()]
      .sort((a, b) =>
        (b.publishedAt || b.retrievedAt).localeCompare(
          a.publishedAt || a.retrievedAt,
        ),
      )
      .slice(0, 200),
    sources: results.map((r) => r.health),
  };
}
export function parseNewsSnapshot(value: unknown): NewsSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const v = value as NewsSnapshot;
  if (
    !Number.isFinite(Date.parse(v.generatedAt)) ||
    !Array.isArray(v.headlines) ||
    v.headlines.length > 200 ||
    !Array.isArray(v.sources)
  )
    return null;
  for (const h of v.headlines) {
    if (!h || typeof h !== "object") return null;
    const feed = feeds.find((f) => f.id === h.sourceId);
    if (
      !feed ||
      typeof h.title !== "string" ||
      h.title.length > 500 ||
      !publisherURL(h.url, feed.host) ||
      h.source !== feed.name ||
      !Array.isArray(h.topics) ||
      h.topics.some((id) => !topics.some((t) => t.id === id)) ||
      !Number.isFinite(Date.parse(h.retrievedAt)) ||
      (h.publishedAt !== null && !Number.isFinite(Date.parse(h.publishedAt)))
    )
      return null;
  }
  if (
    v.sources.length !== feeds.length ||
    new Set(v.sources.map((s) => s?.id)).size !== feeds.length ||
    v.sources.some(
      (s) =>
        !s ||
        typeof s !== "object" ||
        !feeds.some(
          (f) => f.id === s.id && f.url === s.url && f.name === s.name,
        ) ||
        !["ok", "error"].includes(s.status) ||
        !Number.isFinite(Date.parse(s.checkedAt)) ||
        (s.lastSuccess !== null &&
          !Number.isFinite(Date.parse(s.lastSuccess))) ||
        !Number.isInteger(s.count) ||
        s.count < 0,
    )
  )
    return null;
  return v;
}

/** Build snapshots retain their own history, independently of the live database. */
export function mergeNewsSnapshots(
  previous: NewsSnapshot | null,
  incoming: NewsSnapshot,
): NewsSnapshot {
  const rows = new Map<string, Headline>();
  for (const h of previous?.headlines || [])
    if (
      Date.parse(h.publishedAt || h.retrievedAt) >=
      Date.parse(incoming.generatedAt) - 90 * 86400000
    )
      rows.set(h.url, h);
  for (const h of incoming.headlines) rows.set(h.url, h);
  return {
    ...incoming,
    headlines: [...rows.values()]
      .sort((a, b) =>
        (b.publishedAt || b.retrievedAt).localeCompare(
          a.publishedAt || a.retrievedAt,
        ),
      )
      .slice(0, 200),
    sources: incoming.sources.map((s) => ({
      ...s,
      lastSuccess:
        s.lastSuccess ||
        previous?.sources.find((old) => old.id === s.id)?.lastSuccess ||
        null,
    })),
  };
}
