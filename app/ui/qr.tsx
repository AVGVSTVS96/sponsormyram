import { encode } from "uqr";

export const Qr = ({ value }: { value: string }) => {
  const { data, size } = encode(value, { border: 2, ecc: "M" });

  const runs = data.flatMap((row, y) =>
    [
      ...row
        .map((dark) => (dark ? "1" : "0"))
        .join("")
        .matchAll(/1+/gu),
    ].map(
      ({ 0: run, index }) => `M${index} ${y}h${run.length}v1h-${run.length}z`
    )
  );

  return (
    <svg
      aria-hidden
      className="block w-full [shape-rendering:crispEdges]"
      viewBox={`0 0 ${size} ${size}`}
    >
      <rect className="fill-white" height={size} width={size} />
      <path className="fill-coal" d={runs.join("")} />
    </svg>
  );
};
