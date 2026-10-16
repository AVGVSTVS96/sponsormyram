import { fetchQuery } from "convex/nextjs";
import { cacheLife, cacheTag } from "next/cache";

import { api } from "@/convex/_generated/api";
import type { Brand } from "@/lib/brand";
import { cleanHandle } from "@/lib/handle";

export const boardOf = async (kind: Brand) => {
  "use cache";
  cacheLife("hours");
  cacheTag(`board:${kind}`);

  return await fetchQuery(api.items.board, { kind });
};

export const listOf = async (raw: string) => {
  "use cache";
  const handle = cleanHandle(raw);

  cacheLife("hours");
  cacheTag(`handle:${handle}`);

  const page = await fetchQuery(api.users.page, { handle });

  if (page !== null) {
    cacheTag(`user:${page.user._id}`);
  }

  return page;
};

export const askOf = async (raw: string, slug: string) => {
  "use cache";
  const handle = cleanHandle(raw);

  cacheLife("hours");
  cacheTag(`handle:${handle}`);

  const found = await fetchQuery(api.items.one, { handle, slug });

  if (found !== null) {
    cacheTag(`user:${found.user._id}`);
  }

  return found;
};
