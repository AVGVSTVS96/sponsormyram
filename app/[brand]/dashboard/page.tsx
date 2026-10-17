import type { Metadata } from "next";
import { Suspense } from "react";

import { Footer, Header } from "@/app/ui/frame";
import { Providers } from "@/app/ui/providers";

import { Dashboard } from "./dashboard";
import { Mine } from "./mine";

export const metadata: Metadata = {
  robots: { index: false },
  title: "Your list · sponsormyram",
};

const DashboardPage = () => (
  <Providers>
    <div className="flex min-h-dvh flex-col">
      <Header here="ram">
        <Mine />
      </Header>
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
