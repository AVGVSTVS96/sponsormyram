import { APIError } from "better-auth/api";
import { ConvexError, v } from "convex/values";

import { cleanHandle } from "../lib/handle";
import { payTo, problemOf, settle } from "../lib/pay";
import { mutation, query } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { change } from "./counters";
import { byHandle, listOf, owner, viewer } from "./model";
import { shown } from "./people";
import { rig } from "./schema";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const found = await viewer(ctx);

    return found === null ? null : { user: found.user };
  },
});

export const save = mutation({
  args: { name: v.string(), note: v.string() },
  handler: async (ctx, args) => {
    const user = await owner(ctx);

    if (args.note.length > 400 || args.name.length > 60) {
      throw new ConvexError(
        "Keep the name under 60 characters and the note under 400."
      );
    }

    await change(ctx, user._id, async () => {
      await ctx.db.patch("users", user._id, {
        name: args.name.trim(),
        note: args.note.trim(),
      });
    });
  },
});

export const saveRig = mutation({
  args: { rig: v.optional(rig) },
  handler: async (ctx, args) => {
    const user = await owner(ctx);

    if (
      args.rig !== undefined &&
      (args.rig.slots.length > 16 ||
        args.rig.board.length > 80 ||
        args.rig.maxGB > 8192)
    ) {
      throw new ConvexError(
        "That rig is bigger than this site can draw: 16 slots, 8TB max."
      );
    }

    await change(ctx, user._id, async () => {
      await ctx.db.patch("users", user._id, { rig: args.rig });
    });
  },
});

export const savePay = mutation({
  args: { pay: v.array(payTo) },
  handler: async (ctx, args) => {
    const user = await owner(ctx);
    const pay = settle(args.pay);

    const problem = pay
      .map(problemOf)
      .find((each): each is string => each !== null);

    if (problem !== undefined) {
      throw new ConvexError(problem);
    }

    await change(ctx, user._id, async () => {
      await ctx.db.patch("users", user._id, { pay });
    });
  },
});

export const leave = mutation({
  args: {},
  handler: async (ctx) => {
    await owner(ctx);

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

    try {
      await auth.api.deleteUser({ body: {}, headers });
    } catch (error) {
      throw new ConvexError(
        error instanceof APIError && error.body?.code === "SESSION_EXPIRED"
          ? "For safety, deleting needs a sign-in from the last day. Sign out, sign back in, then delete."
          : "Couldn't delete it. Try again."
      );
    }
  },
});

export const page = query({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const user = await byHandle(ctx, cleanHandle(args.handle));

    if (user === null) {
      return null;
    }

    return {
      items: await shown(ctx, await listOf(ctx, user._id)),
      user: {
        _id: user._id,
        gh: user.gh,
        handle: user.handle,
        hidden: user.hidden === true,
        name: user.name,
        note: user.note,
        pay: user.pay ?? [],
        rig: user.rig,
        x: user.x,
      },
    };
  },
});
