import {
  applyResponseHeaders,
  authkit,
  partitionAuthkitHeaders,
} from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { signedIn } from "@/app/ui/hint";
import { brandFrom } from "@/lib/brand";
import { origin } from "@/lib/origin";

const ramOnly = /^\/(?:dashboard|sign-in|callback)(?:\/|$)/u;

const gate = (pathname: string, user: boolean) => {
  if (pathname.startsWith("/dashboard") && !user) {
    return "/sign-in";
  }

  return pathname.startsWith("/sign-in") && user ? "/dashboard" : null;
};

export const proxy = async (request: NextRequest) => {
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

  const { headers, session } = await authkit(request, {
    redirectUri: `${request.nextUrl.origin}/callback`,
  });

  const { requestHeaders, responseHeaders } = partitionAuthkitHeaders(
    request,
    headers
  );

  const user = session.user !== null;
  const to = gate(pathname, user);

  const response =
    to === null
      ? NextResponse.rewrite(target, { request: { headers: requestHeaders } })
      : NextResponse.redirect(new URL(`${to}${search}`, request.url));

  if (user) {
    response.cookies.set(signedIn);
  } else {
    response.cookies.delete(signedIn.name);
  }

  return applyResponseHeaders(response, responseHeaders);
};

export const config = {
  matcher: ["/((?!_next/|_vercel/).*)"],
};
