"use client";

import { useMutation } from "convex/react";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { forgetSignIn } from "@/app/ui/account";
import { Fit } from "@/app/ui/fit";
import { GitHub, X } from "@/app/ui/icons";
import { Holes } from "@/app/ui/lights";
import { onBoardGhost, outline, small, solid } from "@/app/ui/parts";
import { installed, Slot, slotName } from "@/app/ui/rig";
import { attempt } from "@/app/ui/say";
import { problem } from "@/app/ui/sheet";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { authClient } from "@/lib/auth-client";
import { stickSizes } from "@/lib/kinds";
import { origin } from "@/lib/origin";

import { useAutosave } from "./autosave";
import { Count } from "./count";
import { SignOut } from "./out";
import { field } from "./picker";

type Rig = NonNullable<Doc<"users">["rig"]>;

export const Status = ({ text }: { text: string }) => (
  <span
    aria-live="polite"
    className={`text-[15px] font-medium ${text.startsWith("✓") ? "text-pcb" : "text-muted"}`}
  >
    {text}
  </span>
);

export const Accounts = ({ user }: { user: Doc<"users"> }) => {
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
      icon: <X />,
      name: "X",
      path: user.x === undefined ? null : user.handle,
      provider: "twitter",
      shown: user.x === undefined ? null : `@${user.x.handle}`,
    },
    {
      icon: <GitHub />,
      name: "GitHub",
      path: user.gh === undefined ? null : `gh/${user.gh.handle.toLowerCase()}`,
      provider: "github",
      shown: user.gh?.handle ?? null,
    },
  ] as const;

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-4xl leading-none font-extrabold tracking-[-0.045em] md:text-[44px]">
        Signed in with
      </h2>
      <ul className="flex flex-col gap-1">
        {rows.map((row) => (
          <li
            className="flex min-h-20 items-center gap-4 bg-surf px-4 py-3.5 md:px-6"
            key={row.name}
          >
            <span className="flex w-5 justify-center">{row.icon}</span>
            {row.shown === null ? (
              <>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-lg font-[650]">Not linked</span>
                  <span className="text-[15px] text-muted">
                    Link it and both accounts open this page.
                  </span>
                </span>
                <button
                  className={`${outline} ${small}`}
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
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-lg font-[650]">{row.shown}</span>
                <span className="truncate text-[15px] text-muted">
                  {row.path === user.handle
                    ? `Your page: sponsormyram.com/${user.handle}`
                    : `sponsormyram.com/${row.path} forwards here`}
                </span>
              </span>
            )}
          </li>
        ))}
      </ul>
      <p className="text-[15px] text-muted">
        {error ??
          (user.x === undefined
            ? "Link X and your page moves to your X handle. This link keeps working."
            : "Your page follows your X handle. Rename on X and it moves the next time you sign in; old links keep working.")}
      </p>
      <SignOut />
    </section>
  );
};

const Leave = () => {
  const leave = useMutation(api.users.leave);
  const [sure, setSure] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const quiet =
    "press link self-start text-[15px] font-medium text-muted hover:text-ink";

  return (
    <div className="flex flex-col gap-3 border-t border-rule pt-6">
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
            className={quiet}
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
          className={quiet}
          onClick={() => {
            setSure(true);
          }}
          type="button"
        >
          Delete my page
        </button>
      )}
      {(sure || error !== null) && (
        <p className="text-[15px] text-muted">
          {error ??
            "Your list, your page and your sign-in go. Parts you sent stay sent, without your name."}
        </p>
      )}
    </div>
  );
};

const Line = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) => (
  <label className="flex flex-col gap-2.5">
    <span className="text-[15px] font-medium text-muted">{label}</span>
    {children}
  </label>
);

export const You = ({ user }: { user: Doc<"users"> }) => {
  const save = useMutation(api.users.save);

  const [you, setYou, status] = useAutosave(
    { name: user.name, note: user.note },
    async (value) => {
      await save(value);

      return null;
    }
  );

  return (
    <section className="flex flex-col gap-8 px-5 pb-20 md:px-16 md:pb-28 xl:flex-row xl:gap-16">
      <div className="flex flex-col gap-4 xl:w-[420px] xl:shrink-0">
        <Fit cap={64} lead={1} lines={["Your note"]} track={-0.045} />
        <p className="max-w-[520px] md:text-lg">
          It tops your page, under the big number. Say what’s going on with your
          rig; sponsors like a&nbsp;reason.
        </p>
        <Status text={status} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <Line label="Note">
          <textarea
            className={`${field} min-h-32 resize-y`}
            maxLength={400}
            onChange={(event) => {
              setYou({ ...you, note: event.target.value });
            }}
            placeholder="What's going on with your rig. This tops your page."
            value={you.note}
          />
        </Line>
        <Line label="Name">
          <input
            className={`${field} h-12`}
            maxLength={60}
            onChange={(event) => {
              setYou({ ...you, name: event.target.value });
            }}
            value={you.name}
          />
        </Line>
        <Leave />
      </div>
    </section>
  );
};

