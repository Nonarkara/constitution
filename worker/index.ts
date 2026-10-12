import {
  harvestNews,
  type NewsSnapshot,
  type Headline,
  type FeedHealth,
} from "../lib/news.ts";
export type Statement = {
  bind(...values: unknown[]): Statement;
  run(): Promise<unknown>;
  all<T>(): Promise<{ results: T[] }>;
};
export type DB = {
  prepare(sql: string): Statement;
  batch(statements: Statement[]): Promise<unknown>;
};
type Env = { NEWS: DB; ASSETS: { fetch(request: Request): Promise<Response> } };
export async function storeSnapshot(db: DB, snapshot: NewsSnapshot) {
  // D1 allows 100 bindings/query and 50 queries/invocation on Free. 14 rows × 7 fields fits both.
  const statements: Statement[] = [];
  for (let offset = 0; offset < snapshot.headlines.length; offset += 14) {
    const rows = snapshot.headlines.slice(offset, offset + 14);
    const values = rows.flatMap((h) => [
      h.url,
      h.title,
      h.source,
      h.sourceId,
      h.publishedAt,
      h.retrievedAt,
      JSON.stringify(h.topics),
    ]);
    statements.push(
      db
        .prepare(
          "INSERT INTO headlines(url,title,source,source_id,published_at,retrieved_at,topics) VALUES " +
            rows.map(() => "(?,?,?,?,?,?,?)").join(",") +
            " ON CONFLICT(url) DO UPDATE SET title=excluded.title,source=excluded.source,source_id=excluded.source_id,published_at=excluded.published_at,retrieved_at=excluded.retrieved_at,topics=excluded.topics",
        )
        .bind(...values),
    );
  }
  for (const s of snapshot.sources)
    statements.push(
      db
        .prepare(
          "INSERT INTO feed_health(id,name,url,checked_at,last_success,status,count) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET checked_at=excluded.checked_at,last_success=COALESCE(excluded.last_success,feed_health.last_success),status=excluded.status,count=excluded.count",
        )
        .bind(
          s.id,
          s.name,
          s.url,
          s.checkedAt,
          s.lastSuccess,
          s.status,
          s.count,
        ),
    );
  if (statements.length) await db.batch(statements);
  await db
    .prepare(
      "DELETE FROM headlines WHERE COALESCE(published_at,retrieved_at) < ?",
    )
    .bind(
      new Date(Date.parse(snapshot.generatedAt) - 90 * 86400000).toISOString(),
    )
    .run();
}
export async function readSnapshot(db: DB): Promise<NewsSnapshot> {
  const [headlines, sources] = await Promise.all([
    db
      .prepare(
        "SELECT url,title,source,source_id AS sourceId,published_at AS publishedAt,retrieved_at AS retrievedAt,topics FROM headlines ORDER BY published_at DESC, retrieved_at DESC LIMIT 200",
      )
      .all<Omit<Headline, "topics"> & { topics: string }>(),
    db
      .prepare(
        "SELECT id,name,url,checked_at AS checkedAt,last_success AS lastSuccess,status,count FROM feed_health ORDER BY id",
      )
      .all<FeedHealth>(),
  ]);
  return {
    generatedAt: new Date().toISOString(),
    headlines: headlines.results.map((h) => ({
      ...h,
      topics: JSON.parse(h.topics),
    })),
    sources: sources.results,
  };
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (new URL(request.url).pathname === "/api/news") {
      if (request.method !== "GET")
        return new Response("Method not allowed", {
          status: 405,
          headers: { Allow: "GET" },
        });
      try {
        return Response.json(await readSnapshot(env.NEWS), {
          headers: {
            "Cache-Control": "public, max-age=300",
            "X-Content-Type-Options": "nosniff",
          },
        });
      } catch {
        return Response.json(
          { error: "Headlines unavailable" },
          { status: 503 },
        );
      }
    }
    return env.ASSETS.fetch(request);
  },
  async scheduled(_event: unknown, env: Env) {
    await storeSnapshot(env.NEWS, await harvestNews());
  },
};
