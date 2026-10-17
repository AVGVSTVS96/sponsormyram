import type { Brand } from "@/lib/brand";

export const colors = {
  coal: "#0a0a0a",
  gold: "#d4a72c",
  paper: "#ffffff",
  pcb: "#0b7a43",
  platter: "#6b6b6b",
};

type Bit =
  | readonly ["rect", number, number, number, number, string]
  | readonly ["circle", number, number, number, string]
  | readonly ["line", string, string, number];

export const art = {
  hdd: [
    ["rect", 0, 0, 32, 32, colors.coal],
    ["circle", 13, 15, 10.5, colors.platter],
    ["circle", 13, 15, 2, colors.coal],
    ["line", "M15 13 L25 24", colors.paper, 3],
    ["circle", 25.5, 24.5, 3.5, colors.paper],
  ],
  ram: [
    ["rect", 0, 0, 32, 32, colors.pcb],
    ["rect", 5, 7, 6, 12, colors.coal],
    ["rect", 13, 7, 6, 12, colors.coal],
    ["rect", 21, 7, 6, 12, colors.coal],
    ["rect", 0, 23, 32, 9, colors.gold],
    ["rect", 19, 23, 2, 9, colors.pcb],
  ],
  ssd: [
    ["rect", 0, 0, 32, 32, colors.pcb],
    ["rect", 0, 0, 7, 12, colors.gold],
    ["rect", 0, 15, 7, 17, colors.gold],
    ["rect", 10, 12, 7, 8, colors.coal],
    ["rect", 20, 7, 7, 18, colors.coal],
    ["circle", 32, 16, 3.5, colors.paper],
  ],
} satisfies Record<Brand, readonly Bit[]>;

export const markup = (bit: Bit) => {
  if (bit[0] === "rect") {
    const [, x, y, width, height, fill] = bit;

    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"/>`;
  }

  if (bit[0] === "circle") {
    const [, cx, cy, r, fill] = bit;

    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
  }

  const [, d, stroke, width] = bit;

  return `<path d="${d}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>`;
};

export const Mark = ({
  brand,
  className,
}: {
  brand: Brand;
  className?: string;
}) => (
  <svg aria-hidden className={className} viewBox="0 0 32 32">
    {art[brand].map((bit) => {
      const key = bit.join(" ");

      if (bit[0] === "rect") {
        const [, x, y, width, height, fill] = bit;

        return (
          <rect
            fill={fill}
            height={height}
            key={key}
            width={width}
            x={x}
            y={y}
          />
        );
      }

      if (bit[0] === "circle") {
        const [, cx, cy, r, fill] = bit;

        return <circle cx={cx} cy={cy} fill={fill} key={key} r={r} />;
      }

      const [, d, stroke, width] = bit;

      return (
        <path
          d={d}
          key={key}
          stroke={stroke}
          strokeLinecap="round"
          strokeWidth={width}
        />
      );
    })}
  </svg>
);
