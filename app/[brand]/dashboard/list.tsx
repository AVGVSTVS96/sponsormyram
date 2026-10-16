"use client";

import { useMutation, useQuery } from "convex/react";
import { useEffect, useEffectEvent, useState, useTransition } from "react";

import { Chips, number, thank, who } from "@/app/ui/parts";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Item } from "@/convex/people";
import { title } from "@/lib/kinds";
import type { Ask, Kind } from "@/lib/kinds";

import { fresh, Picker } from "./picker";

type Editing =
  | { type: "new"; kind: Kind }
  | { type: "edit"; id: Id<"items"> }
  | null;

const askOf = ({
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
  "label inline-flex h-11 min-w-11 items-center justify-center px-2.5 text-muted transition-colors hover:text-ink disabled:opacity-30 lg:h-auto lg:min-w-0 lg:px-0";

const adds = [
  ["ram", "+ Add RAM"],
  ["ssd", "+ Add an SSD"],
  ["hdd", "+ Add an HDD"],
  ["other", "+ Something else"],
] as const;

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
    <div className="fixed inset-x-0 bottom-6 z-10 mx-auto flex w-fit items-center gap-4 rounded-chip bg-ink px-4 py-3 label text-paper">
      <span>Removed {title(item)}</span>
      <button
        className="text-gold hover:underline"
        onClick={onUndo}
        type="button"
      >
        Undo
      </button>
    </div>
  );
};

export const List = ({ handle }: { handle: string }) => {
  const items = useQuery(api.items.mine);
  const add = useMutation(api.items.add);
  const edit = useMutation(api.items.edit);
  const restore = useMutation(api.items.restore);
  const fill = useMutation(api.items.fill);
  const unfill = useMutation(api.items.unfill);
  const clear = useMutation(api.items.clear);

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

  const [editing, setEditing] = useState<Editing>(null);
  const [removed, setRemoved] = useState<Item | null>(null);
  const [landed, setLanded] = useState<Id<"items"> | null>(null);
  const [, start] = useTransition();

  if (items === undefined) {
    return <div className="h-64" />;
  }

  const filled = items.filter((item) => item.sponsor !== undefined).length;

  return (
    <section className="px-6 py-12 md:px-16">
      <div className="flex items-baseline justify-between gap-4 pb-6">
        <div className="flex items-baseline gap-4">
          <h2 className="title">Your list</h2>
          <span className="label text-muted">
            {items.length} {items.length === 1 ? "ask" : "asks"} · {filled}{" "}
            filled
          </span>
        </div>
        <span className="hidden label text-muted md:block">
          ↑ ↓ sets priority
        </span>
      </div>
      <ol>
        {items.map((item, index) =>
          editing?.type === "edit" && editing.id === item._id ? (
            <li key={item._id}>
              <Picker
                heading={`Edit ask ${number(index)}`}
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
                saveLabel="Save →"
              />
            </li>
          ) : (
            <li
              className="flex flex-col gap-3 border-t border-rule py-5 lg:flex-row lg:items-center lg:gap-0"
              key={item._id}
            >
              <span className="hidden label text-muted lg:block lg:w-16">
                {number(index)}
              </span>
              <span
                className={`flex-1 title ${item.sponsor === undefined ? "" : "text-muted"}`}
              >
                {title(item)}
              </span>
              <div className="lg:w-96">
                <Chips item={item} lands={item._id === landed} />
              </div>
              <div className="-mx-2.5 flex flex-wrap items-center lg:mx-0 lg:w-80 lg:flex-nowrap lg:justify-end lg:gap-5">
                {item.sponsor === undefined || item.sponsor.by === null ? (
                  <button
                    className={action}
                    onClick={() => {
                      setEditing({ id: item._id, type: "edit" });
                    }}
                    type="button"
                  >
                    Edit
                  </button>
                ) : (
                  <a
                    className="mx-2.5 inline-flex h-9 items-center rounded-chip border-2 border-ink bg-ink px-3 text-sm font-bold whitespace-nowrap text-paper transition-colors hover:bg-paper hover:text-ink lg:mx-0 lg:h-8"
                    href={thank(handle, item, item.sponsor.by, item.sponsor.at)}
                  >
                    Thank {who(item.sponsor.by)}
                  </a>
                )}
                {item.sponsor === undefined ? (
                  <button
                    className={`${action} ${item.sending === undefined ? "" : "text-ink"}`}
                    onClick={() => {
                      setLanded(item._id);
                      start(async () => {
                        await fill({ id: item._id });
                      });
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
                {item.sending !== undefined && (
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
                <button
                  aria-label="Move up"
                  className={action}
                  disabled={index === 0}
                  onClick={() => {
                    start(async () => {
                      await move({ by: -1, id: item._id });
                    });
                  }}
                  type="button"
                >
                  ↑
                </button>
                <button
                  aria-label="Move down"
                  className={action}
                  disabled={index === items.length - 1}
                  onClick={() => {
                    start(async () => {
                      await move({ by: 1, id: item._id });
                    });
                  }}
                  type="button"
                >
                  ↓
                </button>
              </div>
            </li>
          )
        )}
      </ol>
      {editing?.type === "new" ? (
        <Picker
          heading="New ask"
          initial={fresh(editing.kind)}
          key={editing.kind}
          onCancel={() => {
            setEditing(null);
          }}
          onSave={async (ask) => {
            await add({ ask });
            setEditing(null);
          }}
          saveLabel="Add to list →"
        />
      ) : (
        <div className="grid grid-cols-1 gap-2 border-t-2 border-ink pt-6 sm:grid-cols-2 md:grid-cols-4">
          {adds.map(([kind, label]) => (
            <button
              className="h-14 rounded-chip border-2 border-dashed border-rule label text-muted transition-colors hover:border-ink hover:text-ink"
              key={kind}
              onClick={() => {
                setEditing({ kind, type: "new" });
              }}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      )}
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
