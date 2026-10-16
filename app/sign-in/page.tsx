import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

import { Footer, Header } from "../ui/frame";
import { here } from "../ui/here";
import { Sheet } from "./sheet";

const SignIn = async ({ searchParams }: PageProps<"/sign-in">) => {
  const { user } = await withAuth();

  if (user !== null) {
    redirect("/dashboard");
  }

  const site = await here();

  return (
    <div className="flex min-h-dvh flex-col">
      <Header here={site} />
      <main className="flex flex-1 flex-col">
        <div className="flex flex-1 items-start justify-center px-6 py-16 md:py-24">
          <Sheet failed={"failed" in (await searchParams)} />
        </div>
      </main>
      <Footer here={site} />
    </div>
  );
};

export default SignIn;
