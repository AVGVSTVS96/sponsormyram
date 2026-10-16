import type { Doc } from "@/convex/_generated/dataModel";
import type { Item, Person } from "@/convex/people";
import { brands, brandOf } from "@/lib/brand";
import type { Brand } from "@/lib/brand";
import { capacity, conditions, kindLabels, search, title } from "@/lib/kinds";
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

type Named = Pick<Person, "gh" | "handle" | "x">;

export const who = ({ gh, handle, x }: Named) => {
  if (x !== undefined) {
    return `@${x.handle}`;
  }

  return gh === undefined ? `@${handle}` : `gh/${gh.handle}`;
};

const tag = (person: Named) =>
  person.x === undefined && person.gh !== undefined
    ? `github.com/${person.gh.handle}`
    : who(person);

const chip =
  "label inline-flex h-6 max-w-full items-center rounded-chip px-2 whitespace-nowrap";

export const Chips = ({
  item,
  lands = false,
}: {
  item: Item;
  lands?: boolean;
}) => {
  const state = () => {
    if (item.sponsor !== undefined) {
      return (
        <span
          className={`${chip} bg-gold text-coal ${lands ? "motion-safe:animate-stamp" : ""}`}
        >
          <span className="truncate">
            {item.sponsor.by === null
              ? "Filled"
              : `Sponsored by ${who(item.sponsor.by)}`}
          </span>
        </span>
      );
    }

    if (item.sending !== undefined) {
      return (
        <span className={`${chip} border-2 border-gold`}>
          <span className="truncate">
            {who(item.sending.by)} is sending this
          </span>
        </span>
      );
    }

    return (
      <span className={`${chip} border border-ink`}>
        {conditions[item.condition].chip}
      </span>
    );
  };

  return (
    <div className="flex min-w-0 flex-wrap gap-2">
      <span className={`${chip} bg-ink text-paper`}>
        {kindLabels[item.kind]}
      </span>
      {state()}
    </div>
  );
};

export const number = (index: number) => String(index + 1).padStart(2, "0");

export const itemUrl = (handle: string, item: Pick<Item, "kind" | "slug">) =>
  `${origin(brandOf(item.kind))}/${handle}/${item.slug}`;

export const sendUrl = (handle: string, item: Pick<Item, "slug">) =>
  `${origin("ram")}/${handle}/${item.slug}#send`;

export const intent = (text: string, url: string) =>
  `https://x.com/intent/post?${new URLSearchParams({ text, url }).toString()}`;

export const postItem = (handle: string, item: Item) =>
  intent(
    `Sponsor my ${brands[brandOf(item.kind)].word}: ${title(item)}`,
    itemUrl(handle, item)
  );

export const postList = (brand: Brand, handle: string) =>
  intent(
    `Sponsor my ${brands[brand].word}. Here's what my rig is short on:`,
    `${origin(brand)}/${handle}`
  );

export const tellOwner = (owner: Named, item: Item) =>
  intent(
    owner.x === undefined
      ? `I'm sending ${tag(owner)} their ${title(item)}.`
      : `@${owner.x.handle} I'm sending your ${title(item)}.`,
    itemUrl(owner.handle, item)
  );

export const reachOwner = (owner: Named) => {
  if (owner.x !== undefined) {
    return `https://x.com/messages/compose?recipient_id=${owner.x.id}`;
  }

  return owner.gh === undefined
    ? `${origin("ram")}/${owner.handle}`
    : `https://github.com/${owner.gh.handle}`;
};

export const thank = (handle: string, item: Item, sponsor: Named, at: number) =>
  intent(
    `Thanks ${tag(sponsor)} for the ${title(item)}. It's in.`,
    `${itemUrl(handle, item)}?v=${at}`
  );

export const stores = (item: Item) => {
  const query = encodeURIComponent(search(item));

  return [
    ["eBay", `https://www.ebay.com/sch/i.html?_nkw=${query}`],
    ["Amazon", `https://www.amazon.com/s?k=${query}`],
  ] as const;
};

export const lead = (here: Brand, items: Item[]): Brand => {
  const first = items.find((item) => item.sponsor === undefined) ?? items[0];

  if (first === undefined || items.some((item) => item.kind === here)) {
    return here;
  }

  return brandOf(first.kind);
};

export const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

export const openFor = (brand: Brand, items: Item[]) =>
  items.filter(
    (item) => item.sponsor === undefined && brandOf(item.kind) === brand
  );

export const shortOf = (
  brand: Brand,
  items: Item[],
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
