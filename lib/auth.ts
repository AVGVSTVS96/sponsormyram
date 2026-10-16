import "server-only";
import { getWorkOS, saveSession } from "@workos-inc/authkit-nextjs";
import type { AuthenticationResponse } from "@workos-inc/node";
import { fetchMutation } from "convex/nextjs";
import { headers } from "next/headers";

import { api } from "@/convex/_generated/api";

export const workos = () => getWorkOS().userManagement;

export const clientId = () => {
  const id = process.env.WORKOS_CLIENT_ID;

  if (id === undefined || id === "") {
    throw new Error(
      "WORKOS_CLIENT_ID is missing. Run `bunx convex dev` locally or set it in Vercel."
    );
  }

  return id;
};

export const requestOrigin = async () => {
  const list = await headers();

  return `${list.get("x-forwarded-proto") ?? "http"}://${list.get("host") ?? "localhost:3000"}`;
};

export const finish = async (auth: AuthenticationResponse, url: string) => {
  await saveSession(auth, url);
  await fetchMutation(api.users.link, {}, { token: auth.accessToken });
};
