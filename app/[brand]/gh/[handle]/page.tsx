import { ListPage, listMetadata } from "@/app/ui/list-page";

export const ensureStatic = "navigation";

export const generateStaticParams = () => [{ handle: "avgvstvs96" }];

export const generateMetadata = async ({
  params,
}: PageProps<"/[brand]/gh/[handle]">) => {
  const { handle } = await params;

  return await listMetadata(`gh/${handle}`);
};

const Page = async ({ params }: PageProps<"/[brand]/gh/[handle]">) => {
  const { handle } = await params;

  return <ListPage handle={`gh/${handle}`} />;
};

export default Page;
