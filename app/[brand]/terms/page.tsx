import type { Metadata } from "next";

import { Legal } from "@/app/ui/legal";

export const metadata: Metadata = { title: "Terms · Sponsor my RAM" };

const rows = [
  [
    "The site",
    "sponsormyram, sponsormyssd and sponsormyhdd are one free site for wish lists of computer parts. It's half a joke, and it can change or go away.",
  ],
  [
    "Nothing is sold",
    "We don't sell parts, take payments or earn from links. Buy links are plain eBay and Amazon searches.",
  ],
  [
    "Sponsoring",
    "A sponsorship is between two people. What gets sent, how it ships and whether it arrives is up to you two.",
  ],
  [
    "Your page",
    "List real parts for a real rig. No scams, spam or anything nasty. We can hide or remove any list.",
  ],
  ["No warranty", "The site comes as is, with no promises."],
  ["Questions", "@avgvstvs96 on X."],
] as const;

const Terms = () => <Legal rows={rows} title="Terms" />;

export default Terms;
