"use client";

import { useMutation, useQuery } from "convex/react";
import { useTransition } from "react";

import { reachOwner, tellOwner, who } from "@/app/ui/parts";
import { api } from "@/convex/_generated/api";
import { title } from "@/lib/kinds";

const since = (at: number) =>
  new Date(at).toLocaleDateString("en-US", { day: "numeric", month: "short" });

const action =
  "label inline-flex h-11 items-center px-2.5 text-muted transition-colors hover:text-ink md:h-auto md:px-0";

export const Sends = () => {
  const sends = useQuery(api.items.sends);
  const unsend = useMutation(api.items.unsend);
  const [, start] = useTransition();

  if (sends === undefined || sends.length === 0) {
    return null;
  }

  return (
    <section className="border-t-2 border-ink px-6 py-12 md:px-16">
      <div className="flex items-baseline justify-between gap-4 pb-6">
        <h2 className="title">You&apos;re sending</h2>
        <span className="label hidden text-muted md:block">
          It turns gold when they confirm
        </span>
      </div>
      <ol>
        {sends.map(({ item, owner }) => (
          <li
            className="flex flex-col gap-3 border-t border-rule py-5 md:flex-row md:items-center md:justify-between"
            key={item._id}
          >
            <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-4">
              <a
                className="title hover:underline"
                href={`/${owner.handle}/${item.slug}`}
              >
                {title(item)}
              </a>
              <span className="label text-muted">
                for {who(owner)}
                {item.sending === undefined
                  ? ""
                  : ` · since ${since(item.sending.at)}`}
              </span>
            </div>
            <div className="-mx-2.5 flex items-center md:mx-0 md:gap-5">
              <a className={action} href={tellOwner(owner, item)}>
                Tell {who(owner)}
              </a>
              <a className={action} href={reachOwner(owner)}>
                {owner.x === undefined ? "GitHub" : "DM"}
              </a>
              <button
                className={action}
                onClick={() => {
                  start(async () => {
                    await unsend({ id: item._id });
                  });
                }}
                type="button"
              >
                Back out
              </button>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};
