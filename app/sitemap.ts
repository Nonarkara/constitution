import type { MetadataRoute } from "next";
import { bibleChapters } from "@/lib/bible";
import { REDIRECT_ROUTES } from "@/lib/nav";
export const dynamic = "force-static";
const routes = ["along", "drills", "polls", "memory", "civic", "amend", "news", "research", "learn", "read", "rights", "section", "practice", "practice/pokklong", "cram", "review", "exam", "flashcards", "games", "notes", "library", "topics", "glossary", "notebook", "cheatsheet", "sources", "settings"];
export default function sitemap(): MetadataRoute.Sitemap {
  return [...routes, "bible", ...bibleChapters().map((c) => `bible/${c.slug}`)]
    .map((r) => `/${r}/`)
    // `/learn/` is a forwarder to `/`, not a page. Listing it asks a crawler to
    // index a stub, so the redirect routes are filtered out by declaration rather
    // than by remembering to leave them off this list.
    .filter((href) => !REDIRECT_ROUTES.includes(href))
    .map((href) => ({ url: `https://constitution.nonarkara.org${href}` }));
}