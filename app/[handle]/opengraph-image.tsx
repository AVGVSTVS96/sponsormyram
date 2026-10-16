import { fetchQuery } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import { brands, domain } from "@/lib/brand";
import { size as gb } from "@/lib/kinds";

import { card } from "../ui/card";
import { here } from "../ui/here";
import { lead } from "../ui/parts";
import { installed } from "../ui/rig";

export { size } from "../ui/card";

export const contentType = "image/png";
export const alt = "A sponsormyram wish list";

const Image = async ({ params }: { params: Promise<{ handle: string }> }) => {
  const site = await here();
  const page = await fetchQuery(api.users.page, await params);
  const brand = page === null ? site.brand : lead(site, page.items);
  const rig = page?.user.rig;

  const short =
    brand === "ram" && rig !== undefined && rig.maxGB > installed(rig)
      ? `${gb(rig.maxGB - installed(rig))} short`
      : null;

  const asks =
    page?.items.filter((item) => item.sponsor === undefined).length ?? 0;

  const owner =
    page === null
      ? ""
      : `@${page.user.x === "" ? page.user.handle : page.user.x}`;

  return await card({
    brand,
    corner: short ?? `${asks} ${asks === 1 ? "ask" : "asks"}`,
    domain: domain(site.origin(brand)),
    footer: `${owner}'s wish list`,
    title: `Sponsor my ${brands[brand].word}.`,
  });
};

export default Image;
