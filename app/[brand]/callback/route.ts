import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { clientId, finish, workos } from "@/lib/auth";

export const GET = async (request: NextRequest) => {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const verifier = request.cookies.get("oauth-verifier")?.value;

  const ok =
    code !== null &&
    verifier !== undefined &&
    state === request.cookies.get("oauth-state")?.value;

  const response = NextResponse.redirect(
    new URL(ok ? "/dashboard" : "/sign-in?failed", request.url)
  );

  response.cookies.delete({ name: "oauth-state", path: "/callback" });
  response.cookies.delete({ name: "oauth-verifier", path: "/callback" });

  if (!ok) {
    return response;
  }

  try {
    await finish(
      await workos().authenticateWithCode({
        clientId: clientId(),
        code,
        codeVerifier: verifier,
      }),
      request.url
    );
  } catch {
    return NextResponse.redirect(new URL("/sign-in?failed", request.url));
  }

  return response;
};
