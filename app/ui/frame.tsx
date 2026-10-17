import Link from "next/link";

import { brandList, brands, domain } from "@/lib/brand";
import type { Brand } from "@/lib/brand";
import { origin } from "@/lib/origin";

import { Account, Start } from "./account";
import { Mark } from "./art";
import { Fit } from "./fit";
import { Led } from "./lights";
import { onGreen, onGreenGhost } from "./parts";

const repo = "https://github.com/AVGVSTVS96/sponsormyram";

export const Wordmark = ({ here }: { here: Brand }) => (
  <Link className="flex items-center gap-2.5 md:gap-3" href="/">
    <Mark brand={here} className="size-6 md:size-[26px]" />
    <span className="text-lg font-[650] tracking-[-0.02em] md:text-xl">
      sponsormy{here}
    </span>
  </Link>
);

const Nav = ({ here }: { here: Brand }) => (
  <nav className="hidden gap-6.5 md:flex">
    {brandList.map((brand) => (
      <a
        aria-current={brand === here ? "page" : undefined}
        className={`flex flex-col gap-1.5 pt-2 text-[15px] ${
          brand === here
            ? "font-semibold after:h-[3px] after:bg-ink"
            : "font-medium text-muted transition-colors after:h-[3px] hover:text-ink"
        }`}
        href={brand === here ? "/" : origin(brand)}
        key={brand}
      >
        {brands[brand].word}
      </a>
    ))}
  </nav>
);

export const Header = ({
  children,
  here,
}: {
  children?: React.ReactNode;
  here: Brand;
}) => (
  <header className="flex h-16 items-center justify-between gap-4 px-5 md:h-20 md:px-16">
    <div className="flex items-center gap-11">
      <Wordmark here={here} />
      <Nav here={here} />
    </div>
    {children ?? <Account brand={here} />}
  </header>
);

const footLink = "text-silksub transition-colors hover:text-silk";

export const Footer = ({ here }: { here: Brand }) => (
  <footer className="flex flex-col gap-7 bg-board px-5 pt-14 pb-12 text-[15px] font-medium text-silk md:gap-10 md:px-16 md:pt-18 md:pb-14">
    <Fit
      as="p"
      cap={196}
      className="hidden md:block"
      lead={0.85}
      lines={[`sponsormy${here}`]}
      track={-0.065}
    />
    <Fit
      as="p"
      cap={92}
      className="md:hidden"
      lead={0.86}
      lines={["sponsor", "my", here]}
      track={-0.065}
    />
    <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
      <div className="flex flex-col gap-2 md:flex-row md:gap-7">
        {brandList.map((brand) => (
          <a
            className={brand === here ? "" : footLink}
            href={origin(brand)}
            key={brand}
          >
            {domain(origin(brand))}
          </a>
        ))}
      </div>
      <p className="font-normal">
        Half joke, half not. Nothing is sold&nbsp;here.
      </p>
      <div className="flex gap-5 md:gap-6">
        <Link className={footLink} href="/terms">
          Terms
        </Link>
        <Link className={footLink} href="/privacy">
          Privacy
        </Link>
        <a className={footLink} href={repo}>
          GitHub
        </a>
      </div>
    </div>
    <div className="flex items-center gap-2.5">
      <Led className="size-2.5" light="filled" />
      <span className="silk text-silksub">PWR</span>
    </div>
  </footer>
);

export const Close = ({ brand }: { brand: Brand }) => (
  <section className="flex flex-col gap-5 bg-green px-5 pt-14 pb-16 text-greenink md:px-16 md:py-24 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <Fit cap={76} flow lead={0.95} lines={["Your rig is", "short too."]} />
      <p className="text-[17px] md:text-xl">
        Make a list in a minute. It’s free, and nothing is sold&nbsp;here.
      </p>
    </div>
    <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
      <Start brand={brand} styles={[onGreen, onGreenGhost]} />
    </div>
  </section>
);
