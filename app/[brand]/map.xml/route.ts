import { mapOf } from "@/app/ui/data";
import { brandList, toBrand } from "@/lib/brand";
import { origin } from "@/lib/origin";

export const generateStaticParams = () => brandList.map((brand) => ({ brand }));

export const GET = async (
  _request: Request,
  { params }: RouteContext<"/[brand]/map.xml">
) => {
  const { brand: raw } = await params;
  const brand = toBrand(raw);
  const home = origin(brand);
  const asks = await mapOf(brand);

  const urls = [
    home,
    ...new Set(asks.map(({ handle }) => `${home}/${handle}`)),
    ...asks.map(({ handle, slug }) => `${home}/${handle}/${slug}`),
  ];

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((url) => `<url><loc>${url}</loc></url>`)
      .join("\n")}\n</urlset>\n`,
    { headers: { "content-type": "application/xml" } }
  );
};
