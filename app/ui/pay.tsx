import { ways } from "@/lib/pay";
import type { PayTo, Way } from "@/lib/pay";

import { Copy } from "./copy";
import { Fit } from "./fit";
import { solid } from "./parts";
import { Qr } from "./qr";

const row =
  "flex min-h-21 items-center justify-between gap-4 bg-surf px-4 py-4 md:px-6";

const action = "press link shrink-0 text-[15px] font-semibold";

const Name = ({ label, shown }: { label: string; shown: string }) => (
  <span className="flex min-w-0 flex-col gap-0.5">
    <span className="text-lg font-[650] md:text-xl">{label}</span>
    <span className="truncate text-[15px] text-muted md:text-base">
      {shown}
    </span>
  </span>
);

const Reveal = ({ owner, pay }: { owner: string; pay: PayTo }) => {
  const way: Way = ways[pay.method];
  const id = `pay-${pay.method}`;

  return (
    <li className={row}>
      <Name label={way.label} shown="Shows when you tap" />
      <button className={action} popoverTarget={id} type="button">
        Show
      </button>
      <div
        className="m-auto w-[calc(100%-40px)] max-w-[400px] border-2 border-ink bg-paper p-6 text-ink backdrop:bg-coal/55 motion-safe:transition-[opacity,scale] motion-safe:duration-200 motion-safe:ease-out md:p-8 motion-safe:starting:open:scale-97 motion-safe:starting:open:opacity-0"
        id={id}
        popover="auto"
      >
        <div className="flex flex-col gap-5">
          <div className="flex justify-between gap-4">
            <span className="silk text-muted">
              {way.label} · {owner}
            </span>
            <button
              className="press text-[15px] font-medium text-muted hover:text-ink"
              popoverTarget={id}
              popoverTargetAction="hide"
              type="button"
            >
              Close
            </button>
          </div>
          <p className="font-mono text-lg font-bold break-all">{pay.to}</p>
          <Copy className={solid} text={pay.to}>
            Copy
          </Copy>
          {"warn" in way && (
            <p className="text-[15px] text-muted">{way.warn}</p>
          )}
        </div>
      </div>
    </li>
  );
};

const Coin = ({ pay }: { pay: PayTo }) => {
  const way: Way = ways[pay.method];

  if (!("qr" in way)) {
    return null;
  }

  return (
    <li className="flex items-center gap-6 bg-surf p-5 md:p-6">
      <div className="w-26 shrink-0 bg-white p-2 md:w-36">
        <Qr value={way.qr(pay.to)} />
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <span className="text-xl font-[650]">{way.label}</span>
        <span className="truncate font-mono text-[17px]">
          {way.show(pay.to)}
        </span>
        <Copy className={`${action} self-start`} text={pay.to}>
          Copy address
        </Copy>
      </div>
    </li>
  );
};

const Open = ({ pay }: { pay: PayTo }) => {
  const way: Way = ways[pay.method];

  if (!("open" in way)) {
    return null;
  }

  return (
    <li className={row}>
      <Name label={way.label} shown={`${way.prefix}${pay.to}`} />
      <a
        className={action}
        href={way.open(pay.to)}
        rel="noreferrer"
        target="_blank"
      >
        {pay.method === "venmo" || pay.method === "cashapp"
          ? `Open ${way.label}`
          : "Open"}
      </a>
    </li>
  );
};

const coins = new Set(["btc", "eth", "sol"]);

export const ChipIn = ({ owner, pay }: { owner: string; pay: PayTo[] }) => {
  if (pay.length === 0) {
    return null;
  }

  const links = pay.filter((each) => !coins.has(each.method));
  const wallets = pay.filter((each) => coins.has(each.method));

  return (
    <section
      className="flex scroll-mt-6 flex-col gap-6 px-5 pb-16 md:px-16 md:pb-30 xl:flex-row xl:gap-16"
      id="chip-in"
    >
      <div className="flex flex-col gap-4 xl:w-[420px] xl:shrink-0">
        <Fit cap={64} lead={1} lines={["Or chip in"]} track={-0.045} />
        <p className="max-w-[520px] md:text-lg">
          Parts are the point, but these work too. Each one opens the app or
          copies the details; the site never touches the&nbsp;money.
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
        {links.length > 0 && (
          <ul className="flex min-w-0 flex-1 flex-col gap-1">
            {links.map((each) =>
              each.method === "zelle" ? (
                <Reveal key={each.method} owner={owner} pay={each} />
              ) : (
                <Open key={each.method} pay={each} />
              )
            )}
          </ul>
        )}
        {wallets.length > 0 && (
          <ul className="flex min-w-0 flex-col gap-1 lg:w-[380px] lg:shrink-0">
            {wallets.map((each) => (
              <Coin key={each.method} pay={each} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
