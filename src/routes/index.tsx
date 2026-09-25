import { Link, createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import iphone15Pro from "@/assets/products/iphone-15-pro.jpg";
import galaxyS24 from "@/assets/products/galaxy-s24-ultra.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Market Rise Digital — Smart Phones. Smart Choices." },
      {
        name: "description",
        content:
          "Your Next Phone Starts Here. Genuine iPhones, Samsung, Pixel, Tecno & Infinix at prices that make sense in Kenya.",
      },
      {
        property: "og:title",
        content: "Market Rise Digital — Your Next Phone Starts Here.",
      },
      {
        property: "og:description",
        content:
          "Genuine iPhones, Samsung, Pixel, Tecno & Infinix — at prices that make sense.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: Home,
});



function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-ink">
      <section className="relative mx-auto flex min-h-[100svh] w-full max-w-md flex-col px-5 pb-7 pt-5">
        <div
          className="pointer-events-none absolute left-1/2 top-[-5rem] h-80 w-80 -translate-x-1/2 rounded-full bg-electric/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-1/2 top-12 h-36 w-56 -translate-x-1/2 rounded-full bg-teal-400/5 blur-3xl"
          aria-hidden="true"
        />

        <header className="relative z-10 flex items-center gap-3 animate-rise">
          <div className="grid size-10 place-items-center rounded-xl border border-electric/70 bg-electric/[0.06] font-mono text-sm font-semibold text-electric shadow-[0_0_28px_rgba(0,245,160,0.10)]">
            MR
          </div>
          <div className="min-w-0">
            <div className="font-display text-sm font-bold tracking-tight text-foreground">
              Market Rise Digital
            </div>
            <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-faint">
              Smart Phones. Smart Choices.
            </div>
          </div>
        </header>

        <div className="relative z-10 flex flex-1 flex-col pt-14 text-center">
          <div className="label-mono text-[9px] text-steel/75 animate-rise-2">KENYA · MOBILE STORE</div>

          <h1 className="mt-4 font-display text-[2.85rem] font-bold leading-[0.95] tracking-[-0.055em] text-foreground animate-rise-2">
            Your Next Phone
            <br />
            <span className="text-electric">Starts Here.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-steel animate-rise-3">
            Genuine iPhones, Samsung, Pixel, Tecno &amp; Infinix — at prices that make sense.
          </p>

          <div className="relative mt-9 h-[18rem] w-full animate-rise-3">
            <article className="glass absolute left-0 top-2 w-[62%] -rotate-[4deg] rounded-[1.65rem] border border-white/[0.07] bg-panel/95 p-3 text-left shadow-[0_28px_70px_rgba(0,0,0,0.44)]">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-1 font-mono text-[7px] font-medium tracking-[0.16em] text-steel">
                  APPLE
                </span>
                <Heart className="size-3.5 text-steel/75" strokeWidth={1.8} />
              </div>
              <div className="mt-3 overflow-hidden rounded-[1.15rem] bg-[#0c121d]">
                <img
                  src={iphone15Pro}
                  alt="iPhone 15 Pro 256GB Titan Black"
                  className="h-36 w-full object-cover object-center"
                />
              </div>
              <div className="mt-3">
                <h2 className="font-display text-sm font-semibold text-foreground">iPhone 15 Pro</h2>
                <p className="mt-1 text-[10px] text-steel">256GB · Titan Black</p>
                <div className="mt-2 font-mono text-sm font-semibold tracking-tight text-electric">KES 89,999</div>
              </div>
            </article>

            <article className="glass absolute bottom-0 right-0 w-[62%] rotate-[4deg] rounded-[1.65rem] border border-white/[0.07] bg-panel/95 p-3 text-left shadow-[0_28px_70px_rgba(0,0,0,0.44)]">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-1 font-mono text-[7px] font-medium tracking-[0.16em] text-steel">
                  SAMSUNG
                </span>
                <Heart className="size-3.5 text-steel/75" strokeWidth={1.8} />
              </div>
              <div className="mt-3 overflow-hidden rounded-[1.15rem] bg-[#0c121d]">
                <img
                  src={galaxyS24}
                  alt="Galaxy S24 256GB Cobalt Violet"
                  className="h-36 w-full object-cover object-center"
                />
              </div>
              <div className="mt-3">
                <h2 className="font-display text-sm font-semibold text-foreground">Galaxy S24</h2>
                <p className="mt-1 text-[10px] text-steel">256GB · Cobalt Violet</p>
                <div className="mt-2 font-mono text-sm font-semibold tracking-tight text-electric">KES 84,999</div>
              </div>
            </article>
          </div>

          <div className="mt-6 flex w-full flex-col items-center">
            <Link
              to="/shop"
              className="flex w-full items-center justify-center rounded-full bg-electric px-7 py-4 font-display text-sm font-bold text-ink shadow-[0_18px_48px_rgba(0,245,160,0.16)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Start Shopping
            </Link>

            <Link
              to="/auth?mode=signin"
              className="mt-3 flex w-full items-center justify-center rounded-full border border-hair bg-transparent px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-electric/40 hover:text-electric"
            >
              Sign in
            </Link>
          </div>
        </div>

        <footer className="relative z-10 mt-7 border-t border-hair pt-4">
          <div className="flex items-center justify-center gap-x-2 text-center font-mono text-[7px] uppercase tracking-[0.13em] text-faint">
            <span>PAY WITH M-PESA</span>
            <span aria-hidden className="text-steel/40">·</span>
            <span>WHATSAPP ORDERS</span>
            <span aria-hidden className="text-steel/40">·</span>
            <span>COUNTRYWIDE DELIVERY</span>
          </div>
        </footer>
      </section>
    </main>
  );
}
