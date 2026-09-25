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

const products = [
  {
    brand: "APPLE",
    name: "iPhone 15 Pro",
    spec: "256GB · Titan Black",
    price: "KES 89,999",
    image: iphone15Pro,
    className: "-rotate-[2.5deg]",
  },
  {
    brand: "SAMSUNG",
    name: "Galaxy S24",
    spec: "256GB · Cobalt Violet",
    price: "KES 84,999",
    image: galaxyS24,
    className: "rotate-[2.5deg] sm:translate-y-5",
  },
];

function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-ink">
      <section className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col px-5 pb-8 pt-6 sm:px-7">
        <div
          className="pointer-events-none absolute left-1/2 top-[-7rem] h-72 w-72 -translate-x-1/2 rounded-full bg-electric/10 blur-3xl sm:h-96 sm:w-96"
          aria-hidden="true"
        />

        <header className="relative z-10 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl border border-electric/70 bg-electric/5 font-mono text-sm font-semibold text-electric">
            MR
          </div>
          <div>
            <div className="font-display text-sm font-semibold tracking-tight text-foreground">
              Market Rise Digital
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-faint">
              Smart Phones. Smart Choices.
            </div>
          </div>
        </header>

        <div className="relative z-10 flex flex-1 flex-col items-center pt-16 text-center sm:pt-20">
          <div className="label-mono text-[10px] text-steel/80">KENYA · MOBILE STORE</div>

          <h1 className="mt-4 max-w-2xl font-display text-[2.65rem] font-bold leading-[0.98] tracking-[-0.04em] text-foreground sm:text-5xl md:text-6xl">
            Your Next Phone
            <br />
            <span className="text-electric">Starts Here.</span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-6 text-steel sm:text-base sm:leading-7">
            Genuine iPhones, Samsung, Pixel, Tecno &amp; Infinix — at prices that make sense.
          </p>

          <div className="mt-10 grid w-full max-w-2xl gap-5 sm:grid-cols-2 sm:gap-6">
            {products.map((product) => (
              <article
                key={product.brand}
                className={"glass relative overflow-hidden rounded-[1.75rem] border border-white/[0.06] bg-panel/90 p-4 text-left shadow-[0_24px_70px_rgba(0,0,0,0.38)] transition-transform duration-300 hover:-translate-y-1 " + product.className}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 font-mono text-[9px] font-medium tracking-[0.18em] text-steel">
                    {product.brand}
                  </span>
                  <Heart className="size-4 text-steel/70" strokeWidth={1.8} />
                </div>

                <div className="mt-4 overflow-hidden rounded-[1.25rem] bg-[#0c121d]">
                  <img
                    src={product.image}
                    alt={product.name + " " + product.spec}
                    className="h-48 w-full object-cover object-center sm:h-56"
                  />
                </div>

                <div className="mt-4">
                  <h2 className="font-display text-base font-semibold text-foreground sm:text-lg">{product.name}</h2>
                  <p className="mt-1 text-xs text-steel">{product.spec}</p>
                  <div className="mt-4 font-mono text-lg font-semibold tracking-tight text-electric sm:text-xl">{product.price}</div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-11 flex w-full max-w-md flex-col items-center">
            <Link
              to="/shop"
              className="flex w-full items-center justify-center rounded-full bg-electric px-7 py-4 font-display text-sm font-bold text-ink shadow-[0_18px_48px_rgba(0,245,160,0.16)] transition-transform hover:-translate-y-0.5"
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

        <footer className="relative z-10 mt-10 border-t border-hair pt-5">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center font-mono text-[8px] uppercase tracking-[0.16em] text-faint sm:text-[9px]">
            <span>PAY WITH M-PESA</span>
            <span aria-hidden className="text-steel/50">·</span>
            <span>WHATSAPP ORDERS</span>
            <span aria-hidden className="text-steel/50">·</span>
            <span>COUNTRYWIDE DELIVERY</span>
          </div>
        </footer>
      </section>
    </main>
  );
}
