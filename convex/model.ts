import { ConvexError } from "convex/values";

import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export const viewer = async (ctx: QueryCtx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (identity === null) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique();

  return { identity, user };
};

export const owner = async (ctx: MutationCtx) => {
  const found = await viewer(ctx);

  if (found === null) {
    throw new ConvexError("Sign in first.");
  }

  if (found.user === null) {
    throw new ConvexError("Claim your page first.");
  }

  return found.user;
};

export const ownItem = async (ctx: MutationCtx, id: Id<"items">) => {
  const user = await owner(ctx);
  const item = await ctx.db.get("items", id);

  if (item?.userId !== user._id) {
    throw new ConvexError("That ask isn't on your list.");
  }

  return { item, user };
};

export const byHandle = async (ctx: QueryCtx, handle: string) =>
  await ctx.db
    .query("users")
    .withIndex("by_handle", (q) => q.eq("handle", handle))
    .unique();
