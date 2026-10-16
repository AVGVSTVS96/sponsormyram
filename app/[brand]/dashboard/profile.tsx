"use client";

import { useMutation, useQuery } from "convex/react";
import { useState, useTransition } from "react";

import { Ram } from "@/app/ui/glyphs";
import { solid } from "@/app/ui/parts";
import { slotName } from "@/app/ui/rig";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { domain } from "@/lib/brand";
import { cleanHandle } from "@/lib/handle";
import { stickSizes } from "@/lib/kinds";
import { origin } from "@/lib/origin";

import { useAutosave } from "./autosave";
import { field } from "./picker";
import { attempt } from "./say";

type Rig = NonNullable<Doc<"users">["rig"]>;

const Line = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) => (
  <label className="flex flex-col gap-2 md:flex-row md:items-start">
    <span className="pt-3 label text-muted md:w-36 md:shrink-0">{label}</span>
    <div className="min-w-0 flex-1">{children}</div>
  </label>
);

export const Status = ({ text }: { text: string }) => (
  <span className={`label ${text.startsWith("✓") ? "text-pcb" : "text-muted"}`}>
    {text}
  </span>
);

const Handle = ({ user }: { user: Doc<"users"> }) => {
  const rename = useMutation(api.users.rename);
  const [handle, setHandle] = useState(user.handle);
  const [error, setError] = useState<string | null>(null);
  const [busy, start] = useTransition();
  const next = cleanHandle(handle);
  const problem = useQuery(api.users.available, { handle: next });
  const changed = next !== user.handle;

  const note = () => {
    if (!changed) {
      return error;
    }

    if (problem === undefined) {
      return "Checking…";
    }

    return problem ?? error ?? `Links to /${user.handle} will forward here.`;
  };

  return (
    <form
      action={() => {
        start(async () => {
          setError(await attempt(async () => await rename({ handle: next })));
        });
      }}
      className="flex flex-col gap-2 md:flex-row md:items-start"
    >
      <span className="pt-3 label text-muted md:w-36 md:shrink-0">Handle</span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex gap-2">
          <div
            className={`${field} flex h-11 min-w-0 flex-1 items-center font-mono`}
          >
            <span className="text-muted">{domain(origin("ram"))}/</span>
            <input
              aria-label="Your handle"
              className="min-w-0 flex-1 bg-transparent outline-none"
              onChange={(event) => {
                setHandle(event.target.value);
                setError(null);
              }}
              value={handle}
            />
          </div>
          {changed && (
            <button
              className={`${solid} h-11`}
              disabled={busy || problem !== null}
              type="submit"
            >
              {busy ? "Saving…" : "Save"}
            </button>
          )}
        </div>
        <span className="label text-muted">{note()}</span>
      </div>
    </form>
  );
};

const You = ({ user }: { user: Doc<"users"> }) => {
  const save = useMutation(api.users.save);

  const [you, setYou, status] = useAutosave(
    { name: user.name, note: user.note, x: user.x },
    async (value) => {
      await save(value);

      return null;
    }
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="title">You</h2>
        <Status text={status} />
      </div>
      <Handle user={user} />
      <Line label="Name">
        <input
          className={`${field} h-11 font-mono`}
          maxLength={60}
          onChange={(event) => {
            setYou({ ...you, name: event.target.value });
          }}
          value={you.name}
        />
      </Line>
      <Line label="On X">
        <input
          className={`${field} h-11 font-mono`}
          onChange={(event) => {
            setYou({ ...you, x: event.target.value });
          }}
          placeholder="@ your X handle"
          value={you.x}
        />
      </Line>
      <Line label="Note">
        <textarea
          className={`${field} min-h-24 resize-y`}
          maxLength={400}
          onChange={(event) => {
            setYou({ ...you, note: event.target.value });
          }}
          placeholder="What's going on with your rig. This tops your page."
          value={you.note}
        />
      </Line>
    </div>
  );
};

const cycle = (gb: number) =>
  stickSizes[(stickSizes.indexOf(gb) + 1) % stickSizes.length] ?? 0;

