import { brand } from "next/root-params";

import { toBrand } from "@/lib/brand";

export const here = async () => toBrand(await brand());
