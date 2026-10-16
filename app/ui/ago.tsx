"use client";

import { useSyncExternalStore } from "react";

const minute = 60_000;

const subscribe = (tick: () => void) => {
  const timer = setInterval(tick, minute);

  return () => {
    clearInterval(timer);
  };
};

const now = () => Math.floor(Date.now() / minute);

const since = (minutes: number) => {
  if (minutes < 60) {
    return `${Math.max(1, minutes)} min`;
  }

  if (minutes < 60 * 24) {
    return `${Math.round(minutes / 60)} h`;
  }

  return `${Math.round(minutes / 60 / 24)} d`;
};

export const Ago = ({ time }: { time: number }) => {
  const at = useSyncExternalStore(subscribe, now, () => null);

  return (
    <time dateTime={new Date(time).toISOString()}>
      {at === null
        ? new Date(time).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
          })
        : since(at - Math.floor(time / minute))}
    </time>
  );
};
