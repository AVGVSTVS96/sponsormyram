"use client";

import { useMutation } from "convex/react";
import { useState } from "react";

import { Fit } from "@/app/ui/fit";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { methods, problemOf, tidy, ways } from "@/lib/pay";
import type { Method, PayTo, Way } from "@/lib/pay";

import { useAutosave } from "./autosave";
import { Status } from "./profile";

const ready = (pay: PayTo) => pay.to !== "" && problemOf(pay) === null;

const stuck = (pay: PayTo) => pay.to !== "" && problemOf(pay) !== null;

const Note = ({ pay }: { pay: PayTo }) => {
  const way: Way = ways[pay.method];

  if (pay.to === "") {
    return null;
  }

  const problem = problemOf(pay);

  if (problem !== null) {
    return <span className="text-[15px] font-semibold">{problem}</span>;
  }

  if ("open" in way) {
    const url = way.open(pay.to);

    return (
      <a
        className="self-start text-[15px] [overflow-wrap:anywhere] text-muted hover:text-ink"
        href={url}
        rel="noreferrer"
        target="_blank"
      >
        Opens {url.replace(/^https:\/\//u, "")}
      </a>
    );
  }

  return (
    <span className="text-[15px] text-muted">
      Anyone can see it on your page, copy it or scan its QR.
    </span>
  );
};

const Toggle = ({
  label,
  on,
  onFlip,
}: {
  label: string;
  on: boolean;
  onFlip: () => void;
}) => (
  <button
    aria-label={`Show ${label} on my page`}
    aria-pressed={on}
    className={`flex h-7 w-12 shrink-0 press border-2 p-[3px] ${on ? "justify-end border-ink bg-ink" : "justify-start border-muted bg-paper"}`}
    onClick={onFlip}
    type="button"
  >
    <span className={`size-[18px] ${on ? "bg-paper" : "bg-muted"}`} />
  </button>
);

const Row = ({
  focus,
  method,
  onChange,
  onFlip,
  pay,
}: {
  focus: boolean;
  method: Method;
  onChange: (to: string) => void;
  onFlip: () => void;
  pay: PayTo | undefined;
}) => {
  const way: Way = ways[method];
  const on = pay !== undefined;

  return (
    <li className="flex flex-col gap-3 bg-surf px-4 py-4 md:flex-row md:items-start md:gap-6 md:px-6">
      <div className="flex items-center gap-4 md:h-12 md:w-56 md:shrink-0">
        <Toggle label={way.label} on={on} onFlip={onFlip} />
        <span className="text-lg font-[650]">{way.label}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <label
          className={`flex h-12 min-w-0 items-center border-2 px-3.5 ${on ? "border-ink bg-paper focus-within:border-gold" : "border-rule"}`}
        >
          {way.prefix !== "" && (
            <span
              className={`shrink-0 text-muted ${way.prefix.length > 1 ? "hidden sm:inline" : ""}`}
            >
              {way.prefix}
            </span>
          )}
          <input
            aria-label={`${way.label} ${way.hint}`}
            autoCapitalize="none"
            autoComplete="off"
            autoFocus={focus}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted disabled:cursor-not-allowed"
            disabled={!on}
            onBlur={() => {
              if (pay !== undefined && way.clean(pay.to) !== pay.to) {
                onChange(way.clean(pay.to));
              }
            }}
            onChange={(event) => {
              onChange(event.target.value);
            }}
            placeholder={on ? way.hint : `Turn it on to add your ${way.hint}`}
            spellCheck={false}
            value={pay?.to ?? ""}
          />
        </label>
        {pay !== undefined && <Note pay={tidy(pay)} />}
      </div>
    </li>
  );
};

export const Money = ({ user }: { user: Doc<"users"> }) => {
  const save = useMutation(api.users.savePay);
  const [focus, setFocus] = useState<Method | null>(null);

  const [pay, setPay, status] = useAutosave(user.pay ?? [], async (value) => {
    await save({ pay: value.map(tidy).filter(ready) });

    return null;
  });

  return (
    <section className="flex flex-col gap-8 px-5 py-16 md:px-16 md:py-28 xl:flex-row xl:gap-16">
      <div className="flex flex-col gap-4 xl:w-[420px] xl:shrink-0">
        <Fit
          cap={64}
          lead={1}
          lines={["Chip in", "options"]}
          flow
          track={-0.045}
        />
        <p className="max-w-[520px] md:text-lg">
          Turn on the ones you use. Visitors see them under your list; the site
          only links out or copies the&nbsp;details.
        </p>
        {status !== "" && (
          <Status text={pay.map(tidy).some(stuck) ? "Not saved yet" : status} />
        )}
      </div>
      <ul className="flex min-w-0 flex-1 flex-col gap-1">
        {methods.map((method) => {
          const each = pay.find((row) => row.method === method);

          return (
            <Row
              focus={method === focus}
              key={method}
              method={method}
              onChange={(to) => {
                setPay(
                  pay.map((row) =>
                    row.method === method ? { ...row, to } : row
                  )
                );
              }}
              onFlip={() => {
                if (each === undefined) {
                  setFocus(method);
                  setPay([...pay, { method, to: "" }]);

                  return;
                }

                setPay(pay.filter((row) => row.method !== method));
              }}
              pay={each}
            />
          );
        })}
      </ul>
    </section>
  );
};
