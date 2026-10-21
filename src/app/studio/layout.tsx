import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Virtual Try-On Studio",
  description: "Create an AI virtual try-on using your photo and outfit fabric.",
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
