import { ConvexError, v } from "convex/values";

import {
  cleanHandle,
  cleanX,
  handleProblem,
  suggestHandle,
  xProblem,
} from "../lib/handle";
import { mutation, query } from "./_generated/server";
import { byHandle, owner, viewer } from "./model";
import { rig } from "./schema";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const found = await viewer(ctx);

    if (found === null) {
      return null;
    }

    return {
      suggestion: suggestHandle(found.identity.email),
      user: found.user,
    };
  },
});

export const available = query({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const handle = cleanHandle(args.handle);
    const problem = handleProblem(handle);

    if (problem !== null) {
      return problem;
    }

    const holder = await byHandle(ctx, handle);

    if (holder === null) {
      return null;
    }

    const found = await viewer(ctx);

    const mine =
      holder.tokenIdentifier !== undefined &&
      holder.tokenIdentifier === found?.identity.tokenIdentifier;

    return mine ? null : "Taken";
  },
});

export const link = mutation({
  args: {},
  handler: async (ctx) => {
    const found = await viewer(ctx);
    const email = found?.identity.email?.toLowerCase();

    if (found === null || found.user !== null || email === undefined) {
      return;
    }

    const claim = await ctx.db
      .query("claims")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    const seeded =
      claim === null ? null : await ctx.db.get("users", claim.userId);

    if (seeded === null || seeded.tokenIdentifier !== undefined) {
      return;
    }

    await ctx.db.patch("users", seeded._id, {
      tokenIdentifier: found.identity.tokenIdentifier,
    });
  },
});

export const claim = mutation({
  args: { handle: v.string(), x: v.string() },
  handler: async (ctx, args) => {
    const found = await viewer(ctx);

    if (found === null) {
      throw new ConvexError("Sign in first.");
    }

    if (found.user !== null) {
      return found.user._id;
    }

    const handle = cleanHandle(args.handle);
    const x = cleanX(args.x);
    const problem = handleProblem(handle) ?? xProblem(x);

    if (problem !== null) {
      throw new ConvexError(problem);
    }

    if ((await byHandle(ctx, handle)) !== null) {
      throw new ConvexError("Taken");
    }

    return await ctx.db.insert("users", {
      handle,
      name: found.identity.name ?? "",
      note: "",
      tokenIdentifier: found.identity.tokenIdentifier,
      x,
    });
  },
});

export const save = mutation({
  args: {
    handle: v.string(),
    name: v.string(),
    note: v.string(),
    x: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await owner(ctx);
    const handle = cleanHandle(args.handle);
    const x = cleanX(args.x);
    const problem = handleProblem(handle) ?? xProblem(x);

    if (problem !== null) {
      throw new ConvexError(problem);
    }

    if (handle !== user.handle && (await byHandle(ctx, handle)) !== null) {
      throw new ConvexError("Taken");
    }

    if (args.note.length > 400 || args.name.length > 60) {
      throw new ConvexError(
        "Keep the name under 60 characters and the note under 400."
      );
    }

    await ctx.db.patch("users", user._id, {
      handle,
      name: args.name.trim(),
      note: args.note.trim(),
      x,
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

    await ctx.db.patch("users", user._id, { rig: args.rig });
  },
});

export const page = query({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const user = await byHandle(ctx, cleanHandle(args.handle));

    if (user === null) {
      return null;
    }

    const items = await ctx.db
      .query("items")
      .withIndex("by_userId_and_rank", (q) => q.eq("userId", user._id))
      .take(100);

    return {
      items,
      user: {
        handle: user.handle,
        name: user.name,
        note: user.note,
        rig: user.rig,
        x: user.x,
      },
    };
  },
});
