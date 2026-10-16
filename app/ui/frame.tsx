import Link from "next/link";

import { brandList, brands, domain } from "@/lib/brand";
import type { Brand } from "@/lib/brand";
import { origin } from "@/lib/origin";

import { Account } from "./account";

const repo = "https://github.com/AVGVSTVS96/sponsormyram";

const Nav = ({ here }: { here: Brand }) => (
  <nav className="hidden gap-4 label md:flex">
    {brandList.map((brand) => (
      <a
        className={
          brand === here
            ? "border-b-2 border-ink pb-1 text-ink"
            : "pb-1 text-muted transition-colors hover:text-ink"
        }
        href={brand === here ? "/" : origin(brand)}
        key={brand}
      >
        {brands[brand].word}
      </a>
    ))}
  </nav>
);

export const Header = ({ here }: { here: Brand }) => (
  <header className="flex h-20 items-center justify-between gap-6 border-b-2 border-ink px-6 md:px-16">
    <div className="flex items-center gap-8">
      <Link className="font-extrabold tracking-tight" href="/">
        sponsormy{here}
      </Link>
      <Nav here={here} />
    </div>
    <Account brand={here} />
  </header>
);

export const Footer = ({ here }: { here: Brand }) => (
  <footer className="flex flex-col gap-4 border-t border-rule px-6 py-8 label text-muted md:flex-row md:items-center md:justify-between md:px-16">
    <div className="flex flex-wrap gap-4">
      {brandList.map((brand) => (
        <a
          className={brand === here ? "text-ink" : "hover:text-ink"}
          href={origin(brand)}
          key={brand}
        >
          {domain(origin(brand))}
        </a>
      ))}
    </div>
    <span>Half joke, half not · nothing is sold here</span>
    <div className="flex flex-wrap gap-4">
      <Link className="hover:text-ink" href="/terms">
        Terms
      </Link>
      <Link className="hover:text-ink" href="/privacy">
        Privacy
      </Link>
      <a className="hover:text-ink" href={repo}>
        Open source → GitHub
      </a>
    </div>
  </footer>
);
