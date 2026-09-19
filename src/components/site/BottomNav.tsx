import { Link } from "@tanstack/react-router";
import { Home, LayoutGrid, Percent, ShoppingBag, User } from "lucide-react";
import { useStore } from "@/lib/store";

const ITEMS = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/shop", label: "Shop", icon: LayoutGrid },
  { to: "/deals", label: "Deals", icon: Percent },
  { to: "/cart", label: "Cart", icon: ShoppingBag },
  { to: "/account", label: "Account", icon: User },
] as const;

export function BottomNav() {
  const { cartCount, hydrated } = useStore();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-hair bg-ink/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {ITEMS.map((it) => (
        <Link
          key={it.to}
          to={it.to}
          activeOptions={{ exact: "exact" in it && it.exact }}
          className="relative flex flex-col items-center gap-1 py-2.5 text-steel transition-colors"
          activeProps={{ className: "text-electric" }}
        >
          <it.icon className="size-5" />
          <span className="font-mono text-[9px] uppercase tracking-widest">{it.label}</span>
          {it.to === "/cart" && hydrated && cartCount > 0 && (
            <span className="absolute right-1/2 top-1 grid size-4 -translate-x-2 place-items-center rounded-full bg-electric font-mono text-[9px] font-bold text-ink">
              {cartCount}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
