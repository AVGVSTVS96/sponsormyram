import { v } from "convex/values";
import type { Infer } from "convex/values";

export const payTo = v.object({
  method: v.union(
    v.literal("venmo"),
    v.literal("cashapp"),
    v.literal("zelle"),
    v.literal("coffee"),
    v.literal("sponsors"),
    v.literal("btc"),
    v.literal("eth"),
    v.literal("sol")
  ),
  to: v.string(),
});

export type PayTo = Infer<typeof payTo>;

export type Method = PayTo["method"];

export const methods = [
  "venmo",
  "cashapp",
  "zelle",
  "coffee",
  "sponsors",
  "btc",
  "eth",
  "sol",
] as const satisfies readonly Method[];

export type Way = {
  clean: (text: string) => string;
  hint: string;
  label: string;
  pattern: RegExp;
  prefix: string;
  problem: string;
  show: (to: string) => string;
} & (
  | { open: (to: string) => string }
  | { qr: (to: string) => string; warn: string }
);

const strip = (text: string, junk: RegExp) => text.trim().replaceAll(junk, "");

const middle = (to: string) =>
  to.length > 18 ? `${to.slice(0, 8)}…${to.slice(-6)}` : to;

const phone = (text: string) => {
  const digits = text.replaceAll(/\D/gu, "").replace(/^1(?=\d{10}$)/u, "");

  return /^[\d\s().+-]+$/u.test(text) && digits.length === 10
    ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    : null;
};

export const ways = {
  btc: {
    clean: (text) => {
      const to = strip(text, /^bitcoin:|\?.*$/giu);

      return /^bc1/iu.test(to) ? to.toLowerCase() : to;
    },
    hint: "bc1… address",
    label: "Bitcoin",
    pattern:
      /^(?:bc1[02-9ac-hj-np-z]{11,71}|[13][1-9A-HJ-NP-Za-km-z]{25,34})$/u,
    prefix: "",
    problem: "That isn't a Bitcoin address",
    qr: (to) => `bitcoin:${to}`,
    show: middle,
    warn: "Only send bitcoin to this address.",
  },
  cashapp: {
    clean: (text) => strip(text, /^(?:https?:\/\/cash\.app\/)?\$/giu),
    hint: "cashtag",
    label: "Cash App",
    open: (to) => `https://cash.app/$${to}`,
    pattern: /^(?=.*[a-z])[\w-]{1,20}$/iu,
    prefix: "$",
    problem: "Cashtags are up to 20 characters, with at least one letter",
    show: (to) => `$${to}`,
  },
  coffee: {
    clean: (text) =>
      strip(text, /^https?:\/\/(?:www\.)?buymeacoffee\.com\/|\/$/giu),
    hint: "username",
    label: "Buy Me a Coffee",
    open: (to) => `https://buymeacoffee.com/${to}`,
    pattern: /^[\w.-]{1,50}$/u,
    prefix: "buymeacoffee.com/",
    problem: "Your Buy Me a Coffee username, the part after buymeacoffee.com/",
    show: (to) => to,
  },
  eth: {
    clean: (text) => strip(text, /^ethereum:|[@/?].*$/giu),
    hint: "0x… address",
    label: "Ethereum",
    pattern: /^0x[\da-f]{40}$/iu,
    prefix: "",
    problem: "That isn't an Ethereum address",
    qr: (to) => `ethereum:${to}`,
    show: middle,
    warn: "Only send ETH or tokens on Ethereum to this address.",
  },
  sol: {
    clean: (text) => strip(text, /^solana:|\?.*$/giu),
    hint: "address",
    label: "Solana",
    pattern: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/u,
    prefix: "",
    problem: "That isn't a Solana address",
    qr: (to) => `solana:${to}`,
    show: middle,
    warn: "Only send SOL or Solana tokens to this address.",
  },
  sponsors: {
    clean: (text) =>
      strip(
        text,
        /^https?:\/\/(?:www\.)?github\.com\/(?:sponsors\/)?|^@|\/$/giu
      ),
    hint: "login",
    label: "GitHub Sponsors",
    open: (to) => `https://github.com/sponsors/${to}`,
    pattern: /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/iu,
    prefix: "github.com/sponsors/",
    problem: "GitHub logins are up to 39 letters, numbers or single dashes",
    show: (to) => to,
  },
  venmo: {
    clean: (text) =>
      strip(text, /^https?:\/\/(?:account\.)?venmo\.com\/(?:u\/)?|^@/giu),
    hint: "username",
    label: "Venmo",
    open: (to) => `https://venmo.com/u/${to}`,
    pattern: /^[\w-]{5,30}$/u,
    prefix: "@",
    problem: "Venmo usernames are 5 to 30 letters, numbers, - or _",
    show: (to) => `@${to}`,
  },
  zelle: {
    clean: (text) => phone(text) ?? text.trim().toLowerCase(),
    hint: "email or US phone",
    label: "Zelle",
    pattern: /^(?:\(\d{3}\) \d{3}-\d{4}|[^\s@]+@[^\s@]+\.[a-z]{2,})$/u,
    prefix: "",
    problem: "Zelle takes the email or US phone number your bank has on file",
    qr: (to) => to,
    show: (to) => to,
    warn: "Send it with Zelle in your bank's app.",
  },
} satisfies Record<Method, Way>;

export const problemOf = ({ method, to }: PayTo) => {
  const way: Way = ways[method];

  return way.pattern.test(to) ? null : way.problem;
};

export const tidy = ({ method, to }: PayTo): PayTo => ({
  method,
  to: ways[method].clean(to),
});

export const settle = (pay: PayTo[]) => {
  const tidied = pay.map(tidy);

  return methods.flatMap(
    (method) => tidied.find((each) => each.method === method) ?? []
  );
};
