const patterns =
  "212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 114131 311141 411131 211412 211214 211232".split(
    " "
  );

const start = 104;
const stop = "2331112";

export const code128 = (text: string) => {
  const codes = [
    start,
    ...Array.from(text, (char) => (char.codePointAt(0) ?? 32) - 32),
  ];

  const check =
    codes.reduce((sum, code, index) => sum + code * Math.max(index, 1), 0) %
    103;

  const widths = Array.from(
    [...codes, check].map((code) => patterns[code] ?? "").join("") + stop,
    Number
  );

  const lefts = widths.map((_, index) =>
    widths.slice(0, index).reduce((sum, width) => sum + width, 0)
  );

  return {
    bars: widths.flatMap((width, index) =>
      index % 2 === 0 ? [[lefts[index] ?? 0, width] as const] : []
    ),
    x: widths.reduce((sum, width) => sum + width, 0),
  };
};

export const barcode = (text: string) => {
  const { bars, x } = code128(text);
  const quiet = 10;

  return {
    d: bars
      .map(([at, width]) => `M${at + quiet} 0h${width}v1h-${width}z`)
      .join(""),
    width: x + quiet * 2,
  };
};
