import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "VTON Labs — preview outfits before you buy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public", "brand", "vton-labs-logo-dark.png"));
  const logoData = `data:image/png;base64,${logo.toString("base64")}`;

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
        <div style={{ display: "flex", alignItems: "center", height: "96px" }}>
          {/* Satori requires a plain img for embedded assets in generated images. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoData} alt="VTON Labs" width={384} height={96} />
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
