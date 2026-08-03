import { ImageResponse } from "next/og";

import { site } from "@/content/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * OG картинката се рисува в build-а, не се качва като файл — така
 * следва името и tagline-а от content/site.ts, вместо да остарява.
 */
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1c1c1c",
          color: "#ffffff",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", fontSize: 34, letterSpacing: 6 }}>
          {site.currencyCode} · {site.address.split(",").pop()?.trim()}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 700 }}>
            {site.name}
          </div>
          <div style={{ display: "flex", fontSize: 40, color: "#b8b8b8" }}>
            {site.description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            borderTop: "2px solid #3a3a3a",
            paddingTop: 24,
            fontSize: 30,
            color: "#b8b8b8",
          }}
        >
          {site.email}
        </div>
      </div>
    ),
    size,
  );
}
