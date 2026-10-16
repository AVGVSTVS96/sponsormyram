import type { Metadata } from "next";
import { Suspense } from "react";

import { Footer, Header } from "@/app/ui/frame";
import { Sheet } from "@/app/ui/sheet";

export const metadata: Metadata = {
  robots: { index: false },
  title: "Sign in · sponsormyram",
};

const SignIn = () => (
  <div className="flex min-h-dvh flex-col">
    <Header here="ram" />
    <main className="flex flex-1 flex-col">
      <div className="flex flex-1 items-start justify-center px-6 py-16 md:py-24">
        <Suspense>
          <Sheet />
        </Suspense>
      </div>
    </main>
    <Footer here="ram" />
  </div>
);

export default SignIn;
