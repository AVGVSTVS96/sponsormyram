import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { brands } from "@/lib/brand";
import type { Brand } from "@/lib/brand";
import { barcode } from "@/lib/code128";

import { ems } from "./fit";
import { fitted, hex, part } from "./hardware";
import type { Face, Light } from "./hardware";
import { display } from "./lights";
import type { Debug } from "./lights";

export const size = { height: 630, width: 1200 };

const color = {
  board: "#121412",
  coal: "#0a0a0a",
  glass: "#060707",
  gold: "#d4a72c",
  latch: "#c8cdc9",
  led: "#3fe07f",
  ledoff: "#353b37",
  red: "#ff4433",
  seg: "#23282a",
  silk: "#f3f4ef",
  silksub: "#969c97",
};

const paint = hex({
  arm: "#f2f3ef",
  chip: "#0a0a0a",
  coal: "#0a0a0a",
  drive: "#1a1c1b",
  esd: "#f5c400",
  film: "#bcc1c6",
  gold: color.gold,
  latch: color.latch,
  pcb: "#0b7a43",
  platter: "#b9bec4",
  screw: "#6b6f6c",
  seal: "#8c9298",
  slot: "#2e322f",
  smd: "#8a6a3c",
  sticker: "#ffffff",
});

export type Card =
  | {
      brand: Brand;
      figure: string;
      kind: "site";
      lists: string;
      unit: string;
      url: string;
    }
  | {
      brand: Brand;
      figure: string;
      kind: "list";
      lines: string[];
      lit: Debug;
      rig: string[];
      tone: "green" | "red";
      url: string;
      who: string;
      x: boolean;
    }
  | {
      at: string;
      brand: Brand;
      by: string;
      face: Face;
      kind: "ask";
      light: Light;
      lines: string[];
      need: string;
      port: string;
      title: string;
      url: string;
      who: string;
    };

const font = async (file: string) =>
  await readFile(path.join(process.cwd(), "assets/fonts", file));

const mono = (px: number, fill: string) =>
  ({
    color: fill,
    fontFamily: "Geist Mono",
    fontSize: px,
    letterSpacing: px * 0.08,
    textTransform: "uppercase",
  }) as const;

const fitPx = (lines: string[], cap: number, width: number, track: number) =>
  Math.floor(
    Math.min(cap, width / Math.max(...lines.map((line) => ems(line, track)), 1))
  );

const Board = ({
  children,
  width = 1200,
}: {
  children: React.ReactNode;
  width?: number;
}) => (
  <div style={{ display: "flex", height: "100%", position: "relative", width }}>
    {children}
    <svg
      height="630"
      style={{ left: 0, position: "absolute", top: 0 }}
      viewBox={`0 0 ${width} 630`}
      width={width}
    >
      {[
        [31, 31],
        [width - 31, 31],
        [31, 599],
        [width - 31, 599],
      ].map(([cx, cy]) => (
        <circle
          cx={cx}
          cy={cy}
          fill="#e9ebe7"
          key={`${cx}-${cy}`}
          r="7"
          stroke={color.latch}
          strokeWidth="4"
        />
      ))}
    </svg>
  </div>
);

const glow = { green: color.led, red: color.red };

const Lights = ({ lit, tone }: { lit: Debug; tone: "green" | "red" }) => (
  <div style={{ display: "flex", gap: 24 }}>
    {(["CPU", "DRAM", "VGA", "BOOT"] as const).map((name) => (
      <div
        key={name}
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          style={{
            background: name === lit ? glow[tone] : color.ledoff,
            borderRadius: 999,
            height: 16,
            width: 16,
          }}
        />
        <span style={mono(12, name === lit ? color.silk : color.silksub)}>
          {name}
        </span>
      </div>
    ))}
  </div>
);

const Readout = ({
  height,
  text,
  tone,
}: {
  height: number;
  text: string;
  tone: "green" | "red";
}) => {
  const { segs, width } = display(text);

  return (
    <div
      style={{
        background: color.glass,
        display: "flex",
        padding: `${height * 0.2}px ${height * 0.24}px`,
      }}
    >
      <svg
        height={height}
        viewBox={`0 0 ${width.toFixed(1)} 56`}
        width={(height * width) / 56}
      >
        {segs.map((seg) => (
          <polygon
            fill={seg.on ? glow[tone] : color.seg}
            key={seg.key}
            points={seg.points}
          />
        ))}
      </svg>
    </div>
  );
};

