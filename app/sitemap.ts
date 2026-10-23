import type { MetadataRoute } from "next";
import { APP_ROUTES, REDIRECT_ROUTES } from "@/lib/nav";

export const dynamic = "force-static";

/**
 * The sitemap is built from the site's OWN route list, so it cannot drift away
 * from the pages that exist.
 *
 * It used to be a second, hand-kept list — and it had already drifted. The
 * hand-kept list had no `/` (the home page was not in its own sitemap) and no
 * `/tikki/`, which was a real page, linked from the home page and built on
 * every deploy. Two lists describing the same site is one list too many, and
 * the one that was wrong was the one a crawler reads.
 *
 * APP_ROUTES is the list the navigation, the link check and the spatial
 * receipt all use. It holds exactly the 43 pages the receipt records, so
 * there is now one description of what this site ships.
 *
 * `/learn/` is filtered out because it is a forwarder to `/`, not a page: it
 * has no content of its own, and listing it asks a crawler to index a stub.
 * That is declared once, in REDIRECT_ROUTES, rather than remembered here —
 * and `npm run check:release` fails if a forwarder slips back in.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return APP_ROUTES.filter((route) => !REDIRECT_ROUTES.includes(route)).map((route) => ({
    url: `https://constitution.nonarkara.org${route}`,
  }));
}
