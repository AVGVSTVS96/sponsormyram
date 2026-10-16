import { board, installedGB, items } from "@/lib/rig";
import { Footer, Header, Rig, Row } from "./ui";

export default function Home() {
  return (
    <main>
      <Header />
      <section className="flex flex-col justify-between gap-12 px-6 pt-16 pb-12 md:flex-row md:items-end md:px-16 md:pt-24">
        <div className="flex flex-col gap-6">
          <h1 className="display">Sponsor<br />my RAM.</h1>
          <p className="max-w-[480px]">
            RAM and SSD prices are out of control. Your old sticks are sitting in a drawer. My server has an empty slot. Let's fix all three.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <span className="label text-muted">Short of the board max</span>
          <span className="display text-pcb">{board.maxGB - installedGB}GB</span>
          <span className="label text-muted">{installedGB} of {board.maxGB}GB installed</span>
        </div>
      </section>
      <Rig />
      <section id="wish-list" className="border-t-2 border-ink px-6 py-12 md:px-16">
        <div className="flex items-baseline justify-between pb-6">
          <h2 className="title">Wish list</h2>
          <span className="label text-muted">Priority order</span>
        </div>
        <ol>{items.map((item) => <Row key={item.id} item={item} />)}</ol>
      </section>
      <section className="flex flex-wrap items-center justify-between gap-4 bg-[#0a0a0a] px-6 py-12 text-[#f5f5f5] md:px-16 dark:border-y-2 dark:border-ink">
        <div className="flex flex-col gap-2">
          <h2 className="title">The MacBook: M1 Max, 32GB, soldered.</h2>
          <p className="text-[#e4e4e4]">Not accepting sticks. Thoughts and prayers accepted.</p>
        </div>
        <span className="label text-gold">0 slots</span>
      </section>
      <Footer />
    </main>
  );
}
