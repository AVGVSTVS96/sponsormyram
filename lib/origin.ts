import type { Brand } from "./brand";

export const origin = (to: Brand) =>
  process.env.NODE_ENV === "development"
    ? `http://${to === "ram" ? "" : `${to}.`}localhost:3000`
    : `https://sponsormy${to}.com`;
