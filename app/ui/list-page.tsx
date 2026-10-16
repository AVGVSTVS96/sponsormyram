import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { AuthLink } from "@/app/ui/account";
import { cardImage } from "@/app/ui/cards";
import { listOf } from "@/app/ui/data";
import { Footer, Header } from "@/app/ui/frame";
import { here } from "@/app/ui/here";
import { Missing } from "@/app/ui/missing";
import {
  Chips,
  lead,
  number,
  openFor,
  outline,
  postItem,
  postList,
  shortOf,
  solid,
  who,
} from "@/app/ui/parts";
import { ChipIn } from "@/app/ui/pay";
import { installed, RigView } from "@/app/ui/rig";
import { Roll } from "@/app/ui/roll";
import { Sponsor } from "@/app/ui/sponsor";
import type { Item } from "@/convex/people";
import { brands } from "@/lib/brand";
import type { Brand } from "@/lib/brand";
import { parsePath } from "@/lib/handle";
import { size, title } from "@/lib/kinds";
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

const Stat = ({ brand, page }: { brand: Brand; page: Page }) => {
  const { rig } = page.user;
  const short = shortOf(brand, page.items, rig);

  if (short.gb === 0) {
    return null;
  }

  const open = openFor(brand, page.items);

  return (
    <div className="flex flex-col gap-2 border-t border-rule pt-6 md:items-end md:border-0 md:pt-0">
      <span className="label text-muted">
        {short.rig ? "Short of the board max" : "Asking for"}
      </span>
      <span className="display text-pcb">
        <Roll text={size(short.gb)} />
      </span>
      <span className="label text-muted">
        {short.rig && rig !== undefined
          ? `${installed(rig)} of ${rig.maxGB}GB installed`
          : `of ${brands[brand].word} · ${open.length} ${open.length === 1 ? "ask" : "asks"}`}
      </span>
    </div>
  );
};

const Row = ({
  index,
  item,
  user,
}: {
  index: number;
  item: Item;
  user: Page["user"];
}) => {
  const open = item.sponsor === undefined && item.sending === undefined;

  return (
    <li className="flex flex-col gap-4 border-t border-rule py-6 md:flex-row md:items-start md:gap-16">
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
        {item.note !== "" && <p className="max-w-[600px]">{item.note}</p>}
        <div className="hidden md:block">
          <Chips item={item} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 md:flex">
        {open && (
          <Sponsor className={solid} item={item} owner={user}>
            Sponsor →
          </Sponsor>
        )}
        <a className={outline} href={postItem(user.handle, item)}>
          Share
        </a>
      </div>
    </li>
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

  const { items, user } = page;
  const brand = lead(site, items);
  const filled = items.filter((item) => item.sponsor !== undefined).length;
  const ranked = items.map((item, index) => ({ index, item }));

  const first =
    site === "ram" ? ranked : ranked.filter(({ item }) => item.kind === site);

  const also =
    first === ranked ? [] : ranked.filter(({ item }) => item.kind !== site);

  return (
    <div>
      <Header here={site} />
      <main className="flex flex-1 flex-col">
        <section className="flex flex-col justify-between gap-10 px-6 pt-12 pb-14 md:flex-row md:items-end md:px-16 md:pt-20">
          <div className="flex max-w-[560px] flex-col gap-6">
            <span className="label text-muted">
              <span className="text-ink">{who(user)}</span>
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
            <div className="flex flex-wrap gap-2">
              <a className={outline} href={postList(brand, user.handle)}>
                Share this list
              </a>
              {user.pay.length > 0 && (
                <a className={outline} href="#chip-in">
                  Chip in ↓
                </a>
              )}
            </div>
          </div>
          <Stat brand={brand} page={page} />
        </section>

        {brand === "ram" &&
          user.rig !== undefined &&
          user.rig.slots.length > 0 && <RigView rig={user.rig} />}

        <section className="border-t-2 border-ink px-6 py-12 md:px-16">
          <div className="flex items-baseline justify-between pb-6">
            <h2 className="title">Wish list</h2>
            <span className="label text-muted">Priority order</span>
          </div>
          <ol>
            {(first.length === 0 ? also : first).map(({ index, item }) => (
              <Row index={index} item={item} key={item._id} user={user} />
            ))}
          </ol>
          {first.length > 0 && also.length > 0 && (
            <>
              <h3 className="pt-10 pb-4 label text-muted">Also on the list</h3>
              <ol>
                {also.map(({ index, item }) => (
                  <Row index={index} item={item} key={item._id} user={user} />
                ))}
              </ol>
            </>
          )}
          {items.length === 0 && (
            <p className="border-t border-rule py-6 text-muted">
              Nothing on the list yet.
            </p>
          )}
        </section>

        <ChipIn owner={who(user)} pay={user.pay} />

        <section className="flex flex-col gap-6 bg-band px-6 py-12 text-white md:flex-row md:items-center md:justify-between md:px-16 dark:border-t dark:border-rule">
          <div className="flex flex-col gap-2">
            <h2 className="title">Your rig is short too.</h2>
            <p className="opacity-80">
              Make a list in a minute. It&apos;s free, and nothing is sold here.
            </p>
          </div>
          <AuthLink
            brand={site}
            className="inline-flex h-11 items-center justify-center rounded-chip border-2 border-white bg-white px-4 font-bold text-coal transition-colors hover:bg-transparent hover:text-white md:h-10"
          >
            Make your list →
          </AuthLink>
        </section>
      </main>
      <Footer here={site} />
    </div>
  );
};
