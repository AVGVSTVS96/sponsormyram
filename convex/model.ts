import { ConvexError } from "convex/values";

import { maxAsks } from "../lib/kinds";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export const pageOf = async (ctx: QueryCtx, authId: string) =>
  await ctx.db
    .query("users")
    .withIndex("by_authId", (q) => q.eq("authId", authId))
    .unique();

export const viewer = async (ctx: QueryCtx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (identity === null) {
    return null;
  }

  return {
    authId: identity.subject,
    user: await pageOf(ctx, identity.subject),
  };
};

export const owner = async (ctx: QueryCtx) => {
  const found = await viewer(ctx);

  if (found === null) {
    throw new ConvexError("Sign in first.");
  }

  if (found.user === null) {
    throw new ConvexError("Your page isn't set up yet. Sign in again.");
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

export const listOf = async (ctx: QueryCtx, userId: Id<"users">) =>
  await ctx.db
    .query("items")
    .withIndex("by_userId_and_rank", (q) => q.eq("userId", userId))
    .take(maxAsks);

export const holderOf = async (ctx: QueryCtx, handle: string) =>
  await ctx.db
    .query("users")
    .withIndex("by_handle", (q) => q.eq("handle", handle))
    .unique();

export const pastHandles = async (ctx: QueryCtx, handle: string) =>
  await ctx.db
    .query("handles")
    .withIndex("by_handle", (q) => q.eq("handle", handle))
    .take(8);

export const byHandle = async (ctx: QueryCtx, handle: string) => {
  const current = await holderOf(ctx, handle);

  if (current !== null) {
    return current;
  }

  const [past] = await pastHandles(ctx, handle);

  return past === undefined ? null : await ctx.db.get("users", past.userId);
};
