import Link from "next/link";

import type { Item, Person } from "@/convex/people";
import { specLine, title, titleLines } from "@/lib/kinds";

import { Ago } from "./ago";
import { Fit } from "./fit";
import { Fitted, lightOf } from "./hardware";
import type { Light } from "./hardware";
import { Led, lightWords } from "./lights";
import {
  outline,
  postItem,
  small,
  solid,
  StateChip,
  stores,
  who,
} from "./parts";
import { Prose } from "./prose";
import { Sponsor } from "./sponsor";

const date = (at: number) =>
  new Date(at).toLocaleDateString("en-US", { day: "numeric", month: "short" });

const artSize = (item: Item, light: Light) => {
  if (light === "sending") {
    return "w-[64%] max-w-[250px]";
  }

  return item.kind === "hdd" || (item.kind === "ssd" && item.form !== "nvme")
    ? "w-[52%] max-w-[210px]"
    : "w-[76%] max-w-[290px]";
};

export const Cell = ({
  className = "h-[190px] md:h-60",
  item,
}: {
  className?: string;
  item: Item;
}) => {
  const light = lightOf(item);
  const filled = light === "filled";

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center pt-6 ${filled ? "bg-gold text-coal" : "bg-board text-silk"} ${className}`}
    >
      <span className="absolute top-3.5 left-4 flex items-center gap-2">
        <Led
          className={`size-3 ${filled ? "ring-2 ring-board" : ""}`}
          light={light}
        />
        <span className="silk">{lightWords[light]}</span>
      </span>
      <Fitted ask={item} className={artSize(item, light)} light={light} />
    </div>
  );
};

const Actions = ({ item, owner }: { item: Item; owner: Person }) => {
  if (item.sponsor !== undefined) {
    return (
      <>
        <p className="text-[15px] text-muted">
          Arrived {date(item.sponsor.at)}.
        </p>
        <a
          className={`${outline} ${small}`}
          href={postItem(owner.handle, item)}
        >
          Share
        </a>
      </>
    );
  }

  if (item.sending !== undefined) {
    return (
      <>
        <p className="text-[15px] text-muted">
          Someone’s on this one. You can still share&nbsp;it.
        </p>
        <a
          className={`${outline} ${small}`}
          href={postItem(owner.handle, item)}
        >
          Share
        </a>
      </>
    );
  }

  return (
    <>
      <Sponsor className={solid} item={item} owner={owner}>
        I’m sending it
      </Sponsor>
      <a className={`${outline} ${small}`} href={postItem(owner.handle, item)}>
        Share
      </a>
      <div className="flex flex-col gap-1.5 pt-2">
        <span className="text-[15px] text-muted">Or buy one for them</span>
        <span className="flex gap-4.5 text-[15px] font-medium">
          {stores(item).map(([store, href]) => (
            <a
              className="link"
              href={href}
              key={store}
              rel="noreferrer"
              target="_blank"
            >
              {store}
            </a>
          ))}
        </span>
      </div>
    </>
  );
};

export const AskRow = ({ item, owner }: { item: Item; owner: Person }) => (
  <li
    className={`flex flex-col border-[3px] on-paper lg:flex-row ${item.sending !== undefined && item.sponsor === undefined ? "border-gold" : "border-transparent"}`}
  >
    <Cell
      className="h-[190px] lg:h-auto lg:min-h-60 lg:w-[300px] xl:w-[380px]"
      item={item}
    />
    <div className="flex min-w-0 flex-1 flex-col gap-3 px-3 pt-5 pb-2 md:px-6 lg:px-10 lg:py-8">
      <StateChip item={item} />
      <Link className="hover:underline" href={`/${owner.handle}/${item.slug}`}>
        <Fit
          as="h3"
          cap={40}
          className="font-[750]"
          flow
          lead={1.05}
          lines={titleLines(item)}
          track={-0.035}
        />
      </Link>
      {item.note !== "" && (
        <p className="max-w-[540px] md:text-lg">
          <Prose text={item.note} />
        </p>
      )}
      <p className="text-[15px] text-muted md:text-base">{specLine(item)}</p>
    </div>
    <div className="flex flex-col gap-2.5 px-3 pt-3 pb-6 md:px-6 lg:w-[272px] lg:shrink-0 lg:py-8 lg:pr-8 lg:pl-0">
      <Actions item={item} owner={owner} />
    </div>
  </li>
);

export const Rows = ({
  entries,
}: {
  entries: { item: Item; owner: Person }[];
}) => (
  <ol className="flex flex-col">
    {entries.map(({ item, owner }) => (
      <li
        className="flex flex-col gap-4 border-t-2 border-rule py-5 md:flex-row md:items-center md:justify-between"
        key={item._id}
      >
        <div className="flex min-w-0 items-start gap-3.5">
          <Led className="mt-2 size-3" light={lightOf(item)} />
          <div className="flex min-w-0 flex-col gap-1">
            <Link
              className="text-2xl font-bold tracking-[-0.02em] hover:underline"
              href={`/${owner.handle}/${item.slug}`}
            >
              {title(item)}
            </Link>
            <span className="text-[15px] text-muted">
              <Link
                className="text-ink hover:underline"
                href={`/${owner.handle}`}
              >
                {who(owner)}
              </Link>{" "}
              · <Ago time={item._creationTime} />
            </span>
          </div>
        </div>
        {lightOf(item) === "open" ? (
          <Sponsor className={`${solid} ${small}`} item={item} owner={owner}>
            I’m sending it
          </Sponsor>
        ) : (
          <a
            className={`${outline} ${small}`}
            href={postItem(owner.handle, item)}
          >
            Share
          </a>
        )}
      </li>
    ))}
  </ol>
);
