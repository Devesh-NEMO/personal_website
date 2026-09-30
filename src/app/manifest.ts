import type { MetadataRoute } from "next";

import { site } from "@/data/site";

/**
 * Web app manifest — defines how the site appears when added to a home screen.
 *
 * Generated at runtime so it can read from the data layer rather than
 * duplicating the site name and colors.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.title,
    short_name: site.shortTitle,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#FFF3D6",
    theme_color: "#FF5C39",
    icons: [
      {
        src: "/icon.png",
        sizes: "64x64",
        type: "image/png",
      },
    ],
  };
}
