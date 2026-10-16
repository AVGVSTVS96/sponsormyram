import { brandList, toBrand } from "@/lib/brand";
import { origin } from "@/lib/origin";

export const generateStaticParams = () => brandList.map((brand) => ({ brand }));

export const GET = async (
  _request: Request,
  { params }: RouteContext<"/[brand]/robots.txt">
) => {
  const { brand } = await params;
  const home = origin(toBrand(brand));

  return new Response(
    [
      "User-agent: *",
      "Allow: /",
      "Disallow: /dashboard",
      "Disallow: /sign-in",
      "Disallow: /callback",
      "Disallow: /api/",
      "",
      `Sitemap: ${home}/sitemap.xml`,
      "",
    ].join("\n")
  );
};
