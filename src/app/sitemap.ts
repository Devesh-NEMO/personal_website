import type { MetadataRoute } from "next";

import { site } from "@/data/site";

/** Generates /sitemap.xml: the one-pager plus the full project archive. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date().toISOString().split("T")[0];

  return [
    {
      url: site.url,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${site.url}/work`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
