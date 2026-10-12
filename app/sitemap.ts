import type { MetadataRoute } from "next";
export const dynamic = "force-static";
const routes = ["learn", "rights", "read", "section", "review", "notebook", "flashcards", "cheatsheet", "sources", "settings"];
export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({ url: `https://constitution.nonarkara.org/${r}/` }));
}
