"use client";

import { useMutation } from "convex/react";
import { useState } from "react";

import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { methods, problemOf, tidy, ways } from "@/lib/pay";
import type { Method, PayTo, Way } from "@/lib/pay";

import { useAutosave } from "./autosave";
import { field } from "./picker";
import { Status } from "./profile";

const ready = (pay: PayTo) => pay.to !== "" && problemOf(pay) === null;

const stuck = (pay: PayTo) => pay.to !== "" && problemOf(pay) !== null;

const Note = ({ pay }: { pay: PayTo }) => {
  const way: Way = ways[pay.method];

  if (pay.to === "") {
    return <span className="label text-muted">Your {way.hint}</span>;
  }

  const problem = problemOf(pay);

  if (problem !== null) {
    return <span className="label text-ink">{problem}</span>;
  }

  if ("open" in way) {
    const url = way.open(pay.to);

    return (
      <a
        className="label self-start [overflow-wrap:anywhere] text-muted hover:text-ink"
        href={url}
        rel="noreferrer"
        target="_blank"
      >
        Opens {url.replace(/^https:\/\//u, "")} ↗
      </a>
    );
  }

  return (
    <span className="label text-muted">
      Anyone can see it on your page, copy it or scan its QR
    </span>
  );
};

const Row = ({
  focus,
  onChange,
  onRemove,
  pay,
}: {
  focus: boolean;
  onChange: (to: string) => void;
  onRemove: () => void;
  pay: PayTo;
}) => {
  const way = ways[pay.method];

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-start">
      <span className="label pt-3 text-muted md:w-36 md:shrink-0">
        {way.label}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex gap-2">
          <label
            className={`${field} flex h-11 min-w-0 flex-1 items-center font-mono focus-within:border-pcb`}
          >
            <span
              className={`text-muted ${way.prefix.length > 1 ? "hidden md:inline" : ""}`}
            >
              {way.prefix}
            </span>
            <input
              aria-label={`${way.label} ${way.hint}`}
              autoCapitalize="none"
              autoComplete="off"
              autoFocus={focus}
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted"
              onBlur={() => {
                if (way.clean(pay.to) !== pay.to) {
                  onChange(way.clean(pay.to));
                }
              }}
              onChange={(event) => {
                onChange(event.target.value);
              }}
              placeholder={way.hint}
              spellCheck={false}
              value={pay.to}
            />
          </label>
          <button
            aria-label={`Take ${way.label} off my page`}
            className="rounded-chip size-11 shrink-0 border-2 border-rule font-bold transition-colors hover:border-ink"
            onClick={onRemove}
            type="button"
          >
            ×
          </button>
        </div>
        <Note pay={tidy(pay)} />
      </div>
    </div>
  );
};

export const Money = ({ user }: { user: Doc<"users"> }) => {
  const save = useMutation(api.users.savePay);
  const [focus, setFocus] = useState<Method | null>(null);

  const [pay, setPay, status] = useAutosave(user.pay ?? [], async (value) => {
    await save({ pay: value.map(tidy).filter(ready) });

    return null;
  });

  const listed = methods.flatMap(
    (method) => pay.find((each) => each.method === method) ?? []
  );

  const open = methods.filter((method) =>
    pay.every((each) => each.method !== method)
  );

  return (
    <section className="flex flex-col gap-4 border-t-2 border-ink px-6 py-12 md:px-16">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="title">Chip in</h2>
        {status === "" ? (
          <span className="label text-muted">
            Optional · shows under your list
          </span>
        ) : (
          <Status text={pay.map(tidy).some(stuck) ? "Not saved yet" : status} />
        )}
      </div>
      <p className="max-w-[600px] text-muted">
        For people who&apos;d rather send money than a part. It goes straight to
        you; this site never sees it.
      </p>
      {listed.map((each) => (
        <Row
          focus={each.method === focus}
          key={each.method}
          onChange={(to) => {
            setPay(pay.map((row) => (row === each ? { ...row, to } : row)));
          }}
          onRemove={() => {
            setPay(pay.filter((row) => row !== each));
          }}
          pay={each}
        />
      ))}
      {open.length > 0 && (
        <div className="grid grid-cols-2 gap-2 pt-2 md:grid-cols-4">
          {open.map((method) => (
            <button
              className="rounded-chip label h-14 border-2 border-dashed border-rule px-2 text-muted transition-colors hover:border-ink hover:text-ink"
              key={method}
              onClick={() => {
                setFocus(method);
                setPay([...pay, { method, to: "" }]);
              }}
              type="button"
            >
              + {ways[method].label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
