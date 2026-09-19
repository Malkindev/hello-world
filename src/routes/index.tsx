import { Link, useNavigate, createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  Apple,
  Bot,
  Crown,
  Gamepad2,
  Headphones,
  RefreshCw,
  Search,
  Signal,
  Smartphone,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { BRANDS, CATEGORIES, type CategorySlug } from "@/lib/data/catalog";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/site/ProductCard";
import { BUSINESS } from "@/lib/config";
import { whatsappLink } from "@/lib/format";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";

const CATEGORY_ICONS: Record<CategorySlug, LucideIcon> = {
  iphone: Apple,
  android: Bot,
  flagship: Crown,
  budget: Wallet,
  gaming: Gamepad2,
  "5g": Signal,
  refurbished: RefreshCw,
  accessories: Headphones,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Market Rise Digital — Buy Smartphones in Kenya | Smart Phones. Smart Choices.",
      },
      {
        name: "description",
        content:
          "Your Next Phone Starts Here. Shop genuine iPhones, Samsung, Google Pixel, Tecno, Infinix and more at competitive prices in Kenya. Buy on WhatsApp, pay with M-Pesa, delivered countrywide.",
      },
      { property: "og:title", content: "Market Rise Digital — Your Next Phone Starts Here." },
      {
        property: "og:description",
        content:
          "Genuine smartphones and accessories at competitive prices, with a simple and trusted buying experience.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { products } = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/shop", search: { q: q.trim() } });
  };

  const featured = products.filter((p) => p.featured && !p.soldOut).slice(0, 8);
  const deals = products.filter((p) => p.originalPrice && p.originalPrice > p.price).length;

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-hair">
        <div className="beam pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-14 pt-14 text-center md:pb-20 md:pt-24 md:px-8">
          <div className="glass mb-5 inline-flex animate-rise items-center gap-2 rounded-full px-4 py-1.5">
            <span className="size-1.5 rounded-full bg-electric" />
            <span className="label-mono">{BUSINESS.tagline}</span>
          </div>
          <h1 className="max-w-3xl animate-rise-2 font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Your Next Phone <span className="text-electric">Starts Here.</span>
          </h1>
          <p className="mt-4 max-w-xl animate-rise-3 text-sm text-steel sm:text-base">
            Discover genuine smartphones at competitive prices, with a simple and trusted buying
            experience.
          </p>

          <form
            onSubmit={submit}
            className="glass mt-7 flex w-full max-w-xl animate-rise-3 items-center gap-2 rounded-full p-1.5 pl-5"
          >
            <Search className="size-4 shrink-0 text-steel/70" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search phones, brands or models... 🔍"
              aria-label="Search phones"
              className="w-full min-w-0 bg-transparent py-2 text-sm text-foreground placeholder:text-faint focus:outline-none"
            />
            <button type="submit" className="btn-electric shrink-0 rounded-full px-5 py-2.5 text-sm">
              Search
            </button>
          </form>

          <div className="mt-6 flex animate-rise-3 flex-wrap items-center justify-center gap-3">
            <Link to="/shop" className="btn-electric px-7 py-3 text-sm">
              Shop Phones <span aria-hidden>→</span>
            </Link>
            <Link to="/deals" className="btn-deal px-7 py-3 text-sm">
              Today's Deals
            </Link>
          </div>

          <div className="mt-10 grid w-full max-w-2xl grid-cols-3 gap-3 animate-rise-3">
            {[
              { icon: Smartphone, label: "100% genuine phones" },
              { icon: Signal, label: "Warranty included" },
              { icon: Wallet, label: "Pay via M-Pesa" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl px-2 py-3">
                <s.icon className="mx-auto size-4 text-electric" />
                <div className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-steel">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="mx-auto max-w-7xl px-4 pt-12 md:px-8">
        <div className="flex items-end justify-between">
          <div>
            <div className="label-mono mb-1">Top brands</div>
            <h2 className="font-display text-2xl font-bold text-foreground">All the names you trust</h2>
          </div>
          <Link to="/shop" className="hidden text-sm text-electric hover:underline sm:block">
            View all →
          </Link>
        </div>
        <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
          {BRANDS.map((b) => (
            <Link
              key={b}
              to="/shop"
              search={{ brand: b }}
              className="glass shrink-0 rounded-full px-5 py-2.5 text-sm font-medium text-steel transition-all hover:-translate-y-0.5 hover:text-foreground hover:ring-electric/40"
            >
              {b}
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 pt-12 md:px-8">
        <div className="label-mono mb-1">Browse</div>
        <h2 className="font-display text-2xl font-bold text-foreground">Shop by category</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICONS[c.slug];
            return (
              <Link
                key={c.slug}
                to="/shop"
                search={{ category: c.slug }}
                className="glass group rounded-3xl p-5 transition-all hover:-translate-y-1 hover:ring-electric/40"
              >
                <Icon className="size-6 text-electric" />
                <div className="mt-3 font-display text-sm font-semibold text-foreground sm:text-base">
                  {c.label}
                </div>
                <div className="label-mono mt-0.5">{c.hint}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 pt-12 md:px-8">
        <div className="flex items-end justify-between">
          <div>
            <div className="label-mono mb-1">Handpicked</div>
            <h2 className="font-display text-2xl font-bold text-foreground">Featured phones</h2>
          </div>
          <Link to="/shop" className="text-sm text-electric hover:underline">
            Shop all →
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Sell + WhatsApp CTA */}
      <section className="mx-auto max-w-7xl px-4 pt-14 md:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass flex flex-col rounded-3xl p-7">
            <div className="label-mono mb-2">Trade-in</div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              Turn Your Old Phone Into Cash.
            </h3>
            <p className="mt-2 text-sm text-steel">
              Upgrading? Send us your current phone and get a fair offer within hours.
            </p>
            <div className="mt-5">
              <Link to="/sell" className="btn-ghost self-start px-5 py-2.5 text-sm">
                Sell your phone
              </Link>
            </div>
          </div>
          <div className="glass flex flex-col rounded-3xl p-7">
            <div className="label-mono mb-2">Talk to us</div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              Order directly on WhatsApp
            </h3>
            <p className="mt-2 text-sm text-steel">
              Fast replies, real photos and the best price — {deals}+ deals live today.
            </p>
            <div className="mt-5">
              <a
                href={whatsappLink(`Hello ${BUSINESS.name}, I'd like some help choosing a phone.`)}
                target="_blank"
                rel="noreferrer"
                className="btn-whats px-5 py-2.5 text-sm"
              >
                <WhatsAppIcon className="size-4" /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
