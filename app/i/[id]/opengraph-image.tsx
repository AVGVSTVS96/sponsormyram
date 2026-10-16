import { itemNumber, items } from "@/lib/rig";
import { card } from "../../card";

export { size } from "../../card";
export const contentType = "image/png";
export const alt = "A sponsormyram wish list item";
export const generateStaticParams = () => items.map(({ id }) => ({ id }));

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = items.find((entry) => entry.id === id)!;
  return card(`Wish list · ${itemNumber(item)}`, item.title);
}
