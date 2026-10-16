"use client";

import { useMutation, useQuery } from "convex/react";
import { useState, useTransition } from "react";

import { attempt } from "@/app/ui/say";
import { api } from "@/convex/_generated/api";
import type { Item, Person } from "@/convex/people";
import { title } from "@/lib/kinds";

import { outline, reachOwner, solid, tellOwner, who } from "./parts";
import { Providers } from "./providers";
import { Card, Dialog, SignIn } from "./sheet";

interface Props {
  item: Item;
  onClose: () => void;
  owner: Person;
}

const quiet = "self-start label text-muted underline-offset-4 hover:text-ink";

const Done = ({ item, onClose, owner }: Props) => {
  const unsend = useMutation(api.items.unsend);
  const [pending, start] = useTransition();
  const name = who(owner);
  const onX = owner.x !== undefined;

  return (
    <Card heading="You're on it." label="Sponsor" onClose={onClose}>
      <p>
        Your handle is on {name}&apos;s {title(item)}. Tell them, then sort out
        the address {onX ? "in DMs" : "through their GitHub"}.
      </p>
      <div className="flex flex-col gap-2">
        <a className={solid} href={tellOwner(owner, item)}>
          Tell {name} on X →
        </a>
        <a className={outline} href={reachOwner(owner)}>
          {onX ? "DM for the address" : "Find them on GitHub"}
        </a>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-rule pt-4 label text-muted">
        <span>Can&apos;t send it after all?</span>
        <button
          className="text-ink underline underline-offset-4"
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
      heading={`Sending ${name} the ${title(item)}?`}
      label="Sponsor"
      onClose={onClose}
    >
      <p>
        Your handle goes on it in a gold outline, so nobody buys it twice.{" "}
        {name} turns it gold when it lands.
      </p>
      <div className="flex flex-col gap-2">
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
          {pending ? "Saving…" : "I'm sending it →"}
        </button>
        <button className={outline} onClick={onClose} type="button">
          Not yet
        </button>
      </div>
      <p className="text-center label text-muted">
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
    <p>{text}</p>
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
        <span className="label text-muted">Checking who&apos;s on it</span>
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
