const nb = "\u00A0";

const glue = (text: string) => {
  const joined = text
    .replaceAll(/(?<times>\d×)\s+/gu, `$<times>${nb}`)
    .replaceAll(
      /(?<digit>\d)\s+(?<unit>GB|TB|MB|MT\/s|mm|W|TBW)\b/gu,
      `$<digit>${nb}$<unit>`
    )
    .replaceAll(/\s+\/\s+/gu, `${nb}/${nb}`);

  const last = joined.lastIndexOf(" ");
  const words = joined.split(" ").length;

  return last > 0 && words >= 4 && joined.length - last <= 15
    ? `${joined.slice(0, last)}${nb}${joined.slice(last + 1)}`
    : joined;
};

const whole = /(?<token>\S+-\S+)/gu;

export const Prose = ({ text }: { text: string }) =>
  glue(text)
    .split(whole)
    .map((part, index) =>
      index % 2 === 1 ? (
        <span className="whitespace-nowrap" key={`${index}-${part}`}>
          {part}
        </span>
      ) : (
        part
      )
    );
