import { iconPng } from "@/app/ui/mark";
import { brandList, toBrand } from "@/lib/brand";

export const generateStaticParams = () => brandList.map((brand) => ({ brand }));

const ico = (png: ArrayBuffer, size: number) => {
  const head = new DataView(new ArrayBuffer(22));

  head.setUint16(2, 1, true);
  head.setUint16(4, 1, true);
  head.setUint8(6, size);
  head.setUint8(7, size);
  head.setUint16(10, 1, true);
  head.setUint16(12, 32, true);
  head.setUint32(14, png.byteLength, true);
  head.setUint32(18, head.byteLength, true);

  return new Blob([head, png]);
};

export const GET = async (
  _request: Request,
  { params }: RouteContext<"/[brand]/favicon.ico">
) => {
  const { brand } = await params;
  const png = await iconPng(toBrand(brand), 32).arrayBuffer();

  return new Response(ico(png, 32), {
    headers: { "content-type": "image/x-icon" },
  });
};
