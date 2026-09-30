import { ImageResponse } from "next/og";

import { ogImage } from "@/lib/constants";
import { site } from "@/data/site";
import { stats } from "@/data/stats";

/**
 * =============================================================================
 * OPEN GRAPH IMAGE
 * =============================================================================
 * Generates the 1200x630 social preview card at build time.
 *
 * Built with Satori (next/og), which supports flexbox and a flat subset of CSS
 * — no grid, no custom fonts unless they are supplied as buffers, no
 * positioned children. That is why the layout is the way it is: three rows, flex,
 * inline styles.
 *
 * The design: cream (or dark) background with the dot grid, the "DK." logo at
 * the top, "Data Analyst · Data Scientist" pill, a hard-shadowed card with 3
 * stat tiles, and the big "I make data talk." heading with the accent block on
 * "talk.".
 *
 * Inter is the only typeface (system-ui falls back correctly in Satori), all
 * values are literals rather than tokens, and every colour is hardcoded — this
 * runs in a build-time context that has no access to CSS custom properties.
 */
export const alt = ogImage.alt;
export const size = {
  width: ogImage.width,
  height: ogImage.height,
};
export const contentType = ogImage.contentType;

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#FFF3D6",
          padding: "80px 60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Dot grid background (simplified) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.3,
            backgroundImage: `radial-gradient(circle, #1B1B1B 1.5px, transparent 1.5px)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            fontSize: 48,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: "#1B1B1B",
            marginBottom: 32,
          }}
        >
          {site.shortTitle}
        </div>

        {/* Heading with accent block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: "#1B1B1B",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            I make data
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
              background: "#FF5C39",
              padding: "8px 32px",
              borderRadius: 12,
              border: "3px solid #1B1B1B",
              boxShadow: "6px 6px 0 #1B1B1B",
              transform: "rotate(-1.5deg)",
            }}
          >
            talk.
          </div>
        </div>

        {/* Role pill */}
        <div
          style={{
            display: "flex",
            fontSize: 20,
            fontWeight: 800,
            color: "#1B1B1B",
            background: "#FFFFFF",
            padding: "12px 32px",
            borderRadius: 999,
            border: "3px solid #1B1B1B",
            boxShadow: "4px 4px 0 #1B1B1B",
            marginBottom: 40,
          }}
        >
          {site.role}
        </div>

        {/* Stat cards */}
        <div
          style={{
            display: "flex",
            gap: 16,
          }}
        >
          {stats.slice(0, 3).map((stat, index) => {
            const colors = ["#A8E6CF", "#FFD3B6", "#C7CEEA"];
            return (
              <div
                key={stat.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 160,
                  height: 120,
                  background: colors[index],
                  border: "3px solid #1B1B1B",
                  borderRadius: 16,
                  boxShadow: "6px 6px 0 #1B1B1B",
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 36,
                    fontWeight: 900,
                    color: "#1B1B1B",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#1B1B1B",
                    textAlign: "center",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
