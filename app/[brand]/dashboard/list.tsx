"use client";

import { useMutation, useQuery } from "convex/react";
import { useEffect, useEffectEvent, useState, useTransition } from "react";

import { Chips, number, solid } from "@/app/ui/parts";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { title } from "@/lib/kinds";
import type { Ask, Kind } from "@/lib/kinds";

import { field, fresh, Picker } from "./picker";
import { attempt } from "./say";

type Editing =
  | { type: "new"; kind: Kind }
  | { type: "edit"; id: Id<"items"> }
  | { type: "fill"; id: Id<"items"> }
  | null;

const askOf = ({
  _creationTime,
  _id,
  rank: _rank,
  slug: _slug,
  sponsor: _sponsor,
  userId: _userId,
  ...ask
}: Doc<"items">): Ask => ask;

const action =
  "label text-muted transition-colors hover:text-ink disabled:opacity-30";

const adds = [
  ["ram", "+ Add RAM"],
  ["ssd", "+ Add an SSD"],
  ["hdd", "+ Add an HDD"],
  ["other", "+ Something else"],
] as const;

const FillForm = ({ id, onDone }: { id: Id<"items">; onDone: () => void }) => {
  const fill = useMutation(api.items.fill);
  const [by, setBy] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async () => {
        const problem = await attempt(async () => await fill({ by, id }));

        setError(problem);

        if (problem === null) {
          onDone();
        }
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <input
        aria-label="Sponsor's X handle"
        autoFocus
        className={`${field} h-9 w-44 font-mono text-sm`}
        onChange={(event) => {
          setBy(event.target.value);
        }}
        placeholder="@ who sent it"
        value={by}
      />
      <button className={`${solid} h-9`} type="submit">
        Mark filled
      </button>
      <button className={action} onClick={onDone} type="button">
        Cancel
      </button>
      {error !== null && <span className="w-full label">{error}</span>}
    </form>
  );
};

const Toast = ({
  item,
  onDone,
  onUndo,
}: {
  item: Doc<"items">;
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

export const List = () => {
  const items = useQuery(api.items.mine);
  const add = useMutation(api.items.add);
  const edit = useMutation(api.items.edit);
  const restore = useMutation(api.items.restore);
  const unfill = useMutation(api.items.unfill);

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
  const [removed, setRemoved] = useState<Doc<"items"> | null>(null);
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
              className="flex flex-col gap-3 border-t border-rule py-5 md:flex-row md:items-center md:gap-0"
              key={item._id}
            >
              <span className="hidden label text-muted md:block md:w-16">
                {number(index)}
              </span>
              <span
                className={`flex-1 title ${item.sponsor === undefined ? "" : "text-muted"}`}
              >
                {title(item)}
              </span>
              <div className="md:w-72">
                <Chips item={item} />
              </div>
              {editing?.type === "fill" && editing.id === item._id ? (
                <FillForm
                  id={item._id}
                  onDone={() => {
                    setEditing(null);
                  }}
                />
              ) : (
                <div className="flex items-center gap-5 md:w-64 md:justify-end">
                  <button
                    className={action}
                    onClick={() => {
                      setEditing({ id: item._id, type: "edit" });
                    }}
                    type="button"
                  >
                    Edit
                  </button>
                  {item.sponsor === undefined ? (
                    <button
                      className={action}
                      onClick={() => {
                        setEditing({ id: item._id, type: "fill" });
                      }}
                      type="button"
                    >
                      Mark filled
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
              )}
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
                sponsor: removed.sponsor,
              });
            });
          }}
        />
      )}
    </section>
  );
};
