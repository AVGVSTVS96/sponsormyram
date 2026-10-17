import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";

import { cardImage } from "@/app/ui/cards";
import { askOf, listOf } from "@/app/ui/data";
import { Fit } from "@/app/ui/fit";
import { Close, Footer, Header } from "@/app/ui/frame";
import {
  faceOf,
  Fitted,
  lightOf,
  Part,
  Seated,
  stickerOf,
} from "@/app/ui/hardware";
import type { Light } from "@/app/ui/hardware";
import { here } from "@/app/ui/here";
import { X } from "@/app/ui/icons";
import { Holes, Led, Lights, lightWords, Readout } from "@/app/ui/lights";
import {
  itemUrl,
  outline,
  postItem,
  solid,
  StateChip,
  stores,
  who,
} from "@/app/ui/parts";
import { Prose } from "@/app/ui/prose";
import { portOf } from "@/app/ui/rig";
import { Cell } from "@/app/ui/rows";
import { Sponsor } from "@/app/ui/sponsor";
import type { Item } from "@/convex/people";
import { brandOf, brands } from "@/lib/brand";
import { parsePath } from "@/lib/handle";
import { conditions, specRows, title, titleLines } from "@/lib/kinds";

type Loaded = NonNullable<Awaited<ReturnType<typeof askOf>>>;

type Owner = Loaded["user"];

const date = (at: number) =>
  new Date(at).toLocaleDateString("en-US", { day: "numeric", month: "short" });

export const itemMetadata = async (
  handle: string,
  slug: string
): Promise<Metadata> => {
  const site = await here();
  const loaded = await askOf(handle, slug);

  if (loaded === null || loaded.found === null) {
    return {};
  }

  const { user } = loaded;
  const { item } = loaded.found;

  return {
    alternates: { canonical: itemUrl(user.handle, item) },
    description: item.note === "" ? `${who(user)} needs this.` : item.note,
    openGraph: {
      images: await cardImage(site, [user.handle, item.slug], title(item)),
    },
    robots: user.hidden ? { index: false } : undefined,
    title: `${title(item)} · Sponsor my ${brands[brandOf(item.kind)].word}`,
  };
};

const Art = ({ item, light }: { item: Item; light: Light }) => {
  const face = faceOf(item);
  const label = stickerOf(item);

  const width =
    face === "hdd" || face === "sata"
      ? "w-[46%] max-w-[300px]"
      : "w-[78%] max-w-[520px]";

  if (light === "filled") {
    return <Fitted ask={item} className={width} light="filled" />;
  }

  const drawn =
    face === "ram" ? (
      <Seated className="w-full" label={label} state="hover" />
    ) : (
      <Part className="w-full" kind={face} label={label} />
    );

  return (
    <div
      className={`flex ${width} ${light === "sending" ? "border-2 border-dashed border-gold p-3 md:p-4" : ""}`}
    >
      {drawn}
    </div>
  );
};

const counts = {
  hdd: "DRIVES",
  other: "PARTS",
  ram: "STICKS",
  ssd: "DRIVES",
} satisfies Record<Item["kind"], string>;

const Stage = ({ item, owner }: { item: Item; owner: Owner }) => {
  const light = lightOf(item);
  const parts = counts[item.kind];

  return (
    <div className="relative flex min-h-[300px] items-center justify-center bg-board px-5 pt-16 pb-10 text-silk md:min-h-[480px] lg:min-h-[720px] lg:w-1/2 lg:shrink-0">
      <Holes />
      <span className="absolute top-5 left-5 flex items-center gap-2.5 md:top-10 md:left-16">
        <Led className="size-2.5 md:size-3" light={light} />
        <span
          className={`silk text-xs ${light === "sending" ? "text-gold" : "text-silk"}`}
        >
          {portOf(item, owner.rig)}&nbsp;&nbsp;&nbsp;
          {lightWords[light].toUpperCase()}
        </span>
      </span>
      <span className="absolute top-4 right-5 flex flex-col items-end gap-2 md:top-10 md:right-16">
        <Readout
          className="h-7.5 md:h-16"
          frame="p-1.5 md:p-3"
          text={String(item.count).padStart(2, "0")}
          tone={light === "filled" ? "green" : "red"}
        />
        <span className="hidden silk text-silk md:block">{parts}</span>
      </span>
      <span className="absolute bottom-12 left-16 hidden lg:block">
        <Lights
          className="gap-4.5"
          led="size-3"
          lit={item.kind === "ram" ? "DRAM" : "BOOT"}
          tone={light === "filled" ? "green" : "red"}
        />
      </span>
      <Art item={item} light={light} />
    </div>
  );
};

const Status = ({ item }: { item: Item }) => {
  if (item.sponsor !== undefined) {
    return (
      <div className="flex flex-col gap-3">
        <StateChip item={item} />
        <p className="text-lg text-muted">In since {date(item.sponsor.at)}.</p>
      </div>
    );
  }

  if (item.sending !== undefined) {
    return (
      <div className="flex flex-col gap-3">
        <StateChip item={item} />
        <p className="text-lg text-muted">It turns gold when it&nbsp;lands.</p>
      </div>
    );
  }

  return (
    <p className="text-lg text-muted">Open. Nobody is on this one&nbsp;yet.</p>
  );
};

