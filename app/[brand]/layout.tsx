import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { here } from "@/app/ui/here";
import { brandList, brands } from "@/lib/brand";
import { origin } from "@/lib/origin";

import "@/app/globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const generateStaticParams = () => brandList.map((brand) => ({ brand }));

export const generateMetadata = async (): Promise<Metadata> => {
  const brand = await here();

  return {
    icons: {
      apple: "/apple-icon.png",
      icon: [
        { sizes: "32x32", url: "/favicon.ico" },
        { type: "image/svg+xml", url: "/icon.svg" },
      ],
    },
    manifest: "/manifest.webmanifest",
    metadataBase: new URL(origin(brand)),
    title: `Sponsor my ${brands[brand].word}`,
    twitter: { card: "summary_large_image" },
  };
};

export const viewport: Viewport = {
  themeColor: [
    { color: "#ffffff", media: "(prefers-color-scheme: light)" },
    { color: "#0a0a0a", media: "(prefers-color-scheme: dark)" },
  ],
};

const RootLayout = ({ children }: LayoutProps<"/[brand]">) => (
  <html className={`${sans.variable} ${mono.variable}`} lang="en">
    <body className="font-sans text-base leading-normal">
      {children}
      <Analytics />
    </body>
  </html>
);

export default RootLayout;
