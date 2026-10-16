"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import type { Brand } from "@/lib/brand";
import { origin } from "@/lib/origin";

import { signedIn } from "./hint";
import { solid } from "./parts";
import { Sheet } from "./sheet";

const listen = (change: () => void) => {
  window.addEventListener("focus", change);

  return () => {
    window.removeEventListener("focus", change);
  };
};

const useSignedIn = () =>
  useSyncExternalStore(
    listen,
    () => document.cookie.includes(`${signedIn.name}=${signedIn.value}`),
    () => false
  );

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
        <Sheet
          onClose={() => {
            setOpen(false);
          }}
        />
      )}
    </>
  );
};

export const Account = ({ brand }: { brand: Brand }) =>
  useSignedIn() ? (
    <Link className={solid} href="/dashboard">
      Your list →
    </Link>
  ) : (
    <div className="flex items-center gap-6">
      <AuthLink brand={brand} className="hidden label hover:underline md:block">
        Sign in
      </AuthLink>
      <AuthLink brand={brand} className={solid}>
        Make your list →
      </AuthLink>
    </div>
  );
