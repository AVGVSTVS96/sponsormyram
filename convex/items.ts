import { ConvexError, v } from "convex/values";

import { cleanHandle, cleanX, xProblem } from "../lib/handle";
import { ask, capacity, kinds, slugify, title } from "../lib/kinds";
import type { Ask } from "../lib/kinds";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { byHandle, owner, ownItem, viewer } from "./model";

const kind = v.union(...kinds.map((k) => v.literal(k)));

const check = (item: Ask) => {
  if (!Number.isInteger(item.count) || item.count < 1 || item.count > 16) {
    throw new ConvexError("How many has to be 1 to 16.");
  }

  if (item.note.length > 280) {
    throw new ConvexError("Keep the why under 280 characters.");
  }

  if (
    item.kind === "other" &&
    (item.title.trim() === "" || item.title.length > 60)
  ) {
    throw new ConvexError("Name the thing in 60 characters or less.");
  }

  if (item.kind !== "other" && (item.gb <= 0 || item.gb > 100_000)) {
    throw new ConvexError("That capacity doesn't exist yet.");
  }

  return { ...item, note: item.note.trim() };
};

const freeSlug = async (
  ctx: MutationCtx,
  userId: Id<"users">,
  base: string
) => {
  const siblings = await ctx.db
    .query("items")
    .withIndex("by_userId_and_slug", (q) =>
      q.eq("userId", userId).gte("slug", base).lt("slug", `${base}~`)
    )
    .take(100);

  const taken = new Set(siblings.map((item) => item.slug));

  let slug = base;

  for (let n = 2; taken.has(slug); n += 1) {
    slug = `${base}-${n}`;
  }

  return slug;
};

const last = async (ctx: MutationCtx, userId: Id<"users">) =>
  await ctx.db
    .query("items")
    .withIndex("by_userId_and_rank", (q) => q.eq("userId", userId))
    .order("desc")
    .first();

export const add = mutation({
  args: { ask },
  handler: async (ctx, args) => {
    const user = await owner(ctx);
    const item = check(args.ask);
    const bottom = await last(ctx, user._id);
    const rank = (bottom?.rank ?? 0) + 1;
    const slug = await freeSlug(ctx, user._id, slugify(title(item)));

    return await ctx.db.insert("items", {
      ...item,
      rank,
      slug,
      userId: user._id,
    });
  },
});

export const edit = mutation({
  args: { ask, id: v.id("items") },
  handler: async (ctx, args) => {
    const { item } = await ownItem(ctx, args.id);

    await ctx.db.replace("items", item._id, {
      ...check(args.ask),
      rank: item.rank,
      slug: item.slug,
      sponsor: item.sponsor,
      userId: item.userId,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const { item } = await ownItem(ctx, args.id);

    await ctx.db.delete("items", item._id);
  },
});

export const restore = mutation({
  args: {
    ask,
    rank: v.number(),
    slug: v.string(),
    sponsor: v.optional(v.object({ at: v.number(), by: v.string() })),
  },
  handler: async (ctx, args) => {
    const user = await owner(ctx);
    const slug = await freeSlug(ctx, user._id, args.slug);

    return await ctx.db.insert("items", {
      ...check(args.ask),
      rank: args.rank,
      slug,
      sponsor: args.sponsor,
      userId: user._id,
    });
  },
});

export const move = mutation({
  args: { by: v.union(v.literal(-1), v.literal(1)), id: v.id("items") },
  handler: async (ctx, args) => {
    const { item, user } = await ownItem(ctx, args.id);

    const neighbor = await ctx.db
      .query("items")
      .withIndex("by_userId_and_rank", (q) =>
        args.by === -1
          ? q.eq("userId", user._id).lt("rank", item.rank)
          : q.eq("userId", user._id).gt("rank", item.rank)
      )
      .order(args.by === -1 ? "desc" : "asc")
      .first();

    if (neighbor === null) {
      return;
    }

    await ctx.db.patch("items", item._id, { rank: neighbor.rank });
    await ctx.db.patch("items", neighbor._id, { rank: item.rank });
  },
});

export const fill = mutation({
  args: { by: v.string(), id: v.id("items") },
  handler: async (ctx, args) => {
    const { item } = await ownItem(ctx, args.id);
    const by = cleanX(args.by);

    const problem =
      by === "" ? "Who sent it? Their X handle goes on it." : xProblem(by);

    if (problem !== null) {
      throw new ConvexError(problem);
    }

    await ctx.db.patch("items", item._id, { sponsor: { at: Date.now(), by } });
  },
});

export const unfill = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const { item } = await ownItem(ctx, args.id);

    await ctx.db.patch("items", item._id, { sponsor: undefined });
  },
});

const withOwners = async (ctx: QueryCtx, items: Doc<"items">[]) => {
  const ids = [...new Set(items.map((item) => item.userId))];

  const users = await Promise.all(
    ids.map(async (id) => await ctx.db.get("users", id))
  );

  const owners = new Map(
    users.flatMap((user) =>
      user === null
        ? []
        : [[user._id, { handle: user.handle, x: user.x }] as const]
    )
  );

  return items.flatMap((item) => {
    const person = owners.get(item.userId);

    return person === undefined ? [] : [{ item, owner: person }];
  });
};

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const found = await viewer(ctx);
    const user = found?.user;

    if (user === null || user === undefined) {
      return [];
    }

    return await ctx.db
      .query("items")
      .withIndex("by_userId_and_rank", (q) => q.eq("userId", user._id))
      .take(100);
  },
});

export const board = query({
  args: { kind },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("items")
      .withIndex("by_kind", (q) => q.eq("kind", args.kind))
      .order("desc")
      .take(2000);

    const open = items.filter((item) => item.sponsor === undefined);

    const slots = items
      .toReversed()
      .flatMap((item) =>
        Array.from({ length: item.count }, () => item.sponsor !== undefined)
      );

    return {
      feed: await withOwners(ctx, items.slice(0, 6)),
      filled: slots.filter(Boolean).length,
      lists: new Set(open.map((item) => item.userId)).size,
      short: open.reduce((sum, item) => sum + capacity(item), 0),
      slots,
    };
  },
});

export const one = query({
  args: { handle: v.string(), slug: v.string() },
  handler: async (ctx, args) => {
    const user = await byHandle(ctx, cleanHandle(args.handle));

    if (user === null) {
      return null;
    }

    const items = await ctx.db
      .query("items")
      .withIndex("by_userId_and_rank", (q) => q.eq("userId", user._id))
      .take(100);

    const index = items.findIndex((item) => item.slug === args.slug);
    const item = items[index];

    if (item === undefined) {
      return null;
    }

    return {
      index,
      item,
      total: items.length,
      user: { handle: user.handle, name: user.name, rig: user.rig, x: user.x },
    };
  },
});
