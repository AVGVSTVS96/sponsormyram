import { v } from "convex/values";

import { brandOf } from "../lib/brand";
import { pathFor } from "../lib/handle";
import type { Platform } from "../lib/handle";
import type { Doc, Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { change, revalidate } from "./counters";
import { holderOf, listOf, pageOf, pastHandles } from "./model";
import { platform } from "./schema";

export type Person = Pick<Doc<"users">, "_id" | "gh" | "handle" | "x">;

export const person = ({ _id, gh, handle, x }: Doc<"users">): Person => ({
  _id,
  gh,
  handle,
  x,
});

export const shown = async (ctx: QueryCtx, items: Doc<"items">[]) => {
  const ids = new Set(
    items.flatMap(({ sponsor }) =>
      sponsor?.by === undefined ? [] : [sponsor.by]
    )
  );

  const users = await Promise.all(
    [...ids].map(async (id) => await ctx.db.get("users", id))
  );

  const people = new Map(
    users.flatMap((user) =>
      user === null ? [] : [[user._id, person(user)] as const]
    )
  );

  return items.map(({ sponsor, ...item }) => ({
    ...item,
    sponsor:
      sponsor === undefined
        ? undefined
        : {
            at: sponsor.at,
            by:
              sponsor.by === undefined
                ? null
                : (people.get(sponsor.by) ?? null),
          },
  }));
};

export type Item = Awaited<ReturnType<typeof shown>>[number];

const platforms = new Map<string, Platform>([
  ["github", "gh"],
  ["twitter", "x"],
]);

const proofOf = async (ctx: QueryCtx, kind: Platform, id: string) =>
  await ctx.db
    .query("identities")
    .withIndex("by_platform_and_id", (q) => q.eq("platform", kind).eq("id", id))
    .unique();

const proofsOf = async (ctx: QueryCtx, authId: string) =>
  await ctx.db
    .query("identities")
    .withIndex("by_authId", (q) => q.eq("authId", authId))
    .take(4);

export const prove = internalMutation({
  args: { handle: v.string(), id: v.string(), name: v.string(), platform },
  handler: async (ctx, args) => {
    const proof = await proofOf(ctx, args.platform, args.id);

    await (proof === null
      ? ctx.db.insert("identities", args)
      : ctx.db.patch("identities", proof._id, {
          handle: args.handle,
          name: args.name,
        }));
  },
});

const unclaim = async (
  ctx: MutationCtx,
  handle: string,
  keep?: Id<"users">
) => {
  const rows = await pastHandles(ctx, handle);

  await Promise.all(
    rows.flatMap((row) =>
      row.userId === keep ? [] : [ctx.db.delete("handles", row._id)]
    )
  );
};

const alias = async (ctx: MutationCtx, handle: string, userId: Id<"users">) => {
  const rows = await pastHandles(ctx, handle);

  if (rows.some((row) => row.userId === userId)) {
    return;
  }

  await unclaim(ctx, handle, userId);
  await ctx.db.insert("handles", { handle, userId });
};

const evict = async (ctx: MutationCtx, holder: Doc<"users">, path: string) => {
  const kind: Platform = path.startsWith("gh/") ? "gh" : "x";
  const id = holder[kind]?.id ?? holder._id;

  await change(ctx, holder._id, async () => {
    await ctx.db.patch("users", holder._id, { handle: `${kind}/${id}` });
  });
};

const accountOf = (proof: Doc<"identities"> | undefined) =>
  proof === undefined ? undefined : { handle: proof.handle, id: proof.id };

export const settle = async (ctx: MutationCtx, authId: string) => {
  const proofs = await proofsOf(ctx, authId);
  const x = proofs.find((proof) => proof.platform === "x");
  const gh = proofs.find((proof) => proof.platform === "gh");
  const lead = x ?? gh;

  if (lead === undefined) {
    return;
  }

  const handle = pathFor(lead.platform, lead.handle);
  const mine = await pageOf(ctx, authId);
  const holder = await holderOf(ctx, handle);
  const page = mine ?? (holder?.authId === undefined ? holder : null);

  if (holder !== null && holder._id !== page?._id) {
    await evict(ctx, holder, handle);
  }

  const known = { authId, gh: accountOf(gh), x: accountOf(x) };

  const aliases =
    x !== undefined && gh !== undefined ? [pathFor("gh", gh.handle)] : [];

  if (page === null) {
    await unclaim(ctx, handle);

    const userId = await ctx.db.insert("users", {
      ...known,
      handle,
      name: lead.name,
      note: "",
    });

    await Promise.all(
      aliases.map(async (each) => {
        await alias(ctx, each, userId);
      })
    );
    await revalidate(
      ctx,
      [handle, ...aliases].map((each) => `handle:${each}`)
    );

    return;
  }

  await change(ctx, page._id, async () => {
    if (page.handle !== handle) {
      await unclaim(ctx, handle, page._id);
      await alias(ctx, page.handle, page._id);
    }

    await ctx.db.patch("users", page._id, { ...known, handle });
    await Promise.all(
      aliases.map(async (each) => {
        await alias(ctx, each, page._id);
      })
    );
  });

  await revalidate(
    ctx,
    aliases.map((each) => `handle:${each}`)
  );
};

export const bind = async (
  ctx: MutationCtx,
  account: { accountId: string; providerId: string; userId: string }
) => {
  const kind = platforms.get(account.providerId);

  const proof =
    kind === undefined ? null : await proofOf(ctx, kind, account.accountId);

  if (proof === null) {
    return;
  }

  await ctx.db.patch("identities", proof._id, { authId: account.userId });

  await settle(ctx, account.userId);
};

const release = async (ctx: MutationCtx, page: Doc<"users">) => {
  const sponsored = await ctx.db
    .query("items")
    .withIndex("by_sponsor_by", (q) => q.eq("sponsor.by", page._id))
    .take(500);

  await Promise.all(
    sponsored.map(async (item) => {
      await ctx.db.patch("items", item._id, {
        sponsor: { at: item.sponsor?.at ?? Date.now() },
      });
    })
  );

  await revalidate(
    ctx,
    sponsored.flatMap((item) => [
      `user:${item.userId}`,
      ...(item.kind === "other" ? [] : [`board:${brandOf(item.kind)}`]),
    ])
  );
};

export const forget = async (ctx: MutationCtx, authId: string) => {
  const proofs = await proofsOf(ctx, authId);
  const page = await pageOf(ctx, authId);

  await Promise.all(
    proofs.map(async (proof) => {
      await ctx.db.delete("identities", proof._id);
    })
  );

  if (page === null) {
    return;
  }

  await release(ctx, page);

  const past = await ctx.db
    .query("handles")
    .withIndex("by_userId", (q) => q.eq("userId", page._id))
    .take(100);

  await change(ctx, page._id, async () => {
    const items = await listOf(ctx, page._id);

    await Promise.all([
      ...items.map(async (item) => {
        await ctx.db.delete("items", item._id);
      }),
      ...past.map(async (row) => {
        await ctx.db.delete("handles", row._id);
      }),
    ]);
    await ctx.db.delete("users", page._id);
  });
};
