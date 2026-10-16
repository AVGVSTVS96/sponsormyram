import { ItemPage, itemMetadata } from "@/app/ui/item-page";

export const ensureStatic = "navigation";

export const generateStaticParams = () => [
  { handle: "avgvstvs96", slug: "ddr4-4x32" },
];

export const generateMetadata = async ({
  params,
}: PageProps<"/[brand]/gh/[handle]/[slug]">) => {
  const { handle, slug } = await params;

  return await itemMetadata(`gh/${handle}`, slug);
};

const Page = async ({ params }: PageProps<"/[brand]/gh/[handle]/[slug]">) => {
  const { handle, slug } = await params;

  return <ItemPage handle={`gh/${handle}`} slug={slug} />;
};

export default Page;
