import { ListPage, listMetadata } from "@/app/ui/list-page";

export const ensureStatic = "navigation";

export const generateStaticParams = () => [{ handle: "avgvstvs96" }];

export const generateMetadata = async ({
  params,
}: PageProps<"/[brand]/[handle]">) => {
  const { handle } = await params;

  return await listMetadata(handle);
};

const Page = async ({ params }: PageProps<"/[brand]/[handle]">) => {
  const { handle } = await params;

  return <ListPage handle={handle} />;
};

export default Page;
