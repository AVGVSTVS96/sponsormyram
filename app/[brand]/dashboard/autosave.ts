"use client";

import { startTransition, useRef, useState } from "react";

import { attempt } from "@/app/ui/say";

export const useAutosave = <T>(
  initial: T,
  save: (value: T) => Promise<null>
) => {
  const [value, setValue] = useState(initial);
  const [status, setStatus] = useState("");
  const timer = useRef(0);

  const update = (next: T) => {
    setValue(next);
    setStatus("Saving…");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      startTransition(async () => {
        const problem = await attempt(async () => await save(next));

        setStatus(problem ?? "✓ Saved");
      });
    }, 600);
  };

  return [value, update, status] as const;
};
