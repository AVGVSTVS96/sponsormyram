import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { brands } from "@/lib/brand";

import { here } from "./ui/here";

import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const generateMetadata = async (): Promise<Metadata> => {
  const site = await here();

  return {
    metadataBase: new URL(site.origin(site.brand)),
    title: `Sponsor my ${brands[site.brand].word}`,
    twitter: { card: "summary_large_image" },
  };
};

export const viewport: Viewport = {
  themeColor: [
    { color: "#ffffff", media: "(prefers-color-scheme: light)" },
    { color: "#0a0a0a", media: "(prefers-color-scheme: dark)" },
  ],
};

const RootLayout = ({ children, modal }: LayoutProps<"/">) => (
  <html className={`${sans.variable} ${mono.variable}`} lang="en">
    <body className="font-sans text-base leading-normal">
      {children}
      {modal}
    </body>
  </html>
);

export default RootLayout;
