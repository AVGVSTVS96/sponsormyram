import { iconPng } from "@/app/ui/mark";
import { brandList, toBrand } from "@/lib/brand";

const sizes = ["192", "512"];

export const generateStaticParams = () =>
  brandList.flatMap((brand) => sizes.map((size) => ({ brand, size })));

export const GET = async (
  _request: Request,
  { params }: RouteContext<"/[brand]/icon/[size]">
) => {
  const { brand, size } = await params;

  return sizes.includes(size)
    ? iconPng(toBrand(brand), Number(size))
    : new Response("No icon this size.", { status: 404 });
};
