import { v } from "convex/values";
import type { Infer } from "convex/values";

const condition = v.union(
  v.literal("new"),
  v.literal("used"),
  v.literal("recert")
);

const fields = { condition, count: v.number(), note: v.string() };

export const ramAsk = v.object({
  ...fields,
  form: v.union(v.literal("desktop"), v.literal("laptop"), v.literal("server")),
  gb: v.number(),
  gen: v.union(v.literal("DDR3"), v.literal("DDR4"), v.literal("DDR5")),
  kind: v.literal("ram"),
  speed: v.optional(v.number()),
});

export const ssdAsk = v.object({
  ...fields,
  form: v.union(v.literal("nvme"), v.literal("sata"), v.literal("u2")),
  gb: v.number(),
  kind: v.literal("ssd"),
});

export const hddAsk = v.object({
  ...fields,
  form: v.union(v.literal("3.5"), v.literal("2.5")),
  gb: v.number(),
  kind: v.literal("hdd"),
});

export const otherAsk = v.object({
  ...fields,
  kind: v.literal("other"),
  title: v.string(),
});

export const ask = v.union(ramAsk, ssdAsk, hddAsk, otherAsk);

export type Ask = Infer<typeof ask>;

export type Kind = Ask["kind"];

export type Condition = Ask["condition"];

export type RamAsk = Infer<typeof ramAsk>;

export type SsdAsk = Infer<typeof ssdAsk>;

export type HddAsk = Infer<typeof hddAsk>;

export const kinds = [
  "ram",
  "ssd",
  "hdd",
  "other",
] as const satisfies readonly Kind[];

export const maxAsks = 30;

export const kindLabels = {
  hdd: "HDD",
  other: "Other",
  ram: "RAM",
  ssd: "SSD",
} satisfies Record<Kind, string>;

export const conditions = {
  new: { chip: "New", picker: "New only", spec: "New only" },
  recert: {
    chip: "Recert OK",
    picker: "Recert OK",
    spec: "Recertified is fine",
  },
  used: { chip: "Used OK", picker: "Used OK", spec: "Used is fine" },
} satisfies Record<Condition, { chip: string; picker: string; spec: string }>;

export const ramForms = {
  desktop: {
    label: "Desktop",
    search: "desktop RAM",
    spec: "desktop UDIMM, non-ECC",
    suffix: "",
  },
  laptop: {
    label: "Laptop",
    search: "SODIMM laptop RAM",
    spec: "laptop SODIMM",
    suffix: " SODIMM",
  },
  server: {
    label: "Server",
    search: "RDIMM ECC server RAM",
    spec: "server RDIMM, ECC",
    suffix: " RDIMM",
  },
} satisfies Record<
  RamAsk["form"],
  { label: string; search: string; spec: string; suffix: string }
>;

export const ramSpeeds = {
  DDR3: [1333, 1600, 1866],
  DDR4: [2400, 2666, 3200, 3600],
  DDR5: [4800, 5600, 6000, 6400],
} satisfies Record<RamAsk["gen"], number[]>;

export const ssdForms = {
  nvme: {
    label: "NVMe M.2",
    search: "NVMe M.2 SSD",
    spec: "NVMe M.2 2280",
    title: "NVMe M.2",
  },
  sata: {
    label: "2.5″ SATA",
    search: "2.5 SATA SSD",
    spec: "2.5″ SATA",
    title: "2.5″ SATA SSD",
  },
  u2: {
    label: "U.2",
    search: "U.2 SSD",
    spec: "U.2 enterprise",
    title: "U.2 SSD",
  },
} satisfies Record<
  SsdAsk["form"],
  { label: string; search: string; spec: string; title: string }
>;

export const sizes = {
  hdd: [4000, 8000, 12_000, 16_000, 20_000, 24_000],
  ram: [8, 16, 32, 48, 64, 128],
  ssd: [1000, 2000, 4000, 8000],
} satisfies Record<Exclude<Kind, "other">, number[]>;

export const stickSizes = [0, 4, 8, 16, 32, 48, 64];

export const size = (gb: number) => {
  if (gb >= 1_000_000) {
    return `${Math.round(gb / 100_000) / 10}PB`;
  }

  if (gb >= 1000) {
    return `${Math.round(gb / 100) / 10}TB`;
  }

  return `${gb}GB`;
};

export const capacity = (item: Ask) =>
  item.kind === "other" ? 0 : item.gb * item.count;

export const title = (item: Ask) => {
  const times = item.count > 1 ? `${item.count}× ` : "";

  if (item.kind === "ram") {
    const speed = item.speed === undefined ? "" : `-${item.speed}`;

    return `${times}${size(item.gb)} ${item.gen}${speed}${ramForms[item.form].suffix}`;
  }

  if (item.kind === "ssd") {
    return `${times}${size(item.gb)} ${ssdForms[item.form].title}`;
  }

  if (item.kind === "hdd") {
    return `${times}${size(item.gb)} ${item.form}″ HDD`;
  }

  return `${times}${item.title}`;
};

export const search = (item: Ask) => {
  if (item.kind === "other") {
    return item.title;
  }

  const amount =
    item.count > 1 ? `${item.count}x${size(item.gb)}` : size(item.gb);

  if (item.kind === "ram") {
    const speed = item.speed === undefined ? "" : ` ${item.speed}`;

    return `${amount} ${item.gen}${speed} ${ramForms[item.form].search}`;
  }

  if (item.kind === "ssd") {
    return `${size(item.gb)} ${ssdForms[item.form].search}`;
  }

  return `${size(item.gb)} ${item.form} inch hard drive`;
};

export const specRows = (item: Ask) => {
  if (item.kind === "other") {
    return [["How many", String(item.count)]];
  }

  const total = item.count > 1 ? ` = ${size(capacity(item))}` : "";
  const amount = ["Capacity", `${item.count} × ${size(item.gb)}${total}`];

  if (item.kind === "ram") {
    const speed =
      item.speed === undefined
        ? `${item.gen}, any speed`
        : `${item.gen}-${item.speed}`;

    return [
      ["Kind", `RAM · ${ramForms[item.form].spec}`],
      amount,
      ["Speed", speed],
    ];
  }

  return [
    item.kind === "ssd"
      ? ["Kind", `SSD · ${ssdForms[item.form].spec}`]
      : ["Kind", `HDD · ${item.form}″`],
    amount,
  ];
};

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replaceAll("×", "x")
    .replaceAll(/[^a-z0-9.]+/gu, "-")
    .replaceAll(/^-|-$/gu, "");
