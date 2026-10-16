import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import type { Brand } from "@/lib/brand";

export const size = { height: 630, width: 1200 };

const color = {
  gold: "#d4a72c",
  ink: "#0a0a0a",
  muted: "#6b6b6b",
  paper: "#ffffff",
  pcb: "#0b7a43",
};

const font = async (file: string) =>
  await readFile(path.join(process.cwd(), "assets/fonts", file));

const mono = {
  fontFamily: "Geist Mono",
  fontSize: 26,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
} as const;

const RamArt = () => (
  <div
    style={{
      bottom: 0,
      display: "flex",
      flexDirection: "column",
      left: 0,
      position: "absolute",
      right: 0,
    }}
  >
    <div
      style={{
        background: color.pcb,
        display: "flex",
        gap: 86,
        height: 70,
        padding: "12px 44px",
      }}
    >
      {[0, 1, 2, 3, 4, 5, 6, 7].map((chip) => (
        <div
          key={chip}
          style={{ background: color.ink, height: 44, width: 64 }}
        />
      ))}
    </div>
    <div style={{ display: "flex", height: 18 }}>
      <div style={{ background: color.gold, flex: 62 }} />
      <div style={{ background: color.paper, width: 10 }} />
      <div style={{ background: color.gold, flex: 38 }} />
    </div>
  </div>
);

const SsdArt = () => (
  <div
    style={{
      bottom: 0,
      display: "flex",
      height: 88,
      left: 0,
      position: "absolute",
      right: 0,
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        justifyContent: "center",
        width: 18,
      }}
    >
      <div style={{ background: color.gold, height: 30 }} />
      <div style={{ background: color.gold, height: 30 }} />
    </div>
    <div
      style={{
        alignItems: "center",
        background: color.pcb,
        display: "flex",
        flex: 1,
        gap: 26,
        padding: "0 34px",
      }}
    >
      <div style={{ background: color.ink, height: 44, width: 44 }} />
      {[0, 1, 2, 3].map((chip) => (
        <div
          key={chip}
          style={{ background: color.ink, height: 56, width: 220 }}
        />
      ))}
    </div>
    <div
      style={{
        background: color.paper,
        borderRadius: 999,
        height: 28,
        position: "absolute",
        right: -14,
        top: 30,
        width: 28,
      }}
    />
  </div>
);

const HddArt = () => (
  <div
    style={{
      background: color.ink,
      bottom: 0,
      display: "flex",
      position: "absolute",
      right: 0,
      top: 0,
      width: 460,
    }}
  >
    {[
      [24, 24],
      [24, 420],
      [590, 24],
      [590, 420],
    ].map(([top, left]) => (
      <div
        key={`${top}-${left}`}
        style={{
          background: color.muted,
          borderRadius: 999,
          height: 16,
          left,
          position: "absolute",
          top,
          width: 16,
        }}
      />
    ))}
    <div
      style={{
        background: color.muted,
        borderRadius: 999,
        height: 386,
        left: 37,
        position: "absolute",
        top: 58,
        width: 386,
      }}
    />
    <div
      style={{
        background: color.ink,
        borderRadius: 999,
        height: 62,
        left: 199,
        position: "absolute",
        top: 220,
        width: 62,
      }}
    />
    <div
      style={{
        background: color.paper,
        height: 16,
        left: 160,
        position: "absolute",
        top: 410,
        transform: "rotate(47deg)",
        width: 260,
      }}
    />
    <div
      style={{
        background: color.paper,
        borderRadius: 999,
        height: 56,
        left: 340,
        position: "absolute",
        top: 500,
        width: 56,
      }}
    />
  </div>
);

const art = { hdd: HddArt, ram: RamArt, ssd: SsdArt } satisfies Record<
  Brand,
  () => React.JSX.Element
>;

interface Card {
  brand: Brand;
  corner: string;
  domain: string;
  done?: boolean;
  footer: string;
  stamp?: string;
  title: string;
}

const titleSize = (text: string) => {
  if (text.length <= 18) {
    return 120;
  }

  return text.length <= 28 ? 96 : 72;
};

export const card = async ({
  brand,
  corner,
  domain,
  done = false,
  footer,
  stamp,
  title,
}: Card) => {
  const Art = art[brand];
  const width = brand === "hdd" ? 620 : 1060;

  return new ImageResponse(
    <div
      style={{
        background: color.paper,
        color: color.ink,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Geist",
        height: "100%",
        justifyContent: "space-between",
        padding: brand === "hdd" ? "60px 64px 80px" : "60px 64px 128px",
        position: "relative",
        width: "100%",
      }}
    >
      <Art />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: brand === "hdd" ? 612 : 1072,
          ...mono,
        }}
      >
        <span>{domain}</span>
        <span style={{ color: color.muted }}>{corner}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            color: done ? color.muted : color.ink,
            fontSize: titleSize(title),
            fontWeight: 800,
            letterSpacing: "-0.05em",
            lineHeight: 0.92,
            maxWidth: width,
          }}
        >
          {title}
        </div>
        <span style={{ ...mono, color: color.muted }}>{footer}</span>
      </div>
      {stamp !== undefined && (
        <div
          style={{
            alignItems: "center",
            background: color.gold,
            border: `3px solid ${color.ink}`,
            borderRadius: 6,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: "18px 36px",
            position: "absolute",
            right: 66,
            top: 112,
            transform: "rotate(-6deg)",
          }}
        >
          <span
            style={{
              ...mono,
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: "0.12em",
            }}
          >
            Sponsored
          </span>
          <span style={mono}>{stamp}</span>
        </div>
      )}
    </div>,
    {
      ...size,
      fonts: [
        { data: await font("Geist-ExtraBold.ttf"), name: "Geist", weight: 800 },
        {
          data: await font("GeistMono-Regular.ttf"),
          name: "Geist Mono",
          weight: 400,
        },
        {
          data: await font("GeistMono-Bold.ttf"),
          name: "Geist Mono",
          weight: 700,
        },
      ],
    }
  );
};
