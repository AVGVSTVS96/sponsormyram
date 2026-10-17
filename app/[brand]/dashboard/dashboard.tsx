"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { Copy } from "@/app/ui/copy";
import { Fit } from "@/app/ui/fit";
import { Bag, faceOf } from "@/app/ui/hardware";
import { GitHub, X } from "@/app/ui/icons";
import {
  golden,
  lead,
  outline,
  postList,
  reachOwner,
  solid,
  who,
} from "@/app/ui/parts";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import type { Item } from "@/convex/people";
import { domain } from "@/lib/brand";
import { origin } from "@/lib/origin";

import { List, Title, useFill } from "./list";
import { Money } from "./money";
import { fresh, Picker } from "./picker";
import { Accounts, RigEditor, You } from "./profile";
import { Sends } from "./sends";

const date = (at: number) =>
  new Date(at).toLocaleDateString("en-US", { day: "numeric", month: "short" });

const Band = ({ user }: { user: Doc<"users"> }) => {
  const brand = lead("ram", useQuery(api.items.mine) ?? []);
  const url = `${origin(brand)}/${user.handle}`;

  return (
    <section className="flex flex-col gap-6 px-5 pt-8 pb-10 md:px-16 md:pt-16 md:pb-12 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <span className="text-[15px] font-medium text-muted">Your page</span>
        <a className="hover:underline" href={url}>
          <Fit
            as="h1"
            cap={72}
            flow
            lead={1}
            lines={[`${domain(origin(brand))}/`, user.handle]}
            track={-0.045}
          />
        </a>
        <p className="flex items-center gap-2 text-[15px] text-muted md:text-base">
          {user.x === undefined ? <GitHub /> : <X />}
          Signed in with {user.x === undefined ? "GitHub" : "X"} as {who(user)}.
        </p>
      </div>
      <div className="flex gap-2.5">
        <Copy className={outline} text={url}>
          Copy link
        </Copy>
        <a className={solid} href={postList(brand, user.handle)}>
          <X /> Post on X
        </a>
      </div>
    </section>
  );
};

const Arriving = ({
  item,
  onFill,
}: {
  item: Item;
  onFill: (id: Id<"items">) => void;
}) => {
  const clear = useMutation(api.items.clear);
  const [pending, start] = useTransition();

  if (item.sending === undefined) {
    return null;
  }

  const sender = item.sending.by;

  return (
    <div className="flex flex-col gap-6 border-[3px] border-gold p-5 md:p-9 lg:flex-row lg:items-center lg:gap-10">
      <Bag className="w-full max-w-[220px] shrink-0" kind={faceOf(item)} />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <h2 className="text-[26px] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance md:text-4xl">
          <span className="whitespace-nowrap">{who(sender)}</span> is sending
          your <Title className="" item={item} />
        </h2>
        <p className="text-[17px]">
          They tapped I’m sending it on {date(item.sending.at)}. Swap the
          address {sender.x === undefined ? "through their GitHub" : "in X DMs"}
          , then mark it when it shows&nbsp;up.
        </p>
      </div>
      <div className="flex flex-col gap-2.5 md:max-w-[360px] lg:w-[260px] lg:shrink-0">
        <button
          className={golden}
          onClick={() => {
            onFill(item._id);
          }}
          type="button"
        >
          It arrived
        </button>
        <a className={outline} href={reachOwner(sender)}>
          {sender.x === undefined ? (
            "Find them on GitHub"
          ) : (
            <>
              <X /> DM {who(sender)}
            </>
          )}
        </a>
        <button
          className="press self-start text-[15px] font-semibold link"
          disabled={pending}
          onClick={() => {
            start(async () => {
              await clear({ id: item._id });
            });
          }}
          type="button"
        >
          Not coming? Clear it
        </button>
      </div>
    </div>
  );
};

const Add = () => {
  const add = useMutation(api.items.add);
  const [round, setRound] = useState(0);
  const [open, setOpen] = useState(false);

  return (
    <section className="flex flex-col gap-6 self-start bg-surf p-5 md:p-9">
      <h2 className="text-4xl leading-none font-extrabold tracking-[-0.045em] md:text-[44px]">
        Add an ask
      </h2>
      <button
        className={`${solid} lg:hidden ${open ? "hidden" : ""}`}
        onClick={() => {
          setOpen(true);
        }}
        type="button"
      >
        Add an ask
      </button>
      <div className={open ? "" : "hidden lg:block"}>
        <Picker
          initial={fresh("ram")}
          key={round}
          onSave={async (ask) => {
            await add({ ask });
            setRound(round + 1);
            setOpen(false);
          }}
          saveLabel="Add to list"
        />
      </div>
    </section>
  );
};

const Signed = () => (
  <section className="flex min-h-[60dvh] flex-col items-start gap-5 px-5 py-16 md:px-16">
    <Fit as="h1" cap={72} lines={["You’re signed out."]} />
    <Link className={solid} href="/sign-in">
      Sign in
    </Link>
  </section>
);

export const Dashboard = () => {
  const me = useQuery(api.users.me);
  const items = useQuery(api.items.mine) ?? [];
  const [landed, land] = useFill();

  if (me === undefined) {
    return <div className="min-h-[60dvh]" />;
  }

  if (me === null) {
    return <Signed />;
  }

  if (me.user === null) {
    return (
      <section className="flex min-h-[60dvh] flex-col items-start gap-4 px-5 py-16 md:px-16">
        <Fit as="h1" cap={72} lines={["Your page isn’t", "set up yet."]} flow />
        <p className="max-w-[480px] text-[17px]">
          Sign-in finished but your page didn’t. Sign out and back in, and it’ll
          be made from your X or GitHub&nbsp;handle.
        </p>
      </section>
    );
  }

  const arriving = items.filter(
    (item) => item.sending !== undefined && item.sponsor === undefined
  );

  return (
    <div className="on-paper">
      <Band user={me.user} />
      {arriving.length > 0 && (
        <div className="flex flex-col gap-3 px-5 pb-12 md:px-16 md:pb-16">
          {arriving.map((item) => (
            <Arriving item={item} key={item._id} onFill={land} />
          ))}
        </div>
      )}
      <div className="grid gap-14 px-5 pb-20 md:px-16 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="flex min-w-0 flex-col gap-16">
          <List handle={me.user.handle} landed={landed} onFill={land} />
          <Sends />
          <Accounts user={me.user} />
        </div>
        <Add />
      </div>
      <RigEditor user={me.user} />
      <Money user={me.user} />
      <You user={me.user} />
    </div>
  );
};