const Sponsor = ({ url }: { url: string }) => {
  const href = `https://${url.replace(/^https?:\/\//u, "")}`;
  const code = barcode(href);
  const step = code.width * 2 <= 760 ? 2 : 1;

  return (
    <div
      style={{
        alignSelf: "flex-start",
        background: "#ffffff",
        color: color.coal,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "14px 18px 12px",
      }}
    >
      <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.5 }}>
        If short, please sponsor.
      </span>
      <svg
        height={44}
        preserveAspectRatio="none"
        viewBox={`0 0 ${code.width} 1`}
        width={code.width * step}
      >
        <path d={code.d} fill={color.coal} />
      </svg>
      <span style={{ fontSize: 15, fontWeight: 600 }}>{url}</span>
    </div>
  );
};

const Headline = ({
  cap,
  color: ink = color.silk,
  lines,
  track,
  width,
}: {
  cap: number;
  color?: string;
  lines: string[];
  track: number;
  width: number;
}) => {
  const px = fitPx(lines, cap, width, track);

  return (
    <div
      style={{
        color: ink,
        display: "flex",
        flexDirection: "column",
        fontSize: px,
        fontWeight: 800,
        letterSpacing: px * track,
        lineHeight: 0.88,
      }}
    >
      {lines.map((line) => (
        <span key={line} style={{ whiteSpace: "nowrap" }}>
          {line}
        </span>
      ))}
    </div>
  );
};

const frame = {
  background: color.board,
  color: color.silk,
  display: "flex",
  flexDirection: "column",
  fontFamily: "Geist",
  height: "100%",
  justifyContent: "space-between",
  padding: "56px 64px 48px",
  width: "100%",
} as const;

