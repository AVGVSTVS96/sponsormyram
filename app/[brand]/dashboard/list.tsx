"use client";

import { useMutation, useQuery } from "convex/react";
import {
  Fragment,
  useEffect,
  useEffectEvent,
  useState,
  useTransition,
} from "react";

import { Fitted, lightOf } from "@/app/ui/hardware";
import { X } from "@/app/ui/icons";
import { Led } from "@/app/ui/lights";
import { small, solid, StateChip, thank, who } from "@/app/ui/parts";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Item } from "@/convex/people";
import { conditions, title, titleLines } from "@/lib/kinds";
import type { Ask } from "@/lib/kinds";

import { Picker } from "./picker";

export const askOf = ({
  _creationTime,
  _id,
  rank: _rank,
  sending: _sending,
  slug: _slug,
  sponsor: _sponsor,
  userId: _userId,
  ...ask
}: Item): Ask => ask;

const action =
  "press inline-flex h-11 min-w-11 items-center justify-center px-2 text-[15px] font-semibold underline decoration-2 underline-offset-4 disabled:opacity-30 md:h-9 md:min-w-0 md:px-1";

const arrow =
  "press inline-flex size-11 items-center justify-center text-lg font-bold disabled:opacity-25 md:size-9";

export const Title = ({
  item,
  className,
}: {
  item: Ask;
  className: string;
}) => (
  <span className={className}>
    {titleLines(item).map((chunk, index) => (
      <Fragment key={chunk}>
        {index > 0 && " "}
        <span className="whitespace-nowrap">{chunk}</span>
      </Fragment>
    ))}
  </span>
);

