import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import { hddAsk, otherAsk, ramAsk, ssdAsk } from "../lib/kinds";
import { payTo } from "../lib/pay";

const placed = {
  oldSlugs: v.optional(v.array(v.string())),
  rank: v.number(),
  sending: v.optional(v.object({ at: v.number(), by: v.id("users") })),
  slug: v.string(),
  sponsor: v.optional(
    v.object({ at: v.number(), by: v.optional(v.id("users")) })
  ),
  userId: v.id("users"),
};

export const account = v.object({ handle: v.string(), id: v.string() });

export const platform = v.union(v.literal("x"), v.literal("gh"));

export const rig = v.object({
  board: v.string(),
  maxGB: v.number(),
  slots: v.array(v.number()),
});

export const shelf = v.union(
  v.literal("ram"),
  v.literal("ssd"),
  v.literal("hdd")
);

export default defineSchema({
  counters: defineTable({
    filled: v.number(),
    kind: shelf,
    lists: v.number(),
    open: v.number(),
    short: v.number(),
    sticks: v.number(),
  }).index("by_kind", ["kind"]),
  handles: defineTable({ handle: v.string(), userId: v.id("users") })
    .index("by_handle", ["handle"])
    .index("by_userId", ["userId"]),
  identities: defineTable({
    authId: v.optional(v.string()),
    handle: v.string(),
    id: v.string(),
    name: v.string(),
    platform,
  })
    .index("by_platform_and_id", ["platform", "id"])
    .index("by_authId", ["authId"]),
  items: defineTable(
    v.union(
      ramAsk.extend(placed),
      ssdAsk.extend(placed),
      hddAsk.extend(placed),
      otherAsk.extend(placed)
    )
  )
    .index("by_userId_and_rank", ["userId", "rank"])
    .index("by_userId_and_slug", ["userId", "slug"])
    .index("by_kind", ["kind"])
    .index("by_sending_by", ["sending.by"])
    .index("by_sponsor_by", ["sponsor.by"]),
  users: defineTable({
    authId: v.optional(v.string()),
    gh: v.optional(account),
    handle: v.string(),
    hidden: v.optional(v.boolean()),
    name: v.string(),
    note: v.string(),
    pay: v.optional(v.array(payTo)),
    rig: v.optional(rig),
    x: v.optional(account),
  })
    .index("by_authId", ["authId"])
    .index("by_handle", ["handle"]),
});
