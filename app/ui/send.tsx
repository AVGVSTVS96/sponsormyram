"use client";

import { useMutation, useQuery } from "convex/react";
import { useState, useTransition } from "react";

import { attempt } from "@/app/ui/say";
import { api } from "@/convex/_generated/api";
import type { Item, Person } from "@/convex/people";
import { title } from "@/lib/kinds";

import { Bag, faceOf, Fitted } from "./hardware";
import { X } from "./icons";
import { Led } from "./lights";
import { outline, reachOwner, solid, tellOwner, who } from "./parts";
import { Providers } from "./providers";
import { Card, Dialog, SignIn } from "./sheet";

interface Props {
  item: Item;
  onClose: () => void;
  owner: Person;
}

const quiet = "press link self-start text-[15px] font-medium";

const Art = ({ item, light }: { item: Item; light: "open" | "sending" }) => (
  <div className="flex items-end gap-3">
    <Led className="size-3.5" light={light} />
    {light === "sending" ? (
      <Bag className="w-[200px]" kind={faceOf(item)} />
    ) : (
      <Fitted ask={item} className="w-[220px]" light="open" />
    )}
  </div>
);

const Done = ({ item, onClose, owner }: Props) => {
  const unsend = useMutation(api.items.unsend);
  const [pending, start] = useTransition();
  const name = who(owner);
  const onX = owner.x !== undefined;

  return (
    <Card
      art={<Art item={item} light="sending" />}
      heading="You’re on it."
      label="Sponsor"
      onClose={onClose}
    >
      <p className="text-[17px]">
        Your handle is on {name}’s {title(item)}. Tell them, then sort out the
        address {onX ? "in X DMs" : "through their GitHub"}. When it lands they
        turn it gold, and you get a thank-you&nbsp;post.
      </p>
      <div className="flex flex-col gap-2.5">
        <a className={solid} href={tellOwner(owner, item)}>
          <X /> Tell {name} on X
        </a>
        <a className={outline} href={reachOwner(owner)}>
          {onX ? `DM ${name} for the address` : "Find them on GitHub"}
        </a>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-rule pt-4 text-[15px] text-muted">
        <span>Can’t send it after all?</span>
        <button
          className={quiet}
          disabled={pending}
          onClick={() => {
            start(async () => {
              await unsend({ id: item._id });
              onClose();
            });
          }}
          type="button"
        >
          Back out
        </button>
      </div>
    </Card>
  );
};

const Confirm = ({ item, onClose, owner }: Props) => {
  const send = useMutation(api.items.send);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const name = who(owner);

  return (
    <Card
      art={<Art item={item} light="open" />}
      heading={`Send ${name} the ${title(item)}?`}
      label="Sponsor"
      onClose={onClose}
    >
      <p className="text-[17px]">
        Your handle goes on it in a gold outline, so nobody sends it twice.{" "}
        {name} turns it gold when it&nbsp;lands.
      </p>
      <div className="flex flex-col gap-2.5">
        <button
          className={solid}
          disabled={pending}
          onClick={() => {
            start(async () => {
              setError(await attempt(async () => await send({ id: item._id })));
            });
          }}
          type="button"
        >
          {pending ? "Saving…" : "I’m sending it"}
        </button>
        <button className={outline} onClick={onClose} type="button">
          Not yet
        </button>
      </div>
      <p className="text-[15px] text-muted">
        {error ??
          `The address stays ${owner.x === undefined ? "between you two" : "in X DMs"}. This site never asks.`}
      </p>
    </Card>
  );
};

const Note = ({
  heading,
  onClose,
  text,
}: {
  heading: string;
  onClose: () => void;
  text: string;
}) => (
  <Card heading={heading} label="Sponsor" onClose={onClose}>
    <p className="text-[17px]">{text}</p>
    <button className={quiet} onClick={onClose} type="button">
      Close
    </button>
  </Card>
);

const Flow = (props: Props) => {
  const { item, onClose, owner } = props;
  const state = useQuery(api.items.state, { id: item._id });

  if (state === undefined) {
    return (
      <Card heading="One second…" label="Sponsor" onClose={onClose}>
        <span className="text-[15px] text-muted">Checking who’s on it</span>
      </Card>
    );
  }

  if (state === null) {
    return (
      <Note
        heading="That ask is gone."
        onClose={onClose}
        text="The list changed since this page loaded."
      />
    );
  }

  if (!state.signedIn) {
    return (
      <Card
        heading="Sign in to send it."
        label="Sponsor"
        note={`So ${who(owner)} knows who it's from.`}
        onClose={onClose}
      >
        <SignIn callbackURL={`${window.location.pathname}#send`} />
      </Card>
    );
  }

  if (state.mine) {
    return (
      <Note
        heading="That's your list."
        onClose={onClose}
        text="Share it instead. Someone with a spare one will see it."
      />
    );
  }

  if (state.sponsored) {
    return (
      <Note
        heading="Already filled."
        onClose={onClose}
        text="Someone sent this one. Check the rest of the list."
      />
    );
  }

  if (state.sending === false) {
    return (
      <Note
        heading="Someone's on it."
        onClose={onClose}
        text="Another sponsor said they're sending this. Check the rest of the list."
      />
    );
  }

  return state.sending ? <Done {...props} /> : <Confirm {...props} />;
};

const Send = (props: Props) => (
  <Dialog onClose={props.onClose}>
    <Providers>
      <Flow {...props} />
    </Providers>
  </Dialog>
);

export default Send;
