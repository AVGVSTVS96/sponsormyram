import { iconPng } from "@/app/ui/mark";
import { brandList, toBrand } from "@/lib/brand";

export const generateStaticParams = () => brandList.map((brand) => ({ brand }));

export const GET = async (
  _request: Request,
  { params }: RouteContext<"/[brand]/apple-touch-icon.png">
) => {
  const { brand } = await params;

  return iconPng(toBrand(brand), 180, false);
};
