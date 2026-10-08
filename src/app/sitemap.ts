import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: new URL("/", siteUrl).toString(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL("/studio", siteUrl).toString(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: new URL("/pricing", siteUrl).toString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
