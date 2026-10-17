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
      <main className="flex flex-1 flex-col gap-10 px-6 pt-10 pb-12 md:px-16 md:pt-20 md:pb-24">
        <div className="flex flex-col gap-3 md:gap-4">
          <span className="label text-muted">{title} · Oct 2026</span>
          <h1 className="display">{title}.</h1>
          {intro !== undefined && <p className="max-w-[620px]">{intro}</p>}
        </div>
        <dl className="border-b border-rule md:max-w-[968px]">
          {rows.map(([term, detail]) => (
            <div
              className="flex flex-col gap-1.5 border-t border-rule py-4 md:flex-row md:gap-0"
              key={term}
            >
              <dt className="label pt-1 text-muted md:w-56 md:shrink-0">
                {term}
              </dt>
              <dd className="max-w-[620px]">{detail}</dd>
            </div>
          ))}
        </dl>
      </main>
      <Footer here={brand} />
    </div>
  );
};
