"use client";

import { useMutation } from "convex/react";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { forgetSignIn } from "@/app/ui/account";
import { Ram } from "@/app/ui/glyphs";
import { outline, solid } from "@/app/ui/parts";
import { slotName } from "@/app/ui/rig";
import { attempt } from "@/app/ui/say";
import { GitHub, problem, X } from "@/app/ui/sheet";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { authClient } from "@/lib/auth-client";
import { stickSizes } from "@/lib/kinds";

import { useAutosave } from "./autosave";
import { field } from "./picker";

type Rig = NonNullable<Doc<"users">["rig"]>;

const Line = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) => (
  <label className="flex flex-col gap-2 md:flex-row md:items-start">
    <span className="label pt-3 text-muted md:w-36 md:shrink-0">{label}</span>
    <div className="min-w-0 flex-1">{children}</div>
  </label>
);

export const Status = ({ text }: { text: string }) => (
  <span className={`label ${text.startsWith("✓") ? "text-pcb" : "text-muted"}`}>
    {text}
  </span>
);

const Linked = ({ user }: { user: Doc<"users"> }) => {
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [error, setError] = useState(problem(params.get("error")));

  const link = (provider: "github" | "twitter") => {
    start(async () => {
      const { error: failed } = await authClient.linkSocial({
        callbackURL: "/dashboard",
        errorCallbackURL: "/dashboard",
        provider,
      });

      if (failed !== null) {
        setError("Couldn't reach the sign-in page. Try again.");
      }
    });
  };

  const rows = [
    {
      account: user.x,
      icon: <X />,
      name: "X",
      path: user.x === undefined ? null : user.handle,
      provider: "twitter",
      shown: user.x === undefined ? null : `@${user.x.handle}`,
    },
    {
      account: user.gh,
      icon: <GitHub />,
      name: "GitHub",
      path: user.gh === undefined ? null : `gh/${user.gh.handle.toLowerCase()}`,
      provider: "github",
      shown: user.gh?.handle ?? null,
    },
  ] as const;

  return (
    <div className="flex flex-col">
      <span className="label pb-3 text-muted">Signed in with</span>
      {rows.map((row) => (
        <div
          className="flex min-h-14 items-center gap-4 border-t border-rule py-2 last:border-b"
          key={row.name}
        >
          <span className="flex w-5 justify-center">{row.icon}</span>
          {row.shown === null ? (
            <>
              <span className="flex-1 font-mono text-muted">Not linked</span>
              <button
                className={`${outline} h-9 md:h-9`}
                disabled={pending}
                onClick={() => {
                  link(row.provider);
                }}
                type="button"
              >
                Link {row.name}
              </button>
            </>
          ) : (
            <>
              <span className="flex-1 font-mono">{row.shown}</span>
              <span className="label text-muted">
                /{row.path === user.handle ? user.handle : `${row.path} → here`}
              </span>
            </>
          )}
        </div>
      ))}
      <p className="pt-3 text-muted">
        {error ??
          (user.x === undefined
            ? "Link X and your page moves to your X handle. This link keeps working."
            : "Your page follows your X handle. Rename on X and it moves the next time you sign in; old links keep working.")}
      </p>
    </div>
  );
};

const Leave = () => {
  const leave = useMutation(api.users.leave);
  const [sure, setSure] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-col gap-2 border-t border-rule pt-6">
      {sure ? (
        <div className="flex flex-wrap items-center gap-4">
          <button
            className={solid}
            disabled={pending}
            onClick={() => {
              start(async () => {
                const failed = await attempt(async () => await leave({}));

                if (failed === null) {
                  await forgetSignIn();
                  window.location.assign("/");

                  return;
                }

                setError(failed);
              });
            }}
            type="button"
          >
            {pending ? "Deleting…" : "Delete my page for good"}
          </button>
          <button
            className="label text-muted hover:text-ink"
            onClick={() => {
              setSure(false);
            }}
            type="button"
          >
            Keep it
          </button>
        </div>
      ) : (
        <button
          className="label self-start text-muted hover:text-ink"
          onClick={() => {
            setSure(true);
          }}
          type="button"
        >
          Delete my page
        </button>
      )}
      <span className="label text-muted">
        {error ??
          (sure
            ? "Your list, your page and your sign-in go. Parts you sent stay sent, without your name."
            : "")}
      </span>
    </div>
  );
};

const You = ({ user }: { user: Doc<"users"> }) => {
  const save = useMutation(api.users.save);

  const [you, setYou, status] = useAutosave(
    { name: user.name, note: user.note },
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
      <Linked user={user} />
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
          className="rounded-chip label h-14 border-2 border-dashed border-rule text-muted transition-colors hover:border-ink hover:text-ink"
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
            <span className="label pt-3 text-muted md:w-36 md:shrink-0">
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
                      <span className="label flex aspect-[220/56] w-full items-center justify-center border-2 border-dashed border-ink">
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
                    className="rounded-chip size-9 border-2 border-rule font-bold hover:border-ink"
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
                    className="rounded-chip size-9 border-2 border-rule font-bold hover:border-ink"
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
                className="label self-start text-muted hover:text-ink"
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
    <div className="flex flex-col gap-10">
      <You user={user} />
      <Leave />
    </div>
    <RigEditor user={user} />
  </section>
);
