"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { outline, solid } from "@/app/ui/parts";
import { authClient } from "@/lib/auth-client";

export const X = () => (
  <svg aria-hidden className="size-[18px] fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const GitHub = () => (
  <svg aria-hidden className="size-[18px] fill-current" viewBox="0 0 24 24">
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);

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

const Path = ({ name, path }: { name: string; path: string }) => (
  <div className="flex items-center gap-3 border-t border-rule py-2.5 last:border-b">
    <span className="w-16 shrink-0 label text-muted">{name}</span>
    <span className="font-mono text-sm text-muted">
      sponsormyram.com/<span className="text-ink">{path}</span>
    </span>
  </div>
);

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
      <div className="flex flex-col gap-2">
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
        <div className="flex flex-col">
          <Path name="X" path="yourhandle" />
          <Path name="GitHub" path="gh/yourlogin" />
        </div>
      ) : (
        <p className="label text-ink">{error}</p>
      )}
      <div className="flex justify-between gap-4 label text-muted">
        <span>We never post for you.</span>
        <Link className="hover:text-ink" href="/privacy">
          Privacy
        </Link>
      </div>
    </div>
  );
};

export const Card = ({
  children,
  heading,
  label,
  note,
  onClose,
}: {
  children: React.ReactNode;
  heading: string;
  label: string;
  note?: string;
  onClose: () => void;
}) => (
  <div className="flex w-full max-w-[440px] flex-col gap-5 rounded-sheet border-2 border-ink bg-paper p-6 md:p-8">
    <div className="flex justify-between label">
      <span>{label}</span>
      <button
        className="label text-muted hover:text-ink"
        onClick={onClose}
        type="button"
      >
        Esc
      </button>
    </div>
    <div className="flex flex-col gap-2">
      <h2 className="title">{heading}</h2>
      {note !== undefined && <p className="text-muted">{note}</p>}
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
      className="m-0 size-full max-h-none max-w-none place-items-center bg-transparent p-6 backdrop:bg-coal/45 open:grid"
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
      <div className="relative flex w-full justify-center">{children}</div>
    </dialog>
  );
};

export const Sheet = ({
  callbackURL = "/dashboard",
  heading = "Make your list in a minute.",
  label = "Sign in",
  note,
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
    <Card heading={heading} label={label} note={note} onClose={close}>
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
