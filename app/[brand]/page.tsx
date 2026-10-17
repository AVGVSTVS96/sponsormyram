import type { Metadata } from "next";
import Link from "next/link";

import { Start } from "@/app/ui/account";
import { cardImage, coldLists, standing } from "@/app/ui/cards";
import { boardOf, listOf } from "@/app/ui/data";
import { Fit } from "@/app/ui/fit";
import { Close, Footer, Header } from "@/app/ui/frame";
import { Bag, DimmTop, faceOf, Fitted, lightOf } from "@/app/ui/hardware";
import { here } from "@/app/ui/here";
import { GitHub, X } from "@/app/ui/icons";
import {
  Holes,
  Led,
  Lights,
  lightWords,
  Readout,
  readout,
} from "@/app/ui/lights";
import {
  onBoard,
  onBoardGhost,
  openFor,
  plural,
  shortOf,
  who,
} from "@/app/ui/parts";
import { emptyLight, Bank } from "@/app/ui/rig";
import { Rows } from "@/app/ui/rows";
import { sample, story } from "@/app/ui/story";
import type { Item, Person } from "@/convex/people";
import { brandList, brandOf, brands, domain } from "@/lib/brand";
import type { Brand } from "@/lib/brand";
import { kindLabels, size, title } from "@/lib/kinds";
import { origin } from "@/lib/origin";

export const ensureStatic = "navigation";

export const generateMetadata = async (): Promise<Metadata> => {
  const brand = await here();
  const { pitch, word } = brands[brand];

  return {
    alternates: { canonical: origin(brand) },
    description: pitch,
    openGraph: {
      images: await cardImage(brand, [], `Sponsor my ${word}`),
    },
    title: `Sponsor my ${word}`,
  };
};

type Page = NonNullable<Awaited<ReturnType<typeof listOf>>>;

type Board = Awaited<ReturnType<typeof boardOf>>;

const Owner = ({ person }: { person: Person }) => (
  <span className="flex min-w-0 items-center gap-2">
    {person.x === undefined ? <GitHub /> : <X />}
    <span className="truncate">{who(person)}</span>
  </span>
);

const shelfSize = (item: Item) => {
  if (lightOf(item) === "sending") {
    return "w-[220px] lg:w-[250px]";
  }

  return faceOf(item) === "ssd"
    ? "w-[280px] lg:w-[340px]"
    : "w-[170px] lg:w-[210px]";
};

const Shelf = ({ items }: { items: Item[] }) => (
  <div className="flex flex-col gap-7">
    {items.slice(0, 3).map((item) => (
      <div className="flex flex-col gap-3" key={item._id}>
        <Fitted ask={item} className={shelfSize(item)} light={lightOf(item)} />
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <Led className="size-2.5" light={lightOf(item)} />
          <span className="text-sm font-semibold">{title(item)}</span>
          <span className="silk text-silksub">{lightWords[lightOf(item)]}</span>
        </span>
      </div>
    ))}
  </div>
);

const debugOf = (brand: Brand, short: number) => {
  if (short === 0) {
    return { lit: "BOOT", tone: "green" } as const;
  }

  return { lit: brand === "ram" ? "DRAM" : "BOOT", tone: "red" } as const;
};

