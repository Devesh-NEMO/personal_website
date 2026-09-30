import { ImageResponse } from "next/og";

import { ogImage } from "@/lib/constants";
import { site } from "@/data/site";

/**
 * Favicon — a "DK" monogram on a brutalist card.
 *
 * Generated at build time, 64x64 (rendered larger than the displayed 16px for
 * the same reason as the OG image: crisp edges at high DPI).
 */
export const size = {
  width: ogImage.iconSize,
  height: ogImage.iconSize,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#FF5C39",
          border: "4px solid #1B1B1B",
          fontSize: 32,
          fontWeight: 900,
          color: "#1B1B1B",
          letterSpacing: "-0.05em",
        }}
      >
        {site.shortTitle}
      </div>
    ),
    {
      ...size,
    },
  );
}
