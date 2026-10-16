import { brandList, brands, toBrand } from "@/lib/brand";

export const generateStaticParams = () => brandList.map((brand) => ({ brand }));

export const GET = async (
  _request: Request,
  { params }: RouteContext<"/[brand]/manifest.webmanifest">
) => {
  const { brand: raw } = await params;
  const brand = toBrand(raw);

  const manifest = {
    background_color: "#ffffff",
    display: "standalone",
    icons: [
      { sizes: "any", src: "/icon.svg", type: "image/svg+xml" },
      { sizes: "192x192", src: "/icon/192", type: "image/png" },
      { sizes: "512x512", src: "/icon/512", type: "image/png" },
    ],
    name: `Sponsor my ${brands[brand].word}`,
    short_name: `sponsormy${brand}`,
    start_url: "/",
    theme_color: "#ffffff",
  };

  return Response.json(manifest, {
    headers: { "content-type": "application/manifest+json" },
  });
};
