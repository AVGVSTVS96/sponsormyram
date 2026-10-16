"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { startTransition, useState } from "react";

import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { domain } from "@/lib/brand";

import { intent, outline, solid } from "../ui/parts";
import { Claim } from "./claim";
import { List } from "./list";
import { Profile } from "./profile";

const Band = ({ origin, user }: { origin: string; user: Doc<"users"> }) => {
  const [copied, setCopied] = useState(false);
  const url = `${origin}/${user.handle}`;

  return (
    <section className="flex flex-col gap-6 border-b-2 border-ink px-6 py-10 md:flex-row md:items-end md:justify-between md:px-16">
      <div className="flex min-w-0 flex-col gap-2">
        <span className="label text-muted">Your page</span>
        <Link
          className="truncate title hover:underline"
          href={`/${user.handle}`}
        >
          <span className="text-muted">{domain(origin)}/</span>
          {user.handle}
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          className={outline}
          onClick={() => {
            startTransition(async () => {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
              }, 1600);
            });
          }}
          type="button"
        >
          {copied ? "Copied ✓" : "Copy link"}
        </button>
        <a
          className={solid}
          href={intent("Sponsor my RAM. Here's what my rig is short on:", url)}
        >
          Post your list on X
        </a>
      </div>
    </section>
  );
};

export const Dashboard = ({ origin }: { origin: string }) => {
  const me = useQuery(api.users.me);

  if (me === undefined) {
    return <div className="min-h-[60dvh]" />;
  }

  if (me === null) {
    return (
      <section className="flex min-h-[60dvh] flex-col items-start gap-4 px-6 py-16 md:px-16">
        <h1 className="title">You&apos;re signed out.</h1>
        <Link className={solid} href="/sign-in">
          Sign in →
        </Link>
      </section>
    );
  }

  if (me.user === null) {
    return <Claim origin={origin} suggestion={me.suggestion} />;
  }

  return (
    <>
      <Band origin={origin} user={me.user} />
      <List />
      <Profile origin={origin} user={me.user} />
    </>
  );
};
