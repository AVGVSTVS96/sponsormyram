import { connection } from "next/server";

import { card } from "@/app/ui/card";
import { cardFor } from "@/app/ui/cards";
import { toBrand } from "@/lib/brand";

export const GET = async (
  _request: Request,
  { params }: RouteContext<"/[brand]/card/[[...at]]">
) => {
  await connection();

  const { at = [], brand } = await params;
  const props = await cardFor(toBrand(brand), at);

  if (props === null) {
    return new Response("No card here.", { status: 404 });
  }

  return await card(props, {
    "cache-control":
      "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  });
};
