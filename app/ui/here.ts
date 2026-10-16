import "server-only";
import { headers } from "next/headers";

import { site } from "@/lib/brand";

export const here = async () => {
  const list = await headers();

  return site(list.get("host") ?? "");
};
