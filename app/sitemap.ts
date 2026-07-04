import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/* The XML sitemap Google/Bing read to discover every indexable route.
   Static site, so the route list is hand-kept here (single source). /chart is
   deliberately omitted — it holds no stable content and redirects home without
   birth data (it also carries a page-level noindex; robots.ts leaves it
   crawlable so that noindex is actually seen). */
type SitemapRoute = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.liveUrl;

  const routes: SitemapRoute[] = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/flashcards", priority: 0.9, changeFrequency: "weekly" },
    { path: "/resources", priority: 0.7, changeFrequency: "monthly" },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" },
    { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  ];

  // lastModified is intentionally omitted: a single build-time Date is identical
  // for every route and changes on each rebuild, so it carries no real signal.
  return routes.map((r) => ({
    url: `${base}${r.path === "/" ? "" : r.path}`,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
