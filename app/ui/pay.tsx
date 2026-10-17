import { ways } from "@/lib/pay";
import type { PayTo, Way } from "@/lib/pay";

import { Copy } from "./copy";
import { solid } from "./parts";
import { Qr } from "./qr";

const tile =
  "group flex min-h-24 w-full flex-col justify-between gap-4 rounded-chip border-2 border-ink p-4 text-left transition-colors hover:bg-ink hover:text-paper";

const Face = ({
  corner,
  label,
  shown,
}: {
  corner: React.ReactNode;
  label: string;
  shown: string;
}) => (
  <>
    <span className="label flex justify-between gap-4">
      <span>{label}</span>
      <span className="text-muted group-hover:text-paper">{corner}</span>
    </span>
    <span className="truncate font-mono text-lg font-bold">{shown}</span>
  </>
);

const Sheet = ({
  id,
  label,
  owner,
  qr,
  to,
  warn,
}: {
  id: string;
  label: string;
  owner: string;
  qr: string;
  to: string;
  warn: string;
}) => (
  <div
    className="rounded-sheet m-auto w-[calc(100%-48px)] max-w-[400px] border-2 border-ink bg-paper p-6 text-ink backdrop:bg-coal/45 motion-safe:transition-[opacity,scale] motion-safe:duration-(--spring-fast) motion-safe:ease-(--ease-spring) md:p-8 motion-safe:starting:open:scale-95 motion-safe:starting:open:opacity-0"
    id={id}
    popover="auto"
  >
    <div className="flex flex-col gap-5">
      <div className="label flex justify-between gap-4">
        <span>
          {label} · {owner}
        </span>
        <button
          className="text-muted hover:text-ink"
          popoverTarget={id}
          popoverTargetAction="hide"
          type="button"
        >
          Esc
        </button>
      </div>
      <div className="rounded-chip hidden overflow-hidden border-2 border-ink md:block">
        <Qr value={qr} />
      </div>
      <p className="font-mono text-lg font-bold break-all">{to}</p>
      <Copy className={solid} text={to}>
        Copy
      </Copy>
      <p className="label text-center text-muted">{warn}</p>
    </div>
  </div>
);

const Method = ({ owner, pay }: { owner: string; pay: PayTo }) => {
  const way: Way = ways[pay.method];

  if ("open" in way) {
    return (
      <a className={tile} href={way.open(pay.to)}>
        <Face corner="↗" label={way.label} shown={way.show(pay.to)} />
      </a>
    );
  }

  const id = `pay-${pay.method}`;

  return (
    <>
      <button className={tile} popoverTarget={id} type="button">
        <Face
          corner={
            <>
              <span className="md:hidden">Copy</span>
              <span className="hidden md:inline">QR · Copy</span>
            </>
          }
          label={way.label}
          shown={way.show(pay.to)}
        />
      </button>
      <Sheet
        id={id}
        label={way.label}
        owner={owner}
        qr={way.qr(pay.to)}
        to={pay.to}
        warn={way.warn}
      />
    </>
  );
};

export const ChipIn = ({ owner, pay }: { owner: string; pay: PayTo[] }) =>
  pay.length === 0 ? null : (
    <section
      className="scroll-mt-6 border-t-2 border-ink px-6 py-12 md:px-16"
      id="chip-in"
    >
      <div className="flex flex-col gap-1 pb-6 md:flex-row md:items-baseline md:justify-between">
        <h2 className="title">Or chip in</h2>
        <span className="label text-muted">
          Straight to {owner} · nothing goes through this site
        </span>
      </div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {pay.map((each) => (
          <li className="flex" key={each.method}>
            <Method owner={owner} pay={each} />
          </li>
        ))}
      </ul>
    </section>
  );
