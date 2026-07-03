import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/* /robots.txt — let crawlers index everything except /chart (per-user, thin,
   redirects home without birth data; also noindex'd on the page). Points at the
   sitemap so discovery doesn't rely on crawling alone. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/chart",
    },
    sitemap: `${SITE.liveUrl}/sitemap.xml`,
    host: SITE.liveUrl,
  };
}
