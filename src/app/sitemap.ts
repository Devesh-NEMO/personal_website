import type { MetadataRoute } from "next";

import { site } from "@/data/site";

/** Generates /sitemap.xml. The site is a single page, so there is one entry. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
