"use client";

import { useQuery } from "convex/react";
import Link from "next/link";

import { Copy } from "@/app/ui/copy";
import { outline, lead, postList, solid } from "@/app/ui/parts";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { domain } from "@/lib/brand";
import { origin } from "@/lib/origin";

import { List } from "./list";
import { Money } from "./money";
import { Profile } from "./profile";
import { Sends } from "./sends";

const Band = ({ user }: { user: Doc<"users"> }) => {
  const brand = lead("ram", useQuery(api.items.mine) ?? []);
  const url = `${origin(brand)}/${user.handle}`;

  return (
    <section className="flex flex-col gap-6 border-b-2 border-ink px-6 py-10 md:flex-row md:items-end md:justify-between md:px-16">
      <div className="flex min-w-0 flex-col gap-2">
        <span className="label text-muted">Your page</span>
        <a
          className="title [overflow-wrap:anywhere] hover:underline"
          href={url}
        >
          <span className="text-muted">{domain(origin(brand))}/</span>
          <wbr />
          {user.handle}
        </a>
      </div>
      <div className="flex flex-wrap gap-2">
        <Copy className={outline} text={url}>
          Copy link
        </Copy>
        <a className={solid} href={postList(brand, user.handle)}>
          Post your list on X
        </a>
      </div>
    </section>
  );
};

export const Dashboard = () => {
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
    return (
      <section className="flex min-h-[60dvh] flex-col items-start gap-4 px-6 py-16 md:px-16">
        <h1 className="title">Your page isn&apos;t set up yet.</h1>
        <p className="max-w-[480px] text-muted">
          Sign-in finished but your page didn&apos;t. Sign out and back in, and
          it&apos;ll be made from your X or GitHub handle.
        </p>
      </section>
    );
  }

  return (
    <>
      <Band user={me.user} />
      <List handle={me.user.handle} />
      <Sends />
      <Money user={me.user} />
      <Profile user={me.user} />
    </>
  );
};
