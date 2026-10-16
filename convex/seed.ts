import { internalMutation } from "./_generated/server";
import { byHandle } from "./model";

export const bassim = internalMutation({
  args: {},
  handler: async (ctx) => {
    if ((await byHandle(ctx, "avgvstvs96")) !== null) {
      return;
    }

    const userId = await ctx.db.insert("users", {
      handle: "avgvstvs96",
      name: "Bassim",
      note: "RAM and SSD prices are out of control. My server has an empty slot, two empty M.2 slots and no backups. Old parts from your drawer are perfect.",
      rig: {
        board: "ASUS B550-F · Ryzen 7 5700G",
        maxGB: 128,
        slots: [0, 8, 16, 8],
      },
    });

    await ctx.db.insert("items", {
      condition: "used",
      count: 4,
      form: "desktop",
      gb: 32,
      gen: "DDR4",
      kind: "ram",
      note: "Fills the empty slot and retires the odd 8GB pair that drags every stick down to 2400 MT/s.",
      rank: 1,
      slug: "ddr4-4x32",
      speed: 3200,
      userId,
    });
    await ctx.db.insert("items", {
      condition: "used",
      count: 1,
      form: "nvme",
      gb: 2000,
      kind: "ssd",
      note: "Gen3 is plenty, DRAM-less is fine. Both M.2 slots are empty; everything runs off one SATA SSD from 2015.",
      rank: 2,
      slug: "nvme-2tb",
      userId,
    });
    await ctx.db.insert("items", {
      condition: "recert",
      count: 2,
      form: "3.5",
      gb: 8000,
      kind: "hdd",
      note: "CMR NAS drives, for a mirror. Backups currently have nowhere to go. Recertified is fine if the health report comes with it.",
      rank: 3,
      slug: "nas-hdd",
      userId,
    });
    await ctx.db.insert("items", {
      condition: "used",
      count: 1,
      form: "sata",
      gb: 2000,
      kind: "ssd",
      note: "Scratch space for agents, builds and video renders. Enterprise 1.92 / 3.84TB welcome.",
      rank: 4,
      slug: "sata-ssd",
      userId,
    });
  },
});
