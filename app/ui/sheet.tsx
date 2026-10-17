"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { outline, solid } from "@/app/ui/parts";
import { authClient } from "@/lib/auth-client";

import { Fitted } from "./hardware";
import { GitHub, X } from "./icons";
import { Led } from "./lights";
import { sample } from "./story";

export { GitHub, X } from "./icons";

const problems = new Map([
  ["access_denied", "You canceled on the other side. Try again any time."],
  [
    "account_already_linked_to_different_user",
    "That account already has its own page here.",
  ],
]);

export const problem = (code: string | null) =>
  code === null
    ? null
    : (problems.get(code) ?? "Sign-in didn't finish. Try again.");

export const SignIn = ({ callbackURL }: { callbackURL: string }) => {
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [error, setError] = useState(problem(params.get("error")));

  const go = (provider: "github" | "twitter") => {
    start(async () => {
      const { error: failed } = await authClient.signIn.social({
        callbackURL,
        errorCallbackURL: "/sign-in",
        provider,
      });

      if (failed !== null) {
        setError("Couldn't reach the sign-in page. Try again.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2.5">
        <button
          className={solid}
          disabled={pending}
          onClick={() => {
            go("twitter");
          }}
          type="button"
        >
          <X /> Continue with X
        </button>
        <button
          className={outline}
          disabled={pending}
          onClick={() => {
            go("github");
          }}
          type="button"
        >
          <GitHub /> Continue with GitHub
        </button>
      </div>
      {error === null ? (
        <p className="text-[15px] text-muted">
          X gives you sponsormyram.com/yourhandle. GitHub gives you
          sponsormyram.com/gh/yourlogin.
        </p>
      ) : (
        <p className="text-[15px] font-semibold">{error}</p>
      )}
      <div className="flex justify-between gap-4 text-[15px] text-muted">
        <span>We never post for you.</span>
        <Link className="hover:text-ink" href="/privacy">
          Privacy
        </Link>
      </div>
    </div>
  );
};

export const Card = ({
  art,
  children,
  heading,
  label,
  note,
  onClose,
}: {
  art?: React.ReactNode;
  children: React.ReactNode;
  heading: string;
  label: string;
  note?: string;
  onClose: () => void;
}) => (
  <div className="flex w-full flex-col gap-5 border-ink bg-paper px-5 pt-7 pb-8 on-paper md:max-w-[440px] md:border-2 md:p-8">
    <div className="flex items-center justify-between">
      <span className="silk text-muted">{label}</span>
      <button
        className="press text-[15px] font-medium text-muted hover:text-ink"
        onClick={onClose}
        type="button"
      >
        Close
      </button>
    </div>
    {art !== undefined && <div className="flex">{art}</div>}
    <div className="flex flex-col gap-2.5">
      <h2 className="text-[28px] leading-[1.1] font-bold tracking-[-0.03em] text-balance md:text-3xl">
        {heading}
      </h2>
      {note !== undefined && <p className="text-[17px]">{note}</p>}
    </div>
    {children}
  </div>
);

export const Dialog = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      className="m-0 size-full max-h-none max-w-none items-end justify-center bg-transparent backdrop:bg-coal/55 open:flex md:items-center md:p-6"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      ref={dialog}
    >
      <button
        aria-label="Close"
        className="fixed inset-0 cursor-default"
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />
      <div className="relative flex w-full justify-center transition-[translate,opacity,scale] duration-320 ease-drawer motion-safe:starting:translate-y-full md:motion-safe:starting:translate-y-0 md:motion-safe:starting:scale-97 md:motion-safe:starting:opacity-0">
        <span
          aria-hidden
          className="absolute top-2.5 left-1/2 h-1 w-10 -translate-x-1/2 bg-rule md:hidden"
        />
        {children}
      </div>
    </dialog>
  );
};

export const Claim = () => (
  <div className="flex items-end gap-3">
    <Led className="size-3.5" light="open" />
    <Fitted ask={sample.ram} className="w-[220px]" light="open" />
  </div>
);

export const Sheet = ({
  callbackURL = "/dashboard",
  heading = "Claim your slot",
  label = "Sign in",
  note = "Sign in with the account you’ll share from. Your page takes its handle, which proves it’s you.",
  onClose,
}: {
  callbackURL?: string;
  heading?: string;
  label?: string;
  note?: string;
  onClose?: () => void;
}) => {
  const router = useRouter();

  const card = (close: () => void) => (
    <Card
      art={<Claim />}
      heading={heading}
      label={label}
      note={note}
      onClose={close}
    >
      <SignIn callbackURL={callbackURL} />
    </Card>
  );

  if (onClose === undefined) {
    return card(() => {
      router.push("/");
    });
  }

  return <Dialog onClose={onClose}>{card(onClose)}</Dialog>;
};

export default Sheet;
