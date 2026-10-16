import { ItemPage, itemMetadata } from "@/app/ui/item-page";

export const ensureStatic = "navigation";

export const generateStaticParams = () => [
  { handle: "avgvstvs96", slug: "ddr4-4x32" },
];

export const generateMetadata = async ({
  params,
}: PageProps<"/[brand]/[handle]/[slug]">) => {
  const { handle, slug } = await params;

  return await itemMetadata(handle, slug);
};

const Page = async ({ params }: PageProps<"/[brand]/[handle]/[slug]">) => {
  const { handle, slug } = await params;

  return <ItemPage handle={handle} slug={slug} />;
};

export default Page;
