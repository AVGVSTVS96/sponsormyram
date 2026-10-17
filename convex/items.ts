import { ConvexError, v } from "convex/values";

import { cleanHandle } from "../lib/handle";
import { ask, maxAsks, slugify, title } from "../lib/kinds";
import type { Ask } from "../lib/kinds";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { change, zero } from "./counters";
import { byHandle, listOf, owner, ownItem, viewer } from "./model";
import { person, shown } from "./people";
import type { Item } from "./people";
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
        sending: item.sending,
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
    sponsor: v.optional(
      v.object({ at: v.number(), by: v.optional(v.id("users")) })
    ),
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
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const { item, user } = await ownItem(ctx, args.id);

    if (item.sponsor !== undefined) {
      return;
    }

    await change(ctx, user._id, async () => {
      await ctx.db.patch("items", item._id, {
        sending: undefined,
        sponsor: { at: Date.now(), by: item.sending?.by },
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

export const clear = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const { item, user } = await ownItem(ctx, args.id);

    await change(ctx, user._id, async () => {
      await ctx.db.patch("items", item._id, { sending: undefined });
    });
  },
});

const maxSending = 5;

const sendsOf = async (ctx: QueryCtx, userId: Id<"users">) =>
  await ctx.db
    .query("items")
    .withIndex("by_sending_by", (q) => q.eq("sending.by", userId))
    .take(maxSending + 1);

export const send = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const me = await owner(ctx);
    const item = await ctx.db.get("items", args.id);

    if (item === null) {
      throw new ConvexError("That ask is gone.");
    }

    if (item.userId === me._id) {
      throw new ConvexError("That's your own list.");
    }

    if (item.sponsor !== undefined) {
      throw new ConvexError("Someone already filled this one.");
    }

    if (item.sending !== undefined) {
      if (item.sending.by === me._id) {
        return;
      }

      throw new ConvexError("Someone's already sending this one.");
    }

    const sending = await sendsOf(ctx, me._id);

    if (sending.length >= maxSending) {
      throw new ConvexError(
        `${maxSending} at a time. Let one land before you take on another.`
      );
    }

    await change(ctx, item.userId, async () => {
      await ctx.db.patch("items", item._id, {
        sending: { at: Date.now(), by: me._id },
      });
    });
  },
});

export const unsend = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const me = await owner(ctx);
    const item = await ctx.db.get("items", args.id);

    if (item?.sending?.by !== me._id) {
      return;
    }

    await change(ctx, item.userId, async () => {
      await ctx.db.patch("items", item._id, { sending: undefined });
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
        : [[user._id, person(user)] as const]
    )
  );

  const visible = await shown(
    ctx,
    items.filter((item) => owners.has(item.userId))
  );

  return visible.flatMap((item) => {
    const found = owners.get(item.userId);

    return found === undefined ? [] : [{ item, owner: found }];
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

    return await shown(ctx, await listOf(ctx, user._id));
  },
});

export const sends = query({
  args: {},
  handler: async (ctx) => {
    const found = await viewer(ctx);
    const user = found?.user;

    if (user === null || user === undefined) {
      return [];
    }

    return await withOwners(ctx, await sendsOf(ctx, user._id));
  },
});

export const state = query({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get("items", args.id);
    const found = await viewer(ctx);

    if (item === null) {
      return null;
    }

    const me = found?.user?._id ?? null;

    return {
      mine: item.userId === me,
      sending: item.sending === undefined ? null : item.sending.by === me,
      signedIn: found !== null,
      sponsored: item.sponsor !== undefined,
    };
  },
});

const recentSlots = 64;

const open = ({ item }: { item: Item }) => item.sponsor === undefined;

const lightOf = (item: Item) => {
  if (item.sponsor !== undefined) {
    return "filled" as const;
  }

  return item.sending === undefined ? ("open" as const) : ("sending" as const);
};

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
        .take(40)
    );

    const lists = new Map(
      oldest.flatMap((entry) =>
        open(entry) ? [[entry.owner._id, entry.owner] as const] : []
      )
    );

    return {
      feed: newest.slice(0, 6),
      first: oldest.find(open)?.owner ?? null,
      latest: newest.find(open)?.owner ?? null,
      lists: [...lists.values()].slice(0, 10),
      parts: newest
        .flatMap(({ item }) =>
          Array.from({ length: item.count }, () => lightOf(item))
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

    const [item] = index === -1 ? [] : await shown(ctx, [items[index]]);

    return {
      found: item === undefined ? null : { index, item, total: items.length },
      user: {
        _id: user._id,
        gh: user.gh,
        handle: user.handle,
        hidden: user.hidden === true,
        name: user.name,
        pay: user.pay ?? [],
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
