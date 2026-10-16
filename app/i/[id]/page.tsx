import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { itemNumber, items } from "@/lib/rig";
import { Actions, Chips, Footer, Header } from "../../ui";

type Props = { params: Promise<{ id: string }> };

const find = async ({ params }: Props) => {
  const { id } = await params;
  return items.find((item) => item.id === id);
};

export const generateStaticParams = () => items.map(({ id }) => ({ id }));
export const dynamicParams = false;

export async function generateMetadata(props: Props): Promise<Metadata> {
  const item = await find(props);
  return item ? { title: `${item.title} · Sponsor my RAM`, description: item.why } : {};
}

export default async function ItemPage(props: Props) {
  const item = await find(props);
  if (!item) notFound();
  return (
    <main className="flex min-h-dvh flex-col">
      <Header />
      <section className="flex flex-1 flex-col justify-end gap-6 px-6 py-16 md:px-16 md:py-24">
        <span className="label text-muted">Wish list · {itemNumber(item)}</span>
        <h1 className="display">{item.title}</h1>
        <p className="max-w-[600px]">{item.why}</p>
        <Chips item={item} />
        <Actions item={item} />
      </section>
      <div className="h-6 bg-pcb" />
      <Footer />
    </main>
  );
}