const XMark = () => (
  <svg fill={color.silk} height="28" viewBox="0 0 24 24" width="28">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const List = (card: Extract<Card, { kind: "list" }>) => (
  <Board>
    <div style={frame}>
      <div
        style={{
          alignItems: "flex-start",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: 14,
            maxWidth: 680,
          }}
        >
          {card.x && <XMark />}
          <span
            style={{
              fontSize: 32,
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {card.who}
          </span>
        </div>
        <Lights lit={card.lit} tone={card.tone} />
      </div>
      <div
        style={{
          alignItems: "flex-end",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Headline
          cap={184}
          lines={card.lines}
          track={-0.065}
          width={card.figure === "" ? 1060 : 700}
        />
        {card.figure !== "" && (
          <div
            style={{
              alignItems: "flex-end",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <Readout height={104} text={card.figure} tone="red" />
            {card.rig.map((line) => (
              <span
                key={line}
                style={{
                  ...mono(14, color.silk),
                  maxWidth: 360,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {line}
              </span>
            ))}
          </div>
        )}
      </div>
      <Sponsor url={card.url} />
    </div>
  </Board>
);

const Site = (card: Extract<Card, { kind: "site" }>) => (
  <Board>
    <div style={frame}>
      <div
        style={{
          alignItems: "flex-start",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
          <div
            style={{
              background: color.led,
              borderRadius: 999,
              height: 12,
              width: 12,
            }}
          />
          <span
            style={mono(15, color.silksub)}
          >{`PWR   SPONSORMY${card.brand.toUpperCase()}`}</span>
        </div>
        <Lights lit={card.brand === "ram" ? "DRAM" : "BOOT"} tone="red" />
      </div>
      <div
        style={{
          alignItems: "flex-end",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Headline
          cap={170}
          lines={["Sponsor", `my ${brands[card.brand].word}.`]}
          track={-0.055}
          width={700}
        />
        <div
          style={{
            alignItems: "flex-end",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <Readout height={104} text={card.figure} tone="red" />
          <span
            style={mono(14, color.silk)}
          >{`${card.unit} ASKED FOR · ${card.lists}`}</span>
        </div>
      </div>
      <Sponsor url={card.url} />
    </div>
  </Board>
);

const ledColor = {
  filled: color.led,
  open: color.red,
  sending: color.gold,
} as const;

const words = { filled: "IN", open: "NEEDED", sending: "ON ITS WAY" } as const;

const Ask = (card: Extract<Card, { kind: "ask" }>) => {
  const art =
    card.light === "sending" ? (
      <div
        style={{
          border: `3px dashed ${color.gold}`,
          display: "flex",
          padding: 18,
        }}
      >
        {part({
          kind: card.face,
          label: "",
          paint,
          svg: {
            width: card.face === "hdd" || card.face === "sata" ? 230 : 400,
          },
        })}
      </div>
    ) : (
      <div style={{ color: color.silk, display: "flex" }}>
        {fitted({
          face: card.face,
          label: "",
          light: "open",
          paint,
          svg: {
            width: card.face === "hdd" || card.face === "sata" ? 280 : 430,
          },
        })}
      </div>
    );

  return (
    <Board>
      <div
        style={{
          ...frame,
          alignItems: "center",
          flexDirection: "row",
          gap: 56,
          justifyContent: "flex-start",
          padding: "60px 64px",
        }}
      >
        <div
          style={{
            alignItems: "flex-start",
            display: "flex",
            flexDirection: "column",
            gap: 22,
            width: 460,
          }}
        >
          <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
            <div
              style={{
                background: ledColor[card.light],
                borderRadius: 999,
                height: 16,
                width: 16,
              }}
            />
            <span
              style={mono(
                16,
                card.light === "sending" ? color.gold : color.silk
              )}
            >
              {`${card.port}   ${words[card.light]}`}
            </span>
          </div>
          {art}
        </div>
        <div
          style={{ display: "flex", flex: 1, flexDirection: "column", gap: 24 }}
        >
          <Headline cap={104} lines={card.lines} track={-0.05} width={520} />
          <span style={{ fontSize: 30, fontWeight: 600 }}>for {card.who}</span>
          {card.light === "sending" ? (
            <div
              style={{
                border: `3px solid ${color.gold}`,
                display: "flex",
                fontSize: 22,
                fontWeight: 600,
                padding: "10px 16px",
              }}
            >
              {`${card.by} is sending it`}
            </div>
          ) : (
            <span
              style={{ color: color.silksub, fontSize: 24, fontWeight: 600 }}
            >
              {card.need}
            </span>
          )}
          <span style={mono(15, color.silksub)}>{card.url}</span>
        </div>
      </div>
    </Board>
  );
};

const Thanks = (card: Extract<Card, { kind: "ask" }>) => (
  <div
    style={{
      background: color.gold,
      display: "flex",
      fontFamily: "Geist",
      height: "100%",
      width: "100%",
    }}
  >
    <Board width={520}>
      <div
        style={{
          alignItems: "center",
          background: color.board,
          display: "flex",
          flexDirection: "column",
          gap: 30,
          height: "100%",
          justifyContent: "center",
          width: 520,
        }}
      >
        {fitted({
          face: card.face,
          label: "",
          light: "filled",
          paint,
          svg: {
            width: card.face === "hdd" || card.face === "sata" ? 300 : 400,
          },
        })}
        <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
          <div
            style={{
              background: color.led,
              borderRadius: 999,
              height: 16,
              width: 16,
            }}
          />
          <span
            style={mono(16, color.silk)}
          >{`${card.port}   IN   ${card.at}`}</span>
        </div>
      </div>
    </Board>
    <div
      style={{
        color: color.coal,
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 56px",
      }}
    >
      <span style={{ fontSize: 28, fontWeight: 600 }}>{card.who}</span>
      <Headline
        cap={96}
        color={color.coal}
        lines={card.by === "" ? ["It’s in."] : ["Thanks,", `${card.by}.`]}
        track={-0.05}
        width={570}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span
          style={{ fontSize: 28, fontWeight: 600 }}
        >{`${card.title}, installed.`}</span>
        <span style={{ fontSize: 20, fontWeight: 600 }}>{card.url}</span>
      </div>
    </div>
  </div>
);

const Drawn = (card: Card) => {
  if (card.kind === "site") {
    return <Site {...card} />;
  }

  if (card.kind === "list") {
    return <List {...card} />;
  }

  return card.light === "filled" ? <Thanks {...card} /> : <Ask {...card} />;
};

export const card = async (props: Card, headers?: Record<string, string>) =>
  new ImageResponse(<Drawn {...props} />, {
    ...size,
    fonts: [
      { data: await font("Geist-ExtraBold.ttf"), name: "Geist", weight: 800 },
      { data: await font("Geist-SemiBold.ttf"), name: "Geist", weight: 600 },
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
    headers,
  });
