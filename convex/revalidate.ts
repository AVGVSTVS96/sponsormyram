import { v } from "convex/values";

import { env, internalAction } from "./_generated/server";

export const tags = internalAction({
  args: { tags: v.array(v.string()) },
  handler: async (_ctx, args) => {
    const site = env.SITE_URL;
    const secret = env.REVALIDATE_SECRET;

    if (site === undefined || secret === undefined || args.tags.length === 0) {
      return;
    }

    const response = await fetch(`${site}/api/revalidate`, {
      body: args.tags.join("\n"),
      headers: { authorization: `Bearer ${secret}` },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Revalidate failed: ${response.status}`);
    }
  },
});
