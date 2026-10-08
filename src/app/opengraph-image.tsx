import { ImageResponse } from "next/og";

export const alt = "FabricFit AI — preview outfits before you buy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          color: "#eff4fa",
          background: "linear-gradient(135deg, #0b1220 0%, #14233a 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "16px",
              background: "#3d7bf0",
              fontSize: "28px",
              fontWeight: 700,
            }}
          >
            F
          </div>
          <span style={{ fontSize: "26px", fontWeight: 700 }}>FabricFit AI</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              color: "#95b9ff",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "4px",
            }}
          >
            YOUR VIRTUAL FITTING ROOM
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: "76px", fontWeight: 700, letterSpacing: "-4px", lineHeight: 1.05 }}>
            <span>Try the outfit.</span>
            <span>Before you buy.</span>
          </div>
          <div style={{ color: "#aebbd0", fontSize: "24px" }}>
            Your photo. Your style. A look made just for you.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#aebbd0", fontSize: "18px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#48d597" }} />
          Private AI-powered try-ons
        </div>
      </div>
    ),
    size,
  );
}