const cycle = (gb: number) =>
  stickSizes[(stickSizes.indexOf(gb) + 1) % stickSizes.length] ?? 0;

const blank: Rig = { board: "", maxGB: 64, slots: [0, 0, 0, 0] };

const dark =
  "w-full border-2 border-silk bg-transparent px-3.5 text-base text-silk outline-none placeholder:text-silksub focus:border-gold";

const square =
  "press flex size-11 items-center justify-center border-2 border-silksub text-lg font-bold hover:border-silk disabled:opacity-30";

export const RigEditor = ({ user }: { user: Doc<"users"> }) => {
  const save = useMutation(api.users.saveRig);

  const [rig, setRig, status] = useAutosave(user.rig, async (value) => {
    await save({ rig: value });

    return null;
  });

  const short = rig === undefined ? 0 : Math.max(0, rig.maxGB - installed(rig));

  return (
    <section className="relative flex flex-col gap-10 bg-board px-5 py-12 text-silk md:px-16 md:py-22 xl:flex-row xl:items-start xl:gap-16">
      <Holes />
      <div className="flex flex-col gap-4 xl:w-[340px] xl:shrink-0">
        <Fit cap={44} lead={1} lines={["Your rig"]} track={-0.04} />
        <p className="text-[17px]">
          Optional. It draws the board on your page and works out how short you
          are. Tap a slot to change its&nbsp;stick.
        </p>
        <Status text={status} />
      </div>
      {rig === undefined ? (
        <button
          className={`${onBoardGhost} self-start`}
          onClick={() => {
            setRig(blank);
          }}
          type="button"
        >
          Add your rig, slot by slot
        </button>
      ) : (
        <>
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-x-6.5 gap-y-6">
              {rig.slots.map((gb, index) => (
                <button
                  aria-label={`Slot ${slotName(index)}: ${gb === 0 ? "empty" : `${gb}GB`}. Tap to change.`}
                  className="press"
                  key={slotName(index)}
                  onClick={() => {
                    setRig({ ...rig, slots: rig.slots.with(index, cycle(gb)) });
                  }}
                  type="button"
                >
                  <Slot
                    empty={short > 0 ? "open" : "off"}
                    gb={gb}
                    height="h-45 md:h-55"
                    index={index}
                  />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Add a slot"
                className={square}
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
                className={square}
                disabled={rig.slots.length === 0}
                onClick={() => {
                  setRig({ ...rig, slots: rig.slots.slice(0, -1) });
                }}
                type="button"
              >
                −
              </button>
              <span className="pl-2 text-[15px] text-silksub">
                Empty → 4 → 8 → 16 → 32 → 48 → 64GB
              </span>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-[15px] font-medium text-silksub">
                Board
              </span>
              <input
                className={`${dark} h-12`}
                maxLength={80}
                onChange={(event) => {
                  setRig({ ...rig, board: event.target.value });
                }}
                placeholder="ASUS B550-F · Ryzen 7 5700G"
                value={rig.board}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[15px] font-medium text-silksub">
                Max RAM
              </span>
              <span className="flex h-12 w-40 items-center border-2 border-silk px-3.5 focus-within:border-gold">
                <input
                  className="w-full min-w-0 bg-transparent text-base text-silk outline-none"
                  inputMode="numeric"
                  onChange={(event) => {
                    setRig({
                      ...rig,
                      maxGB: Number(event.target.value.replaceAll(/\D/gu, "")),
                    });
                  }}
                  value={rig.maxGB}
                />
                <span className="text-silksub">GB</span>
              </span>
            </label>
            <div className="flex items-center gap-3.5">
              <Count
                className="h-7.5"
                frame="p-2"
                tone={short > 0 ? "red" : "green"}
                value={short}
              />
              <span className="text-base font-semibold">
                {short > 0
                  ? "GB short, so the DRAM light is on."
                  : "Maxed out. The DRAM light is off."}
              </span>
            </div>
            <button
              className="press self-start text-[15px] font-medium text-silksub link hover:text-silk"
              onClick={() => {
                setRig(undefined);
              }}
              type="button"
            >
              Take the rig off my page
            </button>
            <a
              className="press self-start text-[15px] font-medium link"
              href={`${origin("ram")}/${user.handle}`}
            >
              See it on your page
            </a>
          </div>
        </>
      )}
    </section>
  );
};
