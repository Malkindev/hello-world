import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Heart, LogOut, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
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
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

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
          {!authLoading && !user && (
            <div className="hidden items-center gap-1 sm:flex">
              <Link to="/auth" className="rounded-full px-3 py-2 text-xs font-semibold text-steel hover:text-foreground">
                Sign in
              </Link>
              <a href="/auth?mode=signup" className="btn-electric px-3 py-2 text-xs">
                Sign up
              </a>
            </div>
          )}

          {!authLoading && user && (
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setAccountOpen((value) => !value)}
                className="flex items-center gap-2 rounded-full border border-hair px-3 py-2 text-xs font-semibold text-foreground hover:border-electric/40"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
              >
                <UserRound className="size-4 text-electric" />
                <span className="max-w-24 truncate">{user.user_metadata?.full_name || user.email || "Account"}</span>
                <ChevronDown className="size-3.5 text-steel" />
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-hair bg-panel p-2 shadow-2xl">
                  <Link to="/account" onClick={() => setAccountOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-accent">
                    My Account
                  </Link>
                  <a href="/account#orders" onClick={() => setAccountOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-accent">
                    My Orders
                  </a>
                  <a href="/account#favourites" onClick={() => setAccountOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-accent">
                    Wishlist
                  </a>
                  <button
                    type="button"
                    onClick={async () => {
                      setAccountOpen(false);
                      await signOut();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-foreground hover:bg-accent"
                  >
                    <LogOut className="size-4" /> Log Out
                  </button>
                </div>
              )}
            </div>
          )}

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
          {!authLoading && !user && (
            <div className="mb-3 grid grid-cols-2 gap-2">
              <Link to="/auth" onClick={() => setOpen(false)} className="glass rounded-xl px-4 py-3 text-sm font-medium text-foreground">
                Sign in
              </Link>
              <a href="/auth?mode=signup" onClick={() => setOpen(false)} className="btn-electric rounded-xl px-4 py-3 text-sm font-semibold">
                Sign up
              </a>
            </div>
          )}

          {!authLoading && user && (
            <div className="mb-3 grid grid-cols-2 gap-2">
              <Link to="/account" onClick={() => setOpen(false)} className="glass rounded-xl px-4 py-3 text-sm font-medium text-foreground">
                My Account
              </Link>
              <a href="/account#orders" onClick={() => setOpen(false)} className="glass rounded-xl px-4 py-3 text-sm font-medium text-foreground">
                My Orders
              </a>
              <a href="/account#favourites" onClick={() => setOpen(false)} className="glass rounded-xl px-4 py-3 text-sm font-medium text-foreground">
                Wishlist
              </a>
              <button
                type="button"
                onClick={async () => {
                  setOpen(false);
                  await signOut();
                }}
                className="glass flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium text-foreground"
              >
                <LogOut className="size-4" /> Log Out
              </button>
            </div>
          )}

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
