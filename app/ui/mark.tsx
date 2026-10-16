import { ImageResponse } from "next/og";

import type { Brand } from "@/lib/brand";

const pcb = "#0b7a43";
const gold = "#d4a72c";
const coal = "#0a0a0a";
const paper = "#ffffff";
const platter = "#6b6b6b";

const art = {
  hdd: `<rect width="32" height="32" fill="${coal}"/><circle cx="13" cy="15" r="10.5" fill="${platter}"/><circle cx="13" cy="15" r="2" fill="${coal}"/><path d="M15 13 L25 24" stroke="${paper}" stroke-width="3" stroke-linecap="round"/><circle cx="25.5" cy="24.5" r="3.5" fill="${paper}"/>`,
  ram: `<rect width="32" height="32" fill="${pcb}"/><rect x="5" y="7" width="6" height="12" fill="${coal}"/><rect x="13" y="7" width="6" height="12" fill="${coal}"/><rect x="21" y="7" width="6" height="12" fill="${coal}"/><rect y="23" width="32" height="9" fill="${gold}"/><rect x="19" y="23" width="2" height="9" fill="${pcb}"/>`,
  ssd: `<rect width="32" height="32" fill="${pcb}"/><rect width="7" height="12" fill="${gold}"/><rect y="15" width="7" height="17" fill="${gold}"/><rect x="10" y="12" width="7" height="8" fill="${coal}"/><rect x="20" y="7" width="7" height="18" fill="${coal}"/><circle cx="32" cy="16" r="3.5" fill="${paper}"/>`,
} satisfies Record<Brand, string>;

export const iconSvg = (brand: Brand, round = true) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${
    round
      ? `<clipPath id="r"><rect width="32" height="32" rx="6"/></clipPath><g clip-path="url(#r)">${art[brand]}</g>`
      : art[brand]
  }</svg>`;

export const iconPng = (brand: Brand, size: number, round = true) =>
  new ImageResponse(
    <div
      style={{
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(iconSvg(brand, round))}")`,
        backgroundSize: "100% 100%",
        display: "flex",
        height: "100%",
        width: "100%",
      }}
    />,
    { height: size, width: size }
  );
