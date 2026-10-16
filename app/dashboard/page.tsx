import { withAuth } from "@workos-inc/authkit-nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { leave } from "../sign-in/actions";
import { Footer } from "../ui/frame";
import { here } from "../ui/here";
import { Dashboard } from "./dashboard";
import { Providers } from "./providers";

export const metadata: Metadata = {
  robots: { index: false },
  title: "Your list · sponsormyram",
};

const DashboardPage = async () => {
  const { user } = await withAuth();

  if (user === null) {
    redirect("/sign-in");
  }

  const site = await here();

  return (
    <Providers>
      <div className="flex min-h-dvh flex-col">
        <header className="flex h-20 items-center justify-between gap-6 border-b-2 border-ink px-6 md:px-16">
          <div className="flex items-center gap-8">
            <Link className="font-extrabold tracking-tight" href="/">
              sponsormyram
            </Link>
            <span className="hidden label text-muted md:block">Dashboard</span>
          </div>
          <form action={leave}>
            <button className="label text-muted hover:text-ink" type="submit">
              Sign out
            </button>
          </form>
        </header>
        <main className="flex-1">
          <Dashboard origin={site.origin("ram")} />
        </main>
        <Footer here={site} />
      </div>
    </Providers>
  );
};

export default DashboardPage;
