CREATE TABLE IF NOT EXISTS headlines (
 url TEXT PRIMARY KEY, title TEXT NOT NULL, source TEXT NOT NULL,
 source_id TEXT NOT NULL, published_at TEXT, retrieved_at TEXT NOT NULL, topics TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS headlines_published ON headlines(published_at DESC);
CREATE TABLE IF NOT EXISTS feed_health (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, url TEXT NOT NULL,
 checked_at TEXT NOT NULL, last_success TEXT, status TEXT NOT NULL, count INTEGER NOT NULL
);
