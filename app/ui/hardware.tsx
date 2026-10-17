import type { Item } from "@/convex/people";
import { size } from "@/lib/kinds";
import type { Ask } from "@/lib/kinds";

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

const Sticker = ({
  bar,
  box: [x, y, w, h],
  text,
  type,
}: {
  bar: number;
  box: Box;
  text: string;
  type: number;
}) => (
  <>
    <rect className="fill-sticker" height={h} width={w} x={x} y={y} />
    <text
      className="fill-coal font-sans font-bold"
      fontSize={type}
      x={x + type * 0.75}
      y={y + type * 1.3}
    >
      {text}
    </text>
    <path
      className="fill-coal"
      d={bars(
        x + type * 0.75,
        y + type * 1.85,
        Math.floor((w - type * 1.5) / (bar * 2.3)),
        bar * 2.3,
        h - type * 2.6
      )}
    />
  </>
);

const DimmFace = ({ label }: { label?: string }) => (
  <>
    <path className="fill-pcb" d={dimm.body} />
    <path className="fill-chip" d={dimm.chips} />
    <path className="fill-smd" d={dimm.smd} />
    <rect className="fill-chip" height="7" width="12" x={notch + 14} y="41" />
    <path className="fill-gold" d={dimm.fingers} />
    {label !== undefined && (
      <Sticker bar={1.1} box={[165, 10, 86, 22]} text={label} type={6.6} />
    )}
  </>
);

const prints = {
  hdd: {
    d: "M0 0H146V100H0Z",
    extra: (
      <>
        {[
          [10, 10],
          [136, 10],
          [10, 90],
          [136, 90],
        ].map(([cx, cy]) => (
          <circle
            cx={cx}
            cy={cy}
            fill="none"
            key={`${cx}-${cy}`}
            r="4"
            strokeDasharray="none"
          />
        ))}
        <rect
          className="fill-current"
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
  pcie: {
    d: "M0 0H172V60H132V70H40V60H0Z",
    extra: null,
    h: 70,
    w: 172,
  },
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
        {[
          [9, 9],
          [91, 9],
          [9, 61],
          [91, 61],
        ].map(([cx, cy]) => (
          <circle
            cx={cx}
            cy={cy}
            fill="none"
            key={`${cx}-${cy}`}
            r="3"
            strokeDasharray="none"
          />
        ))}
        <rect
          className="fill-current"
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
    extra: (
      <circle className="fill-current" cx="240" cy="33" r="3" stroke="none" />
    ),
    h: 66,
    w: 240,
  },
};

type Print = keyof typeof prints;

const Footprint = ({ kind }: { kind: Print }) => {
  const { d, extra } = prints[kind];

  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeDasharray="6 4"
      strokeWidth="2"
      vectorEffect="non-scaling-stroke"
    >
      <path d={d} vectorEffect="non-scaling-stroke" />
      <g vectorEffect="non-scaling-stroke">{extra}</g>
    </g>
  );
};

const M2Face = ({ label }: { label?: string }) => (
  <>
    <path className="fill-pcb" d="M14 0H240V25a8 8 0 0 0 0 16V66H14Z" />
    <path
      className="fill-gold"
      d={boxes(
        span(18).flatMap((i) =>
          i === 13 || i === 14
            ? []
            : [[0, round(3 + i * 3.4), 14, 2.2] as const]
        )
      )}
    />
    <path
      className="fill-chip"
      d={boxes([
        [28, 20, 26, 26],
        [66, 9, 22, 16],
        [100, 9, 58, 48],
        [166, 9, 58, 48],
      ])}
    />
    {label !== undefined && (
      <Sticker bar={1.3} box={[98, 16, 128, 34]} text={label} type={10} />
    )}
  </>
);

const HddFace = () => (
  <>
    <rect className="fill-drive" height="100" width="146" />
    {[
      [8, 8],
      [138, 8],
      [8, 92],
      [138, 92],
      [73, 8],
      [73, 92],
    ].map(([cx, cy]) => (
      <circle
        className="fill-screw"
        cx={cx}
        cy={cy}
        key={`${cx}-${cy}`}
        r="3"
      />
    ))}
    <circle className="fill-platter" cx="56" cy="50" r="38" />
    <circle
      className="stroke-drive"
      cx="56"
      cy="50"
      fill="none"
      opacity=".16"
      r="27"
      strokeWidth="1.2"
    />
    <circle
      className="stroke-drive"
      cx="56"
      cy="50"
      fill="none"
      opacity=".12"
      r="16"
    />
    <circle className="fill-drive" cx="56" cy="50" r="9" />
    <circle className="fill-platter" cx="56" cy="50" r="3" />
    <rect className="fill-screw" height="30" width="22" x="112" y="58" />
    <path className="stroke-arm" d="M122 74 70 34" strokeWidth="6" />
    <circle className="fill-arm" cx="122" cy="74" r="8" />
    <rect
      className="fill-arm"
      height="9"
      transform="rotate(-38 68 33)"
      width="9"
      x="64"
      y="29"
    />
  </>
);

const SataFace = ({ label }: { label?: string }) => (
  <>
    <rect className="fill-drive" height="70" width="100" />
    {label !== undefined && (
      <Sticker bar={1} box={[10, 12, 62, 40]} text={label} type={9} />
    )}
    <rect className="fill-gold" height="50" width="6" x="88" y="10" />
    <circle className="fill-screw" cx="6" cy="6" r="2" />
    <circle className="fill-screw" cx="6" cy="64" r="2" />
  </>
);

