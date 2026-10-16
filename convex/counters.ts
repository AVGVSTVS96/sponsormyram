import { brandList, brandOf } from "../lib/brand";
import type { Brand } from "../lib/brand";
import { capacity } from "../lib/kinds";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { listOf } from "./model";

type Totals = Omit<Doc<"counters">, "_creationTime" | "_id" | "kind">;

const fields = ["filled", "lists", "open", "short", "sticks"] as const;

export const zero: Totals = {
  filled: 0,
  lists: 0,
  open: 0,
  short: 0,
  sticks: 0,
};

const total = (items: Doc<"items">[], kind: Brand): Totals => {
  const mine = items.filter((item) => item.kind === kind);
  const open = mine.filter((item) => item.sponsor === undefined);

  return {
    filled: mine
      .filter((item) => item.sponsor !== undefined)
      .reduce((sum, item) => sum + item.count, 0),
    lists: open.length > 0 ? 1 : 0,
    open: open.length,
    short: open.reduce((sum, item) => sum + capacity(item), 0),
    sticks: mine.reduce((sum, item) => sum + item.count, 0),
  };
};

const tally = (user: Doc<"users"> | null, items: Doc<"items">[]) => {
  const counted = user === null || user.hidden === true ? [] : items;

  return {
    hdd: total(counted, "hdd"),
    ram: total(counted, "ram"),
    ssd: total(counted, "ssd"),
  } satisfies Record<Brand, Totals>;
};

const snapshot = async (ctx: MutationCtx, userId: Id<"users">) => {
  const user = await ctx.db.get("users", userId);
  const items = user === null ? [] : await listOf(ctx, userId);

  return { items, totals: tally(user, items), user };
};

const combine = (a: Totals, b: Totals, sign: 1 | -1): Totals => ({
  filled: a.filled + sign * b.filled,
  lists: a.lists + sign * b.lists,
  open: a.open + sign * b.open,
  short: a.short + sign * b.short,
  sticks: a.sticks + sign * b.sticks,
});

const counterOf = async (ctx: MutationCtx, kind: Brand) =>
  await ctx.db
    .query("counters")
    .withIndex("by_kind", (q) => q.eq("kind", kind))
    .unique();

const put = async (
  ctx: MutationCtx,
  kind: Brand,
  counter: Doc<"counters"> | null,
  totals: Totals
) => {
  await (counter === null
    ? ctx.db.insert("counters", { kind, ...totals })
    : ctx.db.patch("counters", counter._id, totals));
};

const shift = async (ctx: MutationCtx, kind: Brand, by: Totals) => {
  if (fields.every((field) => by[field] === 0)) {
    return;
  }

  const counter = await counterOf(ctx, kind);

  await put(ctx, kind, counter, combine(counter ?? zero, by, 1));
};

export const revalidate = async (ctx: MutationCtx, tags: Iterable<string>) => {
  const unique = [...new Set(tags)];

  if (unique.length > 0) {
    await ctx.scheduler.runAfter(0, internal.revalidate.tags, { tags: unique });
  }
};

export const change = async <T>(
  ctx: MutationCtx,
  userId: Id<"users">,
  run: () => Promise<T>
) => {
  const before = await snapshot(ctx, userId);
  const result = await run();
  const after = await snapshot(ctx, userId);

  await Promise.all(
    brandList.map(async (kind) => {
      await shift(
        ctx,
        kind,
        combine(after.totals[kind], before.totals[kind], -1)
      );
    })
  );

  const touched = [before, after].flatMap(({ items, user }) => [
    ...(user === null ? [] : [`handle:${user.handle}`]),
    ...items.flatMap((item) =>
      item.kind === "other" ? [] : [`board:${brandOf(item.kind)}`]
    ),
  ]);

  await revalidate(ctx, [`user:${userId}`, ...touched]);

  return result;
};

export const rebuild = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").take(10_000);

    const tallies = await Promise.all(
      users.map(async (user) => tally(user, await listOf(ctx, user._id)))
    );

    await Promise.all(
      brandList.map(async (kind) => {
        let sum = zero;

        for (const each of tallies) {
          sum = combine(sum, each[kind], 1);
        }

        await put(ctx, kind, await counterOf(ctx, kind), sum);
      })
    );

    await revalidate(
      ctx,
      brandList.map((kind) => `board:${kind}`)
    );
  },
});
