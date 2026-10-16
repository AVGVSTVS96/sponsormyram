import { board, installedGB } from "@/lib/rig";
import { card } from "./card";

export { size } from "./card";
export const contentType = "image/png";
export const alt = "Sponsor my RAM";

export default function Image() {
  return card(`${board.maxGB - installedGB}GB short`, "Sponsor my RAM.");
}
