import { fetchQuery } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import { brandOf, domain } from "@/lib/brand";
import { conditions, title } from "@/lib/kinds";

import { card } from "../../ui/card";
import { here } from "../../ui/here";
import { number } from "../../ui/parts";

export { size } from "../../ui/card";

export const contentType = "image/png";
export const alt = "One ask from a sponsormyram wish list";

const stamp = (at: number) =>
  new Date(at).toLocaleDateString("en-US", { day: "numeric", month: "short" });

const Image = async ({
  params,
}: {
  params: Promise<{ handle: string; slug: string }>;
}) => {
  const site = await here();
  const loaded = await fetchQuery(api.items.one, await params);

  if (loaded === null || loaded.found === null) {
    return await card({
      brand: site.brand,
      corner: "",
      domain: domain(site.origin(site.brand)),
      footer: "",
      title: "Not found",
    });
  }

  const { user } = loaded;
  const { index, item } = loaded.found;
  const brand = brandOf(item.kind);
  const owner = `@${user.x === "" ? user.handle : user.x}`;

  return await card({
    brand,
    corner: `Ask ${number(index)}`,
    domain: domain(site.origin(brand)),
    done: item.sponsor !== undefined,
    footer:
      item.sponsor === undefined
        ? `${owner} needs this · ${conditions[item.condition].chip}`
        : `${owner} got this`,
    stamp:
      item.sponsor === undefined
        ? undefined
        : `By @${item.sponsor.by} · ${stamp(item.sponsor.at)}`,
    title: title(item),
  });
};

export default Image;
