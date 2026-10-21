import type { MetadataRoute } from "next";

import { getAllGuides } from "@/lib/guides";
import { site } from "@/lib/site";

const staticPaths = [
  { path: "/", priority: 1 },
  { path: "/pricing", priority: 0.9 },
  { path: "/how-it-works", priority: 0.8 },
  { path: "/start", priority: 0.9 },
  { path: "/guides", priority: 0.8 },
  { path: "/faq", priority: 0.7 },
  { path: "/about", priority: 0.6 },
  { path: "/legal/terms", priority: 0.2 },
  { path: "/legal/privacy", priority: 0.2 },
  { path: "/legal/disclaimer", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, site.url).toString();
  return [
    ...staticPaths.map(({ path, priority }) => ({ url: url(path), priority })),
    ...getAllGuides().map((guide) => ({
      url: url(`/guides/${guide.slug}`),
      lastModified: guide.updated,
      priority: 0.7,
    })),
  ];
}
