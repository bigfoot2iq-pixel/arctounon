import { ImageResponse } from "next/og";
import { SITE } from "@/lib/collection";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(120% 90% at 20% 0%, #123, #05060e 60%), linear-gradient(135deg, #05060e, #0a1330)",
          color: "#eaf1ff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 26,
            letterSpacing: 8,
            color: "#27e2e8",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: "#27e2e8",
            }}
          />
          {SITE.supply} Pandas · {SITE.chainTagline}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 150,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: -4,
              background: "linear-gradient(100deg, #5aacff, #27e2e8 55%, #8b7bff)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {SITE.name}
          </div>
          <div style={{ fontSize: 40, color: "#8ea3c9", marginTop: 18, maxWidth: 900 }}>
            {SITE.short}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 30 }}>
          <div
            style={{
              display: "flex",
              padding: "14px 30px",
              borderRadius: 999,
              background: "linear-gradient(100deg, #5aacff, #27e2e8)",
              color: "#04121f",
              fontWeight: 700,
            }}
          >
            Mint — Coming Soon
          </div>
          <div style={{ color: "#8ea3c9" }}>@Arctounon</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
