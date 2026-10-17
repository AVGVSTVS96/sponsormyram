import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

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
      apple: "/apple-touch-icon.png",
      icon: [
        { sizes: "32x32", url: "/favicon.ico" },
        { type: "image/svg+xml", url: "/mark.svg" },
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
    { color: "#000000", media: "(prefers-color-scheme: dark)" },
  ],
};

const power = `try{const html=document.documentElement;if(sessionStorage.getItem("powered"))html.dataset.powered="";sessionStorage.setItem("powered","1");setTimeout(()=>{html.dataset.powered=""},700)}catch{}`;

const RootLayout = ({ children }: LayoutProps<"/[brand]">) => (
  <html
    className={`${sans.variable} ${mono.variable}`}
    lang="en"
    suppressHydrationWarning
  >
    <body className="font-sans text-base leading-normal">
      <Script id="power" strategy="beforeInteractive">
        {power}
      </Script>
      {children}
      <Analytics />
    </body>
  </html>
);

export default RootLayout;
