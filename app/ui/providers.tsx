"use client";

import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { useCallback, useMemo } from "react";

import { authClient } from "@/lib/auth-client";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? "");

const useBetterAuth = () => {
  const { data, isPending } = authClient.useSession();
  const sessionId = data?.session.id;

  const fetchAccessToken = useCallback(async () => {
    if (sessionId === undefined) {
      return null;
    }

    const { data: token } = await authClient.convex.token({
      fetchOptions: { throw: false },
    });

    return token?.token ?? null;
  }, [sessionId]);

  return useMemo(
    () => ({
      fetchAccessToken,
      isAuthenticated: sessionId !== undefined,
      isLoading: isPending,
    }),
    [fetchAccessToken, isPending, sessionId]
  );
};

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <ConvexProviderWithAuth client={convex} useAuth={useBetterAuth}>
    {children}
  </ConvexProviderWithAuth>
);
