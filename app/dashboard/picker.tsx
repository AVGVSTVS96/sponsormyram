"use client";

import { useState, useTransition } from "react";

import { brandOf } from "@/lib/brand";
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

import { glyphs } from "../ui/glyphs";
import { outline, solid } from "../ui/parts";
import { attempt } from "./say";

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
  "label h-9 rounded-chip border-2 px-3 normal-case tracking-normal transition-colors";

const Choice = <T extends string | number | undefined>({
  onPick,
  options,
  value,
}: {
  onPick: (value: T) => void;
  options: readonly (readonly [T, string])[];
  value: T;
}) => (
  <div className="flex flex-wrap gap-2">
    {options.map(([option, label]) => (
      <button
        aria-pressed={option === value}
        className={`${pill} ${option === value ? "border-ink bg-ink text-paper" : "border-rule hover:border-ink"}`}
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
  <div className="flex flex-col gap-2 md:flex-row md:items-start md:gap-0">
    <span className="pt-3 label text-muted md:w-36 md:shrink-0">{label}</span>
    <div className="min-w-0 flex-1">{children}</div>
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
  "w-full rounded-chip border-2 border-ink bg-paper px-3 py-2 outline-none placeholder:text-muted focus:border-pcb";

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
        className={`${field} h-11`}
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

const Preview = ({ ask }: { ask: Ask }) => {
  const Glyph = ask.kind === "other" ? null : glyphs[brandOf(ask.kind)];
  const total = capacity(ask);

  return (
    <div className="flex flex-col gap-4">
      <span className="label text-muted">Preview</span>
      {Glyph !== null && (
        <Glyph
          className={ask.kind === "hdd" ? "w-28" : "w-full max-w-[320px]"}
        />
      )}
      <span className="title">{title(ask) === "" ? "…" : title(ask)}</span>
      <span className="label text-muted">
        {total === 0 ? "" : `${size(total)} total · `}
        {conditions[ask.condition].chip}
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
  heading: string;
  initial: Ask;
  onCancel: () => void;
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
    <div className="grid grid-cols-1 gap-10 border-t-2 border-ink py-8 md:grid-cols-[1fr_320px] md:pl-16">
      <div className="flex flex-col gap-4">
        <span className="label">{heading}</span>
        <Row label="Kind">
          <Choice
            onPick={(kind) => {
              setAsk(kind === ask.kind ? ask : fresh(kind, ask));
            }}
            options={kinds.map((kind) => [kind, kindLabels[kind]] as const)}
            value={ask.kind}
          />
        </Row>
        <SpecFields ask={ask} set={setAsk} />
        <Row label="How many">
          <div className="inline-flex h-10 items-stretch rounded-chip border-2 border-ink">
            <button
              aria-label="One fewer"
              className="w-10 font-bold hover:bg-ink hover:text-paper"
              onClick={() => {
                setAsk({ ...ask, count: Math.max(1, ask.count - 1) });
              }}
              type="button"
            >
              −
            </button>
            <span className="flex w-12 items-center justify-center border-x-2 border-ink font-mono">
              {ask.count}
            </span>
            <button
              aria-label="One more"
              className="w-10 font-bold hover:bg-ink hover:text-paper"
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
            className={`${field} min-h-20 resize-y`}
            maxLength={280}
            onChange={(event) => {
              setAsk({ ...ask, note: event.target.value });
            }}
            placeholder="What it fixes. Sponsors like a reason."
            value={ask.note}
          />
        </Row>
      </div>
      <div className="flex flex-col justify-between gap-8 md:border-l md:border-rule md:pl-8">
        <Preview ask={ask} />
        <div className="flex flex-col gap-3">
          {error !== null && <span className="label">{error}</span>}
          <div className="flex flex-wrap gap-2">
            <button className={outline} onClick={onCancel} type="button">
              Cancel
            </button>
            <button
              className={solid}
              disabled={busy}
              onClick={save}
              type="button"
            >
              {saveLabel}
            </button>
          </div>
          {onDelete !== undefined && (
            <button
              className="self-start label text-muted hover:text-ink"
              onClick={onDelete}
              type="button"
            >
              Delete this ask
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
