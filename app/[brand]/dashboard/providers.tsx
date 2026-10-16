"use client";

import {
  AuthKitProvider,
  useAccessToken,
  useAuth,
} from "@workos-inc/authkit-nextjs/components";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { useCallback } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? "");

const useAuthKit = () => {
  const { loading, user } = useAuth();
  const { getAccessToken, refresh } = useAccessToken();

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (user === null) {
        return null;
      }

      try {
        return (
          (forceRefreshToken ? await refresh() : await getAccessToken()) ?? null
        );
      } catch {
        return null;
      }
    },
    [getAccessToken, refresh, user]
  );

  return {
    fetchAccessToken,
    isAuthenticated: user !== null,
    isLoading: loading,
  };
};

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <AuthKitProvider>
    <ConvexProviderWithAuth client={convex} useAuth={useAuthKit}>
      {children}
    </ConvexProviderWithAuth>
  </AuthKitProvider>
);