const blank: Rig = { board: "", maxGB: 64, slots: [0, 0, 0, 0] };

const RigEditor = ({ user }: { user: Doc<"users"> }) => {
  const save = useMutation(api.users.saveRig);

  const [rig, setRig, status] = useAutosave(user.rig, async (value) => {
    await save({ rig: value });

    return null;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="title">The rig</h2>
        {status === "" ? (
          <span className="label text-muted">
            Optional · shows on your page
          </span>
        ) : (
          <Status text={status} />
        )}
      </div>
      {rig === undefined ? (
        <button
          className="h-14 rounded-chip border-2 border-dashed border-rule label text-muted transition-colors hover:border-ink hover:text-ink"
          onClick={() => {
            setRig(blank);
          }}
          type="button"
        >
          + Add your rig, slot by slot
        </button>
      ) : (
        <>
          <Line label="Board">
            <input
              className={`${field} h-11 font-mono`}
              maxLength={80}
              onChange={(event) => {
                setRig({ ...rig, board: event.target.value });
              }}
              placeholder="ASUS B550-F · Ryzen 7 5700G"
              value={rig.board}
            />
          </Line>
          <Line label="Max RAM">
            <div className="flex items-center gap-3">
              <input
                className={`${field} h-11 w-32 font-mono`}
                inputMode="numeric"
                onChange={(event) => {
                  setRig({
                    ...rig,
                    maxGB: Number(event.target.value.replaceAll(/\D/gu, "")),
                  });
                }}
                value={rig.maxGB}
              />
              <span className="label text-muted">GB</span>
            </div>
          </Line>
          <div className="flex flex-col gap-2 md:flex-row md:items-start">
            <span className="pt-3 label text-muted md:w-36 md:shrink-0">
              Slots
            </span>
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                {rig.slots.map((gb, index) => (
                  <button
                    aria-label={`Slot ${slotName(index)}: ${gb === 0 ? "empty" : `${gb}GB`}`}
                    className="flex w-28 flex-col gap-1 text-left"
                    key={slotName(index)}
                    onClick={() => {
                      setRig({
                        ...rig,
                        slots: rig.slots.with(index, cycle(gb)),
                      });
                    }}
                    type="button"
                  >
                    {gb === 0 ? (
                      <span className="flex aspect-[220/56] w-full items-center justify-center border-2 border-dashed border-ink label">
                        Empty
                      </span>
                    ) : (
                      <Ram className="w-full" />
                    )}
                    <span className="label text-muted">
                      {slotName(index)} · {gb === 0 ? "free" : `${gb}GB`}
                    </span>
                  </button>
                ))}
                <div className="flex gap-2 self-start">
                  <button
                    aria-label="Add a slot"
                    className="size-9 rounded-chip border-2 border-rule font-bold hover:border-ink"
                    disabled={rig.slots.length >= 16}
                    onClick={() => {
                      setRig({ ...rig, slots: [...rig.slots, 0] });
                    }}
                    type="button"
                  >
                    +
                  </button>
                  <button
                    aria-label="Remove the last slot"
                    className="size-9 rounded-chip border-2 border-rule font-bold hover:border-ink"
                    disabled={rig.slots.length === 0}
                    onClick={() => {
                      setRig({ ...rig, slots: rig.slots.slice(0, -1) });
                    }}
                    type="button"
                  >
                    −
                  </button>
                </div>
              </div>
              <span className="label text-muted">
                Tap a slot to cycle its stick: empty → 4 → 8 → 16 → 32 → 48 →
                64GB
              </span>
              <button
                className="self-start label text-muted hover:text-ink"
                onClick={() => {
                  setRig(undefined);
                }}
                type="button"
              >
                Take the rig off my page
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const Profile = ({ user }: { user: Doc<"users"> }) => (
  <section className="grid grid-cols-1 gap-12 border-t-2 border-ink px-6 py-12 md:grid-cols-2 md:gap-16 md:px-16">
    <You user={user} />
    <RigEditor user={user} />
  </section>
);
