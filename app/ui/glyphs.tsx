import type { Brand } from "@/lib/brand";

interface GlyphProps {
  className?: string;
}

const ramChips = [0, 1, 2, 3, 4, 5];

export const Ram = ({ className }: GlyphProps) => (
  <svg aria-hidden className={className} viewBox="0 0 220 56">
    <rect className="fill-pcb" height="48" width="220" />
    <rect className="fill-gold" height="8" width="220" y="48" />
    <rect className="fill-paper" height="8" width="4" x="136" y="48" />
    {ramChips.map((chip) => (
      <rect
        className="fill-coal"
        height="28"
        key={chip}
        width="18"
        x={12 + chip * 36.4}
        y="8"
      />
    ))}
  </svg>
);

export const Ssd = ({ className }: GlyphProps) => (
  <svg aria-hidden className={className} viewBox="0 0 220 56">
    <rect className="fill-gold" height="20" width="10" y="4" />
    <rect className="fill-gold" height="22" width="10" y="30" />
    <rect className="fill-pcb" height="56" width="210" x="10" />
    <rect className="fill-coal" height="28" width="28" x="24" y="14" />
    <rect className="fill-coal" height="36" width="56" x="66" y="10" />
    <rect className="fill-coal" height="36" width="56" x="130" y="10" />
    <circle className="fill-paper" cx="220" cy="28" r="7" />
  </svg>
);

export const Hdd = ({ className }: GlyphProps) => (
  <svg aria-hidden className={className} viewBox="0 0 80 56">
    <rect className="fill-coal" height="56" width="80" />
    <circle className="fill-platter" cx="34" cy="28" r="21" />
    <circle className="fill-coal" cx="34" cy="28" r="4" />
    <path
      className="stroke-paper"
      d="M38 24 L60 44"
      strokeLinecap="round"
      strokeWidth="4"
    />
    <circle className="fill-paper" cx="62" cy="46" r="5" />
  </svg>
);

export const glyphs = { hdd: Hdd, ram: Ram, ssd: Ssd } satisfies Record<
  Brand,
  (props: GlyphProps) => React.JSX.Element
>;

const slotSize = {
  hdd: "h-7 w-10",
  ram: "h-5 w-14",
  ssd: "h-4 w-18",
} satisfies Record<Brand, string>;

export const Slot = ({
  brand,
  filled,
  order,
}: {
  brand: Brand;
  filled: boolean;
  order: number;
}) => {
  const Glyph = glyphs[brand];

  return filled ? (
    <span
      className="inline-flex motion-safe:animate-drop"
      style={{ animationDelay: `${order * 12}ms` }}
    >
      <Glyph className={slotSize[brand]} />
    </span>
  ) : (
    <span className={`${slotSize[brand]} border border-dashed border-ink`} />
  );
};

export const Strip = ({ brand }: { brand: Brand }) => {
  if (brand === "hdd") {
    return (
      <svg
        aria-hidden
        className="block h-24 w-full"
        preserveAspectRatio="xMidYMin slice"
        viewBox="0 0 1440 96"
      >
        <rect className="fill-coal" height="96" width="1440" />
        <circle className="fill-platter" cx="1180" cy="300" r="260" />
        <circle className="fill-platter" cx="260" cy="300" r="260" />
      </svg>
    );
  }

  if (brand === "ssd") {
    return (
      <svg
        aria-hidden
        className="block h-24 w-full"
        preserveAspectRatio="xMinYMid slice"
        viewBox="0 0 1440 96"
      >
        <rect className="fill-gold" height="36" width="24" y="6" />
        <rect className="fill-gold" height="40" width="24" y="50" />
        <rect className="fill-pcb" height="96" width="1416" x="24" />
        <rect className="fill-coal" height="48" width="48" x="72" y="24" />
        {[0, 1, 2, 3].map((chip) => (
          <rect
            className="fill-coal"
            height="60"
            key={chip}
            width="250"
            x={160 + chip * 290}
            y="18"
          />
        ))}
        <circle className="fill-paper" cx="1440" cy="48" r="20" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden
      className="block h-24 w-full"
      preserveAspectRatio="xMinYMid slice"
      viewBox="0 0 1440 96"
    >
      <rect className="fill-pcb" height="76" width="1440" />
      <rect className="fill-gold" height="20" width="1440" y="76" />
      <rect className="fill-paper" height="20" width="10" x="894" y="76" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((chip) => (
        <rect
          className="fill-coal"
          height="48"
          key={chip}
          width="76"
          x={52 + chip * 180}
          y="14"
        />
      ))}
    </svg>
  );
};
