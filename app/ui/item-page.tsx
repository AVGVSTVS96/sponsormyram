import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";

import { cardImage } from "@/app/ui/cards";
import { askOf } from "@/app/ui/data";
import { Footer, Header } from "@/app/ui/frame";
import { Strip } from "@/app/ui/glyphs";
import { here } from "@/app/ui/here";
import { itemUrl, number, outline, postItem, solid, who } from "@/app/ui/parts";
import { Sponsor } from "@/app/ui/sponsor";
import type { Item } from "@/convex/people";
import { brandOf, brands } from "@/lib/brand";
import { parsePath } from "@/lib/handle";
import { conditions, specRows, title } from "@/lib/kinds";

const stamp = (at: number) =>
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

const Stamp = ({ item }: { item: Item }) => {
  const place =
    "mt-6 inline-flex -rotate-3 flex-col items-center gap-1 rounded-chip border-2 px-6 py-3 motion-safe:animate-stamp md:absolute md:top-0 md:right-0 md:mt-0";

  if (item.sponsor !== undefined) {
    return (
      <div className={`${place} border-coal bg-gold text-coal`}>
        <span className="font-mono text-2xl font-bold tracking-[0.12em] uppercase">
          Sponsored
        </span>
        <span className="label">
          {item.sponsor.by === null ? "Filled" : `By ${who(item.sponsor.by)}`} ·{" "}
          {stamp(item.sponsor.at)}
        </span>
      </div>
    );
  }

  if (item.sending !== undefined) {
    return (
      <div className={`${place} border-gold bg-paper`}>
        <span className="font-mono text-2xl font-bold tracking-[0.12em] uppercase">
          On its way
        </span>
        <span className="label">
          {who(item.sending.by)} is sending this · {stamp(item.sending.at)}
        </span>
      </div>
    );
  }

  return null;
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

  const { index, item, total } = found;
  const owner = who(user);
  const open = item.sponsor === undefined && item.sending === undefined;

  const rows = [
    ...specRows(item),
    ["Condition", conditions[item.condition].spec],
    ...(item.kind === "ram" && user.rig !== undefined
      ? [["Goes in", user.rig.board]]
      : []),
    ...(item.note === "" ? [] : [["Why", item.note]]),
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <Header here={site} />
      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col gap-10 px-6 pt-12 pb-16 md:px-16 md:pt-16">
          <div className="flex justify-between gap-4 label">
            <span>
              Ask {number(index)} of {number(total - 1)} ·{" "}
              <Link className="hover:underline" href={`/${user.handle}`}>
                {owner}
              </Link>
            </span>
            <Link
              className="shrink-0 text-muted hover:text-ink"
              href={`/${user.handle}`}
            >
              ← <span className="md:hidden">List</span>
              <span className="hidden md:inline">The whole list</span>
            </Link>
          </div>
          <div className="relative">
            <h1
              className={`max-w-[11ch] display text-balance ${item.sponsor === undefined ? "" : "text-muted"}`}
            >
              {title(item)}
            </h1>
            <Stamp item={item} />
          </div>
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <dl className="flex-1 md:max-w-[968px]">
              {rows.map(([term, detail]) => (
                <div
                  className="flex flex-col gap-1 border-t border-rule py-4 md:flex-row md:gap-0"
                  key={term}
                >
                  <dt className="pt-1 label text-muted md:w-56 md:shrink-0">
                    {term}
                  </dt>
                  <dd className="max-w-[620px]">{detail}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-col gap-2 md:w-[280px]">
              {open && (
                <Sponsor className={solid} item={item} owner={user}>
                  Sponsor this →
                </Sponsor>
              )}
              <a className={outline} href={postItem(user.handle, item)}>
                Share on X
              </a>
              {item.sponsor === undefined && (
                <span className="pt-2 text-center label text-muted">
                  {item.sending === undefined
                    ? `Your handle goes on it. The address stays in ${user.x === undefined ? "a DM" : "X DMs"}.`
                    : `${who(item.sending.by)} said they're sending this. It turns gold when it lands.`}
                </span>
              )}
              {user.pay.length > 0 && (
                <Link
                  className="pt-2 text-center label text-muted hover:text-ink"
                  href={`/${user.handle}#chip-in`}
                >
                  Or chip in money →
                </Link>
              )}
            </div>
          </div>
        </section>
        {item.kind !== "other" && <Strip brand={item.kind} />}
      </main>
      <Footer here={site} />
    </div>
  );
};
