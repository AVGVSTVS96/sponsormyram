import type { Item } from "@/convex/people";
import { size } from "@/lib/kinds";
import type { Ask } from "@/lib/kinds";

const fills = {
  arm: "fill-arm",
  chip: "fill-chip",
  coal: "fill-coal",
  drive: "fill-drive",
  esd: "fill-esd",
  film: "fill-film",
  gold: "fill-gold",
  latch: "fill-latch",
  pcb: "fill-pcb",
  platter: "fill-platter",
  screw: "fill-screw",
  seal: "fill-seal",
  slot: "fill-slot",
  smd: "fill-smd",
  sticker: "fill-sticker",
};

export type Role = keyof typeof fills;

const strokes = {
  arm: "stroke-arm",
  coal: "stroke-coal",
  drive: "stroke-drive",
} satisfies Partial<Record<Role, string>>;

type Line = keyof typeof strokes;

export interface Paint {
  fill: (role: Role) => { className: string } | { fill: string };
  line: (role: Line) => { className: string } | { stroke: string };
}

const web: Paint = {
  fill: (role) => ({ className: fills[role] }),
  line: (role) => ({ className: strokes[role] }),
};

export const hex = (colors: Record<Role, string>): Paint => ({
  fill: (role) => ({ fill: colors[role] }),
  line: (role) => ({ stroke: colors[role] }),
});

type Box = readonly [number, number, number, number];

const boxes = (list: Box[]) =>
  list.map(([x, y, w, h]) => `M${x} ${y}h${w}v${h}h${-w}z`).join("");

const round = (value: number) => Math.round(value * 100) / 100;

const span = (count: number) => Array.from({ length: count }, (_, i) => i);

const notch = 144.18;

const dimm = {
  body: `M0 0H267V22h-5a5 5 0 0 0 0 10h5V51H${notch + 3}V46H${notch - 3}V51H0V32h5a5 5 0 0 0 0-10H0Z`,
  chips: boxes(span(8).map((i) => [round(13 + i * 31.14), 8, 23, 25])),
  fingers: boxes(
    span(60).flatMap((i) => {
      const x = 5 + (i * 257) / 60;
      const t = (x - 133.5) / 133.5;

      return Math.abs(x + 1.33 - notch) < 4.5
        ? []
        : [[round(x), 52, 2.57, round(11.5 - 1.6 * t * t)]];
    })
  ),
  smd: boxes(
    span(40).flatMap((i) => {
      const x = 14 + i * 6.2;

      return i % 5 === 4 || Math.abs(x - notch + 1) < 7
        ? []
        : [[round(x), 38, 3.2, 2] as const];
    })
  ),
};

const bars = (x: number, y: number, count: number, step: number, h: number) =>
  boxes(span(count).map((i) => [round(x + i * step), y, i % 3 ? 1.1 : 1.9, h]));

const sticker = (
  paint: Paint,
  [x, y, w, h]: Box,
  type: number,
  label: string
) => (
  <>
    <rect {...paint.fill("sticker")} height={h} width={w} x={x} y={y} />
    {label !== "" && (
      <text
        className="fill-coal font-sans font-bold"
        fontSize={type}
        x={x + type * 0.75}
        y={y + type * 1.3}
      >
        {label}
      </text>
    )}
    <path
      {...paint.fill("coal")}
      d={bars(
        x + type * 0.75,
        y + (label === "" ? type * 0.75 : type * 1.85),
        Math.floor((w - type * 1.5) / 2.6),
        2.6,
        label === "" ? h - type * 1.5 : h - type * 2.6
      )}
    />
  </>
);

export type Face = "hdd" | "pcie" | "ram" | "sata" | "ssd";

const dimmFace = (paint: Paint, label?: string) => (
  <>
    <path {...paint.fill("pcb")} d={dimm.body} />
    <path {...paint.fill("chip")} d={dimm.chips} />
    <path {...paint.fill("smd")} d={dimm.smd} />
    <rect {...paint.fill("chip")} height="7" width="12" x={notch + 14} y="41" />
    <path {...paint.fill("gold")} d={dimm.fingers} />
    {label !== undefined && sticker(paint, [165, 10, 86, 22], 6.6, label)}
  </>
);

