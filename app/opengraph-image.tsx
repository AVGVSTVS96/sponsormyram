import { fetchQuery } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import { brands, domain } from "@/lib/brand";
import { size as gb } from "@/lib/kinds";

import { card } from "./ui/card";
import { here } from "./ui/here";

export { size } from "./ui/card";

export const contentType = "image/png";
export const alt = "Sponsor my RAM, SSD or HDD";

const Image = async () => {
  const site = await here();
  const board = await fetchQuery(api.items.board, { kind: site.brand });

  return await card({
    brand: site.brand,
    corner: `${board.totals.open} ${board.totals.open === 1 ? "ask" : "asks"}`,
    domain: domain(site.origin(site.brand)),
    footer: `Collectively short ${gb(board.totals.short)}`,
    title: `Sponsor my ${brands[site.brand].word}.`,
  });
};

export default Image;
