import type { MetadataRoute } from "next";

import { site } from "@/data/site";

/** Generates /robots.txt: crawlers are welcome everywhere except the admin. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