const m2Face = (paint: Paint, label?: string) => (
  <>
    <path {...paint.fill("pcb")} d="M14 0H240V25a8 8 0 0 0 0 16V66H14Z" />
    <path
      {...paint.fill("gold")}
      d={boxes(
        span(18).flatMap((i) =>
          i === 13 || i === 14
            ? []
            : [[0, round(3 + i * 3.4), 14, 2.2] as const]
        )
      )}
    />
    <path
      {...paint.fill("chip")}
      d={boxes([
        [28, 20, 26, 26],
        [66, 9, 22, 16],
        [100, 9, 58, 48],
        [166, 9, 58, 48],
      ])}
    />
    {label !== undefined && sticker(paint, [98, 16, 128, 34], 10, label)}
  </>
);

const screws = [
  [8, 8],
  [138, 8],
  [8, 92],
  [138, 92],
  [73, 8],
  [73, 92],
] as const;

const hddFace = (paint: Paint) => (
  <>
    <rect {...paint.fill("drive")} height="100" width="146" />
    {screws.map(([cx, cy]) => (
      <circle
        {...paint.fill("screw")}
        cx={cx}
        cy={cy}
        key={`${cx}-${cy}`}
        r="3"
      />
    ))}
    <circle {...paint.fill("platter")} cx="56" cy="50" r="38" />
    <circle
      {...paint.line("drive")}
      cx="56"
      cy="50"
      fill="none"
      opacity=".16"
      r="27"
      strokeWidth="1.2"
    />
    <circle
      {...paint.line("drive")}
      cx="56"
      cy="50"
      fill="none"
      opacity=".12"
      r="16"
    />
    <circle {...paint.fill("drive")} cx="56" cy="50" r="9" />
    <circle {...paint.fill("platter")} cx="56" cy="50" r="3" />
    <rect {...paint.fill("screw")} height="30" width="22" x="112" y="58" />
    <path {...paint.line("arm")} d="M122 74 70 34" strokeWidth="6" />
    <circle {...paint.fill("arm")} cx="122" cy="74" r="8" />
    <rect
      {...paint.fill("arm")}
      height="9"
      transform="rotate(-38 68 33)"
      width="9"
      x="64"
      y="29"
    />
  </>
);

const sataFace = (paint: Paint, label?: string) => (
  <>
    <rect {...paint.fill("drive")} height="70" width="100" />
    {label !== undefined && sticker(paint, [10, 12, 62, 40], 9, label)}
    <rect {...paint.fill("gold")} height="50" width="6" x="88" y="10" />
    <circle {...paint.fill("screw")} cx="6" cy="6" r="2" />
    <circle {...paint.fill("screw")} cx="6" cy="64" r="2" />
  </>
);

const pcieFace = (paint: Paint) => (
  <>
    <rect {...paint.fill("pcb")} height="60" width="172" />
    <path
      {...paint.fill("gold")}
      d={boxes(span(22).map((i) => [42 + i * 4, 60, 2.6, 9]))}
    />
    <path
      {...paint.fill("chip")}
      d={boxes([
        [70, 14, 34, 32],
        [16, 14, 22, 14],
        [120, 18, 36, 8],
        [120, 32, 36, 8],
      ])}
    />
  </>
);

const faces = {
  hdd: (paint: Paint) => hddFace(paint),
  pcie: (paint: Paint) => pcieFace(paint),
  ram: dimmFace,
  sata: sataFace,
  ssd: m2Face,
} satisfies Record<Face, (paint: Paint, label?: string) => React.JSX.Element>;

const holes = (spots: readonly (readonly [number, number])[], r: number) =>
  spots.map(([cx, cy]) => (
    <circle
      cx={cx}
      cy={cy}
      fill="none"
      key={`${cx}-${cy}`}
      r={r}
      strokeDasharray="none"
    />
  ));

const prints = {
  hdd: {
    d: "M0 0H146V100H0Z",
    extra: (
      <>
        {holes(
          [
            [10, 10],
            [136, 10],
            [10, 90],
            [136, 90],
          ],
          4
        )}
        <rect
          fill="currentColor"
          height="5"
          stroke="none"
          width="58"
          x="44"
          y="92"
        />
      </>
    ),
    h: 100,
    w: 146,
  },
  pcie: { d: "M0 0H172V60H132V70H40V60H0Z", extra: null, h: 70, w: 172 },
  ram: {
    d: `M0 0H267V22h-5a5 5 0 0 0 0 10h5V62H${notch + 3}V46H${notch - 3}V62H0V32h5a5 5 0 0 0 0-10H0Z`,
    extra: (
      <path
        d={`M6 51H${notch - 6}M${notch + 6} 51H261`}
        strokeDasharray="2 3"
      />
    ),
    h: 63,
    w: 267,
  },
  sata: {
    d: "M0 0H100V70H0Z",
    extra: (
      <>
        {holes(
          [
            [9, 9],
            [91, 9],
            [9, 61],
            [91, 61],
          ],
          3
        )}
        <rect
          fill="currentColor"
          height="4"
          stroke="none"
          width="40"
          x="30"
          y="63"
        />
      </>
    ),
    h: 70,
    w: 100,
  },
  ssd: {
    d: "M0 0H240V25a8 8 0 0 0 0 16V66H0V46H6V40H0Z",
    extra: <circle cx="240" cy="33" fill="currentColor" r="3" stroke="none" />,
    h: 66,
    w: 240,
  },
} satisfies Record<
  Face,
  { d: string; extra: React.JSX.Element | null; h: number; w: number }
