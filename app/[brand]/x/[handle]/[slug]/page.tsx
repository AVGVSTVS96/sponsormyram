import { ItemPage, itemMetadata } from "@/app/ui/item-page";

export const ensureStatic = "navigation";

export const generateStaticParams = () => [{ handle: "api", slug: "ram" }];

export const generateMetadata = async ({
  params,
}: PageProps<"/[brand]/x/[handle]/[slug]">) => {
  const { handle, slug } = await params;

  return await itemMetadata(`x/${handle}`, slug);
};

const Page = async ({ params }: PageProps<"/[brand]/x/[handle]/[slug]">) => {
  const { handle, slug } = await params;

  return <ItemPage handle={`x/${handle}`} slug={slug} />;
};

export default Page;
