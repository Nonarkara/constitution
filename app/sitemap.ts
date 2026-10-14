import type { MetadataRoute } from "next";
export const dynamic = "force-static";
const routes = ["along", "drills", "polls", "memory", "civic", "amend", "news", "research", "learn", "read", "rights", "section", "practice", "cram", "review", "exam", "flashcards", "games", "notes", "library", "topics", "glossary", "notebook", "cheatsheet", "sources", "settings"];
export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({ url: `https://constitution.nonarkara.org/${r}/` }));
}