const PcieFace = () => (
  <>
    <rect className="fill-pcb" height="60" width="172" />
    <path
      className="fill-gold"
      d={boxes(span(22).map((i) => [42 + i * 4, 60, 2.6, 9]))}
    />
    <path
      className="fill-chip"
      d={boxes([
        [70, 14, 34, 32],
        [16, 14, 22, 14],
        [120, 18, 36, 8],
        [120, 32, 36, 8],
      ])}
    />
  </>
);

type Face = "hdd" | "pcie" | "ram" | "sata" | "ssd";

const faces = {
  hdd: () => <HddFace />,
  pcie: () => <PcieFace />,
  ram: (label?: string) => <DimmFace label={label} />,
  sata: (label?: string) => <SataFace label={label} />,
  ssd: (label?: string) => <M2Face label={label} />,
} satisfies Record<Face, (label?: string) => React.JSX.Element>;

export const Part = ({
  className,
  kind,
  label,
}: {
  className?: string;
  kind: Face;
  label?: string;
}) => (
  <svg
    aria-hidden
    className={className}
    viewBox={`0 0 ${prints[kind].w} ${prints[kind].h}`}
  >
    {faces[kind](label)}
  </svg>
);

const Latches = ({ open, y }: { open: boolean; y: number }) =>
  open ? (
    <g className="fill-latch">
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
    <g className="fill-latch">
      <rect height="22" width="12" x="0" y={y} />
      <rect height="22" width="12" x="255" y={y} />
    </g>
  );

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
}) => {
  const lift = state === "hover" ? 34 : 0;
  const slot = 54.64 + lift;

  return (
    <svg aria-hidden className={className} viewBox={`-12 -2 291 ${81 + lift}`}>
      {state === "empty" ? (
        <g className="text-current">
          <Footprint kind="ram" />
        </g>
      ) : (
        <g
          className={
            seat ? "[transform-box:fill-box] motion-safe:animate-seat" : ""
          }
        >
          <DimmFace label={label} />
        </g>
      )}
      <rect className="fill-slot" height="14" width="247" x="10" y={slot + 8} />
      <Latches open={state !== "in"} y={slot} />
    </svg>
  );
};

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
    <g transform="translate(69 16) rotate(90)">
      {filled ? (
        <DimmFace />
      ) : (
        <g className="text-silk">
          <Footprint kind="ram" />
        </g>
      )}
    </g>
    <rect className="fill-latch" height="12" width="75" y="287" />
  </svg>
);

export const M2Slot = ({
  className,
  label,
  state,
}: {
  className?: string;
  label?: string;
  state: "empty" | "in";
}) => (
  <svg aria-hidden className={className} viewBox="0 0 278 66">
    <rect className="fill-slot" height="52" width="16" y="7" />
    <svg height="66" viewBox="0 0 240 66" width="240" x="16">
      {state === "empty" ? <Footprint kind="ssd" /> : <M2Face label={label} />}
    </svg>
    <circle className="fill-latch" cx="265" cy="33" r="10" />
  </svg>
);

export const Bay = ({
  className,
  drive,
  label,
  state,
}: {
  className?: string;
  drive: "hdd" | "sata";
  label?: string;
  state: "empty" | "in";
}) => {
  const { h, w } = prints[drive];

  return (
    <svg aria-hidden className={className} viewBox={`0 0 ${w + 28} ${h + 8}`}>
      <rect className="fill-slot" height={h + 8} width="6" />
      <rect className="fill-slot" height={h + 8} width="6" x={w + 22} />
      <svg height={h} viewBox={`0 0 ${w} ${h}`} width={w} x="14" y="4">
        {state === "empty" ? <Footprint kind={drive} /> : faces[drive](label)}
      </svg>
    </svg>
  );
};

export const Card = ({
  className,
  state,
}: {
  className?: string;
  state: "empty" | "in";
}) => (
  <svg aria-hidden className={className} viewBox="-12 -4 196 78">
    <rect className="fill-latch" height="78" width="7" x="-12" y="-4" />
    {state === "empty" ? <Footprint kind="pcie" /> : <PcieFace />}
  </svg>
);

const fits = {
  hdd: { h: 72, w: 105 },
  pcie: { h: 61, w: 150 },
  ram: { h: 39, w: 164 },
  sata: { h: 72, w: 103 },
  ssd: { h: 45, w: 164 },
} satisfies Record<Face, { h: number; w: number }>;

export const Bag = ({
  className,
  kind,
}: {
  className?: string;
  kind: Face;
}) => {
  const { h, w } = fits[kind];

  return (
    <svg aria-hidden className={className} viewBox="0 0 200 120">
      <rect className="fill-film" height="120" width="200" />
      <svg
        height={h}
        opacity=".6"
        viewBox={`0 0 ${prints[kind].w} ${prints[kind].h}`}
        width={w}
        x={(200 - w) / 2}
        y={38 + (72 - h) / 2}
      >
        {faces[kind]()}
      </svg>
      <rect className="fill-seal" height="6" width="200" y="12" />
      <rect className="fill-esd" height="20" width="20" x="12" y="24" />
      <path
        className="stroke-coal"
        d="M22 27 30 41H14Z"
        fill="none"
        strokeWidth="2"
      />
      <rect className="fill-coal" height="5" width="2" x="21" y="32" />
    </svg>
  );
};

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
}) => {
  const face = faceOf(ask);
  const label = stickerOf(ask);

  if (light === "sending") {
    return <Bag className={className} kind={face} />;
  }

  const state = light === "filled" ? "in" : "empty";

  if (face === "ram") {
    return (
      <Seated className={className} label={label} seat={seat} state={state} />
    );
  }

  if (face === "ssd") {
    return <M2Slot className={className} label={label} state={state} />;
  }

  if (face === "pcie") {
    return <Card className={className} state={state} />;
  }

  return <Bay className={className} drive={face} label={label} state={state} />;
};
