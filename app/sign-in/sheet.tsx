"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { outline, solid } from "../ui/parts";
import { continueWith, sendCode, verifyCode } from "./actions";

const field =
  "h-11 w-full rounded-chip border-2 border-ink bg-paper px-3 font-mono text-base outline-none placeholder:text-muted focus:border-pcb";

const GitHub = () => (
  <svg aria-hidden className="size-5 fill-current" viewBox="0 0 24 24">
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);

const Google = () => (
  <svg aria-hidden className="size-5 fill-current" viewBox="0 0 24 24">
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.19-1.79 4.13-1.15 1.15-2.93 2.4-6.05 2.4-4.83 0-8.6-3.89-8.6-8.72s3.77-8.72 8.6-8.72c2.6 0 4.5 1.03 5.9 2.35l2.31-2.31C18.75 1.44 16.13 0 12.48 0 5.87 0 .31 5.39.31 12s5.56 12 12.17 12c3.57 0 6.27-1.17 8.37-3.36 2.16-2.16 2.84-5.21 2.84-7.67 0-.76-.05-1.47-.17-2.05H12.48Z" />
  </svg>
);

const github = continueWith.bind(null, "github");
const google = continueWith.bind(null, "google");

const Form = ({ failed }: { failed: boolean }) => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);

  const [error, setError] = useState(
    failed ? "Sign-in didn't finish. Try again." : null
  );

  const [pending, start] = useTransition();

  const send = () => {
    start(async () => {
      const problem = await sendCode(email);

      setError(problem);
      setSent(problem === null);
    });
  };

  const verify = () => {
    start(async () => {
      setError((await verifyCode(email, code)) ?? null);
    });
  };

  if (sent) {
    return (
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          verify();
        }}
      >
        <p>
          We sent a code to <strong>{email}</strong>.
        </p>
        <input
          aria-label="Code from the email"
          autoComplete="one-time-code"
          autoFocus
          className={`${field} tracking-[0.4em]`}
          inputMode="numeric"
          maxLength={6}
          onChange={(event) => {
            setCode(event.target.value);
          }}
          placeholder="000000"
          value={code}
        />
        <button
          className={solid}
          disabled={pending || code.length < 6}
          type="submit"
        >
          {pending ? "Checking…" : "Sign in →"}
        </button>
        <button
          className="pt-1 label text-muted hover:text-ink"
          onClick={() => {
            setSent(false);
          }}
          type="button"
        >
          Wrong email? Start over
        </button>
        {error !== null && (
          <p className="text-center label text-ink">{error}</p>
        )}
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <form className="flex flex-col gap-3">
        <button className={outline} formAction={github} type="submit">
          <GitHub /> Continue with GitHub
        </button>
        <button className={outline} formAction={google} type="submit">
          <Google /> Continue with Google
        </button>
      </form>
      <div className="flex items-center gap-4 py-1 label text-muted">
        <span className="h-px flex-1 bg-rule" />
        or
        <span className="h-px flex-1 bg-rule" />
      </div>
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <input
          aria-label="Email"
          autoComplete="email"
          className={field}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
          placeholder="you@example.com"
          type="email"
          value={email}
        />
        <button
          className={solid}
          disabled={pending || email === ""}
          type="submit"
        >
          {pending ? "Sending…" : "Email me a code →"}
        </button>
      </form>
      <p
        className={`pt-1 text-center label ${error === null ? "text-muted" : "text-ink"}`}
      >
        {error ?? "No password. Nothing gets posted for you."}
      </p>
    </div>
  );
};

const Card = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => (
  <div className="flex w-full max-w-[440px] flex-col gap-5 rounded-sheet border-2 border-ink bg-paper p-8">
    <div className="flex justify-between label">
      <span>Sign in</span>
      <button
        className="text-muted hover:text-ink"
        onClick={onClose}
        type="button"
      >
        Esc
      </button>
    </div>
    <h2 className="title">Make your list in a minute.</h2>
    {children}
  </div>
);

export const Sheet = ({
  failed = false,
  modal = false,
}: {
  failed?: boolean;
  modal?: boolean;
}) => {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);

  const close = () => {
    if (modal) {
      router.back();
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    if (modal) {
      dialog.current?.showModal();
    }
  }, [modal]);

  if (!modal) {
    return (
      <Card onClose={close}>
        <Form failed={failed} />
      </Card>
    );
  }

  return (
    <dialog
      className="m-0 size-full max-h-none max-w-none place-items-center bg-transparent p-6 backdrop:bg-coal/45 open:grid"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      ref={dialog}
    >
      <button
        aria-label="Close"
        className="fixed inset-0 cursor-default"
        onClick={close}
        tabIndex={-1}
        type="button"
      />
      <div className="relative w-full max-w-[440px]">
        <Card onClose={close}>
          <Form failed={failed} />
        </Card>
      </div>
    </dialog>
  );
};
