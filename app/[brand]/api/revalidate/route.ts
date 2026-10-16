import { revalidateTag } from "next/cache";

export const POST = async (request: Request) => {
  const secret = process.env.REVALIDATE_SECRET;

  if (
    secret === undefined ||
    secret === "" ||
    request.headers.get("authorization") !== `Bearer ${secret}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.text();
  const tags = body.split("\n").filter((tag) => tag !== "");

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return Response.json({ revalidated: tags });
};
