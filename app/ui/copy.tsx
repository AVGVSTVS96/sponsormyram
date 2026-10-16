"use client";

import { startTransition, useState } from "react";

export const Copy = ({
  children,
  className,
  text,
}: {
  children: React.ReactNode;
  className: string;
  text: string;
}) => {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className={className}
      onClick={() => {
        startTransition(async () => {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 1600);
        });
      }}
      type="button"
    >
      {copied ? "Copied ✓" : children}
    </button>
  );
};
