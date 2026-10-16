import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { brandOf, brands } from "@/lib/brand";
import { conditions, specRows, title } from "@/lib/kinds";

import { Footer, Header } from "../../ui/frame";
import { Strip } from "../../ui/glyphs";
import { here } from "../../ui/here";
import {
  itemUrl,
  number,
  outline,
  postItem,
  solid,
  sponsorItem,
} from "../../ui/parts";

const load = async (params: PageProps<"/[handle]/[slug]">["params"]) =>
  await fetchQuery(api.items.one, await params);

const stamp = (at: number) =>
  new Date(at).toLocaleDateString("en-US", { day: "numeric", month: "short" });

export const generateMetadata = async ({
  params,
}: PageProps<"/[handle]/[slug]">): Promise<Metadata> => {
  const site = await here();
  const loaded = await load(params);

  if (loaded === null || loaded.found === null) {
    return {};
  }

  const { user } = loaded;
  const { item } = loaded.found;

  return {
    alternates: { canonical: itemUrl(site, user.handle, item) },
    description: item.note === "" ? `@${user.handle} needs this.` : item.note,
    title: `${title(item)} · Sponsor my ${brands[brandOf(item.kind)].word}`,
  };
};

const ItemPage = async ({ params }: PageProps<"/[handle]/[slug]">) => {
  const site = await here();
  const { handle, slug } = await params;
  const loaded = await load(params);

  if (loaded === null) {
    notFound();
  }

  const { found, user } = loaded;

  if (found === null) {
    redirect(`/${user.handle}`);
  }

  if (user.handle !== handle || found.item.slug !== slug) {
    permanentRedirect(`/${user.handle}/${found.item.slug}`);
  }

  const { index, item, total } = found;
  const owner = user.x === "" ? user.handle : user.x;

  const sponsor =
    item.sponsor === undefined
      ? sponsorItem(site, user.handle, user.x, item)
      : null;

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
                @{owner}
              </Link>
            </span>
            <Link
              className="text-muted hover:text-ink"
              href={`/${user.handle}`}
            >
              ← The whole list
            </Link>
          </div>
          <div className="relative">
            <h1
              className={`max-w-[11ch] display text-balance ${item.sponsor === undefined ? "" : "text-muted"}`}
            >
              {title(item)}
            </h1>
            {item.sponsor !== undefined && (
              <div className="mt-6 inline-flex -rotate-3 flex-col items-center gap-1 rounded-chip border-2 border-coal bg-gold px-6 py-3 text-coal md:absolute md:top-0 md:right-0 md:mt-0">
                <span className="font-mono text-2xl font-bold tracking-[0.12em] uppercase">
                  Sponsored
                </span>
                <span className="label">
                  By @{item.sponsor.by} · {stamp(item.sponsor.at)}
                </span>
              </div>
            )}
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
              {sponsor !== null && (
                <a className={solid} href={sponsor}>
                  Sponsor this →
                </a>
              )}
              <a className={outline} href={postItem(site, user.handle, item)}>
                Post on X
              </a>
              {sponsor !== null && (
                <span className="pt-2 text-center label text-muted">
                  Sponsor opens a post to @{user.x} on X
                </span>
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

export default ItemPage;
