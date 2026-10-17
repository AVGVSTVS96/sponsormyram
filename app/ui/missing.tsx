import Link from "next/link";

import { domain } from "@/lib/brand";
import type { Brand } from "@/lib/brand";
import type { parsePath } from "@/lib/handle";
import { origin } from "@/lib/origin";

import { Fit } from "./fit";
import { Footer, Header } from "./frame";
import { Fitted } from "./hardware";
import { Holes, Led } from "./lights";
import { solid } from "./parts";
import { Prose } from "./prose";
import { sample } from "./story";

type Free = NonNullable<ReturnType<typeof parsePath>>;

const whose = ({ name, platform }: Free) =>
  platform === "x"
    ? `If you’re @${name} on X, it’s yours: sign in with X.`
    : "If that’s your GitHub login, it’s yours: sign in with GitHub.";

export const Missing = ({
  brand,
  free,
}: {
  brand: Brand;
  free: Free | null;
}) => (
  <div className="flex min-h-dvh flex-col">
    <Header here={brand} />
    <main className="flex flex-1 flex-col lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col justify-end gap-6 px-5 pt-10 pb-14 md:px-16 md:pt-24 md:pb-24">
        <span className="silk text-muted">
          {free === null ? "404 · Not found" : "Not claimed yet"}
        </span>
        {free === null ? (
          <Fit as="h1" cap={120} lines={["Nothing in", "this slot."]} />
        ) : (
          <h1 className="flex flex-col gap-1">
            <Fit
              as="span"
              cap={64}
              className="text-muted"
              lines={[`${domain(origin(brand))}/`]}
            />
            <Fit as="span" cap={120} flow lines={[free.path, "is free."]} />
          </h1>
        )}
        <p className="max-w-[480px] text-[17px] [overflow-wrap:anywhere] md:text-xl">
          <Prose
            text={
              free === null
                ? "The link is wrong, or the page moved."
                : `Nobody has this page yet. ${whose(free)}`
            }
          />
        </p>
        {free === null ? (
          <Link className={`${solid} self-start`} href="/">
            Back home
          </Link>
        ) : (
          <a
            className={`${solid} self-start`}
            href={`${origin("ram")}/sign-in`}
          >
            Claim it
          </a>
        )}
      </div>
      <div className="relative flex min-h-[260px] flex-col items-center justify-center gap-5 bg-board px-5 py-12 text-silk lg:w-[42%] lg:shrink-0">
        <Holes />
        <Fitted
          ask={sample[brand]}
          className="w-[70%] max-w-[360px]"
          light="open"
        />
        <span className="flex items-center gap-2.5">
          <Led className="size-2.5" light="open" />
          <span className="block max-w-[240px] truncate silk">
            {free === null ? "404   EMPTY" : `/${free.path}   FREE`}
          </span>
        </span>
      </div>
    </main>
    <Footer here={brand} />
  </div>
);
