import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });
const siteName = "Ronak House TryON";
const siteDescription =
  "Create private AI-powered virtual try-on previews with your photo, fabric image, and styles including Indian ethnic wear.";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Ronak House TryON | Virtual Fitting Room",
    template: "%s | Ronak House TryON",
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "AI virtual try-on",
    "virtual fitting room",
    "online clothes try-on",
    "virtual outfit preview",
    "Indian saree try-on",
    "lehenga virtual try-on",
    "kurta try-on",
  ],
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
    title: "Ronak House TryON | Virtual Fitting Room",
    description: siteDescription,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Ronak House TryON virtual fitting room" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ronak House TryON | Virtual Fitting Room",
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
      <body className={`${inter.variable} ${syne.variable} min-h-screen bg-slate-950 font-sans text-slate-100`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}