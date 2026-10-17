import type { Doc } from "@/convex/_generated/dataModel";
import type { Item, Person } from "@/convex/people";
import { brands, brandOf } from "@/lib/brand";
import type { Brand } from "@/lib/brand";
import { capacity, search, title } from "@/lib/kinds";
import { origin } from "@/lib/origin";

import { installed } from "./rig";

const base =
  "press inline-flex h-12 shrink-0 items-center justify-center gap-2.5 border-2 px-5 font-semibold whitespace-nowrap disabled:opacity-50";

export const solid = `${base} border-ink bg-ink text-paper hover:bg-paper hover:text-ink`;
export const outline = `${base} border-ink hover:bg-ink hover:text-paper`;
export const onBoard = `${base} border-silk bg-silk text-board hover:bg-transparent hover:text-silk`;
export const onBoardGhost = `${base} border-silk text-silk hover:bg-silk hover:text-board`;
export const onGreen = `${base} border-silk bg-silk text-green hover:bg-transparent hover:text-greenink`;
export const onGreenGhost = `${base} border-greenink text-greenink hover:bg-greenink hover:text-green`;
export const golden = `${base} border-gold bg-gold text-coal hover:bg-transparent hover:text-ink`;
export const small = "h-10 px-4 text-[15px]";

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
  "inline-flex h-8 max-w-full shrink-0 items-center self-start px-3 text-sm font-semibold whitespace-nowrap";

export const StateChip = ({
  item,
  lands = false,
}: {
  item: Item;
  lands?: boolean;
}) => {
  if (item.sponsor !== undefined) {
    return (
      <span
        className={`${chip} bg-gold text-coal ${lands ? "motion-safe:animate-seat" : ""}`}
      >
        <span className="truncate">
          {item.sponsor.by === null
            ? "Sponsored"
            : `Sponsored by ${who(item.sponsor.by)}`}
        </span>
      </span>
    );
  }

  if (item.sending !== undefined) {
    return (
      <span className={`${chip} border-2 border-gold`}>
        <span className="truncate">{who(item.sending.by)} is sending this</span>
      </span>
    );
  }

  return null;
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
