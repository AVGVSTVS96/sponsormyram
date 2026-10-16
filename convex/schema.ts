import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import { hddAsk, otherAsk, ramAsk, ssdAsk } from "../lib/kinds";

const placed = {
  oldSlugs: v.optional(v.array(v.string())),
  rank: v.number(),
  slug: v.string(),
  sponsor: v.optional(v.object({ at: v.number(), by: v.string() })),
  userId: v.id("users"),
};

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
  claims: defineTable({ email: v.string(), userId: v.id("users") }).index(
    "by_email",
    ["email"]
  ),
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
    .index("by_kind", ["kind"]),
  users: defineTable({
    handle: v.string(),
    hidden: v.optional(v.boolean()),
    name: v.string(),
    note: v.string(),
    rig: v.optional(rig),
    tokenIdentifier: v.optional(v.string()),
    x: v.string(),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_handle", ["handle"]),
});
