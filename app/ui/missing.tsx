import Link from "next/link";

import { domain } from "@/lib/brand";
import type { Brand } from "@/lib/brand";
import type { parsePath } from "@/lib/handle";
import { origin } from "@/lib/origin";

import { Footer, Header } from "./frame";
import { solid } from "./parts";

const big =
  "font-extrabold tracking-[-0.05em] [overflow-wrap:anywhere] text-[clamp(64px,8.3vw,120px)] leading-[0.9]";

type Free = NonNullable<ReturnType<typeof parsePath>>;

const whose = ({ name, platform }: Free) =>
  platform === "x"
    ? `If you're @${name} on X, it's yours: sign in with X.`
    : `If you're ${name} on GitHub, it's yours: sign in with GitHub.`;

const Slot = ({ handle }: { handle: string | null }) => (
  <div className="flex w-full flex-col gap-2">
    <div className="label flex h-14 items-center justify-center border-2 border-dashed border-ink md:h-18">
      Empty
    </div>
    {handle !== null && (
      <div className="label flex justify-between gap-4">
        <span className="truncate">/{handle}</span>
        <span className="text-muted">free</span>
      </div>
    )}
  </div>
);

export const Missing = ({
  brand,
  free,
}: {
  brand: Brand;
  free: Free | null;
}) => (
  <div className="flex min-h-dvh flex-col">
    <Header here={brand} />
    <main className="flex flex-1 flex-col justify-end px-6 pt-10 pb-12 md:min-h-[756px] md:px-16 md:pt-30 md:pb-32">
      <div className="flex flex-col gap-5 md:gap-6">
        <span className="label text-muted">
          {free === null ? "404 · Not found" : "Not claimed yet"}
        </span>
        {free === null ? (
          <h1 className={big}>
            Nothing in
            <br />
            this slot.
          </h1>
        ) : (
          <h1 className="flex flex-col">
            <span className="text-[clamp(32px,8.3vw,120px)] leading-[1] font-extrabold tracking-[-0.05em] whitespace-nowrap text-muted md:leading-[0.9]">
              {domain(origin(brand))}/
            </span>
            <span className={big}>{free.path} is free.</span>
          </h1>
        )}
        <div className="grid gap-5 md:grid-cols-[minmax(0,480px)_280px] md:justify-between md:gap-x-12 md:gap-y-6">
          <p>
            {free === null
              ? "The link is wrong, or the page moved."
              : `Nobody has this page yet. ${whose(free)}`}
          </p>
          <div className="md:col-start-2 md:row-span-2 md:row-start-1 md:self-end">
            <Slot handle={free?.path ?? null} />
          </div>
          {free === null ? (
            <Link className={`${solid} md:justify-self-start`} href="/">
              Back home →
            </Link>
          ) : (
            <a
              className={`${solid} md:justify-self-start`}
              href={`${origin("ram")}/sign-in`}
            >
              Claim it →
            </a>
          )}
        </div>
      </div>
    </main>
    <Footer here={brand} />
  </div>
);
