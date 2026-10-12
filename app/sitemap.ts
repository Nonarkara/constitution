import type { MetadataRoute } from "next";
export const dynamic = "force-static";
const routes = ["learn", "read", "rights", "section", "practice", "review", "exam", "flashcards", "games", "notes", "library", "topics", "glossary", "notebook", "cheatsheet", "sources", "settings"];
export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({ url: `https://constitution.nonarkara.org/${r}/` }));
}
