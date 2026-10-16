import type { Metadata } from "next";
import Link from "next/link";

import { AuthLink } from "@/app/ui/account";
import { Ago } from "@/app/ui/ago";
import { cardImage, coldLists, standing } from "@/app/ui/cards";
import { boardOf, listOf } from "@/app/ui/data";
import { Footer, Header } from "@/app/ui/frame";
import { Slot } from "@/app/ui/glyphs";
import { here } from "@/app/ui/here";
import {
  Chips,
  number,
  outline,
  plural,
  postItem,
  solid,
  sponsorItem,
} from "@/app/ui/parts";
import { installed } from "@/app/ui/rig";
import { brands, domain } from "@/lib/brand";
import type { Brand } from "@/lib/brand";
import { size, title } from "@/lib/kinds";
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
    "Get it filled.",
    "Someone ships you the part. You mark it sponsored and their handle goes on it in gold, for good.",
  ],
];

const Featured = async ({
  brand,
  handle,
}: {
  brand: Brand;
  handle: string;
}) => {
  const page = await listOf(handle);

  if (page === null) {
    return null;
  }

  const { items, user } = page;
  const shown = standing(brand, page);
  const rig = brand === "ram" ? user.rig : undefined;
  const open = items.filter((item) => item.sponsor === undefined);

  return (
    <div className="flex w-full shrink-0 flex-col border-2 border-ink md:w-[600px]">
      <div className="flex flex-col gap-5 p-4 pb-6 md:px-6 md:pt-6 md:pb-7">
        <div className="flex justify-between gap-4 label">
          <span>@{user.handle}</span>
          <span className="text-muted">
            {plural(open.length, "ask")} · {items.length - open.length} filled
          </span>
        </div>
        <span className="text-[56px] leading-[50px] font-extrabold tracking-[-0.05em] md:text-[64px] md:leading-[58px]">
          <span className="text-pcb">{shown.figure}</span> {shown.title}
        </span>
      </div>
      {rig !== undefined && rig.slots.length > 0 && (
        <div className="flex flex-col gap-2 px-4 pb-6 md:px-6">
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 label text-muted">
            <span>{rig.board}</span>
            <span>
              {installed(rig)} of {rig.maxGB}GB
            </span>
          </div>
          <div className="flex h-4 gap-0.5">
            <div
              className="bg-ink"
              style={{
                width: `${Math.min(100, (installed(rig) / Math.max(rig.maxGB, 1)) * 100)}%`,
              }}
            />
            <div className="flex-1 border-2 border-dashed border-ink" />
          </div>
        </div>
      )}
      <ol>
        {open.slice(0, 3).map((item) => {
          const sponsor = sponsorItem(user.handle, user.x, item);

          return (
            <li
              className="flex flex-col gap-3 border-t border-rule px-4 py-4 md:flex-row md:items-center md:gap-4 md:px-6"
              key={item._id}
            >
              <span className="hidden w-6 label text-muted md:block">
                {number(items.indexOf(item))}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Link
                  className="title hover:underline"
                  href={`/${user.handle}/${item.slug}`}
                >
                  {title(item)}
                </Link>
                <div className="hidden md:block">
                  <Chips item={item} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="label text-muted md:hidden">
                  {number(items.indexOf(item))}
                </span>
                <div className="flex-1 md:hidden">
                  <Chips item={item} />
                </div>
                <a
                  className={sponsor === null ? outline : solid}
                  href={sponsor ?? postItem(user.handle, item)}
                >
                  {sponsor === null ? "Share" : "Sponsor →"}
                </a>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="flex items-center justify-between gap-4 border-t-2 border-ink px-4 py-4 md:px-6">
        <span className="truncate label text-muted">
          <span className="hidden md:inline">{domain(origin(brand))}</span>/
          {user.handle}
        </span>
        <Link
          className="font-bold whitespace-nowrap underline underline-offset-4"
          href={`/${user.handle}`}
        >
          See all {plural(items.length, "ask")} →
        </Link>
      </div>
    </div>
  );
};

const Landing = async () => {
  const brand = await here();
  const { bay, part, pitch, word } = brands[brand];
  const board = await boardOf(brand);
  const cold = board.totals.lists < coldLists;
  const featured = cold ? board.first : null;

  const feed = board.feed.filter(
    ({ owner }) => featured === null || owner.handle !== featured
  );

  return (
    <div>
      <Header here={brand} />
      <main className="flex flex-1 flex-col">
        <section className="flex flex-col justify-between gap-12 px-6 pt-16 pb-14 md:flex-row md:items-end md:px-16 md:pt-24">
          <div className="flex max-w-[560px] flex-col gap-6">
            <h1 className="display">
              Sponsor
              <br />
              my {word}.
            </h1>
            <p>{pitch}</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <AuthLink brand={brand} className={solid}>
                Make your list →
              </AuthLink>
              {board.latest !== null && (
                <Link className={outline} href={`/${board.latest}`}>
                  See one: @{board.latest}
                </Link>
              )}
            </div>
          </div>
          {cold ? (
            featured !== null && <Featured brand={brand} handle={featured} />
          ) : (
            <div className="flex flex-col gap-2 md:items-end">
              <span className="label text-muted">Collectively short</span>
              <span className="display text-pcb">
                {size(board.totals.short)}
              </span>
              <span className="label text-muted">
                of {word} · {plural(board.totals.lists, "list")}
              </span>
            </div>
          )}
        </section>

        {!cold && (
          <section className="flex flex-col gap-4 border-t-2 border-ink px-6 py-10 md:px-16">
            <div className="flex flex-wrap justify-between gap-2 label">
              <span>
                Every {part} asked for on the site, one {bay} each
              </span>
              <span className="text-muted">
                {board.totals.filled} of {board.totals.sticks} filled
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {board.slots.map((filled, index) => (
                <Slot brand={brand} filled={filled} key={index} />
              ))}
            </div>
          </section>
        )}

        {(feed.length > 0 || featured === null) && (
          <section className="border-t-2 border-ink px-6 py-12 md:px-16">
            <div className="flex items-baseline justify-between pb-6">
              <h2 className="title">Who needs {word} right now</h2>
              <span className="hidden label text-muted md:block">
                Newest first
              </span>
            </div>
            <ol>
              {feed.map(({ item, owner }, index) => {
                const sponsor =
                  item.sponsor === undefined
                    ? sponsorItem(owner.handle, owner.x, item)
                    : null;

                return (
                  <li
                    className="flex items-center gap-6 border-t border-rule py-6 md:gap-16"
                    key={item._id}
                  >
                    <span className="hidden w-8 label text-muted md:block">
                      {number(index)}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <Link
                        className={`title hover:underline ${item.sponsor === undefined ? "" : "text-muted"}`}
                        href={`/${owner.handle}/${item.slug}`}
                      >
                        {title(item)}
                      </Link>
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="label text-muted">
                          <Link
                            className="text-ink hover:underline"
                            href={`/${owner.handle}`}
                          >
                            @{owner.handle}
                          </Link>{" "}
                          · <Ago time={item._creationTime} />
                        </span>
                        <Chips item={item} />
                      </div>
                    </div>
                    {sponsor === null ? (
                      <a
                        className={outline}
                        href={postItem(owner.handle, item)}
                      >
                        Share
                      </a>
                    ) : (
                      <a className={solid} href={sponsor}>
                        Sponsor →
                      </a>
                    )}
                  </li>
                );
              })}
            </ol>
            {feed.length === 0 && (
              <p className="border-t border-rule py-6 text-muted">
                Nobody has asked for {word} yet. Be the first; it takes a
                minute.
              </p>
            )}
          </section>
        )}

        <section className="grid grid-cols-1 gap-10 border-t-2 border-ink px-6 py-14 md:grid-cols-3 md:px-16">
          {steps.map(([heading, body], index) => (
            <div className="flex max-w-[360px] flex-col gap-3" key={heading}>
              <span className="label text-muted">{number(index)}</span>
              <h3 className="title">{heading}</h3>
              <p>{body}</p>
            </div>
          ))}
        </section>
      </main>
      <Footer here={brand} />
    </div>
  );
};

export default Landing;
