import betterAuth from "@convex-dev/better-auth/convex.config";
import { defineApp } from "convex/server";
import { v } from "convex/values";

const app = defineApp({
  env: {
    BETTER_AUTH_SECRET: v.string(),
    GITHUB_CLIENT_ID: v.string(),
    GITHUB_CLIENT_SECRET: v.string(),
    REVALIDATE_SECRET: v.optional(v.string()),
    SITE_URL: v.string(),
    TWITTER_CLIENT_ID: v.string(),
    TWITTER_CLIENT_SECRET: v.string(),
  },
});

app.use(betterAuth);

export default app;
