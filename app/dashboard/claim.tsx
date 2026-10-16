"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

import { api } from "@/convex/_generated/api";
import { domain } from "@/lib/brand";
import { cleanHandle, handleRule } from "@/lib/handle";

import { solid } from "../ui/parts";
import { field } from "./picker";
import { attempt } from "./say";

export const Claim = ({
  origin,
  suggestion,
}: {
  origin: string;
  suggestion: string;
}) => {
  const claim = useMutation(api.users.claim);
  const [handle, setHandle] = useState(suggestion);
  const [x, setX] = useState("");
  const [error, setError] = useState<string | null>(null);

  const problem = useQuery(api.users.available, {
    handle: cleanHandle(handle),
  });

  return (
    <section className="grid grid-cols-1 gap-12 px-6 py-12 md:grid-cols-2 md:gap-16 md:px-16 md:py-16">
      <form
        action={async () => {
          setError(await attempt(async () => await claim({ handle, x })));
        }}
        className="flex flex-col gap-4"
      >
        <span className="label">Step 1 of 2</span>
        <h1 className="title">Claim your page.</h1>
        <div className={`${field} flex h-11 items-center font-mono`}>
          <span className="text-muted">{domain(origin)}/</span>
          <input
            aria-label="Your handle"
            autoFocus
            className="min-w-0 flex-1 bg-transparent outline-none"
            onChange={(event) => {
              setHandle(event.target.value);
            }}
            value={handle}
          />
        </div>
        <div className="flex justify-between gap-4 label">
          {problem === null ? (
            <span className="text-pcb">✓ Yours if you want it</span>
          ) : (
            <span>{problem ?? "Checking…"}</span>
          )}
          <span className="text-muted">{handleRule}</span>
        </div>
        <input
          aria-label="Your X handle"
          className={`${field} h-11 font-mono`}
          onChange={(event) => {
            setX(event.target.value);
          }}
          placeholder="@ your X handle"
          value={x}
        />
        <span className="label text-muted">
          Your X handle, so sponsors can reach you
        </span>
        <button className={solid} disabled={problem !== null} type="submit">
          Claim it →
        </button>
        {error !== null && <span className="label">{error}</span>}
      </form>
      <div className="flex flex-col gap-4 opacity-50">
        <span className="label">Step 2 of 2</span>
        <h2 className="title">
          Your list is empty.
          <br />
          Your rig isn&apos;t.
        </h2>
        {["+ Add RAM", "+ Add an SSD", "+ Add an HDD"].map((label) => (
          <span
            className="flex h-14 items-center justify-center rounded-chip border-2 border-dashed border-rule label text-muted"
            key={label}
          >
            {label}
          </span>
        ))}
      </div>
    </section>
  );
};
