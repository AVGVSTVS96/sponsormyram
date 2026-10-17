import "server-only";
import { createHash } from "node:crypto";

import { brandOf, domain } from "@/lib/brand";
import type { Brand } from "@/lib/brand";
import { conditions, size, title, titleLines } from "@/lib/kinds";
import { origin } from "@/lib/origin";

import type { Card } from "./card";
import { askOf, boardOf, listOf } from "./data";
import { faceOf, lightOf } from "./hardware";
import { readout } from "./lights";
import { debugFor, lead, plural, shortOf, who } from "./parts";
import { installed, portOf } from "./rig";

export const coldLists = 10;

const stamp = (at: number) =>
  new Date(at).toLocaleDateString("en-US", { day: "numeric", month: "short" });

type Page = NonNullable<Awaited<ReturnType<typeof listOf>>>;

export const standing = (brand: Brand, page: Page) => {
  const open = page.items.filter((item) => item.sponsor === undefined).length;
  const filled = page.items.length - open;
  const short = shortOf(brand, page.items, page.user.rig).gb;

  if (short > 0) {
    return {
      corner: plural(open, "ask"),
      figure: size(short),
      title: "short.",
    };
  }

  if (open === 0 && filled > 0) {
    return { corner: `${filled} filled`, figure: "", title: "All in." };
  }

  return {
    corner: filled > 0 ? `${filled} filled` : "",
    figure: String(open),
    title: open === 1 ? "ask." : "asks.",
  };
};

const landing = async (brand: Brand): Promise<Card> => {
  const { totals } = await boardOf(brand);
  const { figure, unit } = readout(size(totals.short));

  return {
    brand,
    figure,
    kind: "site",
    lists: plural(totals.lists, "list"),
    unit,
    url: domain(origin(brand)),
  };
};

const list = async (here: Brand, handle: string): Promise<Card | null> => {
  const page = await listOf(handle);

  if (page === null) {
    return null;
  }

  const brand = lead(here, page.items);
  const head = standing(brand, page);
  const short = shortOf(brand, page.items, page.user.rig);
  const { rig } = page.user;
  const { figure, unit } = readout(size(short.gb));

  return {
    brand,
    ...debugFor(brand, page),
    figure: short.gb > 0 ? figure : "",
    kind: "list",
    lines: head.figure === "" ? [head.title] : [head.figure, head.title],
    rig:
      brand === "ram" && rig !== undefined && rig.slots.length > 0
        ? [rig.board, `${installed(rig)} of ${rig.maxGB}GB installed`].flatMap(
            (line) => (line === "" ? [] : [line.toUpperCase()])
          )
        : [`${unit} short`],
    url: `${domain(origin(brand))}/${page.user.handle}`,
    who: who(page.user),
    x: page.user.x !== undefined,
  };
};

const ask = async (handle: string, slug: string): Promise<Card | null> => {
  const loaded = await askOf(handle, slug);

  if (loaded === null || loaded.found === null) {
    return null;
  }

  const { user } = loaded;
  const { item } = loaded.found;
  const brand = brandOf(item.kind);
  const light = lightOf(item);
  const url = `${domain(origin(brand))}/${user.handle}`;

  const by =
    item.sponsor?.by ?? (item.sending === undefined ? null : item.sending.by);

  return {
    at: item.sponsor === undefined ? "" : stamp(item.sponsor.at).toUpperCase(),
    brand,
    by: by === null ? "" : who(by),
    face: faceOf(item),
    kind: "ask",
    light,
    lines: titleLines(item),
    need: `${conditions[item.condition].spec}.`,
    port: portOf(item, user.rig),
    title: title(item),
    url,
    who: who(user),
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
