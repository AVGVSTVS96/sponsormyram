import type { Doc } from "@/convex/_generated/dataModel";

import { Ram } from "./glyphs";

type Rig = NonNullable<Doc<"users">["rig"]>;

export const slotName = (index: number) =>
  `${String.fromCodePoint(65 + Math.floor(index / 2))}${(index % 2) + 1}`;

export const installed = (rig: Rig) =>
  rig.slots.reduce((sum, gb) => sum + gb, 0);

export const RigView = ({ rig }: { rig: Rig }) => {
  const filled = Math.min(100, (installed(rig) / Math.max(rig.maxGB, 1)) * 100);

  return (
    <section className="flex flex-col gap-6 border-t-2 border-ink px-6 py-12 md:px-16">
      <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
        <h2 className="title">The rig, slot by slot</h2>
        <span className="label text-muted">{rig.board}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4 md:gap-x-16">
        {rig.slots.map((gb, index) => (
          <div className="flex flex-col gap-2" key={slotName(index)}>
            {gb === 0 ? (
              <div className="flex aspect-[220/56] items-center justify-center border-2 border-dashed border-ink label">
                Empty
              </div>
            ) : (
              <Ram className="w-full" />
            )}
            <div className="flex justify-between label text-muted">
              {gb === 0 ? (
                <span>{slotName(index)} · free</span>
              ) : (
                <span className="text-ink">{gb}GB</span>
              )}
              {gb !== 0 && <span>{slotName(index)}</span>}
            </div>
          </div>
        ))}
      </div>
      <div className="hidden flex-col gap-3 md:flex">
        <div className="flex h-6">
          <div className="bg-ink" style={{ width: `${filled}%` }} />
          <div className="flex-1 border-2 border-dashed border-ink" />
        </div>
        <div className="flex justify-between label text-muted">
          <span>{installed(rig)}GB installed</span>
          <span>{rig.maxGB}GB supported</span>
        </div>
      </div>
    </section>
  );
};
