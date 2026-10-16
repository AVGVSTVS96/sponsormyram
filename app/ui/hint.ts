export const signedIn = {
  maxAge: 60 * 60 * 24 * 400,
  name: "signed-in",
  path: "/",
  sameSite: "lax",
  secure: true,
  value: "1",
} as const;