>;

const footprint = (kind: Face) => (
  <g
    fill="none"
    stroke="currentColor"
    strokeDasharray="6 4"
    strokeWidth="2"
    vectorEffect="non-scaling-stroke"
  >
    <path d={prints[kind].d} vectorEffect="non-scaling-stroke" />
    {prints[kind].extra}
  </g>
);

const latches = (paint: Paint, open: boolean, y: number) =>
  open ? (
    <g {...paint.fill("latch")}>
      <rect
        height="20"
        transform={`rotate(-28 10 ${y + 22})`}
        width="12"
        x="-2"
        y={y + 2}
      />
      <rect
        height="20"
        transform={`rotate(28 257 ${y + 22})`}
        width="12"
        x="257"
        y={y + 2}
      />
    </g>
  ) : (
    <g {...paint.fill("latch")}>
      <rect height="22" width="12" x="0" y={y} />
      <rect height="22" width="12" x="255" y={y} />
    </g>
  );

type Svg = React.SVGProps<SVGSVGElement>;

interface Draw {
  label?: string;
  paint?: Paint;
  seat?: boolean;
  state: "empty" | "hover" | "in";
  svg?: Svg;
}

export const seated = ({
  label,
  paint = web,
  seat = false,
  state,
  svg,
}: Draw) => {
  const lift = state === "hover" ? 34 : 0;
  const slot = 54.64 + lift;

  return (
    <svg aria-hidden viewBox={`-12 -2 291 ${81 + lift}`} {...svg}>
      {state === "empty" ? (
        footprint("ram")
      ) : (
        <g
          className={
            seat
              ? "[transform-box:fill-box] motion-safe:animate-seat"
              : undefined
          }
        >
          {dimmFace(paint, label)}
        </g>
      )}
      <rect
        {...paint.fill("slot")}
        height="14"
        width="247"
        x="10"
        y={slot + 8}
      />
      {latches(paint, state !== "in", slot)}
    </svg>
  );
};

export const m2Slot = ({ label, paint = web, state, svg }: Draw) => (
  <svg aria-hidden viewBox="0 0 278 66" {...svg}>
    <rect {...paint.fill("slot")} height="52" width="16" y="7" />
    <g transform="translate(16 0)">
      {state === "empty" ? footprint("ssd") : m2Face(paint, label)}
    </g>
    <circle {...paint.fill("latch")} cx="265" cy="33" r="10" />
  </svg>
);

export const bay = ({
  drive,
  label,
  paint = web,
  state,
  svg,
}: Draw & { drive: "hdd" | "sata" }) => {
  const { h, w } = prints[drive];

  return (
    <svg aria-hidden viewBox={`0 0 ${w + 28} ${h + 8}`} {...svg}>
      <rect {...paint.fill("slot")} height={h + 8} width="6" />
      <rect {...paint.fill("slot")} height={h + 8} width="6" x={w + 22} />
      <g transform="translate(14 4)">
        {state === "empty" ? footprint(drive) : faces[drive](paint, label)}
      </g>
    </svg>
  );
};

const expansion = ({ paint = web, state, svg }: Draw) => (
  <svg aria-hidden viewBox="-12 -4 196 78" {...svg}>
    <rect {...paint.fill("latch")} height="78" width="7" x="-12" y="-4" />
    {state === "empty" ? footprint("pcie") : pcieFace(paint)}
  </svg>
);

const fits = {
  hdd: { h: 72, w: 105 },
  pcie: { h: 61, w: 150 },
  ram: { h: 39, w: 164 },
  sata: { h: 72, w: 103 },
  ssd: { h: 45, w: 164 },
} satisfies Record<Face, { h: number; w: number }>;

