import { defineApp } from "convex/server";
import { v } from "convex/values";

export default defineApp({
  env: {
    REVALIDATE_SECRET: v.optional(v.string()),
    SITE_URL: v.optional(v.string()),
    WORKOS_CLIENT_ID: v.string(),
  },
});
