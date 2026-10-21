import HomeExperience from "@/components/home/HomeExperience";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-url";

const homeTitle = "Preview Your Outfit Ideas with AI | VTON Labs";
const homeDescription =
  "Explore how your fabric and outfit ideas could look with an AI-generated try-on preview. Bring your own photo or start with a studio model.";
const homeUrl = new URL("/", siteUrl).toString();

export const metadata: Metadata = {
  title: homeTitle,
  description: homeDescription,
  alternates: { canonical: homeUrl },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: homeUrl,
  },
};

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${homeUrl}#organization`,
        name: "VTON Labs",
        url: homeUrl,
      },
      {
        "@type": "WebSite",
        "@id": `${homeUrl}#website`,
        name: "VTON Labs",
        url: homeUrl,
        inLanguage: "en",
        publisher: { "@id": `${homeUrl}#organization` },
      },
      {
        "@type": "WebApplication",
        name: "VTON Labs",
        url: homeUrl,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web browser",
        description: homeDescription,
        featureList: [
          "AI virtual try-on using a personal photo and fabric image",
          "Saree, salwar suit, lehenga, and kurta outfit previews",
          "Private saved try-on library",
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <HomeExperience />
    </>
  );
}
