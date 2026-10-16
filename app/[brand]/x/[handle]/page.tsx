import { ListPage, listMetadata } from "@/app/ui/list-page";

export const ensureStatic = "navigation";

export const generateStaticParams = () => [{ handle: "api" }];

export const generateMetadata = async ({
  params,
}: PageProps<"/[brand]/x/[handle]">) => {
  const { handle } = await params;

  return await listMetadata(`x/${handle}`);
};

const Page = async ({ params }: PageProps<"/[brand]/x/[handle]">) => {
  const { handle } = await params;

  return <ListPage handle={`x/${handle}`} />;
};

export default Page;
