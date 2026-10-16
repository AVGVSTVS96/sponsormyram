import type { Kind } from "./kinds";

export const brands = {
  hdd: {
    bay: "bay",
    part: "drive",
    pitch:
      "Western Digital sold out of big drives for the rest of 2026. List what your NAS needs and let someone with a spare drive fill the bay.",
    word: "HDD",
  },
  ram: {
    bay: "slot",
    part: "stick",
    pitch:
      "32GB of DDR5 costs $400 now. List what your rig needs, post it, and let someone with a drawer of old sticks fill the slot.",
    word: "RAM",
  },
  ssd: {
    bay: "slot",
    part: "drive",
    pitch:
      "An 8TB SSD costs more than its weight in gold now. List the drives you need, post it, and let someone with a spare M.2 fill the slot.",
    word: "SSD",
  },
} as const;

export type Brand = keyof typeof brands;

export const brandList = [
  "ram",
  "ssd",
  "hdd",
] as const satisfies readonly Brand[];

export const brandOf = (kind: Kind): Brand => (kind === "other" ? "ram" : kind);

const hostPattern = /^(?:www\.)?sponsormy(?<brand>ram|ssd|hdd)\.(?<rest>.+)$/u;

const localPattern =
  /^(?:(?<brand>ram|ssd|hdd)\.)?(?<rest>localhost(?::\d+)?)$/u;

export interface Site {
  brand: Brand;
  origin: (to: Brand) => string;
}

const parse = (brand?: string): Brand =>
  brand === "ssd" || brand === "hdd" ? brand : "ram";

export const site = (host: string): Site => {
  const named = hostPattern.exec(host)?.groups;

  if (named !== undefined) {
    return {
      brand: parse(named.brand),
      origin: (to) => `https://sponsormy${to}.${named.rest}`,
    };
  }

  const local = localPattern.exec(host)?.groups;

  if (local !== undefined) {
    return {
      brand: parse(local.brand),
      origin: (to) =>
        to === "ram" ? `http://${local.rest}` : `http://${to}.${local.rest}`,
    };
  }

  return { brand: "ram", origin: () => `https://${host}` };
};

export const domain = (origin: string) => origin.replace(/^https?:\/\//u, "");
