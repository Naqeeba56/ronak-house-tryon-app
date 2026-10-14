import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
const supabaseImageHost = supabaseUrl ? new URL(supabaseUrl) : null;

const nextConfig: NextConfig = {
  devIndicators: false,
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseImageHost
      ? [{
          protocol: supabaseImageHost.protocol.slice(0, -1) as "http" | "https",
          hostname: supabaseImageHost.hostname,
          port: supabaseImageHost.port,
          pathname: "/storage/v1/object/sign/**",
        }]
      : [],
  },
};

export default nextConfig;
