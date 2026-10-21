import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0f3d2e",
          color: "#faf8f3",
          position: "relative",
        }}
      >
        <svg
          width="520"
          height="630"
          viewBox="0 0 400 600"
          style={{ position: "absolute", right: -40, top: 0, opacity: 0.12 }}
        >
          <path
            d="M330 -10C330 90 70 110 70 220s260 120 260 230-180 120-180 170"
            stroke="#faf8f3"
            strokeWidth="56"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="72" height="72" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" fill="#faf8f3" />
            <path
              d="M21.5 5.5c0 4.5-11 4.5-11 10s11 5.5 11 11"
              fill="none"
              stroke="#0f3d2e"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="21.5" cy="26.5" r="2.2" fill="#b4532a" />
          </svg>
          <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -1 }}>{site.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 900 }}>
          <div style={{ fontSize: 68, lineHeight: 1.08, fontWeight: 700, letterSpacing: -1.5 }}>
            {site.tagline}
          </div>
          <div style={{ fontSize: 28, color: "rgba(250,248,243,0.75)", lineHeight: 1.4 }}>
            Fixed-price help for overseas Pakistanis. Written plans, independent advocates, tracked to closure.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, color: "#f6e7de" }}>
          <div style={{ width: 48, height: 4, background: "#b4532a", borderRadius: 2 }} />
          Not a law firm. General information, not legal advice.
        </div>
      </div>
    ),
    size,
  );
}
