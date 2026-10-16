"use server";

import { signOut } from "@workos-inc/authkit-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { clientId, finish, requestOrigin, workos } from "@/lib/auth";

const providers = new Map([
  ["github", "GitHubOAuth"],
  ["google", "GoogleOAuth"],
]);

const pkceCookie = {
  httpOnly: true,
  maxAge: 600,
  path: "/callback",
  sameSite: "lax",
  secure: true,
} as const;

export const continueWith = async (name: string) => {
  const provider = providers.get(name);

  if (provider === undefined) {
    return redirect("/sign-in?failed");
  }

  const { codeVerifier, state, url } =
    await workos().getAuthorizationUrlWithPKCE({
      clientId: clientId(),
      provider,
      redirectUri: `${await requestOrigin()}/callback`,
    });

  const jar = await cookies();

  jar.set("oauth-state", state, pkceCookie);
  jar.set("oauth-verifier", codeVerifier, pkceCookie);

  return redirect(url);
};

const cleanEmail = (email: string) => email.trim().toLowerCase();

export const sendCode = async (email: string) => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(cleanEmail(email))) {
    return "That doesn't look like an email.";
  }

  try {
    await workos().createMagicAuth({ email: cleanEmail(email) });
  } catch {
    return "Couldn't send a code. Try again in a minute.";
  }

  return null;
};

export const verifyCode = async (email: string, code: string) => {
  try {
    const auth = await workos().authenticateWithMagicAuth({
      clientId: clientId(),
      code: code.replaceAll(/\D/gu, ""),
      email: cleanEmail(email),
    });

    await finish(auth, await requestOrigin());
  } catch {
    return "That code didn't work. Check it, or send a new one.";
  }

  return redirect("/dashboard");
};

export const leave = async () => {
  await signOut({ returnTo: await requestOrigin() });
};
