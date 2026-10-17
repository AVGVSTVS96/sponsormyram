"use client";

import { useQuery } from "convex/react";

import { outline, small, who } from "@/app/ui/parts";
import { api } from "@/convex/_generated/api";

export const Mine = () => {
  const me = useQuery(api.users.me);
  const user = me?.user ?? null;

  if (user === null) {
    return null;
  }

  return (
    <div className="flex items-center gap-6">
      <span className="hidden text-[15px] font-medium text-muted md:inline">
        {who(user)}
      </span>
      <a className={`${outline} ${small}`} href={`/${user.handle}`}>
        Your page
      </a>
    </div>
  );
};
