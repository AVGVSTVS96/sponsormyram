export const handle = "AVGVSTVS96";
export const site = "https://sponsormyram.vercel.app";
export const repo = "https://github.com/AVGVSTVS96/sponsormyram";
export const checked = "Oct 16, 2026";

export const board = {
  name: "ASUS B550-F",
  cpu: "Ryzen 7 5700G",
  maxGB: 128,
  slots: [
    { id: "A1", gb: 0, speed: 0 },
    { id: "A2", gb: 8, speed: 2400 },
    { id: "B1", gb: 16, speed: 2400 },
    { id: "B2", gb: 8, speed: 2400 },
  ],
};

export const installedGB = board.slots.reduce((sum, slot) => sum + slot.gb, 0);

export type Item = {
  id: string;
  title: string;
  why: string;
  need: string;
  condition: string;
};

export const items: Item[] = [
  {
    id: "ddr4-2x32",
    title: "2× 32GB DDR4-3200",
    why: "Desktop UDIMM kit, non-ECC. Fills the empty slot and retires the odd 8GB pair that drags every stick down to 2400 MT/s.",
    need: "Need 2 kits",
    condition: "Used OK",
  },
  {
    id: "nvme-2tb",
    title: "2TB NVMe M.2",
    why: "Gen3 is plenty, 3000 MB/s and up, DRAM-less fine. Both M.2 slots are empty; everything runs off one SATA SSD from 2015.",
    need: "Need 1",
    condition: "Used OK",
  },
  {
    id: "nas-hdd",
    title: "2× 3.5\" CMR NAS drive, 8TB+",
    why: "For a mirror. Backups currently have nowhere to go. Recertified is fine if the health report comes with it.",
    need: "Need 2",
    condition: "Recert OK",
  },
  {
    id: "sata-ssd",
    title: "2.5\" SATA SSD, 2–4TB",
    why: "Scratch space for agents, builds and video renders. Enterprise 1.92 / 3.84TB welcome.",
    need: "Need 1",
    condition: "Used OK",
  },
];

export const itemNumber = (item: Item) => String(items.indexOf(item) + 1).padStart(2, "0");

export const postUrl = (item?: Item) => {
  const text = item
    ? `Someone please sponsor @${handle}'s ${item.title}. RAM prices did this.`
    : `RAM costs what it costs. Sponsor @${handle}'s RAM.`;
  const url = item ? `${site}/i/${item.id}` : site;
  return `https://x.com/intent/post?${new URLSearchParams({ text, url })}`;
};

export const sponsorUrl = `https://x.com/${handle}`;
