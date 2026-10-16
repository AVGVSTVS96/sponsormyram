import { authkit, handleAuthkitProxy } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { site } from "@/lib/brand";

const ramOnly = /^\/(?:dashboard|sign-in|callback)(?:\/|$)/u;

export const proxy = async (request: NextRequest) => {
  const here = site(request.headers.get("host") ?? "");
  const { origin, pathname, search } = request.nextUrl;

  if (here.brand !== "ram" && ramOnly.test(pathname)) {
    return NextResponse.redirect(`${here.origin("ram")}${pathname}${search}`);
  }

  const { headers } = await authkit(request, {
    redirectUri: `${origin}/callback`,
  });

  return handleAuthkitProxy(request, headers);
};

export const config = {
  matcher: [
    "/((?!_next/|favicon.ico|.*opengraph-image|.*\\.(?:png|svg|ttf|txt|xml)$).*)",
  ],
};
