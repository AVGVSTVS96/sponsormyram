import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Footer } from "@/app/ui/frame";
import { Providers } from "@/app/ui/providers";

import { Dashboard } from "./dashboard";
import { SignOut } from "./out";

export const metadata: Metadata = {
  robots: { index: false },
  title: "Your list · sponsormyram",
};

const DashboardPage = () => (
  <Providers>
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-20 items-center justify-between gap-6 border-b-2 border-ink px-6 md:px-16">
        <div className="flex items-center gap-8">
          <Link className="font-extrabold tracking-tight" href="/">
            sponsormyram
          </Link>
          <span className="hidden label text-muted md:block">Dashboard</span>
        </div>
        <SignOut />
      </header>
      <main className="flex-1">
        <Suspense>
          <Dashboard />
        </Suspense>
      </main>
      <Footer here="ram" />
    </div>
  </Providers>
);

export default DashboardPage;
