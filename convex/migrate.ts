import { internalMutation } from "./_generated/server";

export const legacy = internalMutation({
  args: {},
  handler: async (ctx) => {
    const claims = await ctx.db.query("claims").take(100);
    const users = await ctx.db.query("users").take(100);
    const items = await ctx.db.query("items").take(1000);

    const unowned = users.filter((user) => user.authId === undefined);

    const strays = items.flatMap(({ _id, sponsor }) => {
      const by =
        sponsor?.by === undefined
          ? undefined
          : (ctx.db.normalizeId("users", sponsor.by) ?? undefined);

      return sponsor === undefined || by === sponsor.by
        ? []
        : [{ _id, sponsor: { at: sponsor.at, by } }];
    });

    await Promise.all([
      ...claims.map(async (claim) => {
        await ctx.db.delete("claims", claim._id);
      }),
      ...unowned.map(async (user) => {
        await ctx.db.replace("users", user._id, {
          handle: user.handle,
          hidden: user.hidden,
          name: user.name,
          note: user.note,
          rig: user.rig,
        });
      }),
      ...strays.map(async ({ _id, sponsor }) => {
        await ctx.db.patch("items", _id, { sponsor });
      }),
    ]);

    return {
      claims: claims.length,
      items: strays.length,
      users: unowned.length,
    };
  },
});
