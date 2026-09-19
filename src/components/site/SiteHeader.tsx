import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useStore } from "@/lib/store";
import { BUSINESS } from "@/lib/config";

const NAV = [
  { to: "/shop", label: "Shop" },
  { to: "/deals", label: "Deals" },
  { to: "/accessories", label: "Accessories" },
  { to: "/compare", label: "Compare" },
  { to: "/sell", label: "Sell" },
  { to: "/track", label: "Track" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { cartCount, wishlist, hydrated } = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/shop", search: { q: q.trim() } });
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-hair bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="grid size-9 place-items-center rounded-md bg-electric font-display text-lg font-bold text-ink">
            M
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold tracking-tight text-foreground">
              {BUSINESS.name}
            </div>
            <div className="label-mono">Smart Phones · Smart Choices</div>
          </div>
        </Link>

        <form onSubmit={submit} className="hidden min-w-0 flex-1 md:block">
          <div className="glass mx-auto flex max-w-xl items-center gap-2 rounded-full px-4 py-2.5">
            <Search className="size-4 shrink-0 text-steel/70" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search phones, brands or models... 🔍"
              className="w-full min-w-0 bg-transparent text-sm text-foreground placeholder:text-faint focus:outline-none"
              aria-label="Search"
            />
          </div>
        </form>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-full px-3 py-2 text-sm font-medium text-steel transition-colors hover:text-foreground"
              activeProps={{ className: "text-electric" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <Link
            to="/account"
            className="relative grid size-10 place-items-center rounded-full border border-hair text-steel transition-colors hover:text-foreground"
            aria-label="Favourites"
          >
            <Heart className="size-4" />
            {hydrated && wishlist.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-deal font-mono text-[9px] font-bold text-ink">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="relative grid size-10 place-items-center rounded-full border border-hair text-steel transition-colors hover:text-foreground"
            aria-label="Cart"
          >
            <ShoppingBag className="size-4" />
            {hydrated && cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-electric font-mono text-[9px] font-bold text-ink">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid size-10 place-items-center rounded-full border border-hair text-steel lg:hidden"
            aria-label="Menu"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-hair bg-ink/95 px-4 pb-4 pt-3 lg:hidden animate-rise">
          <form onSubmit={submit} className="glass mb-3 flex items-center gap-2 rounded-full px-4 py-2.5">
            <Search className="size-4 text-steel/70" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search phones, brands or models... 🔍"
              className="w-full bg-transparent text-sm placeholder:text-faint focus:outline-none"
            />
          </form>
          <div className="grid grid-cols-2 gap-2">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="glass rounded-xl px-4 py-3 text-sm font-medium text-foreground"
                activeProps={{ className: "text-electric" }}
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
