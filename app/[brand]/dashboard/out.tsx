"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { forgetSignIn } from "@/app/ui/account";
import { authClient } from "@/lib/auth-client";

export const SignOut = () => {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      className="label h-11 text-muted hover:text-ink"
      disabled={pending}
      onClick={() => {
        start(async () => {
          await authClient.signOut();
          await forgetSignIn();
          router.push("/");
        });
      }}
      type="button"
    >
      Sign out
    </button>
  );
};
