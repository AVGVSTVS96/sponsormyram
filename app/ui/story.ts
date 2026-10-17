import type { Item } from "@/convex/people";
import { brands } from "@/lib/brand";
import type { Brand } from "@/lib/brand";
import { capacity, size } from "@/lib/kinds";
import type { Ask } from "@/lib/kinds";

import { installed } from "./rig";

const base = { condition: "used", count: 1, note: "" } as const;

export const sample = {
  hdd: { ...base, form: "3.5", gb: 8000, kind: "hdd" },
  ram: { ...base, form: "desktop", gb: 32, gen: "DDR4", kind: "ram" },
  ssd: { ...base, form: "nvme", gb: 2000, kind: "ssd" },
} satisfies Record<Brand, Ask>;

const words = [
  "no",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
];

export const say = (count: number, word: string, many = `${word}s`) =>
  `${words[count] ?? count} ${count === 1 ? word : many}`;

const capital = (text: string) =>
  `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

interface Page {
  items: Item[];
  user: { rig?: { board: string; maxGB: number; slots: number[] } };
}

export const story = (brand: Brand, page: Page, open: number) => {
  const { rig } = page.user;

  if (brand === "ram" && rig !== undefined && rig.slots.length > 0) {
    const sticks = rig.slots.filter((gb) => gb > 0).length;
    const dark = rig.slots.length - sticks;
    const board = rig.board === "" ? "" : `${rig.board}. `;

    if (dark === 0) {
      return `${board}Every slot is full, but the board takes ${rig.maxGB}GB and has ${installed(rig)}. The DRAM light stays on until it’s maxed.`;
    }

    return `${board}${capital(say(sticks, "stick"))} in, ${say(dark, "slot")} dark. The DRAM light stays on until ${dark === 1 ? "it’s" : "they’re"} filled.`;
  }

  const asked = page.items.filter(
    (item) => item.sponsor === undefined && item.kind === brand
  );

  const total = asked.reduce((sum, item) => sum + capacity(item), 0);
  const light = brand === "ram" ? "DRAM" : "BOOT";

  if (open === 0) {
    return `Nothing open for ${brands[brand].word} right now. Every light on this list is green.`;
  }

  return `${capital(say(open, brands[brand].part))} asked for, ${size(total)} in all. The ${light} light stays on until ${open === 1 ? "it’s" : "they’re"} in.`;
};
