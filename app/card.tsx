import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };

const font = async (family: string, weight: number) => {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=${family.replace(" ", "+")}:wght@${weight}`).then((r) => r.text());
  const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error(`No TTF for ${family} ${weight}`);
  return fetch(url).then((r) => r.arrayBuffer());
};

export async function card(eyebrow: string, title: string) {
  const mono = { fontFamily: "Geist Mono", fontSize: 24, letterSpacing: "0.08em", textTransform: "uppercase" } as const;
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: 64, background: "#fff", color: "#0a0a0a", borderBottom: "24px solid #0b7a43", fontFamily: "Geist" }}>
        <div style={{ display: "flex", justifyContent: "space-between", ...mono }}>
          <span>sponsormyram</span>
          <span style={{ color: "#6b6b6b" }}>{eyebrow}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 120, fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 0.9, maxWidth: 1000 }}>{title}</div>
          <span style={{ ...mono, color: "#6b6b6b" }}>Sponsor my RAM · @AVGVSTVS96</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: await font("Geist", 800), weight: 800 },
        { name: "Geist Mono", data: await font("Geist Mono", 400), weight: 400 },
      ],
    },
  );
}
