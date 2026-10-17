import { ImageResponse } from "next/og";

import type { Brand } from "@/lib/brand";

import { art, markup } from "./art";

export const iconSvg = (brand: Brand, round = true) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${
    round
      ? `<clipPath id="r"><rect width="32" height="32" rx="6"/></clipPath><g clip-path="url(#r)">${art[brand].map(markup).join("")}</g>`
      : art[brand].map(markup).join("")
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
