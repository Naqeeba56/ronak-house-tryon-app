import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import PageTransition from "@/components/layout/PageTransition";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });
const siteName = "VTON Labs";
const siteDescription =
  "Create AI-powered virtual try-on previews with your photo, fabric image, and styles including Indian ethnic wear.";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "VTON Labs | Virtual Fitting Room",
    template: "%s | VTON Labs",
  },
  description: siteDescription,
  applicationName: siteName,
  appleWebApp: {
    title: siteName,
    capable: true,
  },
  icons: {
    icon: [
      { url: "/brand/vton-labs-favicon-transparent.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
    ],
    apple: [{ url: "/brand/vton-labs-favicon-transparent.png", sizes: "512x512", type: "image/png" }],
  },
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
    title: "VTON Labs | Virtual Fitting Room",
    description: siteDescription,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "VTON Labs virtual fitting room" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VTON Labs | Virtual Fitting Room",
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
    <html lang="en" className="dark" data-theme="dark" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${syne.variable} min-h-screen bg-slate-950 font-sans text-slate-100`}>
        <Navbar />
        <main>
          <PageTransition>{children}</PageTransition>
        </main>
      </body>
    </html>
  );
}