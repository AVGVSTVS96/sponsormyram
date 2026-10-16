import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import { hddAsk, otherAsk, ramAsk, ssdAsk } from "../lib/kinds";

const placed = {
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

export default defineSchema({
  claims: defineTable({ email: v.string(), userId: v.id("users") }).index(
    "by_email",
    ["email"]
  ),
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
    name: v.string(),
    note: v.string(),
    rig: v.optional(rig),
    tokenIdentifier: v.optional(v.string()),
    x: v.string(),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_handle", ["handle"]),
});
