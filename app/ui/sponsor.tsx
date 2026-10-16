"use client";

import { lazy, Suspense, useState, useSyncExternalStore } from "react";

import type { Item, Person } from "@/convex/people";
import { origin } from "@/lib/origin";

import { useSignedIn } from "./account";
import { sendUrl, who } from "./parts";

const Send = lazy(async () => await import("./send"));
const Sheet = lazy(async () => await import("./sheet"));

const onHash = (change: () => void) => {
  window.addEventListener("hashchange", change);

  return () => {
    window.removeEventListener("hashchange", change);
  };
};

const atHome = () => window.location.origin === origin("ram");

const useAsked = () =>
  useSyncExternalStore(
    onHash,
    () => atHome() && window.location.hash === "#send",
    () => false
  );

export const Sponsor = ({
  children,
  className,
  item,
  owner,
}: {
  children: React.ReactNode;
  className: string;
  item: Item;
  owner: Person;
}) => {
  const asked = useAsked();
  const signed = useSignedIn();
  const [open, setOpen] = useState(false);

  const close = () => {
    setOpen(false);

    if (asked) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`
      );
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  };

  return (
    <>
      <a
        className={className}
        href={sendUrl(owner.handle, item)}
        onClick={(event) => {
          if (atHome()) {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        {children}
      </a>
      {(open || asked) && (
        <Suspense>
          {signed ? (
            <Send item={item} onClose={close} owner={owner} />
          ) : (
            <Sheet
              callbackURL={`${window.location.pathname}#send`}
              heading="Sign in to send it."
              label="Sponsor"
              note={`So ${who(owner)} knows who it's from.`}
              onClose={close}
            />
          )}
        </Suspense>
      )}
    </>
  );
};
