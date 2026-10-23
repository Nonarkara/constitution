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
 * APP_ROUTES holds exactly the pages this site builds — `tests/nav.test.ts`
 * checks the built route list against it, which is what keeps the two from
 * drifting apart again — and it holds exactly the 43 pages the spatial
 * receipt records. The receipt does not read this list: it walks the build.
 * They agree because the build is made from these routes.
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
