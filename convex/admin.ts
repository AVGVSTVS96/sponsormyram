import { ConvexError, v } from "convex/values";

import { internalMutation } from "./_generated/server";
import { change } from "./counters";
import { byHandle, listOf } from "./model";

const found = async <T>(value: Promise<T | null>, what: string) => {
  const result = await value;

  if (result === null) {
    throw new ConvexError(`No ${what}.`);
  }

  return result;
};

export const hide = internalMutation({
  args: { handle: v.string(), hidden: v.boolean() },
  handler: async (ctx, args) => {
    const user = await found(byHandle(ctx, args.handle), "such handle");

    await change(ctx, user._id, async () => {
      await ctx.db.patch("users", user._id, { hidden: args.hidden });
    });
  },
});

export const reslug = internalMutation({
  args: { from: v.string(), handle: v.string(), to: v.string() },
  handler: async (ctx, args) => {
    const user = await found(byHandle(ctx, args.handle), "such handle");
    const items = await listOf(ctx, user._id);
    const item = items.find((each) => each.slug === args.from);

    if (item === undefined) {
      throw new ConvexError(`No ask at ${args.from}.`);
    }

    if (items.some((each) => each.slug === args.to)) {
      throw new ConvexError(`${args.to} is already an ask.`);
    }

    await change(ctx, user._id, async () => {
      await ctx.db.patch("items", item._id, {
        oldSlugs: [...(item.oldSlugs ?? []), args.from],
        slug: args.to,
      });
    });
  },
});
