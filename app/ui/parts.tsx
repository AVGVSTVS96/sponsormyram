import type { Doc } from "@/convex/_generated/dataModel";
import { brands, brandOf } from "@/lib/brand";
import type { Brand } from "@/lib/brand";
import { capacity, conditions, kindLabels, title } from "@/lib/kinds";
import { origin } from "@/lib/origin";

import { installed } from "./rig";

export const button = {
  base: "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-chip px-4 font-bold whitespace-nowrap transition-colors md:h-10",
  ghost: "border-2 border-ink hover:bg-ink hover:text-paper",
  primary:
    "border-2 border-ink bg-ink text-paper hover:bg-paper hover:text-ink",
};

export const solid = `${button.base} ${button.primary}`;
export const outline = `${button.base} ${button.ghost}`;

const chip =
  "label inline-flex h-6 items-center rounded-chip px-2 whitespace-nowrap";

export const Chips = ({
  item,
  lands = false,
}: {
  item: Doc<"items">;
  lands?: boolean;
}) => (
  <div className="flex flex-wrap gap-2">
    <span className={`${chip} bg-ink text-paper`}>{kindLabels[item.kind]}</span>
    {item.sponsor === undefined ? (
      <span className={`${chip} border border-ink`}>
        {conditions[item.condition].chip}
      </span>
    ) : (
      <span
        className={`${chip} bg-gold text-coal ${lands ? "motion-safe:animate-stamp" : ""}`}
      >
        Sponsored by @{item.sponsor.by}
      </span>
    )}
  </div>
);

export const number = (index: number) => String(index + 1).padStart(2, "0");

export const itemUrl = (handle: string, item: Doc<"items">) =>
  `${origin(brandOf(item.kind))}/${handle}/${item.slug}`;

export const intent = (text: string, url: string) =>
  `https://x.com/intent/post?${new URLSearchParams({ text, url }).toString()}`;

export const postItem = (handle: string, item: Doc<"items">) =>
  intent(
    `Sponsor my ${brands[brandOf(item.kind)].word}: ${title(item)}`,
    itemUrl(handle, item)
  );

export const postList = (brand: Brand, handle: string) =>
  intent(
    `Sponsor my ${brands[brand].word}. Here's what my rig is short on:`,
    `${origin(brand)}/${handle}`
  );

export const lead = (here: Brand, items: Doc<"items">[]): Brand => {
  const first = items.find((item) => item.sponsor === undefined) ?? items[0];

  if (first === undefined || items.some((item) => item.kind === here)) {
    return here;
  }

  return brandOf(first.kind);
};

export const sponsorItem = (handle: string, x: string, item: Doc<"items">) =>
  x === ""
    ? null
    : intent(`@${x} I can sponsor your ${title(item)}`, itemUrl(handle, item));

export const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

export const openFor = (brand: Brand, items: Doc<"items">[]) =>
  items.filter(
    (item) => item.sponsor === undefined && brandOf(item.kind) === brand
  );

export const shortOf = (
  brand: Brand,
  items: Doc<"items">[],
  rig: Doc<"users">["rig"]
) => {
  const fromRig =
    brand === "ram" && rig !== undefined ? rig.maxGB - installed(rig) : 0;

  return fromRig > 0
    ? { gb: fromRig, rig: true }
    : {
        gb: openFor(brand, items).reduce(
          (sum, item) => sum + capacity(item),
          0
        ),
        rig: false,
      };
};
