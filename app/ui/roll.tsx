const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export const Roll = ({ text }: { text: string }) => {
  const parts = text.match(/\d|\D+/gu) ?? [];

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline-flex tabular-nums">
        {parts.map((part, index) =>
          /\d/u.test(part) ? (
            <span
              className="inline-block h-[1lh] overflow-hidden"
              key={parts.length - index}
            >
              <span
                className="motion-safe:animate-roll flex flex-col motion-safe:transition-[translate] motion-safe:duration-(--spring-slow) motion-safe:ease-(--ease-spring)"
                style={{ translate: `0 calc(${part} * -1lh)` }}
              >
                {digits.map((digit) => (
                  <span key={digit}>{digit}</span>
                ))}
                <span>0</span>
              </span>
            </span>
          ) : (
            <span key={parts.length - index}>{part}</span>
          )
        )}
      </span>
    </>
  );
};
