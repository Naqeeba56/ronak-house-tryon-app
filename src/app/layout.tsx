import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const siteName = "FabricFit AI";
const siteDescription =
  "Preview outfits on a full-body model or your own photo with private, AI-powered virtual try-ons.";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "FabricFit AI | AI Virtual Try-On for Outfits",
    template: "%s | FabricFit AI",
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "AI virtual try-on",
    "virtual fitting room",
    "try on clothes online",
    "outfit preview",
    "Indian ethnic wear",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName,
    title: "FabricFit AI | AI Virtual Try-On for Outfits",
    description: siteDescription,
    url: "/",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "FabricFit AI virtual fitting room" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FabricFit AI | AI Virtual Try-On for Outfits",
    description: siteDescription,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" data-theme="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}