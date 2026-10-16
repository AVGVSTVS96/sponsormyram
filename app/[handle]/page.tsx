import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { brandOf, brands } from "@/lib/brand";
import type { Brand } from "@/lib/brand";
import { capacity, size, title } from "@/lib/kinds";

import { AuthLink, Footer, Header } from "../ui/frame";
import { here } from "../ui/here";
import {
  Chips,
  lead,
  number,
  outline,
  postItem,
  postList,
  solid,
  sponsorItem,
} from "../ui/parts";
import { installed, RigView } from "../ui/rig";

const load = async (handle: string) =>
  await fetchQuery(api.users.page, { handle });

export const generateMetadata = async ({
  params,
}: PageProps<"/[handle]">): Promise<Metadata> => {
  const site = await here();
  const { handle } = await params;
  const page = await load(handle);

  if (page === null) {
    return {};
  }

  const brand = lead(site, page.items);

  return {
    alternates: { canonical: `${site.origin(brand)}/${page.user.handle}` },
    description:
      page.user.note === "" ? `${page.items.length} asks.` : page.user.note,
    title: `@${page.user.x === "" ? page.user.handle : page.user.x} · Sponsor my ${brands[brand].word}`,
  };
};

const Stat = ({
  brand,
  page,
}: {
  brand: Brand;
  page: NonNullable<Awaited<ReturnType<typeof load>>>;
}) => {
  const { rig } = page.user;

  if (brand === "ram" && rig !== undefined && rig.maxGB > installed(rig)) {
    return (
      <div className="flex flex-col gap-2 border-t border-rule pt-6 md:items-end md:border-0 md:pt-0">
        <span className="label text-muted">Short of the board max</span>
        <span className="display text-pcb">
          {size(rig.maxGB - installed(rig))}
        </span>
        <span className="label text-muted">
          {installed(rig)} of {rig.maxGB}GB installed
        </span>
      </div>
    );
  }

  const open = page.items.filter(
    (item) => item.sponsor === undefined && brandOf(item.kind) === brand
  );

  const total = open.reduce((sum, item) => sum + capacity(item), 0);

  if (total === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 border-t border-rule pt-6 md:items-end md:border-0 md:pt-0">
      <span className="label text-muted">Asking for</span>
      <span className="display text-pcb">{size(total)}</span>
      <span className="label text-muted">
        of {brands[brand].word} · {open.length}{" "}
        {open.length === 1 ? "ask" : "asks"}
      </span>
    </div>
  );
};

const UserPage = async ({ params }: PageProps<"/[handle]">) => {
  const site = await here();
  const { handle } = await params;
  const page = await load(handle);

  if (page === null) {
    notFound();
  }

  if (page.user.handle !== handle) {
    permanentRedirect(`/${page.user.handle}`);
  }

  const { items, user } = page;
  const brand = lead(site, items);
  const filled = items.filter((item) => item.sponsor !== undefined).length;

  return (
    <div>
      <Header here={site} />
      <main className="flex flex-1 flex-col">
        <section className="flex flex-col justify-between gap-10 px-6 pt-12 pb-14 md:flex-row md:items-end md:px-16 md:pt-20">
          <div className="flex max-w-[560px] flex-col gap-6">
            <span className="label text-muted">
              <span className="text-ink">
                @{user.x === "" ? user.handle : user.x}
              </span>
              <span className="ml-4">
                {items.length} {items.length === 1 ? "ask" : "asks"} · {filled}{" "}
                filled
              </span>
            </span>
            <h1 className="display">
              Sponsor
              <br />
              my {brands[brand].word}.
            </h1>
            {user.note !== "" && <p>{user.note}</p>}
            <a
              className={`${outline} self-start`}
              href={postList(site, brand, user.handle)}
            >
              Post this list
            </a>
          </div>
          <Stat brand={brand} page={page} />
        </section>

        {user.rig !== undefined && user.rig.slots.length > 0 && (
          <RigView rig={user.rig} />
        )}

        <section className="border-t-2 border-ink px-6 py-12 md:px-16">
          <div className="flex items-baseline justify-between pb-6">
            <h2 className="title">Wish list</h2>
            <span className="label text-muted">Priority order</span>
          </div>
          <ol>
            {items.map((item, index) => {
              const sponsor =
                item.sponsor === undefined
                  ? sponsorItem(site, user.handle, user.x, item)
                  : null;

              return (
                <li
                  className="flex flex-col gap-4 border-t border-rule py-6 md:flex-row md:items-start md:gap-16"
                  key={item._id}
                >
                  <div className="flex items-center justify-between md:w-8 md:pt-2">
                    <span className="label text-muted">{number(index)}</span>
                    <div className="md:hidden">
                      <Chips item={item} />
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <Link
                      className={`title hover:underline ${item.sponsor === undefined ? "" : "text-muted"}`}
                      href={`/${user.handle}/${item.slug}`}
                    >
                      {title(item)}
                    </Link>
                    {item.note !== "" && (
                      <p className="max-w-[600px]">{item.note}</p>
                    )}
                    <div className="hidden md:block">
                      <Chips item={item} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:flex">
                    {sponsor !== null && (
                      <a className={solid} href={sponsor}>
                        Sponsor →
                      </a>
                    )}
                    <a
                      className={outline}
                      href={postItem(site, user.handle, item)}
                    >
                      Post
                    </a>
                  </div>
                </li>
              );
            })}
          </ol>
          {items.length === 0 && (
            <p className="border-t border-rule py-6 text-muted">
              Nothing on the list yet.
            </p>
          )}
        </section>

        <section className="flex flex-col gap-6 bg-ink px-6 py-12 text-paper md:flex-row md:items-center md:justify-between md:px-16">
          <div className="flex flex-col gap-2">
            <h2 className="title">Your rig is short too.</h2>
            <p className="opacity-80">
              Make a list in a minute. It&apos;s free, and nothing is sold here.
            </p>
          </div>
          <AuthLink
            className="inline-flex h-10 items-center justify-center rounded-chip border-2 border-paper bg-paper px-4 font-bold text-ink transition-colors hover:bg-ink hover:text-paper"
            here={site}
          >
            Make your list →
          </AuthLink>
        </section>
      </main>
      <Footer here={site} />
    </div>
  );
};

export default UserPage;
