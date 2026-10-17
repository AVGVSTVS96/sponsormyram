import { Fit } from "./fit";
import { Footer, Header } from "./frame";
import { here } from "./here";

export const Legal = async ({
  intro,
  rows,
  title,
}: {
  intro?: string;
  rows: readonly (readonly [string, string])[];
  title: string;
}) => {
  const brand = await here();

  return (
    <div className="flex min-h-dvh flex-col">
      <Header here={brand} />
      <main className="flex flex-1 flex-col gap-10 px-5 pt-10 pb-16 md:gap-14 md:px-16 md:pt-20 md:pb-28">
        <div className="flex flex-col gap-4 md:gap-6">
          <span className="silk text-muted">{title} · Oct 2026</span>
          <Fit as="h1" cap={120} lines={[`${title}.`]} />
          {intro !== undefined && (
            <p className="max-w-[620px] text-[17px] md:text-xl">{intro}</p>
          )}
        </div>
        <dl className="flex flex-col border-t border-rule md:max-w-[968px]">
          {rows.map(([term, detail]) => (
            <div
              className="flex flex-col gap-1.5 border-b border-rule py-4 md:flex-row md:gap-6 md:py-5"
              key={term}
            >
              <dt className="font-semibold md:w-56 md:shrink-0">{term}</dt>
              <dd className="max-w-[620px] text-[17px]">{detail}</dd>
            </div>
          ))}
        </dl>
      </main>
      <Footer here={brand} />
    </div>
  );
};
