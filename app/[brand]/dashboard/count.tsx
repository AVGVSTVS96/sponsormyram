"use client";

import { useEffect, useRef, useState } from "react";

import { Readout } from "@/app/ui/lights";

const steps = 8;

export const Count = ({
  className,
  frame,
  tone,
  value,
}: {
  className?: string;
  frame?: string;
  tone?: "green" | "red";
  value: number;
}) => {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const start = from.current;

    const still =
      start === value || matchMedia("(prefers-reduced-motion: reduce)").matches;

    const step = Math.max(
      8,
      Math.ceil(Math.abs(value - start) / steps / 8) * 8
    );

    let at = start;

    from.current = value;

    const timer = setInterval(
      () => {
        at =
          value > at ? Math.min(value, at + step) : Math.max(value, at - step);

        if (still) {
          at = value;
        }

        setShown(at);

        if (at === value) {
          clearInterval(timer);
        }
      },
      still ? 0 : 60
    );

    return () => {
      clearInterval(timer);
    };
  }, [value]);

  return (
    <Readout
      className={className}
      frame={frame}
      text={String(shown).padStart(2, "0")}
      tone={tone}
    />
  );
};
