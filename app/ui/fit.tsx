import { Fragment } from "react";

const glyphs =
  " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~×″’‘“”…·—–→↓é";

const advances = [
  221, 272, 405, 626, 683, 833, 734, 212, 339, 339, 419, 574, 248, 417, 248,
  536, 703, 470, 665, 662, 670, 686, 638, 551, 684, 643, 315, 315, 552, 556,
  552, 602, 981, 750, 710, 745, 723, 628, 609, 751, 724, 310, 637, 705, 592,
  927, 753, 788, 679, 781, 706, 695, 615, 708, 751, 1038, 715, 650, 610, 404,
  516, 404, 473, 563, 288, 609, 647, 615, 647, 620, 464, 647, 621, 294, 355,
  666, 328, 907, 621, 633, 647, 647, 440, 586, 462, 618, 633, 859, 671, 603,
  598, 414, 304, 414, 523, 553, 470, 261, 261, 494, 494, 737, 248, 913, 597,
  792, 704, 620,
];

export const graphemes = (text: string) =>
  [...new Intl.Segmenter().segment(text)].map(({ segment }) => segment);

const advance = new Map(
  graphemes(glyphs).map((glyph, index) => [glyph, advances[index] ?? 750])
);

export const ems = (text: string, track: number) =>
  graphemes(text).reduce(
    (sum, glyph) => sum + (advance.get(glyph) ?? 750) / 1000 + track,
    0
  );

export const fitSize = (lines: string[], cap: number, track = -0.05) => {
  const widest = Math.max(...lines.map((line) => ems(line, track)), 1);

  return `min(${cap}px, ${(97 / widest).toFixed(2)}cqi)`;
};

type Tag = "h1" | "h2" | "h3" | "p" | "span";

export const Fit = ({
  as: As = "h2",
  cap,
  className = "",
  flow = false,
  lead = 0.9,
  lines,
  track = -0.05,
}: {
  as?: Tag;
  cap: number;
  className?: string;
  flow?: boolean;
  lead?: number;
  lines: string[];
  track?: number;
}) => (
  <As className={`fit min-w-0 ${className}`}>
    <span
      className={flow ? "block text-balance" : "flex flex-col"}
      style={{
        fontSize: fitSize(lines, cap, track),
        letterSpacing: `${track}em`,
        lineHeight: lead,
      }}
    >
      {lines.map((line, index) => (
        <Fragment key={line}>
          {flow && index > 0 && " "}
          <span className="whitespace-nowrap">{line}</span>
        </Fragment>
      ))}
    </span>
  </As>
);
