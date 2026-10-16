import type { Metadata } from "next";

import { Legal } from "@/app/ui/legal";

export const metadata: Metadata = { title: "Privacy · Sponsor my RAM" };

const rows = [
  [
    "What we keep",
    "Your handle and account id from X or GitHub, your name, and your email if they share it. Your list, your note and your rig. Who said they're sending what.",
  ],
  [
    "What's public",
    "Your page: your handle, list, note and rig, and who's sending or sponsored each part. That's the point of the site.",
  ],
  [
    "What we don't keep",
    "Addresses, ever. Passwords. Your IP address. Anything that could post or act on your X or GitHub account.",
  ],
  [
    "Who sees the rest",
    "Nobody buys it: nothing is sold here. Vercel and Convex host the site and store it for us. Vercel Web Analytics counts page views without cookies.",
  ],
  [
    "Deleting it",
    "Delete your page from the dashboard and everything above goes with it, sign-in included.",
  ],
  ["Questions", "@avgvstvs96 on X."],
] as const;

const Privacy = () => (
  <Legal
    intro="Short version: we keep your handle, your email and your list. We never keep an address."
    rows={rows}
    title="Privacy"
  />
);

export default Privacy;
