"use client";

import { useState, useTransition } from "react";

import { faceOf, Fitted, Part } from "@/app/ui/hardware";
import { Led } from "@/app/ui/lights";
import { outline, solid } from "@/app/ui/parts";
import { attempt } from "@/app/ui/say";
import {
  capacity,
  conditions,
  kindLabels,
  kinds,
  ramForms,
  ramSpeeds,
  size,
  sizes,
  ssdForms,
  title,
} from "@/lib/kinds";
import type { Ask, Condition, HddAsk, Kind, RamAsk, SsdAsk } from "@/lib/kinds";

export const fresh = (kind: Kind, keep?: Ask): Ask => {
  const base = {
    condition: keep?.condition ?? "used",
    count: keep?.count ?? 1,
    note: keep?.note ?? "",
  } as const;

  if (kind === "ram") {
    return { ...base, form: "desktop", gb: 32, gen: "DDR4", kind };
  }

  if (kind === "ssd") {
    return { ...base, form: "nvme", gb: 2000, kind };
  }

  if (kind === "hdd") {
    return { ...base, form: "3.5", gb: 8000, kind };
  }

  return { ...base, kind, title: "" };
};

const pill =
  "press flex h-10 items-center border-2 px-3.5 text-[15px] whitespace-nowrap";

const Choice = <T extends string | number | undefined>({
  onPick,
  options,
  value,
}: {
  onPick: (value: T) => void;
  options: readonly (readonly [T, string])[];
  value: T;
}) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map(([option, label]) => (
      <button
        aria-pressed={option === value}
        className={`${pill} ${option === value ? "border-ink bg-ink font-semibold text-paper" : "border-rule font-medium hover:border-ink"}`}
        key={label}
        onClick={() => {
          onPick(option);
        }}
        type="button"
      >
        {label}
      </button>
    ))}
  </div>
);

const Row = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) => (
  <div className="flex flex-col gap-2.5">
    <span className="text-[15px] font-medium text-muted">{label}</span>
    {children}
  </div>
);

const capacityOptions = (list: number[]) =>
  list.map((gb) => [gb, size(gb)] as const);

const RamFields = ({
  ask,
  set,
}: {
  ask: RamAsk;
  set: (ask: RamAsk) => void;
}) => (
  <>
    <Row label="Stick size">
      <Choice
        onPick={(gb) => {
          set({ ...ask, gb });
        }}
        options={capacityOptions(sizes.ram)}
        value={ask.gb}
      />
    </Row>
    <Row label="Type">
      <Choice
        onPick={(gen) => {
          set({ ...ask, gen, speed: undefined });
        }}
        options={[
          ["DDR3", "DDR3"],
          ["DDR4", "DDR4"],
          ["DDR5", "DDR5"],
        ]}
        value={ask.gen}
      />
    </Row>
    <Row label="Form">
      <Choice
        onPick={(form) => {
          set({ ...ask, form });
        }}
        options={[
          ["desktop", ramForms.desktop.label],
          ["laptop", ramForms.laptop.label],
          ["server", ramForms.server.label],
        ]}
        value={ask.form}
      />
    </Row>
    <Row label="Speed">
      <Choice
        onPick={(speed) => {
          set({ ...ask, speed });
        }}
        options={[
          [undefined, "Any"],
          ...ramSpeeds[ask.gen].map((speed) => [speed, String(speed)] as const),
        ]}
        value={ask.speed}
      />
    </Row>
  </>
);

const SsdFields = ({
  ask,
  set,
}: {
  ask: SsdAsk;
  set: (ask: SsdAsk) => void;
}) => (
  <>
    <Row label="Capacity">
      <Choice
        onPick={(gb) => {
          set({ ...ask, gb });
        }}
        options={capacityOptions(sizes.ssd)}
        value={ask.gb}
      />
    </Row>
    <Row label="Form">
      <Choice
        onPick={(form) => {
          set({ ...ask, form });
        }}
        options={[
          ["nvme", ssdForms.nvme.label],
          ["sata", ssdForms.sata.label],
          ["u2", ssdForms.u2.label],
        ]}
        value={ask.form}
      />
    </Row>
  </>
);

const HddFields = ({
  ask,
  set,
}: {
  ask: HddAsk;
  set: (ask: HddAsk) => void;
}) => (
  <>
    <Row label="Capacity">
      <Choice
        onPick={(gb) => {
          set({ ...ask, gb });
        }}
        options={capacityOptions(sizes.hdd)}
        value={ask.gb}
      />
    </Row>
    <Row label="Form">
      <Choice
        onPick={(form) => {
          set({ ...ask, form });
        }}
        options={[
          ["3.5", "3.5″"],
          ["2.5", "2.5″"],
        ]}
        value={ask.form}
      />
    </Row>
  </>
);

export const field =
  "w-full border-2 border-ink bg-paper px-3.5 py-2.5 text-base outline-none placeholder:text-muted focus:border-gold";

