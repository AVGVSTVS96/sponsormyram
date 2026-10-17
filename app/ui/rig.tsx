import type { Doc } from "@/convex/_generated/dataModel";
import type { Item } from "@/convex/people";
import { size, title } from "@/lib/kinds";

import { Fit } from "./fit";
import { DimmTop, Fitted, lightOf } from "./hardware";
import type { Light } from "./hardware";
import { Holes, Led, Lights, Readout, readout } from "./lights";
import type { Debug } from "./lights";

type Rig = NonNullable<Doc<"users">["rig"]>;

export const slotName = (index: number) =>
  `${String.fromCodePoint(65 + Math.floor(index / 2))}${(index % 2) + 1}`;

export const installed = (rig: Rig) =>
  rig.slots.reduce((sum, gb) => sum + gb, 0);

export const emptyLight = (items: Item[]): Light | "off" => {
  const waiting = items.find(
    (item) => item.kind === "ram" && item.sponsor === undefined
  );

  return waiting === undefined ? "off" : lightOf(waiting);
};

export const Slot = ({
  empty,
  gb,
  height,
  index,
}: {
  empty: Light | "off";
  gb: number;
  height: string;
  index: number;
}) => (
  <div className="flex flex-col items-center gap-2.5">
    <Led light={gb === 0 ? empty : "filled"} />
    <DimmTop className={height} filled={gb > 0} />
    <span className="flex flex-col items-center gap-0.5 pt-1">
      <span className="silk text-silksub">DIMM_{slotName(index)}</span>
      <span className={`text-sm ${gb === 0 ? "font-[650]" : "font-medium"}`}>
        {gb === 0 ? "Empty" : `${gb}GB`}
      </span>
    </span>
  </div>
);

export const Bank = ({
  empty,
  height,
  slots,
}: {
  empty: Light | "off";
  height: string;
  slots: number[];
}) => (
  <div className="flex flex-wrap gap-x-5 gap-y-6 md:gap-x-7.5">
    {slots.map((gb, index) => (
      <Slot
        empty={empty}
        gb={gb}
        height={height}
        index={index}
        key={slotName(index)}
      />
    ))}
  </div>
);

const per = (rig: Rig) => Math.max(rig.maxGB / 16, 1);

const Meter = ({ rig }: { rig: Rig }) => {
  const has = installed(rig);
  const step = per(rig);
  const lit = Math.min(16, Math.round(has / step));
  const { figure, unit } = readout(size(has));

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-end gap-4">
        <Readout
          className="h-11 md:h-14"
          frame="p-3"
          text={figure}
          tone="green"
        />
        <span className="flex flex-col gap-1 pb-1">
          <span className="silk text-xs text-silk">
            {unit === "GB" ? "" : `${unit} `}OF {size(rig.maxGB)}
          </span>
          <span className="silk text-silksub">INSTALLED</span>
        </span>
      </div>
      <div className="flex gap-1.25 md:gap-1.5">
        <span className="sr-only">{`${lit} of 16 lights on`}</span>
        {Array.from({ length: 16 }, (_, index) => (
          <Led
            className="size-3 md:size-3.5"
            key={index}
            light={index < lit ? "filled" : "off"}
          />
        ))}
      </div>
      <p className="max-w-[330px] text-[15px] text-silksub">
        One light per {size(Math.round(step * 10) / 10)}. The board takes{" "}
        {size(rig.maxGB)} and has&nbsp;{size(has)}.
      </p>
    </div>
  );
};

const portOf = (item: Item) => {
  if (item.kind === "ssd") {
    return item.form === "nvme" ? "M.2" : "SATA6G";
  }

  return item.kind === "hdd" ? "SATA6G" : "PCIEX16";
};

const captions = {
  filled: { tone: "font-semibold", word: "in" },
  open: { tone: "text-silksub", word: "needed" },
  sending: { tone: "font-semibold text-gold", word: "on its way" },
} satisfies Record<Light, { tone: string; word: string }>;

const Others = ({ items }: { items: Item[] }) => (
  <div className="flex flex-col gap-6">
    {items.slice(0, 4).map((item, index, shown) => {
      const light = lightOf(item);
      const port = portOf(item);

      const nth = shown
        .slice(0, index + 1)
        .filter((each) => portOf(each) === port).length;

      return (
        <div className="flex flex-col gap-2" key={item._id}>
          <span className="flex items-center gap-2">
            <Led className="size-2.5" light={light} />
            <span className="silk text-silksub">
              {port}_{nth}
            </span>
          </span>
          <Fitted
            ask={item}
            className={
              item.kind === "ssd" && item.form === "nvme"
                ? "w-[210px]"
                : "w-[150px]"
            }
            light={light}
          />
          <span className={`text-[15px] ${captions[light].tone}`}>
            {title(item)} {captions[light].word}
          </span>
        </div>
      );
    })}
  </div>
);

export const RigBoard = ({
  debug,
  items,
  rig,
}: {
  debug: { lit: Debug; tone: "green" | "red" };
  items: Item[];
  rig: Rig;
}) => {
  const others = items.filter((item) => item.kind !== "ram");

  return (
    <section className="relative flex flex-col gap-8 bg-board px-5 pt-10 pb-11 text-silk md:gap-12 md:px-16 md:pt-20 md:pb-22">
      <Holes />
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <Fit
          cap={56}
          flow
          lead={1}
          lines={["The rig,", "slot by slot"]}
          track={-0.045}
        />
        <div className="flex items-center justify-between gap-6 md:flex-col md:items-end md:gap-4">
          {rig.board !== "" && (
            <span className="max-w-[60%] silk whitespace-normal text-silksub md:max-w-none md:text-right">
              {rig.board}
            </span>
          )}
          <Lights
            {...debug}
            className="gap-3 md:gap-5"
            led="size-2.5 md:size-3.5"
          />
        </div>
      </div>
      <div className="flex flex-col gap-11 lg:flex-row lg:items-start lg:gap-18">
        <Bank
          empty={emptyLight(items)}
          height="h-57.5 md:h-75"
          slots={rig.slots}
        />
        <div className="flex flex-col gap-11 xl:flex-row xl:gap-18">
          <Meter rig={rig} />
          {others.length > 0 && <Others items={others} />}
        </div>
      </div>
    </section>
  );
};
