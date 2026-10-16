const reserved = new Set([
  "about",
  "admin",
  "api",
  "auth",
  "callback",
  "dashboard",
  "help",
  "i",
  "new",
  "settings",
]);

export const handleRule = "a-z, 0-9, _";

export const handleProblem = (handle: string) => {
  if (handle.length < 2) {
    return "At least 2 characters";
  }

  if (handle.length > 24) {
    return "24 characters at most";
  }

  if (!/^[a-z0-9_]+$/u.test(handle)) {
    return `Only ${handleRule}`;
  }

  if (reserved.has(handle)) {
    return "That one's taken by the site";
  }

  return null;
};

export const cleanHandle = (text: string) =>
  text.trim().toLowerCase().replace(/^@/u, "");

export const cleanX = (text: string) =>
  text
    .trim()
    .replace(/^@/u, "")
    .replace(/^https?:\/\/(?:www\.)?(?:x|twitter)\.com\//u, "");

export const xProblem = (x: string) =>
  x === "" || /^\w{1,15}$/u.test(x)
    ? null
    : "X handles are up to 15 letters, numbers or _";

export const suggestHandle = (email: string | undefined) =>
  (email ?? "")
    .split("@")[0]
    ?.toLowerCase()
    .replaceAll(/[^a-z0-9_]/gu, "")
    .slice(0, 24) ?? "";