const Panel = ({ brand, page }: { brand: Brand; page: Page | null }) => {
  const short =
    page === null ? 0 : shortOf(brand, page.items, page.user.rig).gb;

  const { figure, unit } = readout(size(short));
  const shelf = page === null ? [] : openFor(brand, page.items);

  const drawn =
    brand === "ram" && (page === null || page.user.rig !== undefined);

  const rigSlots = page?.user.rig?.slots ?? [];
  const slots = rigSlots.length > 0 ? rigSlots : [0, 0, 0, 0];
  const debug = debugOf(brand, page === null ? 1 : short);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-8 lg:gap-9 lg:pt-1.5">
      <div className="flex items-center justify-between gap-4 lg:items-start">
        <Lights {...debug} className="gap-4 lg:gap-5.5" power />
        <div className="flex flex-col items-end gap-2.5">
          <Readout
            className="h-11 lg:h-21"
            frame="px-3 py-2.5 lg:px-5.5 lg:py-4.5"
            text={page === null ? "--" : figure}
          />
          <span className="silk text-[10px] text-silk lg:text-xs">
            {page === null ? "NOT LISTED YET" : `${unit} SHORT`}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:gap-11">
        {drawn ? (
          <Bank
            empty={page === null ? "off" : emptyLight(page.items)}
            height={slots.length > 4 ? "h-40" : "h-50 lg:h-62.5"}
            slots={slots}
          />
        ) : (
          <Shelf
            items={(page?.items ?? []).filter(
              (item) => brandOf(item.kind) === brand
            )}
          />
        )}
        <div className="flex max-w-[300px] flex-col gap-4 pb-1.5 sm:w-[250px]">
          {page === null ? (
            <p className="text-silksub">
              Nobody has listed yet. The first list lights this board.
            </p>
          ) : (
            <>
              <Link
                className="text-lg font-[650] hover:underline"
                href={`/${page.user.handle}`}
              >
                <Owner person={page.user} />
              </Link>
              <p className="text-silksub">{story(brand, page, shelf.length)}</p>
              <Link
                className="self-start font-semibold link"
                href={`/${page.user.handle}`}
              >
                See the {plural(page.items.length, "ask")}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Hero = ({ brand, page }: { brand: Brand; page: Page | null }) => (
  <section className="relative flex flex-col gap-12 bg-board px-5 pt-8 pb-11 text-silk md:px-16 md:pt-26 md:pb-28 lg:flex-row lg:gap-18">
    <Holes />
    <span className="flex items-center gap-2.5 md:absolute md:top-10.5 md:left-16">
      <Led className="size-2" light="filled" />
      <span className="silk text-silksub">
        PWR&nbsp;&nbsp;&nbsp;SPONSORMY{brand.toUpperCase()} REV 4.0
      </span>
    </span>
    <div className="flex flex-col gap-6 md:gap-8 lg:w-[44%] lg:max-w-[560px] lg:shrink-0 lg:pt-2">
      <Fit
        as="h1"
        cap={136}
        lead={0.9}
        lines={["Sponsor", `my ${brands[brand].word}.`]}
        track={-0.055}
      />
      <p className="max-w-[520px] text-[17px] leading-normal md:text-xl">
        {brands[brand].pitch}
      </p>
      <div className="flex flex-col gap-2.5 pt-2 sm:flex-row sm:gap-3">
        <Start brand={brand} styles={[onBoard, onBoardGhost]} />
      </div>
      <p className="text-[15px] text-silksub">
        Your page lives at {domain(origin("ram"))}/yourhandle.
      </p>
    </div>
    <Panel brand={brand} page={page} />
  </section>
);

const taken = (count: number) =>
  [
    "None",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
  ][Math.min(count, 10)] ?? "Ten";

const TenSlot = ({ brand, on }: { brand: Brand; on: boolean }) => {
  if (brand === "ram") {
    return <DimmTop className="h-27.5 md:h-37.5" filled={on} />;
  }

  return (
    <Fitted
      ask={sample[brand]}
      className={brand === "hdd" ? "h-16 md:h-20" : "h-9 md:h-11"}
      light={on ? "filled" : "open"}
    />
  );
};

const Ten = ({ board, brand }: { board: Board; brand: Brand }) => {
  const count = Math.min(board.totals.lists, 10);
  const newest = board.lists.at(-1);

  return (
    <div className="relative flex flex-col gap-6 bg-board px-6 pt-7 pb-8 text-silk md:flex-row md:items-end md:justify-between md:gap-10 md:px-18 md:pt-18 md:pb-11">
      <Holes />
      <span className="silk text-silksub md:absolute md:top-7 md:left-18">
        FIRST TEN LISTS
      </span>
      <div className="flex items-center justify-between gap-4 md:flex-col md:items-start md:gap-2.5">
        <div className="flex flex-col gap-2.5">
          <Readout
            className="h-8 md:h-14"
            frame="p-2 md:p-3"
            text={String(count).padStart(2, "0")}
            tone="green"
          />
          <span className="silk text-silk">OF 10 LISTS</span>
        </div>
        {newest !== undefined && (
          <Link
            className="min-w-0 pt-3 text-[15px] font-[650] hover:underline"
            href={`/${newest.handle}`}
          >
            <Owner person={newest} />
          </Link>
        )}
      </div>
      <ol
        className={`grid gap-x-3 gap-y-6 md:max-w-[1000px] md:flex-1 ${brand === "ram" ? "grid-cols-5 md:grid-cols-10 md:gap-x-6" : "grid-cols-2 md:grid-cols-5 md:gap-x-8"}`}
      >
        {Array.from({ length: 10 }, (_, index) => {
          const owner = board.lists[index];

          const slot = (
            <>
              <Led
                className="size-2.5"
                light={index < count ? "filled" : "off"}
              />
              <TenSlot brand={brand} on={index < count} />
              <span
                className={`silk ${index < count ? "text-silk" : "text-silksub"}`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </>
          );

          return (
            <li className="flex justify-center" key={index}>
              {owner === undefined ? (
                <span className="flex flex-col items-center gap-2">{slot}</span>
              ) : (
                <Link
                  aria-label={`${who(owner)}'s list`}
                  className="flex flex-col items-center gap-2"
                  href={`/${owner.handle}`}
                >
                  {slot}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

const PartLights = ({ boards }: { boards: Board[] }) => (
  <ul className="flex flex-wrap gap-x-3.5 gap-y-4 md:gap-x-5.5">
    {brandList.flatMap((kind, at) =>
      (boards[at]?.parts ?? []).map((light, index) => (
        <li
          className="flex flex-col items-center gap-2"
          key={`${kind}-${index}`}
        >
          <Led className="size-5 md:size-6.5" light={light} />
          <span className="text-[13px] font-medium text-muted">
            {kindLabels[kind]}
          </span>
        </li>
      ))
    )}
  </ul>
);

const Status = ({ boards }: { boards: Board[] }) => {
  const total = (pick: (board: Board) => number) =>
    boards.reduce((sum, board) => sum + pick(board), 0);

  const cells = [
    [String(total((board) => board.totals.sticks)), "PARTS ASKED", "red"],
    ...brandList.map((kind, at) => {
      const { figure, unit } = readout(size(boards[at]?.totals.short ?? 0));

      return [
        figure,
        `${unit} OF ${{ hdd: "DRIVES", ram: "RAM", ssd: "SSD" }[kind]}`,
        "red",
      ] as const;
    }),
    [String(total((board) => board.totals.filled)), "SENT SO FAR", "green"],
  ] as const;

  return (
    <div className="relative grid grid-cols-2 gap-x-4.5 gap-y-6 bg-board px-5 py-7 text-silk sm:grid-cols-3 md:px-18 md:pt-16 md:pb-12 lg:flex lg:items-end lg:justify-between">
      <Holes />
      <span className="hidden silk text-silksub md:absolute md:top-6.5 md:left-18 md:block">
        STATUS&nbsp;&nbsp;&nbsp;ALL LISTS
      </span>
      {cells.map(([figure, label, tone]) => (
        <div className="flex flex-col gap-3" key={label}>
          <Readout
            className="h-10 md:h-16"
            frame="p-2.5 md:p-3.5"
            text={figure.length === 1 ? `0${figure}` : figure}
            tone={tone}
          />
          <span className="silk text-silk">{label}</span>
        </div>
      ))}
    </div>
  );
};

const Founding = ({
  board,
  boards,
  brand,
}: {
  board: Board;
  boards: Board[];
  brand: Brand;
}) => (
  <section className="flex flex-col gap-8 px-5 py-18 md:gap-12 md:px-16 md:py-35">
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
      <Fit
        className="min-w-0 flex-1"
        cap={92}
        flow
        lead={0.95}
        lines={["Ten slots.", `${taken(board.totals.lists)} taken.`]}
      />
      <p className="text-[17px] md:text-lg lg:w-[340px]">
        The first ten lists light up this board. At ten, it turns into the live
        count of everything everyone is&nbsp;short.
      </p>
    </div>
    <Ten board={board} brand={brand} />
    <div className="flex flex-col gap-4 pt-4 md:gap-6 md:pt-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <Fit
          cap={40}
          className="flex-1"
          lead={1.05}
          lines={["One light", "per part"]}
          flow
          track={-0.04}
        />
        <p className="text-muted">
          Red is still needed. Gold is on its way. Green is&nbsp;in.
        </p>
      </div>
      <PartLights boards={boards} />
    </div>
    <Status boards={boards} />
  </section>
);

const Everyone = ({
  board,
  boards,
  brand,
}: {
  board: Board;
  boards: Board[];
  brand: Brand;
}) => (
  <section className="flex flex-col gap-8 px-5 py-18 md:gap-12 md:px-16 md:py-35">
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
      <Fit
        className="min-w-0 flex-1"
        cap={92}
        flow
        lead={0.95}
        lines={["Everyone is", `${size(board.totals.short)} short.`]}
      />
      <p className="text-[17px] md:text-lg lg:w-[340px]">
        {plural(board.totals.lists, "list")} asking for {brands[brand].word}{" "}
        right now. Every part asked for gets a light: red is still needed, gold
        is on its way, green is&nbsp;in.
      </p>
    </div>
    <Status boards={boards} />
    <PartLights boards={boards} />
    <div className="flex flex-col gap-6 pt-6">
      <Fit cap={40} lead={1.05} lines={["Newest asks"]} track={-0.04} />
      <Rows entries={board.feed} />
    </div>
  </section>
);

const steps = [
  [
    "List it.",
    "Pick the sticks, drives and SSDs your rig is missing. Every item gets its own page and share card.",
  ],
  [
    "Post it.",
    "Put your card on X. Every card already links to the right domain.",
  ],
  [
    "Someone’s sending it.",
    "They tap I’m sending it and their handle goes on it in a gold outline. The address stays in X DMs.",
  ],
  ["It’s in.", "You turn it solid gold, for good, and thank them in a post."],
] as const;

const Mini = ({ brand, page }: { brand: Brand; page: Page | null }) => {
  const head = page === null ? null : standing(brand, page);
  const { figure } = readout(head?.figure ?? "");

  return (
    <div className="flex aspect-[1200/630] w-[260px] flex-col justify-between bg-board px-3.5 py-3 text-silk">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[10px] font-medium text-silksub">
          {page === null ? domain(origin(brand)) : who(page.user)}
        </span>
        <Lights
          className="gap-1.5"
          led="size-1.5"
          lit={brand === "ram" ? "DRAM" : "BOOT"}
        />
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-[33px] leading-[0.9] font-extrabold tracking-[-0.05em] whitespace-nowrap">
          {head === null
            ? `My ${brands[brand].word}.`
            : `${head.figure ?? ""}${head.figure === undefined ? "" : " "}${head.title}`}
        </span>
        {head?.figure !== undefined && head.title === "short." && (
          <Readout className="h-4" frame="p-1" text={figure} />
        )}
      </div>
    </div>
  );
};

const HowItGoes = ({ brand, page }: { brand: Brand; page: Page | null }) => {
  const ask = sample[brand];

  const art = [
    <div className="flex items-end gap-3" key="list">
      <Led className="size-3.5" light="open" />
      <Fitted ask={ask} className="w-[230px] text-ink" light="open" />
    </div>,
    <Mini brand={brand} key="post" page={page} />,
    <div className="flex items-end gap-3" key="send">
      <Led className="size-3.5" light="sending" />
      <Bag className="w-[210px]" kind={faceOf(ask)} />
    </div>,
    <div className="flex flex-col gap-2.5" key="in">
      <div className="flex items-end gap-3">
        <Led className="size-3.5" light="filled" />
        <Fitted ask={ask} className="w-[230px]" light="filled" />
      </div>
      <span className="inline-flex h-7.5 items-center self-start bg-gold px-2.5 text-[13px] font-semibold text-coal">
        Sponsored
      </span>
    </div>,
  ];

  return (
    <section className="flex flex-col gap-12 bg-surf px-5 py-18 on-paper md:gap-16 md:px-16 md:py-30">
      <Fit cap={64} lead={1} lines={["How it goes"]} track={-0.045} />
      <ol className="grid gap-12 md:grid-cols-2 md:gap-x-10 xl:grid-cols-4">
        {steps.map(([heading, body], index) => (
          <li className="flex flex-col gap-7 md:max-w-[340px]" key={heading}>
            <div className="flex md:h-[150px] md:items-end">{art[index]}</div>
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl leading-tight font-bold tracking-[-0.02em] whitespace-nowrap">
                {heading}
              </h3>
              <p className="text-[17px]">{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};

const Landing = async () => {
  const brand = await here();
  const boards = await Promise.all(brandList.map(boardOf));
  const board = boards[brandList.indexOf(brand)] ?? boards[0];

  if (board === undefined) {
    return null;
  }

  const cold = board.totals.lists < coldLists;
  const featured = cold ? (board.first ?? board.latest) : board.latest;
  const page = featured === null ? null : await listOf(featured.handle);

  return (
    <div>
      <Header here={brand} />
      <main>
        <Hero brand={brand} page={page} />
        {cold ? (
          <Founding board={board} boards={boards} brand={brand} />
        ) : (
          <Everyone board={board} boards={boards} brand={brand} />
        )}
        <HowItGoes brand={brand} page={page} />
        <Close brand={brand} />
      </main>
      <Footer here={brand} />
    </div>
  );
};

export default Landing;
