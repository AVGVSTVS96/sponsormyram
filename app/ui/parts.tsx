import type { Doc } from "@/convex/_generated/dataModel";
import { brands, brandOf } from "@/lib/brand";
import type { Brand, Site } from "@/lib/brand";
import { conditions, kindLabels, title } from "@/lib/kinds";

export const button = {
  base: "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-chip px-4 font-bold whitespace-nowrap transition-colors",
  ghost: "border-2 border-ink hover:bg-ink hover:text-paper",
  primary:
    "border-2 border-ink bg-ink text-paper hover:bg-paper hover:text-ink",
};

export const solid = `${button.base} ${button.primary}`;
export const outline = `${button.base} ${button.ghost}`;

const chip =
  "label inline-flex h-6 items-center rounded-chip px-2 whitespace-nowrap";

export const Chips = ({ item }: { item: Doc<"items"> }) => (
  <div className="flex flex-wrap gap-2">
    <span className={`${chip} bg-ink text-paper`}>{kindLabels[item.kind]}</span>
    {item.sponsor === undefined ? (
      <span className={`${chip} border border-ink`}>
        {conditions[item.condition].chip}
      </span>
    ) : (
      <span className={`${chip} bg-gold text-coal`}>
        Sponsored by @{item.sponsor.by}
      </span>
    )}
  </div>
);

export const ago = (time: number) => {
  const minutes = Math.max(1, Math.round((Date.now() - time) / 60_000));

  if (minutes < 60) {
    return `${minutes} min`;
  }

  if (minutes < 60 * 24) {
    return `${Math.round(minutes / 60)} h`;
  }

  return `${Math.round(minutes / 60 / 24)} d`;
};

export const number = (index: number) => String(index + 1).padStart(2, "0");

export const itemUrl = (here: Site, handle: string, item: Doc<"items">) =>
  `${here.origin(brandOf(item.kind))}/${handle}/${item.slug}`;

export const intent = (text: string, url: string) =>
  `https://x.com/intent/post?${new URLSearchParams({ text, url }).toString()}`;

export const postItem = (here: Site, handle: string, item: Doc<"items">) =>
  intent(
    `Sponsor my ${brands[brandOf(item.kind)].word}: ${title(item)}`,
    itemUrl(here, handle, item)
  );

export const postList = (here: Site, brand: Brand, handle: string) =>
  intent(
    `Sponsor my ${brands[brand].word}. Here's what my rig is short on:`,
    `${here.origin(brand)}/${handle}`
  );

export const lead = (here: Site, items: Doc<"items">[]): Brand => {
  const first = items.find((item) => item.sponsor === undefined) ?? items[0];

  if (first === undefined || items.some((item) => item.kind === here.brand)) {
    return here.brand;
  }

  return brandOf(first.kind);
};

export const sponsorItem = (
  here: Site,
  handle: string,
  x: string,
  item: Doc<"items">
) =>
  x === ""
    ? null
    : intent(
        `@${x} I can sponsor your ${title(item)}`,
        itemUrl(here, handle, item)
      );
