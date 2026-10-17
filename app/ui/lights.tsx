import { graphemes } from "./fit";
import type { Light } from "./hardware";

const tones = {
  filled: "bg-led",
  off: "bg-ledoff",
  open: "bg-red",
  sending: "bg-gold",
} satisfies Record<Light | "off", string>;

export const Led = ({
  className = "size-3",
  light,
}: {
  className?: string;
  light: Light | "off";
}) => (
  <span
    aria-hidden
    className={`inline-block shrink-0 rounded-full ${tones[light]} ${className}`}
  />
);

export const lightWords = {
  filled: "In",
  open: "Needed",
  sending: "On its way",
} satisfies Record<Light, string>;

const debug = ["CPU", "DRAM", "VGA", "BOOT"] as const;

const fills = {
  green: { bg: "bg-led", fill: "fill-led" },
  red: { bg: "bg-red", fill: "fill-red" },
};

export type Debug = (typeof debug)[number];

export const Lights = ({
  className = "gap-5",
  led = "size-3.5",
  lit,
  power = false,
  tone = "red",
}: {
  className?: string;
  led?: string;
  lit: Debug | null;
  power?: boolean;
  tone?: "green" | "red";
}) => (
  <div className={`flex ${className}`}>
    <span className="sr-only">
      {lit === null ? "Debug lights off" : `${lit} light on`}
    </span>
    {debug.map((name, index) => (
      <span aria-hidden className="flex flex-col items-center gap-2" key={name}>
        <span
          className={`rounded-full ${led} ${name === lit ? fills[tone].bg : "bg-ledoff"}`}
          data-lit={power && name === lit ? "" : undefined}
          data-post={power ? index : undefined}
        />
        <span
          className={`silk text-[10px] ${name === lit ? "text-silk" : "text-silksub"}`}
        >
          {name}
        </span>
      </span>
    ))}
  </div>
);

const W = 30;
const H = 56;
const T = 5.6;
const G = 1.1;
const SKEW = 0.14;

type Point = readonly [number, number];

const across = (y: number): Point[] => [
  [T / 2 + G, y + T / 2],
  [T + G, y],
  [W - T - G, y],
  [W - T / 2 - G, y + T / 2],
  [W - T - G, y + T],
  [T + G, y + T],
];

const down = (x: number, top: number, bottom: number): Point[] => [
  [x + T / 2, top],
  [x + T, top + T / 2],
  [x + T, bottom - T / 2],
  [x + T / 2, bottom],
  [x, bottom - T / 2],
  [x, top + T / 2],
];

const upper = [T / 2 + G, H / 2 - G] as const;
const lower = [H / 2 + G, H - T / 2 - G] as const;

const segments = {
  a: across(0),
  b: down(W - T, ...upper),
  c: down(W - T, ...lower),
  d: across(H - T),
  e: down(0, ...lower),
  f: down(0, ...upper),
  g: across(H / 2 - T / 2),
};

type Segment = keyof typeof segments;

const order = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
] as const satisfies readonly Segment[];

const points = (list: Point[], left: number) =>
  list
    .map(
      ([x, y]) =>
        `${(left + x - y * SKEW + H * SKEW).toFixed(2)},${y.toFixed(2)}`
    )
    .join(" ");

const glyph = new Map<string, string>([
  ["0", "abcdef"],
  ["1", "bc"],
  ["2", "abged"],
  ["3", "abgcd"],
  ["4", "fgbc"],
  ["5", "afgcd"],
  ["6", "afgedc"],
  ["7", "abc"],
  ["8", "abcdefg"],
  ["9", "abcfgd"],
  ["-", "g"],
]);

const cellsOf = (text: string) =>
  graphemes(text).flatMap((char, index, all) =>
    char === "." ? [] : [{ char, dot: all[index + 1] === "." }]
  );

export const display = (text: string) => {
  const cells = cellsOf(text);

  return {
    segs: cells.flatMap(({ char, dot }, index) => {
      const left = index * (W + 9);
      const lit = glyph.get(char) ?? "";

      const parts = order.map((name) => ({
        key: `${index}${name}`,
        on: lit.includes(name),
        points: points(segments[name], left),
      }));

      return dot
        ? [
            ...parts,
            {
              key: `${index}dot`,
              on: true,
              points: points(
                [
                  [W + 1.6, H - T],
                  [W + 1.6 + T, H - T],
                  [W + 1.6 + T, H],
                  [W + 1.6, H],
                ],
                left
              ),
            },
          ]
        : parts;
    }),
    width: cells.length * (W + 9) - 9 + H * SKEW,
  };
};

export const Readout = ({
  className = "h-16",
  frame = "px-4 py-3",
  text,
  tone = "red",
}: {
  className?: string;
  frame?: string;
  text: string;
  tone?: "green" | "red";
}) => {
  const { segs, width } = display(text);

  return (
    <span className={`inline-flex shrink-0 self-start bg-glass ${frame}`}>
      <span className="sr-only">{text}</span>
      <svg
        aria-hidden
        className={`w-auto ${className}`}
        viewBox={`0 0 ${width.toFixed(1)} ${H}`}
      >
        {segs.map((seg) => (
          <polygon
            className={seg.on ? fills[tone].fill : "fill-seg"}
            key={seg.key}
            points={seg.points}
          />
        ))}
      </svg>
    </span>
  );
};

export const readout = (amount: string) => {
  const { figure = amount, unit = "" } =
    /^(?<figure>[\d.]+)(?<unit>\D*)$/u.exec(amount)?.groups ?? {};

  return { figure: figure.length === 1 ? `0${figure}` : figure, unit };
};

export const Holes = () => (
  <>
    {[
      "top-5 left-5",
      "top-5 right-5",
      "bottom-5 left-5",
      "bottom-5 right-5",
    ].map((place) => (
      <span
        aria-hidden
        className={`absolute hidden size-[18px] rounded-full border-4 border-latch bg-paper md:block ${place}`}
        key={place}
      />
    ))}
  </>
);
