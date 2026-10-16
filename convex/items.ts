import { ConvexError, v } from "convex/values";

import { cleanHandle, cleanX, xProblem } from "../lib/handle";
import { ask, maxAsks, slugify, title } from "../lib/kinds";
import type { Ask } from "../lib/kinds";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { change, zero } from "./counters";
import { byHandle, listOf, owner, ownItem, viewer } from "./model";
import { shelf } from "./schema";

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

const roomFor = (items: Doc<"items">[]) => {
  if (items.length >= maxAsks) {
    throw new ConvexError(
      `${maxAsks} asks is the most a list holds. Remove one or mark it filled first.`
    );
  }
};

const freeSlug = (items: Doc<"items">[], base: string) => {
  const taken = new Set(
    items.flatMap((item) => [item.slug, ...(item.oldSlugs ?? [])])
  );

  let slug = base;

  for (let n = 2; taken.has(slug); n += 1) {
    slug = `${base}-${n}`;
  }

  return slug;
};

const place = async (
  ctx: MutationCtx,
  userId: Id<"users">,
  item: Ask & Pick<Doc<"items">, "sponsor">,
  slug: string,
  rank?: number
) => {
  const items = await listOf(ctx, userId);

  roomFor(items);

  return await change(
    ctx,
    userId,
    async () =>
      await ctx.db.insert("items", {
        ...item,
        rank: rank ?? (items.at(-1)?.rank ?? 0) + 1,
        slug: freeSlug(items, slug),
        userId,
      })
  );
};

export const add = mutation({
  args: { ask },
  handler: async (ctx, args) => {
    const user = await owner(ctx);
    const item = check(args.ask);

    return await place(ctx, user._id, item, slugify(title(item)));
  },
});

export const edit = mutation({
  args: { ask, id: v.id("items") },
  handler: async (ctx, args) => {
    const { item, user } = await ownItem(ctx, args.id);

    await change(ctx, user._id, async () => {
      await ctx.db.replace("items", item._id, {
        ...check(args.ask),
        oldSlugs: item.oldSlugs,
        rank: item.rank,
        slug: item.slug,
        sponsor: item.sponsor,
        userId: item.userId,
      });
    });
  },
});

export const remove = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const { item, user } = await ownItem(ctx, args.id);

    await change(ctx, user._id, async () => {
      await ctx.db.delete("items", item._id);
    });
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

    return await place(
      ctx,
      user._id,
      { ...check(args.ask), sponsor: args.sponsor },
      args.slug,
      args.rank
    );
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

    await change(ctx, user._id, async () => {
      await ctx.db.patch("items", item._id, { rank: neighbor.rank });
      await ctx.db.patch("items", neighbor._id, { rank: item.rank });
    });
  },
});

export const fill = mutation({
  args: { by: v.string(), id: v.id("items") },
  handler: async (ctx, args) => {
    const { item, user } = await ownItem(ctx, args.id);
    const by = cleanX(args.by);

    const problem =
      by === "" ? "Who sent it? Their X handle goes on it." : xProblem(by);

    if (problem !== null) {
      throw new ConvexError(problem);
    }

    await change(ctx, user._id, async () => {
      await ctx.db.patch("items", item._id, {
        sponsor: { at: Date.now(), by },
      });
    });
  },
});

export const unfill = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const { item, user } = await ownItem(ctx, args.id);

    await change(ctx, user._id, async () => {
      await ctx.db.patch("items", item._id, { sponsor: undefined });
    });
  },
});

const withOwners = async (ctx: QueryCtx, items: Doc<"items">[]) => {
  const ids = [...new Set(items.map((item) => item.userId))];

  const users = await Promise.all(
    ids.map(async (id) => await ctx.db.get("users", id))
  );

  const owners = new Map(
    users.flatMap((user) =>
      user === null || user.hidden === true
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

    return await listOf(ctx, user._id);
  },
});

const recentSlots = 64;

const open = ({ item }: { item: Doc<"items"> }) => item.sponsor === undefined;

export const board = query({
  args: { kind: shelf },
  handler: async (ctx, args) => {
    const counter = await ctx.db
      .query("counters")
      .withIndex("by_kind", (q) => q.eq("kind", args.kind))
      .unique();

    const newest = await withOwners(
      ctx,
      await ctx.db
        .query("items")
        .withIndex("by_kind", (q) => q.eq("kind", args.kind))
        .order("desc")
        .take(40)
    );

    const oldest = await withOwners(
      ctx,
      await ctx.db
        .query("items")
        .withIndex("by_kind", (q) => q.eq("kind", args.kind))
        .take(20)
    );

    return {
      feed: newest.slice(0, 6),
      first: oldest.find(open)?.owner.handle ?? null,
      latest: newest.find(open)?.owner.handle ?? null,
      slots: newest
        .flatMap(({ item }) =>
          Array.from({ length: item.count }, () => item.sponsor !== undefined)
        )
        .slice(0, recentSlots)
        .toReversed(),
      totals: counter ?? zero,
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

    const items = await listOf(ctx, user._id);

    const index = items.findIndex(
      (item) =>
        item.slug === args.slug || item.oldSlugs?.includes(args.slug) === true
    );

    return {
      found:
        index === -1
          ? null
          : { index, item: items[index], total: items.length },
      user: {
        _id: user._id,
        handle: user.handle,
        hidden: user.hidden === true,
        name: user.name,
        rig: user.rig,
        x: user.x,
      },
    };
  },
});

export const sitemap = query({
  args: { brand: shelf },
  handler: async (ctx, args) => {
    const kinds =
      args.brand === "ram" ? (["ram", "other"] as const) : [args.brand];

    const items = await Promise.all(
      kinds.map(
        async (kind) =>
          await ctx.db
            .query("items")
            .withIndex("by_kind", (q) => q.eq("kind", kind))
            .take(5000)
      )
    );

    const owned = await withOwners(ctx, items.flat());

    return owned.map((each) => ({
      handle: each.owner.handle,
      slug: each.item.slug,
    }));
  },
});
