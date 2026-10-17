import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { cardImage, standing } from "@/app/ui/cards";
import { Copy } from "@/app/ui/copy";
import { listOf } from "@/app/ui/data";
import { Fit } from "@/app/ui/fit";
import { Close, Footer, Header } from "@/app/ui/frame";
import { lightOf } from "@/app/ui/hardware";
import { here } from "@/app/ui/here";
import { GitHub, X } from "@/app/ui/icons";
import { Lights } from "@/app/ui/lights";
import { Missing } from "@/app/ui/missing";
import { debugFor, lead, outline, postList, solid, who } from "@/app/ui/parts";
import { ChipIn } from "@/app/ui/pay";
import { Prose } from "@/app/ui/prose";
import { RigBoard } from "@/app/ui/rig";
import { AskRow } from "@/app/ui/rows";
import { brands } from "@/lib/brand";
import type { Brand } from "@/lib/brand";
import { parsePath } from "@/lib/handle";
import { origin } from "@/lib/origin";

type Page = NonNullable<Awaited<ReturnType<typeof listOf>>>;

export const listMetadata = async (handle: string): Promise<Metadata> => {
  const site = await here();
  const page = await listOf(handle);

  if (page === null) {
    const free = parsePath(handle);

    return free === null
      ? {}
      : {
          robots: { index: false },
          title: `${free.path} is free · Sponsor my ${brands[site].word}`,
        };
  }

  const { items, user } = page;
  const brand = lead(site, items);
  const owner = who(user);

  return {
    alternates: { canonical: `${origin(brand)}/${user.handle}` },
    description: user.note === "" ? `${items.length} asks.` : user.note,
    openGraph: {
      images: await cardImage(site, [user.handle], `${owner}'s wish list`),
    },
    robots: user.hidden ? { index: false } : undefined,
    title: `${owner} · Sponsor my ${brands[brand].word}`,
  };
};

const Stat = ({ count, label }: { count: number; label: string }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-4xl leading-none font-extrabold tracking-[-0.04em] md:text-[44px]">
      {count}
    </span>
    <span className="text-[15px] font-medium whitespace-nowrap text-muted">
      {label}
    </span>
  </div>
);

const Person = ({ brand, page }: { brand: Brand; page: Page }) => {
  const { items, user } = page;
  const head = standing(brand, page);
  const debug = debugFor(brand, page);
  const url = `${origin(brand)}/${user.handle}`;

  const count = (light: string) =>
    items.filter((item) => lightOf(item) === light).length;

  return (
    <section className="flex flex-col gap-5.5 px-5 pt-7 pb-10 md:gap-7 md:px-16 md:pt-16 md:pb-18">
      <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
        <div className="flex min-w-0 items-center gap-2">
          {user.x === undefined ? <GitHub /> : <X />}
          <span className="truncate text-lg font-[650] md:text-xl">
            {who(user)}
          </span>
          {user.rig !== undefined && user.rig.board !== "" && (
            <span className="hidden truncate text-muted md:inline">
              {user.rig.board}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4.5 bg-board px-4.5 py-3.5 text-silk">
          <Lights {...debug} className="gap-3" led="size-2.5" />
          <span className="silk text-silk">
            {debug.tone === "green" ? "ALL GREEN" : `${debug.lit} LIGHT ON`}
          </span>
        </div>
      </div>
      <Fit
        as="h1"
        cap={196}
        flow
        lead={0.86}
        lines={
          head.figure === undefined || head.figure === ""
            ? [head.title]
            : [head.figure, head.title]
        }
        track={-0.065}
      />
      <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        {user.note === "" ? (
          <span />
        ) : (
          <p className="max-w-[620px] text-[17px] md:text-xl">
            <Prose text={user.note} />
          </p>
        )}
        <div className="flex flex-col gap-6 lg:items-end lg:gap-8">
          <div className="flex gap-8 md:gap-10">
            <Stat
              count={items.length}
              label={items.length === 1 ? "ask" : "asks"}
            />
            <Stat count={count("sending")} label="on its way" />
            <Stat count={count("filled")} label="in" />
          </div>
          <div className="flex gap-2.5">
            <a className={solid} href={postList(brand, user.handle)}>
              <X /> Share on X
            </a>
            <Copy className={outline} text={url}>
              Copy link
            </Copy>
          </div>
        </div>
      </div>
    </section>
  );
};

const Asks = ({ page, site }: { page: Page; site: Brand }) => {
  const { items, user } = page;

  const first =
    site === "ram" ? items : items.filter((item) => item.kind === site);

  const also =
    first === items ? [] : items.filter((item) => item.kind !== site);

  const shown = first.length === 0 ? also : first;

  return (
    <section className="flex flex-col gap-5 px-5 pt-14 pb-16 md:gap-10 md:px-16 md:pt-30 md:pb-30">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <Fit
          cap={72}
          className="flex-1"
          lead={1}
          lines={["What it needs"]}
          track={-0.045}
        />
        {items.length > 1 && (
          <p className="text-muted md:text-lg">Most wanted first.</p>
        )}
      </div>
      <ol className="flex flex-col gap-4 md:gap-3">
        {shown.map((item) => (
          <AskRow item={item} key={item._id} owner={user} />
        ))}
      </ol>
      {first.length > 0 && also.length > 0 && (
        <>
          <Fit
            as="h3"
            cap={40}
            className="pt-8"
            lead={1}
            lines={["Also on the list"]}
            track={-0.04}
          />
          <ol className="flex flex-col gap-4 md:gap-3">
            {also.map((item) => (
              <AskRow item={item} key={item._id} owner={user} />
            ))}
          </ol>
        </>
      )}
      {items.length === 0 && (
        <p className="text-lg text-muted">Nothing on the list yet.</p>
      )}
    </section>
  );
};

export const ListPage = async ({ handle }: { handle: string }) => {
  const site = await here();
  const page = await listOf(handle);

  if (page === null) {
    const free = parsePath(handle);

    if (free === null) {
      notFound();
    }

    return <Missing brand={site} free={free} />;
  }

  if (page.user.handle !== handle) {
    permanentRedirect(`/${page.user.handle}`);
  }

  const brand = lead(site, page.items);
  const { rig } = page.user;

  return (
    <div>
      <Header here={site} />
      <main>
        <Person brand={brand} page={page} />
        {brand === "ram" && rig !== undefined && rig.slots.length > 0 && (
          <RigBoard
            debug={debugFor(brand, page)}
            items={page.items}
            rig={rig}
          />
        )}
        <Asks page={page} site={site} />
        <ChipIn owner={who(page.user)} pay={page.user.pay} />
        <Close brand={site} />
      </main>
      <Footer here={site} />
    </div>
  );
};
