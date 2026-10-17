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
      className="press self-start text-[15px] font-semibold link"
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
