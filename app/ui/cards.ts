import "server-only";
import { createHash } from "node:crypto";

import { brandOf, brands, domain } from "@/lib/brand";
import type { Brand } from "@/lib/brand";
import { conditions, size, title } from "@/lib/kinds";
import { origin } from "@/lib/origin";

import type { Card } from "./card";
import { askOf, boardOf, listOf } from "./data";
import { lead, number, plural, shortOf, who } from "./parts";

export const coldLists = 10;

const stamp = (at: number) =>
  new Date(at).toLocaleDateString("en-US", { day: "numeric", month: "short" });

const landing = async (brand: Brand): Promise<Card> => {
  const { totals } = await boardOf(brand);
  const cold = totals.lists < coldLists;

  return {
    brand,
    corner: cold ? "" : plural(totals.open, "ask"),
    footer: cold
      ? "List what your rig is short on"
      : `Collectively short ${size(totals.short)}`,
    title: `Sponsor my ${brands[brand].word}.`,
    top: domain(origin(brand)),
  };
};

type Page = NonNullable<Awaited<ReturnType<typeof listOf>>>;

export const standing = (brand: Brand, page: Page) => {
  const open = page.items.filter((item) => item.sponsor === undefined).length;
  const filled = page.items.length - open;
  const short = shortOf(brand, page.items, page.user.rig).gb;

  return short > 0
    ? { corner: plural(open, "ask"), figure: size(short), title: "short." }
    : {
        corner: filled > 0 ? `${filled} filled` : "",
        figure: String(open),
        title: open === 1 ? "ask." : "asks.",
      };
};

const list = async (here: Brand, handle: string): Promise<Card | null> => {
  const page = await listOf(handle);

  if (page === null) {
    return null;
  }

  const brand = lead(here, page.items);

  return { brand, ...standing(brand, page), top: who(page.user) };
};

const ask = async (handle: string, slug: string): Promise<Card | null> => {
  const loaded = await askOf(handle, slug);

  if (loaded === null || loaded.found === null) {
    return null;
  }

  const { user } = loaded;
  const { index, item } = loaded.found;
  const brand = brandOf(item.kind);
  const owner = who(user);

  return {
    brand,
    corner: `Ask ${number(index)}`,
    done: item.sponsor !== undefined,
    footer:
      item.sponsor === undefined
        ? `${owner} needs this · ${conditions[item.condition].chip}`
        : `${owner} got this`,
    stamp:
      item.sponsor === undefined
        ? undefined
        : `${item.sponsor.by === null ? "Filled" : `By ${who(item.sponsor.by)}`} · ${stamp(item.sponsor.at)}`,
    title: title(item),
    top: domain(origin(brand)),
  };
};

const split = (at: string[]) => {
  const width = at[0] === "gh" || at[0] === "x" ? 2 : 1;

  return {
    handle: at.length < width ? undefined : at.slice(0, width).join("/"),
    more: at.slice(width),
  };
};

export const cardFor = async (brand: Brand, at: string[]) => {
  const {
    handle,
    more: [slug, ...rest],
  } = split(at);

  if (at.length === 0) {
    return await landing(brand);
  }

  if (handle === undefined) {
    return null;
  }

  if (slug === undefined) {
    return await list(brand, handle);
  }

  return rest.length === 0 ? await ask(handle, slug) : null;
};

export const cardImage = async (brand: Brand, at: string[], alt: string) => {
  const props = await cardFor(brand, at);

  if (props === null) {
    return [];
  }

  const version = createHash("sha256")
    .update(JSON.stringify(props))
    .digest("base64url")
    .slice(0, 12);

  return [
    {
      alt,
      height: 630,
      url: `/card${at.map((part) => `/${part}`).join("")}?v=${version}`,
      width: 1200,
    },
  ];
};
