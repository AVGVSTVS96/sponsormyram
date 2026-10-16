import { ConvexError } from "convex/values";

export const attempt = async <T>(run: () => Promise<T>) => {
  try {
    await run();

    return null;
  } catch (error) {
    return error instanceof ConvexError
      ? String(error.data)
      : "Something broke. Try again.";
  }
};