const SpecFields = ({ ask, set }: { ask: Ask; set: (ask: Ask) => void }) => {
  if (ask.kind === "ram") {
    return <RamFields ask={ask} set={set} />;
  }

  if (ask.kind === "ssd") {
    return <SsdFields ask={ask} set={set} />;
  }

  if (ask.kind === "hdd") {
    return <HddFields ask={ask} set={set} />;
  }

  return (
    <Row label="What">
      <input
        aria-label="What you need"
        className={`${field} h-12`}
        maxLength={60}
        onChange={(event) => {
          set({ ...ask, title: event.target.value });
        }}
        placeholder="A 10GbE NIC"
        value={ask.title}
      />
    </Row>
  );
};

const Kinds = ({ ask, onPick }: { ask: Ask; onPick: (kind: Kind) => void }) => (
  <div className="grid grid-cols-4 gap-1.5">
    {kinds.map((kind) => (
      <button
        aria-pressed={kind === ask.kind}
        className={`flex aspect-square press flex-col items-center justify-center gap-2.5 border-2 bg-paper p-2 text-[15px] font-semibold ${kind === ask.kind ? "border-[3px] border-ink" : "border-rule hover:border-ink"}`}
        key={kind}
        onClick={() => {
          onPick(kind);
        }}
        type="button"
      >
        {kind === "other" ? (
          <span className="text-2xl leading-none font-extrabold">?</span>
        ) : (
          <Part
            className={kind === "hdd" ? "h-7" : "w-[80%]"}
            kind={faceOf(fresh(kind))}
          />
        )}
        {kindLabels[kind]}
      </button>
    ))}
  </div>
);

const Preview = ({ ask }: { ask: Ask }) => {
  const total = capacity(ask);
  const named = title(ask);

  return (
    <div className="relative flex flex-col gap-3.5 bg-board px-6 pt-11 pb-6 text-silk">
      <span className="absolute top-4.5 left-6 flex items-center gap-2">
        <Led className="size-2.5" light="open" />
        <span className="silk text-silksub">
          Preview&nbsp;&nbsp;&nbsp;needed
        </span>
      </span>
      <Fitted ask={ask} className="w-full max-w-[300px]" light="filled" />
      <span className="text-[22px] leading-tight font-bold tracking-[-0.01em] text-balance">
        {named.trim() === "" || named.endsWith(" ") ? "…" : named}
      </span>
      <span className="text-[15px] text-silksub">
        {total === 0 ? "" : `${size(total)} total. `}
        {conditions[ask.condition].spec}.
      </span>
    </div>
  );
};

export const Picker = ({
  heading,
  initial,
  onCancel,
  onDelete,
  onSave,
  saveLabel,
}: {
  heading?: string;
  initial: Ask;
  onCancel?: () => void;
  onDelete?: () => void;
  onSave: (ask: Ask) => Promise<void>;
  saveLabel: string;
}) => {
  const [ask, setAsk] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, start] = useTransition();

  const save = () => {
    start(async () => {
      setError(
        await attempt(async () => {
          await onSave(ask);
        })
      );
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {heading !== undefined && (
        <h3 className="text-2xl font-bold tracking-[-0.02em]">{heading}</h3>
      )}
      <Row label="Kind">
        <Kinds
          ask={ask}
          onPick={(kind) => {
            setAsk(kind === ask.kind ? ask : fresh(kind, ask));
          }}
        />
      </Row>
      <SpecFields ask={ask} set={setAsk} />
      <Row label="How many">
        <div className="inline-flex h-12 items-stretch self-start border-2 border-ink">
          <button
            aria-label="One fewer"
            className="w-12 press text-lg font-bold hover:bg-ink hover:text-paper"
            onClick={() => {
              setAsk({ ...ask, count: Math.max(1, ask.count - 1) });
            }}
            type="button"
          >
            −
          </button>
          <span className="flex w-12 items-center justify-center text-lg font-bold">
            {ask.count}
          </span>
          <button
            aria-label="One more"
            className="w-12 press text-lg font-bold hover:bg-ink hover:text-paper"
            onClick={() => {
              setAsk({ ...ask, count: Math.min(16, ask.count + 1) });
            }}
            type="button"
          >
            +
          </button>
        </div>
      </Row>
      <Row label="Condition">
        <Choice
          onPick={(condition: Condition) => {
            setAsk({ ...ask, condition });
          }}
          options={[
            ["new", conditions.new.picker],
            ["used", conditions.used.picker],
            ["recert", conditions.recert.picker],
          ]}
          value={ask.condition}
        />
      </Row>
      <Row label="Why">
        <textarea
          aria-label="Why you need it"
          className={`${field} min-h-24 resize-y`}
          maxLength={280}
          onChange={(event) => {
            setAsk({ ...ask, note: event.target.value });
          }}
          placeholder="What it fixes. Sponsors like a reason."
          value={ask.note}
        />
      </Row>
      <Preview ask={ask} />
      {error !== null && <p className="text-[15px] font-semibold">{error}</p>}
      <div className="flex flex-col gap-2.5">
        <button className={solid} disabled={busy} onClick={save} type="button">
          {busy ? "Saving…" : saveLabel}
        </button>
        {onCancel !== undefined && (
          <button className={outline} onClick={onCancel} type="button">
            Cancel
          </button>
        )}
      </div>
      {onDelete !== undefined && (
        <button
          className="press self-start text-[15px] font-medium text-muted link hover:text-ink"
          onClick={onDelete}
          type="button"
        >
          Delete this ask
        </button>
      )}
    </div>
  );
};
