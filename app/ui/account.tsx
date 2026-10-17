"use client";

import Link from "next/link";
import {
  lazy,
  Suspense,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";

import type { Brand } from "@/lib/brand";
import { origin } from "@/lib/origin";

import { signedIn } from "./hint";
import { GitHub, X } from "./icons";
import { small, solid } from "./parts";

const Sheet = lazy(async () => await import("./sheet"));

const listen = (change: () => void) => {
  window.addEventListener("focus", change);

  return () => {
    window.removeEventListener("focus", change);
  };
};

export const useSignedIn = () =>
  useSyncExternalStore(
    listen,
    () => document.cookie.includes(`${signedIn.name}=${signedIn.value}`),
    () => false
  );

export const forgetSignIn = async () => {
  await cookieStore.delete({ name: signedIn.name, path: signedIn.path });
};

export const AuthLink = ({
  brand,
  children,
  className,
}: {
  brand: Brand;
  children: React.ReactNode;
  className: string;
}) => {
  const [open, setOpen] = useState(false);
  const signed = useSignedIn();

  if (signed) {
    return (
      <Link className={className} href="/dashboard">
        {children}
      </Link>
    );
  }

  if (brand !== "ram") {
    return (
      <a className={className} href={`${origin("ram")}/sign-in`}>
        {children}
      </a>
    );
  }

  return (
    <>
      <Link
        className={className}
        href="/sign-in"
        onClick={(event) => {
          event.preventDefault();
          setOpen(true);
        }}
      >
        {children}
      </Link>
      {open && (
        <Suspense>
          <Sheet
            onClose={() => {
              setOpen(false);
            }}
          />
        </Suspense>
      )}
    </>
  );
};

const begin = async (provider: "github" | "twitter") => {
  const { authClient } = await import("@/lib/auth-client");

  const { error } = await authClient.signIn.social({
    callbackURL: "/dashboard",
    errorCallbackURL: "/sign-in",
    provider,
  });

  if (error !== null) {
    window.location.assign("/sign-in");
  }
};

const providers = [
  ["twitter", "Start with X", X],
  ["github", "GitHub", GitHub],
] as const;

export const Start = ({
  brand,
  styles,
}: {
  brand: Brand;
  styles: readonly [string, string];
}) => {
  const signed = useSignedIn();
  const [pending, start] = useTransition();

  if (signed) {
    return (
      <Link className={styles[0]} href="/dashboard">
        Your list →
      </Link>
    );
  }

  return (
    <>
      {providers.map(([provider, label, Icon], index) => (
        <a
          aria-disabled={pending}
          className={styles[index]}
          href={`${origin("ram")}/sign-in`}
          key={provider}
          onClick={(event) => {
            if (brand !== "ram") {
              return;
            }

            event.preventDefault();
            start(async () => {
              await begin(provider);
            });
          }}
        >
          <Icon /> {label}
        </a>
      ))}
    </>
  );
};

export const Account = ({ brand }: { brand: Brand }) =>
  useSignedIn() ? (
    <Link className={`${solid} ${small}`} href="/dashboard">
      Your list
    </Link>
  ) : (
    <div className="flex items-center gap-6">
      <AuthLink
        brand={brand}
        className="hidden text-[15px] font-medium hover:underline md:block"
      >
        Sign in
      </AuthLink>
      <AuthLink brand={brand} className={`${solid} ${small}`}>
        <span className="md:hidden">Sign in</span>
        <span className="hidden md:inline">Make your list</span>
      </AuthLink>
    </div>
  );