export const bag = ({
  kind,
  paint = web,
  svg,
}: {
  kind: Face;
  paint?: Paint;
  svg?: Svg;
}) => {
  const { h, w } = fits[kind];

  return (
    <svg aria-hidden viewBox="0 0 200 120" {...svg}>
      <rect {...paint.fill("film")} height="120" width="200" />
      <g
        opacity=".6"
        transform={`translate(${(200 - w) / 2} ${38 + (72 - h) / 2}) scale(${(w / prints[kind].w).toFixed(4)})`}
      >
        {faces[kind](paint)}
      </g>
      <rect {...paint.fill("seal")} height="6" width="200" y="12" />
      <rect {...paint.fill("esd")} height="20" width="20" x="12" y="24" />
      <path
        {...paint.line("coal")}
        d="M22 27 30 41H14Z"
        fill="none"
        strokeWidth="2"
      />
      <rect {...paint.fill("coal")} height="5" width="2" x="21" y="32" />
    </svg>
  );
};

export const part = ({
  kind,
  label,
  paint = web,
  svg,
}: {
  kind: Face;
  label?: string;
  paint?: Paint;
  svg?: Svg;
}) => (
  <svg aria-hidden viewBox={`0 0 ${prints[kind].w} ${prints[kind].h}`} {...svg}>
    {faces[kind](paint, label)}
  </svg>
);

export const Part = ({
  className,
  kind,
  label,
}: {
  className?: string;
  kind: Face;
  label?: string;
}) => part({ kind, label, svg: { className } });

export const Seated = ({
  className,
  label,
  seat = false,
  state,
}: {
  className?: string;
  label?: string;
  seat?: boolean;
  state: "empty" | "hover" | "in";
}) => seated({ label, seat, state, svg: { className } });

export const Bag = ({ className, kind }: { className?: string; kind: Face }) =>
  bag({ kind, svg: { className } });

export const DimmTop = ({
  className,
  filled,
}: {
  className?: string;
  filled: boolean;
}) => (
  <svg aria-hidden className={className} viewBox="0 0 75 299">
    <rect className="fill-latch" height="12" width="75" />
    <rect className="fill-slot" height="267" width="75" y="16" />
    <g
      className={filled ? undefined : "text-silk"}
      transform="translate(69 16) rotate(90)"
    >
      {filled ? dimmFace(web) : footprint("ram")}
    </g>
    <rect className="fill-latch" height="12" width="75" y="287" />
  </svg>
);

export const faceOf = (ask: Ask): Face => {
  if (ask.kind === "ram") {
    return "ram";
  }

  if (ask.kind === "ssd") {
    return ask.form === "nvme" ? "ssd" : "sata";
  }

  return ask.kind === "hdd" ? "hdd" : "pcie";
};

const forms = { nvme: "NVMe", sata: "SATA", u2: "U.2" };

export const stickerOf = (ask: Ask) => {
  if (ask.kind === "ssd") {
    return `${size(ask.gb)} ${forms[ask.form]}`;
  }

  return ask.kind === "ram" ? `${size(ask.gb)} ${ask.gen}` : undefined;
};

export type Light = "open" | "sending" | "filled";

export const lightOf = (item: Pick<Item, "sending" | "sponsor">): Light => {
  if (item.sponsor !== undefined) {
    return "filled";
  }

  return item.sending === undefined ? "open" : "sending";
};

export const fitted = ({
  face,
  label,
  light,
  paint = web,
  seat = false,
  svg,
}: {
  face: Face;
  label?: string;
  light: Light;
  paint?: Paint;
  seat?: boolean;
  svg?: Svg;
}) => {
  if (light === "sending") {
    return bag({ kind: face, paint, svg });
  }

  const state = light === "filled" ? "in" : "empty";

  if (face === "ram") {
    return seated({ label, paint, seat, state, svg });
  }

  if (face === "ssd") {
    return m2Slot({ label, paint, state, svg });
  }

  if (face === "pcie") {
    return expansion({ paint, state, svg });
  }

  return bay({ drive: face, label, paint, state, svg });
};

export const Fitted = ({
  ask,
  className,
  light,
  seat = false,
}: {
  ask: Ask;
  className?: string;
  light: Light;
  seat?: boolean;
}) =>
  fitted({
    face: faceOf(ask),
    label: stickerOf(ask),
    light,
    seat,
    svg: { className },
  });
