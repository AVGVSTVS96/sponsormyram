import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { signedIn } from "@/app/ui/hint";
import { brandFrom } from "@/lib/brand";
import { origin } from "@/lib/origin";

const ramOnly = /^\/(?:dashboard|sign-in|api\/auth)(?:\/|$)/u;

const gate = (pathname: string, user: boolean) => {
  if (pathname.startsWith("/dashboard") && !user) {
    return "/sign-in";
  }

  return pathname.startsWith("/sign-in") && user ? "/dashboard" : null;
};

export const proxy = (request: NextRequest) => {
  const brand = brandFrom(request.headers.get("host") ?? "");
  const { pathname, search } = request.nextUrl;
  const target = request.nextUrl.clone();

  target.pathname = `/${brand}${pathname === "/" ? "" : pathname}`;

  if (!ramOnly.test(pathname)) {
    return NextResponse.rewrite(target);
  }

  if (brand !== "ram") {
    return NextResponse.redirect(`${origin("ram")}${pathname}${search}`);
  }

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.rewrite(target);
  }

  const user = getSessionCookie(request) !== null;
  const to = gate(pathname, user);

  const response =
    to === null
      ? NextResponse.rewrite(target)
      : NextResponse.redirect(new URL(`${to}${search}`, request.url));

  if (user) {
    response.cookies.set(signedIn);
  } else {
    response.cookies.delete(signedIn.name);
  }

  return response;
};

export const config = {
  matcher: ["/((?!_next/|_vercel/).*)"],
};
