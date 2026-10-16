import { iconSvg } from "@/app/ui/mark";
import { brandList, toBrand } from "@/lib/brand";

export const generateStaticParams = () => brandList.map((brand) => ({ brand }));

export const GET = async (
  _request: Request,
  { params }: RouteContext<"/[brand]/icon.svg">
) => {
  const { brand } = await params;

  return new Response(iconSvg(toBrand(brand)), {
    headers: { "content-type": "image/svg+xml" },
  });
};
