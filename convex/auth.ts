import { createClient } from "@convex-dev/better-auth";
import type { AuthFunctions, GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";
import * as z from "zod";

import type { Platform } from "../lib/handle";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { env } from "./_generated/server";
import authConfig from "./auth.config";
import { bind, forget, settle } from "./people";

const authFunctions: AuthFunctions = internal.auth;

export const authComponent = createClient<DataModel>(components.betterAuth, {
  authFunctions,
  triggers: {
    account: {
      onCreate: async (ctx, account) => {
        await bind(ctx, account);
      },
    },
    session: {
      onCreate: async (ctx, session) => {
        await settle(ctx, session.userId);
      },
    },
    user: {
      onDelete: async (ctx, user) => {
        await forget(ctx, user._id);
      },
    },
  },
});

export const { onCreate, onDelete, onUpdate } = authComponent.triggersApi();

const xProfile = z.object({
  data: z.object({
    confirmed_email: z.string().optional(),
    id: z.string(),
    name: z.string(),
    username: z.string(),
  }),
});

const day = 60 * 60 * 24;

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  const prove = async (
    platform: Platform,
    profile: { handle: string; id: string; name: string }
  ) => {
    if ("runMutation" in ctx) {
      await ctx.runMutation(internal.people.prove, { ...profile, platform });
    }
  };

  return betterAuth({
    account: {
      accountLinking: { allowDifferentEmails: true },
      updateAccountOnSignIn: false,
    },
    advanced: { ipAddress: { disableIpTracking: true } },
    baseURL: env.SITE_URL,
    database: authComponent.adapter(ctx),
    databaseHooks: {
      account: {
        create: {
          before: async (account) =>
            await Promise.resolve({
              data: {
                ...account,
                accessToken: null,
                idToken: null,
                refreshToken: null,
              },
            }),
        },
      },
      session: {
        create: {
          before: async (session) =>
            await Promise.resolve({
              data: { ...session, ipAddress: null, userAgent: null },
            }),
        },
      },
    },
    plugins: [convex({ authConfig })],
    secret: env.BETTER_AUTH_SECRET,
    session: { expiresIn: 30 * day, updateAge: day },
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        mapProfileToUser: async (profile) => {
          await prove("gh", {
            handle: profile.login,
            id: z.coerce.string().parse(profile.id),
            name: profile.name || profile.login,
          });

          return {};
        },
      },
      twitter: {
        clientId: env.TWITTER_CLIENT_ID,
        clientSecret: env.TWITTER_CLIENT_SECRET,
        disableDefaultScope: true,
        getUserInfo: async (token) => {
          const response = await fetch(
            "https://api.x.com/2/users/me?user.fields=confirmed_email",
            { headers: { authorization: `Bearer ${token.accessToken}` } }
          );

          const parsed = xProfile.safeParse(
            response.ok ? await response.json() : null
          );

          if (!parsed.success) {
            return null;
          }

          const {
            confirmed_email: email,
            id,
            name,
            username,
          } = parsed.data.data;

          await prove("x", { handle: username, id, name });

          return {
            data: parsed.data,
            user: {
              email: email ?? `${id}@x.invalid`,
              emailVerified: email !== undefined,
              id,
              name,
            },
          };
        },
        scope: ["users.read", "tweet.read", "users.email"],
      },
    },
    user: { deleteUser: { enabled: true } },
  });
};
