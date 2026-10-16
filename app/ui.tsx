import Link from "next/link";
import { board, handle, installedGB, itemNumber, postUrl, repo, sponsorUrl, checked, type Item } from "@/lib/rig";

const button = "inline-flex h-10 items-center rounded-chip px-4 font-bold transition-opacity hover:opacity-80";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b-2 border-ink px-6 py-5 md:px-16">
      <Link href="/" className="font-extrabold tracking-tight">sponsormyram</Link>
      <nav className="label flex gap-6">
        <a href="/#wish-list" className="max-sm:hidden">Wish list</a>
        <a href="/#rig" className="max-sm:hidden">The rig</a>
        <a href={sponsorUrl}>@{handle}</a>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="label flex flex-wrap justify-between gap-4 px-6 py-6 text-muted md:px-16">
      <span>Half joke, half not · nothing is sold here</span>
      <a href={repo} className="hover:text-ink">Fork it for your own rig → GitHub</a>
    </footer>
  );
}

export function Actions({ item }: { item?: Item }) {
  return (
    <div className="flex shrink-0 gap-2">
      <a href={sponsorUrl} className={`${button} bg-ink text-paper`}>Sponsor →</a>
      <a href={postUrl(item)} className={`${button} border-2 border-ink`}>Post</a>
    </div>
  );
}

export function Chips({ item }: { item: Item }) {
  return (
    <div className="label flex gap-2">
      <span className="flex h-6 items-center rounded-chip bg-pcb px-2 text-paper">{item.need}</span>
      <span className="flex h-6 items-center rounded-chip border border-ink px-2">{item.condition}</span>
    </div>
  );
}

function Stick({ gb, speed, id }: { gb: number; speed: number; id: string }) {
  if (!gb)
    return (
      <div className="flex flex-col gap-2">
        <div className="label flex h-14 items-center justify-center border-2 border-dashed border-ink">Empty</div>
        <div className="label text-muted">{id} · free</div>
      </div>
    );
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-14 flex-col justify-between bg-pcb pt-1.5" title={`${gb}GB DDR4 at ${speed} MT/s`}>
        <div className="flex justify-between px-2.5">
          {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-7 w-[9%] bg-[#0a0a0a]" />)}
        </div>
        <div className="h-2 bg-gold" />
      </div>
      <div className="label flex justify-between">
        <span>{gb}GB</span>
        <span className="text-muted">{id} · {speed}</span>
      </div>
    </div>
  );
}

export function Rig() {
  const filled = (installedGB / board.maxGB) * 100;
  return (
    <section id="rig" className="flex flex-col gap-6 border-t-2 border-ink px-6 py-12 md:px-16">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="title">The server, slot by slot</h2>
        <p className="label text-muted">{board.name} · {board.cpu} · read live {checked}</p>
      </div>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-16">
        {board.slots.map((slot) => <Stick key={slot.id} {...slot} />)}
      </div>
      <div className="flex h-6 gap-0.5" role="img" aria-label={`${installedGB} of ${board.maxGB}GB installed`}>
        <div className="bg-ink" style={{ width: `${filled}%` }} />
        <div className="flex-1 border-2 border-dashed border-ink" />
      </div>
      <div className="label flex justify-between text-muted">
        <span>{installedGB}GB installed</span>
        <span>{board.maxGB}GB supported</span>
      </div>
    </section>
  );
}

export function Row({ item }: { item: Item }) {
  return (
    <li className="flex flex-col gap-4 border-t border-rule py-6 md:flex-row md:gap-8">
      <span className="label w-12 shrink-0 pt-2 text-muted">{itemNumber(item)}</span>
      <div className="flex flex-1 flex-col gap-2">
        <Link href={`/i/${item.id}`} className="title hover:underline">{item.title}</Link>
        <p className="max-w-[600px]">{item.why}</p>
        <Chips item={item} />
      </div>
      <Actions item={item} />
    </li>
  );
}
