import { withAuth } from "@workos-inc/authkit-nextjs";
import Link from "next/link";

import { brandList, brands, domain } from "@/lib/brand";
import type { Site } from "@/lib/brand";

import { solid } from "./parts";

const repo = "https://github.com/AVGVSTVS96/sponsormyram";

const Nav = ({ here }: { here: Site }) => (
  <nav className="hidden gap-4 label md:flex">
    {brandList.map((brand) => (
      <a
        className={
          brand === here.brand
            ? "border-b-2 border-ink pb-1 text-ink"
            : "pb-1 text-muted transition-colors hover:text-ink"
        }
        href={brand === here.brand ? "/" : here.origin(brand)}
        key={brand}
      >
        {brands[brand].word}
      </a>
    ))}
  </nav>
);

export const AuthLink = ({
  className,
  here,
  children,
}: {
  children: React.ReactNode;
  className: string;
  here: Site;
}) =>
  here.brand === "ram" ? (
    <Link className={className} href="/sign-in">
      {children}
    </Link>
  ) : (
    <a className={className} href={`${here.origin("ram")}/sign-in`}>
      {children}
    </a>
  );

export const Header = async ({ here }: { here: Site }) => {
  const { user } = here.brand === "ram" ? await withAuth() : { user: null };
  const signedIn = user !== null;

  return (
    <header className="flex h-20 items-center justify-between gap-6 border-b-2 border-ink px-6 md:px-16">
      <div className="flex items-center gap-8">
        <Link className="font-extrabold tracking-tight" href="/">
          sponsormy{here.brand}
        </Link>
        <Nav here={here} />
      </div>
      {signedIn ? (
        <Link className={solid} href="/dashboard">
          Your list →
        </Link>
      ) : (
        <div className="flex items-center gap-6">
          <AuthLink
            className="hidden label hover:underline md:block"
            here={here}
          >
            Sign in
          </AuthLink>
          <AuthLink className={solid} here={here}>
            Make your list →
          </AuthLink>
        </div>
      )}
    </header>
  );
};

export const Footer = ({ here }: { here: Site }) => (
  <footer className="flex flex-col gap-4 border-t border-rule px-6 py-8 label text-muted md:flex-row md:items-center md:justify-between md:px-16">
    <div className="flex flex-wrap gap-4">
      {brandList.map((brand) => (
        <a
          className={brand === here.brand ? "text-ink" : "hover:text-ink"}
          href={here.origin(brand)}
          key={brand}
        >
          {domain(here.origin(brand))}
        </a>
      ))}
    </div>
    <span>Half joke, half not · nothing is sold here</span>
    <a className="hover:text-ink" href={repo}>
      Open source → GitHub
    </a>
  </footer>
);
