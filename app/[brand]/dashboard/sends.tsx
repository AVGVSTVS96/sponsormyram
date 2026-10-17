"use client";

import { useMutation, useQuery } from "convex/react";
import { useTransition } from "react";

import { Bag, faceOf } from "@/app/ui/hardware";
import { X } from "@/app/ui/icons";
import { outline, reachOwner, small, tellOwner, who } from "@/app/ui/parts";
import { api } from "@/convex/_generated/api";

import { Title } from "./list";

const since = (at: number) =>
  new Date(at).toLocaleDateString("en-US", { day: "numeric", month: "short" });

const quiet = "press link text-[15px] font-semibold";

export const Sends = () => {
  const sends = useQuery(api.items.sends);
  const unsend = useMutation(api.items.unsend);
  const [, start] = useTransition();

  if (sends === undefined || sends.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-4xl leading-none font-extrabold tracking-[-0.045em] md:text-[44px]">
        You’re sending
      </h2>
      <ol className="flex flex-col gap-3">
        {sends.map(({ item, owner }) => (
          <li
            className="flex flex-col gap-5 border-[3px] border-gold p-5 md:flex-row md:items-center md:gap-6"
            key={item._id}
          >
            <Bag className="w-[150px] shrink-0" kind={faceOf(item)} />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <a
                className="hover:underline"
                href={`/${owner.handle}/${item.slug}`}
              >
                <Title
                  className="text-xl leading-tight font-bold tracking-[-0.02em] md:text-[22px]"
                  item={item}
                />
              </a>
              <p className="text-[15px] md:text-base">
                For {who(owner)}
                {item.sending === undefined
                  ? ""
                  : `, since ${since(item.sending.at)}`}
                . They turn it gold when it&nbsp;lands.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2.5 md:items-end">
              <a
                className={`${outline} ${small}`}
                href={tellOwner(owner, item)}
              >
                <X /> Tell {who(owner)}
              </a>
              <span className="flex gap-4">
                <a className={quiet} href={reachOwner(owner)}>
                  {owner.x === undefined ? "Their GitHub" : "DM"}
                </a>
                <button
                  className={quiet}
                  onClick={() => {
                    start(async () => {
                      await unsend({ id: item._id });
                    });
                  }}
                  type="button"
                >
                  Back out
                </button>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};
