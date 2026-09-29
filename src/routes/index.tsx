import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, MessageCircle, ShieldCheck } from "lucide-react";
import iphone15Pro from "@/assets/products/iphone-15-pro.jpg";
import galaxyS24 from "@/assets/products/galaxy-s24-ultra.jpg";
import oneplus12 from "@/assets/products/oneplus-12.jpg";

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
    <main className="min-h-screen overflow-hidden bg-[#050a12] text-foreground">
      <section className="relative mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-6 pb-8 pt-5 sm:px-8 lg:px-12">
        <header className="relative z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-[10px] bg-[#8FE649] font-display text-base font-bold text-[#050a12] shadow-[0_10px_28px_rgba(143,230,73,0.18)]">
              MR
            </div>
            <div className="leading-none">
              <div className="font-display text-sm font-bold uppercase tracking-[0.02em] text-white">Market Rise</div>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">Digital</div>
            </div>
          </div>

          <Link
            to="/auth?mode=signin"
            className="text-sm font-medium text-white transition-colors hover:text-[#8FE649]"
          >
            Sign in
          </Link>
        </header>

        <div className="relative z-10 flex flex-1 flex-col justify-center pt-14 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#8FE649]">
                <span className="h-px w-8 bg-[#8FE649]" />
                <span>Smart phones. Smart choices.</span>
              </div>

              <h1 className="mt-6 max-w-[640px] font-display text-5xl font-bold leading-[0.92] tracking-[-0.05em] text-white sm:text-6xl md:text-7xl lg:text-[5.2rem]">
                <span className="block">Your next</span>
                <span className="block">phone</span>
                <span className="block text-[#8FE649]">starts here.</span>
              </h1>

              <p className="mt-7 max-w-xl text-[15px] leading-7 text-slate-400 sm:text-base">
                Genuine smartphones and accessories at competitive prices, backed by a simple and trusted buying experience.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#8FE649] px-6 py-3.5 font-display text-sm font-bold text-[#050a12] shadow-[0_14px_34px_rgba(143,230,73,0.20)] transition-transform hover:-translate-y-0.5"
                >
                  Start shopping
                  <ArrowRight className="size-4" strokeWidth={2.2} />
                </Link>

                <Link
                  to="/auth?mode=signin"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-700/80 bg-[#0a111c] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-slate-500 hover:bg-[#0d1622]"
                >
                  Sign in to account
                </Link>
              </div>
            </div>

            <div className="relative min-h-[330px] sm:min-h-[430px] lg:min-h-[560px]">
              <div
                className="pointer-events-none absolute bottom-[5%] left-1/2 h-24 w-[76%] -translate-x-1/2 rounded-full bg-[#8FE649]/20 blur-3xl"
                aria-hidden="true"
              />
              <div
                className="relative h-full min-h-[330px] overflow-hidden bg-[#0a111c] shadow-[0_28px_90px_rgba(0,0,0,0.36)] sm:min-h-[430px] lg:min-h-[560px]"
              >
                <div className="absolute inset-x-0 bottom-0 h-px bg-[#8FE649]/25" />

                <div className="absolute bottom-[7%] left-[7%] h-[68%] w-[29%] -rotate-[7deg] overflow-hidden rounded-[28px] border border-white/5 bg-[#0c131f] shadow-[0_30px_70px_rgba(0,0,0,0.42)]">
                  <img
                    src={iphone15Pro}
                    alt="iPhone 15 Pro"
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                <div className="absolute bottom-[5%] left-1/2 h-[78%] w-[31%] -translate-x-1/2 rotate-[1deg] overflow-hidden rounded-[30px] border border-white/5 bg-[#0b121d] shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
                  <img
                    src={galaxyS24}
                    alt="Samsung Galaxy phone"
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                <div className="absolute bottom-[7%] right-[7%] h-[68%] w-[29%] rotate-[7deg] overflow-hidden rounded-[28px] border border-white/5 bg-[#0c131f] shadow-[0_30px_70px_rgba(0,0,0,0.42)]">
                  <img
                    src={oneplus12}
                    alt="OnePlus phone"
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                <div className="absolute inset-x-[10%] bottom-[8%] h-16 rounded-full bg-[#8FE649]/8 blur-2xl" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12 border-t border-slate-800/80">
          <div className="grid divide-y divide-slate-800/80 md:grid-cols-3 md:divide-x md:divide-y-0">
            <div className="flex items-center gap-4 py-5 md:pr-8">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#102019] text-[#8FE649]">
                <Check className="size-4" strokeWidth={2.2} />
              </div>
              <div>
                <div className="font-display text-sm font-semibold text-white">Genuine devices</div>
                <div className="mt-1 text-xs text-slate-500">Quality you can trust</div>
              </div>
            </div>

            <div className="flex items-center gap-4 py-5 md:px-8">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#102019] text-[#8FE649]">
                <ShieldCheck className="size-4" strokeWidth={2.1} />
              </div>
              <div>
                <div className="font-display text-sm font-semibold text-white">Secure shopping</div>
                <div className="mt-1 text-xs text-slate-500">A safer way to buy</div>
              </div>
            </div>

            <div className="flex items-center gap-4 py-5 md:pl-8">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#102019] text-[#8FE649]">
                <MessageCircle className="size-4" strokeWidth={2.1} />
              </div>
              <div>
                <div className="font-display text-sm font-semibold text-white">Countrywide delivery</div>
                <div className="mt-1 text-xs text-slate-500">Across Kenya</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
