export type Platform = "gh" | "x";

const routes = new Set([
  "api",
  "card",
  "dashboard",
  "gh",
  "mark",
  "privacy",
  "terms",
  "x",
]);

const allowed = {
  gh: /^[a-z0-9-]{1,39}$/u,
  x: /^[a-z0-9_]{1,15}$/u,
} satisfies Record<Platform, RegExp>;

export const cleanHandle = (text: string) =>
  text.trim().toLowerCase().replace(/^@/u, "");

export const pathFor = (platform: Platform, handle: string) => {
  const name = handle.toLowerCase();

  if (platform === "gh") {
    return `gh/${name}`;
  }

  return routes.has(name) ? `x/${name}` : name;
};

export const parsePath = (path: string) => {
  const [first = "", second] = cleanHandle(path).split("/");
  const platform: Platform = first === "gh" ? "gh" : "x";
  const name = second ?? first;
  const prefixed = second !== undefined;

  if (
    (prefixed && first !== "gh" && first !== "x") ||
    !allowed[platform].test(name)
  ) {
    return null;
  }

  return pathFor(platform, name) === cleanHandle(path)
    ? { name, path: pathFor(platform, name), platform }
    : null;
};
