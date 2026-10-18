import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VTON Labs",
    short_name: "VTON Labs",
    description: "Private AI-powered virtual try-ons from your photo and fabric.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [
      {
        src: "/brand/vton-labs-favicon-dark.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
