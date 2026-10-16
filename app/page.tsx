import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import Link from "next/link";

import { api } from "@/convex/_generated/api";
import { brands, domain } from "@/lib/brand";
import type { Site } from "@/lib/brand";
import { size, title } from "@/lib/kinds";

import { AuthLink, Footer, Header } from "./ui/frame";
import { Slot } from "./ui/glyphs";
import { here } from "./ui/here";
import {
  ago,
  Chips,
  number,
  outline,
  postItem,
  solid,
  sponsorItem,
} from "./ui/parts";

export const generateMetadata = async (): Promise<Metadata> => {
  const site = await here();
  const { word, pitch } = brands[site.brand];

  return {
    alternates: { canonical: site.origin(site.brand) },
    description: pitch,
    title: `Sponsor my ${word}`,
  };
};

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

const steps = (origin: Site["origin"]) => [
  [
    "List it.",
    "Pick the sticks, drives and SSDs your rig is missing. Every item gets its own page and share card.",
  ],
  [
    "Post it.",
    `Put the card on X. RAM asks link from ${domain(origin("ram"))}, SSDs from ${domain(origin("ssd"))}, drives from ${domain(origin("hdd"))}.`,
  ],
  [
    "Get it filled.",
    "Someone ships you the part. You mark it sponsored and their handle goes on it in gold, for good.",
  ],
];

const Landing = async () => {
  const site = await here();
  const { bay, part, pitch, word } = brands[site.brand];
  const board = await fetchQuery(api.items.board, { kind: site.brand });

  return (
    <div>
      <Header here={site} />
      <main className="flex flex-1 flex-col">
        <section className="flex flex-col justify-between gap-12 px-6 pt-16 pb-14 md:flex-row md:items-end md:px-16 md:pt-24">
          <div className="flex max-w-[560px] flex-col gap-6">
            <h1 className="display">
              Sponsor
              <br />
              my {word}.
            </h1>
            <p>{pitch}</p>
            <div className="flex flex-wrap gap-2">
              <AuthLink className={solid} here={site}>
                Make your list →
              </AuthLink>
              <Link className={outline} href="/avgvstvs96">
                See one: @AVGVSTVS96
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <span className="label text-muted">Collectively short</span>
            <span className="display text-pcb">{size(board.totals.short)}</span>
            <span className="label text-muted">
              of {word} · {plural(board.totals.lists, "list")}
            </span>
          </div>
        </section>

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
              <Slot brand={site.brand} filled={filled} key={index} />
            ))}
          </div>
        </section>

        <section className="border-t-2 border-ink px-6 py-12 md:px-16">
          <div className="flex items-baseline justify-between pb-6">
            <h2 className="title">Who needs {word} right now</h2>
            <span className="hidden label text-muted md:block">
              Newest first
            </span>
          </div>
          <ol>
            {board.feed.map(({ item, owner }, index) => {
              const sponsor =
                item.sponsor === undefined
                  ? sponsorItem(site, owner.handle, owner.x, item)
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
                        · {ago(item._creationTime)}
                      </span>
                      <Chips item={item} />
                    </div>
                  </div>
                  {sponsor === null ? (
                    <a
                      className={outline}
                      href={postItem(site, owner.handle, item)}
                    >
                      Post it
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
          {board.feed.length === 0 && (
            <p className="border-t border-rule py-6 text-muted">
              Nobody has asked for {word} yet. Be the first; it takes a minute.
            </p>
          )}
        </section>

        <section className="grid grid-cols-1 gap-10 border-t-2 border-ink px-6 py-14 md:grid-cols-3 md:px-16">
          {steps(site.origin).map(([heading, body], index) => (
            <div className="flex max-w-[360px] flex-col gap-3" key={heading}>
              <span className="label text-muted">{number(index)}</span>
              <h3 className="title">{heading}</h3>
              <p>{body}</p>
            </div>
          ))}
        </section>
      </main>
      <Footer here={site} />
    </div>
  );
};

export default Landing;
