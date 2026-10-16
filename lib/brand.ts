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

export const isBrand = (value: string): value is Brand =>
  brandList.some((brand) => brand === value);

export const toBrand = (value = ""): Brand => (isBrand(value) ? value : "ram");

const hostPattern =
  /^(?:www\.)?sponsormy(?<brand>ram|ssd|hdd)\.|^(?<local>ram|ssd|hdd)\.localhost(?::\d+)?$/u;

export const brandFrom = (host: string) => {
  const groups = hostPattern.exec(host)?.groups;

  return toBrand(groups?.brand ?? groups?.local);
};

export const domain = (url: string) => url.replace(/^https?:\/\//u, "");
