import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/library/", "/profile/", "/result/"],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
