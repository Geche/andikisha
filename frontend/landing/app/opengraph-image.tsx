import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AndikishaHR — HR & Payroll for Kenyan Businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CHIPS = ["500+ Companies", "KRA Compliant", "M-Pesa Integrated", "Data in East Africa"];

// token-exempt: this is a build-time OG image rendered by Satori (next/og),
// which resolves only literal inline styles — CSS custom properties / Tailwind
// tokens are unavailable. Hex values mirror the brand ramp (brand-950/900/800,
// amber #e8a020) and must stay literal.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #071e13 0%, #0b3d2e 45%, #0f5040 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 90px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo row — real SVG mark */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "44px" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 575.466 575.466"
            width="56"
            height="56"
          >
            <path
              d="M259.16,74.741c-32.128,0-61.825,17.104-77.947,44.894L24.226,390.689c-28.326,50.116,19.61,110.037,77.352,110.037h22.879L370.679,74.741h-111.519Z"
              fill="#0b3d2e"
            />
            <path
              d="M554.801,396.136l-102.411-178.674-163.421,283.263h191.748c55.563-1.089,92.605-54.473,74.084-104.589Z"
              fill="#e8a020"
            />
          </svg>
          <div style={{ fontSize: "36px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.5px" }}>
            AndikishaHR
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "68px",
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.08,
            marginBottom: "22px",
            letterSpacing: "-1.5px",
          }}
        >
          Run payroll in{" "}
          <span style={{ color: "#e8a020" }}>30 minutes.</span>
          <br />
          Stay compliant. Every month.
        </div>

        {/* Sub */}
        <div style={{ fontSize: "22px", color: "rgba(255,255,255,0.65)", marginBottom: "52px" }}>
          PAYE · NSSF · SHIF · Housing Levy · KRA filing — all automated.
        </div>

        {/* Trust chips */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {CHIPS.map((chip) => (
            <div
              key={chip}
              style={{
                padding: "9px 18px",
                borderRadius: "8px",
                border: "1.5px solid rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.65)",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
