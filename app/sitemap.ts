import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/* The XML sitemap Google/Bing read to discover every indexable route.
   Static site, so the route list is hand-kept here (single source). /chart is
   deliberately omitted — it holds no stable content and redirects home without
   birth data (also disallowed in robots.ts + noindex on the page itself). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.liveUrl;
  const now = new Date();

  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/flashcards", priority: 0.9, changeFrequency: "weekly" },
    { path: "/resources", priority: 0.7, changeFrequency: "monthly" },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" },
    { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  ];

  return routes.map((r) => ({
    url: `${base}${r.path === "/" ? "" : r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