const Toast = ({
  item,
  onDone,
  onUndo,
}: {
  item: Item;
  onDone: () => void;
  onUndo: () => void;
}) => {
  const done = useEffectEvent(onDone);

  useEffect(() => {
    const timer = setTimeout(() => {
      done();
    }, 6000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="fixed inset-x-5 bottom-6 z-10 mx-auto flex max-w-[440px] items-center justify-between gap-4 bg-board px-4 py-3.5 text-[15px] text-silk transition-[translate,opacity] duration-200 ease-out motion-safe:starting:translate-y-4 motion-safe:starting:opacity-0">
      <span className="truncate">Removed {title(item)}</span>
      <button
        className="shrink-0 press font-semibold text-gold underline decoration-2 underline-offset-4"
        onClick={onUndo}
        type="button"
      >
        Undo
      </button>
    </div>
  );
};

const Row = ({
  first,
  item,
  last,
  landed,
  onEdit,
  onFill,
  onMove,
  owner,
}: {
  first: boolean;
  item: Item;
  last: boolean;
  landed: boolean;
  onEdit: () => void;
  onFill: (id: Id<"items">) => void;
  onMove: (by: -1 | 1) => void;
  owner: string;
}) => {
  const unfill = useMutation(api.items.unfill);
  const clear = useMutation(api.items.clear);
  const [, start] = useTransition();
  const light = lightOf(item);

  return (
    <li className="flex flex-col gap-3 bg-surf px-4 py-4 md:px-6 md:py-5 xl:flex-row xl:items-center xl:gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <span className="flex items-center gap-4">
          <Led
            className={`size-3 ${landed ? "motion-safe:animate-settle" : ""}`}
            light={light}
          />
          <Fitted
            ask={item}
            className={
              item.kind === "hdd" ? "w-15 shrink-0" : "w-24 shrink-0 md:w-28"
            }
            light={light}
            seat={landed}
          />
        </span>
        <div className="flex min-w-0 flex-col gap-1.5">
          <Title
            className={`text-xl leading-tight font-bold tracking-[-0.02em] md:text-[22px] ${light === "filled" ? "text-muted" : ""}`}
            item={item}
          />
          {light === "open" ? (
            <span className="text-[15px] text-muted">
              Open · {conditions[item.condition].chip}
            </span>
          ) : (
            <StateChip item={item} lands={landed} />
          )}
        </div>
      </div>
      <div className="-mx-2 flex flex-wrap items-center xl:mx-0 xl:flex-nowrap xl:gap-3">
        {item.sponsor !== undefined && item.sponsor.by !== null ? (
          <a
            className={`${solid} ${small} mx-2 md:mx-0`}
            href={thank(owner, item, item.sponsor.by, item.sponsor.at)}
          >
            <X /> Thank {who(item.sponsor.by)}
          </a>
        ) : (
          <button className={action} onClick={onEdit} type="button">
            Edit
          </button>
        )}
        {item.sponsor === undefined ? (
          <button
            className={action}
            onClick={() => {
              onFill(item._id);
            }}
            type="button"
          >
            {item.sending === undefined ? "Mark filled" : "It arrived"}
          </button>
        ) : (
          <button
            className={action}
            onClick={() => {
              start(async () => {
                await unfill({ id: item._id });
              });
            }}
            type="button"
          >
            Unfill
          </button>
        )}
        {item.sending !== undefined && item.sponsor === undefined && (
          <button
            className={action}
            onClick={() => {
              start(async () => {
                await clear({ id: item._id });
              });
            }}
            type="button"
          >
            Clear
          </button>
        )}
        <span className="flex">
          <button
            aria-label="Move up"
            className={arrow}
            disabled={first}
            onClick={() => {
              onMove(-1);
            }}
            type="button"
          >
            ↑
          </button>
          <button
            aria-label="Move down"
            className={arrow}
            disabled={last}
            onClick={() => {
              onMove(1);
            }}
            type="button"
          >
            ↓
          </button>
        </span>
      </div>
    </li>
  );
};

export const useFill = () => {
  const fill = useMutation(api.items.fill);
  const [landed, setLanded] = useState<Id<"items"> | null>(null);
  const [, start] = useTransition();

  const land = (id: Id<"items">) => {
    setLanded(id);
    start(async () => {
      await fill({ id });
    });
  };

  return [landed, land] as const;
};

export const List = ({
  handle,
  landed,
  onFill,
}: {
  handle: string;
  landed: Id<"items"> | null;
  onFill: (id: Id<"items">) => void;
}) => {
  const items = useQuery(api.items.mine);
  const edit = useMutation(api.items.edit);
  const restore = useMutation(api.items.restore);

  const remove = useMutation(api.items.remove).withOptimisticUpdate(
    (store, { id }) => {
      const current = store.getQuery(api.items.mine, {});

      if (current !== undefined) {
        store.setQuery(
          api.items.mine,
          {},
          current.filter((item) => item._id !== id)
        );
      }
    }
  );

  const move = useMutation(api.items.move).withOptimisticUpdate(
    (store, { by, id }) => {
      const current = store.getQuery(api.items.mine, {});
      const from = current?.findIndex((item) => item._id === id) ?? -1;
      const mine = current?.[from];
      const other = current?.[from + by];

      if (current !== undefined && mine !== undefined && other !== undefined) {
        store.setQuery(
          api.items.mine,
          {},
          current.with(from, other).with(from + by, mine)
        );
      }
    }
  );

  const [editing, setEditing] = useState<Id<"items"> | null>(null);
  const [removed, setRemoved] = useState<Item | null>(null);
  const [, start] = useTransition();

  if (items === undefined) {
    return <div className="h-64" />;
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <h2 className="text-4xl leading-none font-extrabold tracking-[-0.045em] md:text-[44px]">
          Your list
        </h2>
        {items.length > 1 && (
          <span className="text-[15px] text-muted">
            ↑ ↓ set what matters most.
          </span>
        )}
      </div>
      {items.length === 0 && (
        <p className="bg-surf px-6 py-8 text-[17px] text-muted">
          Nothing on it yet. Add the first part your rig is short&nbsp;on.
        </p>
      )}
      <ol className="flex flex-col gap-1">
        {items.map((item, index) =>
          editing === item._id ? (
            <li className="bg-surf p-5 md:p-8" key={item._id}>
              <Picker
                heading={`Edit ${title(item)}`}
                initial={askOf(item)}
                onCancel={() => {
                  setEditing(null);
                }}
                onDelete={() => {
                  setEditing(null);
                  setRemoved(item);
                  start(async () => {
                    await remove({ id: item._id });
                  });
                }}
                onSave={async (ask) => {
                  await edit({ ask, id: item._id });
                  setEditing(null);
                }}
                saveLabel="Save"
              />
            </li>
          ) : (
            <Row
              first={index === 0}
              item={item}
              key={item._id}
              landed={item._id === landed}
              last={index === items.length - 1}
              onEdit={() => {
                setEditing(item._id);
              }}
              onFill={onFill}
              onMove={(by) => {
                start(async () => {
                  await move({ by, id: item._id });
                });
              }}
              owner={handle}
            />
          )
        )}
      </ol>
      {removed !== null && (
        <Toast
          item={removed}
          key={removed._id}
          onDone={() => {
            setRemoved(null);
          }}
          onUndo={() => {
            setRemoved(null);
            start(async () => {
              await restore({
                ask: askOf(removed),
                rank: removed.rank,
                slug: removed.slug,
                sponsor:
                  removed.sponsor === undefined
                    ? undefined
                    : { at: removed.sponsor.at, by: removed.sponsor.by?._id },
              });
            });
          }}
        />
      )}
    </section>
  );
};
