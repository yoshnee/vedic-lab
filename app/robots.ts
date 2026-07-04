import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/* /robots.txt — let crawlers reach every route. /chart is deliberately NOT
   disallowed here: it carries a page-level `noindex, follow` (app/chart/page.tsx),
   and a robots block would stop crawlers from ever seeing that directive, letting
   the page linger in the index. So we leave it crawlable and let the page's
   noindex keep it out. Points at the sitemap so discovery doesn't rely on
   crawling alone. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE.liveUrl}/sitemap.xml`,
    host: SITE.liveUrl,
  };
}