const Specs = ({ item, owner }: { item: Item; owner: Owner }) => {
  const rows = [
    ...specRows(item),
    ["Condition", conditions[item.condition].spec],
    ...(item.kind === "ram" && owner.rig !== undefined && owner.rig.board !== ""
      ? [["Goes in", owner.rig.board]]
      : []),
    ...(item.note === "" ? [] : [["Why", item.note]]),
  ];

  return (
    <dl className="flex flex-col border-t border-rule">
      {rows.map(([term = "", detail = ""]) => (
        <div
          className="flex flex-col gap-1 border-b border-rule py-3 sm:flex-row sm:gap-6 sm:py-3.5"
          key={term}
        >
          <dt className="text-sm font-medium text-muted sm:w-[140px] sm:shrink-0 sm:pt-0.5 sm:text-base">
            {term}
          </dt>
          <dd className="text-[17px]">
            <Prose text={detail} />
          </dd>
        </div>
      ))}
    </dl>
  );
};

const Actions = ({ item, owner }: { item: Item; owner: Owner }) => {
  const share = (
    <a className={outline} href={postItem(owner.handle, item)}>
      <X /> Share on X
    </a>
  );

  if (item.sponsor !== undefined) {
    return <div className="flex flex-col gap-2.5">{share}</div>;
  }

  if (item.sending !== undefined) {
    return (
      <div className="flex flex-col gap-2.5">
        {share}
        <p className="text-[15px] text-muted">
          {who(item.sending.by)} said they’re sending this. You can still share
          it, or look at the rest of the&nbsp;list.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <Sponsor className={solid} item={item} owner={owner}>
        I’m sending it
      </Sponsor>
      {share}
      <p className="text-[15px] text-muted">
        {owner.x === undefined
          ? "Tap it and your handle goes on it. Sort out the address through their GitHub; this site never asks."
          : `Tap it, then DM ${who(owner)} for the address. Addresses stay in X DMs; this site never asks.`}
      </p>
    </div>
  );
};

const Buy = ({ item }: { item: Item }) => (
  <div className="flex flex-col gap-3">
    <h2 className="text-lg font-semibold">Or buy one for them</h2>
    <div className="flex gap-6 font-medium">
      {stores(item).map(([store, href]) => (
        <a
          className="link"
          href={href}
          key={store}
          rel="noreferrer"
          target="_blank"
        >
          Search {store}
        </a>
      ))}
    </div>
    <p className="text-[15px] text-muted">
      Plain searches, no affiliate tags. Nothing is sold&nbsp;here.
    </p>
  </div>
);

const More = ({
  item,
  items,
  owner,
}: {
  item: Item;
  items: Item[];
  owner: Owner;
}) => {
  const others = items.filter((each) => each._id !== item._id);

  if (others.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-8 px-5 py-16 on-paper md:gap-10 md:px-16 md:py-30">
      <Fit
        cap={72}
        flow
        lead={1}
        lines={["More on", `${who(owner)}’s list`]}
        track={-0.045}
      />
      <ul className="grid gap-x-12 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
        {others.map((each) => (
          <li key={each._id}>
            <Link
              className="group flex flex-col gap-4"
              href={`/${owner.handle}/${each.slug}`}
            >
              <Cell className="h-[200px]" item={each} />
              <StateChip item={each} />
              {lightOf(each) === "open" && (
                <span className="text-[15px] text-muted">
                  {conditions[each.condition].chip}
                </span>
              )}
              <Fit
                as="h3"
                cap={30}
                className="font-bold group-hover:underline"
                flow
                lead={1.1}
                lines={titleLines(each)}
                track={-0.03}
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export const ItemPage = async ({
  handle,
  slug,
}: {
  handle: string;
  slug: string;
}) => {
  const site = await here();
  const loaded = await askOf(handle, slug);

  if (loaded === null) {
    if (parsePath(handle) === null) {
      notFound();
    }

    redirect(`/${handle}`);
  }

  const { found, user } = loaded;

  if (found === null) {
    redirect(`/${user.handle}`);
  }

  if (user.handle !== handle || found.item.slug !== slug) {
    permanentRedirect(`/${user.handle}/${found.item.slug}`);
  }

  const { item } = found;
  const page = await listOf(user.handle);
  const items = page?.items ?? [];

  return (
    <div>
      <Header here={site} />
      <main>
        <section className="flex flex-col on-paper lg:flex-row">
          <Stage item={item} owner={user} />
          <div className="flex min-w-0 flex-1 flex-col gap-7 px-5 pt-8 pb-14 md:gap-8 md:px-16 md:pt-16 md:pb-20">
            <Link
              className="self-start font-medium link"
              href={`/${user.handle}`}
            >
              {who(user)}’s list
            </Link>
            <Fit
              as="h1"
              cap={96}
              className={item.sponsor === undefined ? "" : "text-muted"}
              flow
              lead={0.92}
              lines={titleLines(item)}
            />
            <Status item={item} />
            <Specs item={item} owner={user} />
            <Actions item={item} owner={user} />
            {lightOf(item) === "open" && <Buy item={item} />}
            {user.pay.length > 0 && (
              <Link
                className="self-start font-medium link"
                href={`/${user.handle}#chip-in`}
              >
                Or chip in money
              </Link>
            )}
          </div>
        </section>
        <More item={item} items={items} owner={user} />
        <Close brand={site} />
      </main>
      <Footer here={site} />
    </div>
  );
};
