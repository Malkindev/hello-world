import { Link } from "@tanstack/react-router";
import { GitCompareArrows, Heart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/data/catalog";
import { useStore } from "@/lib/store";
import { discountPct, ksh, productWhatsappMessage, whatsappLink } from "@/lib/format";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function ProductCard({ product, showSaved }: { product: Product; showSaved?: boolean }) {
  const { toggleWishlist, isWished, toggleCompare, compare, hydrated } = useStore();
  const pct = discountPct(product.price, product.originalPrice);
  const wished = hydrated && isWished(product.id);
  const inCompare = hydrated && compare.includes(product.id);
  const specLine =
    product.kind === "phone"
      ? `${product.ram} RAM · ${product.network} · ${product.condition}`
      : `${product.accessoryType} · ${product.condition}`;

  return (
    <div className="group flex flex-col rounded-3xl bg-card p-3 ring-1 ring-foreground/5 transition-all duration-200 hover:-translate-y-1 hover:ring-electric/30">
      <div className="relative overflow-hidden rounded-2xl">
        {pct > 0 && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-deal px-2 py-0.5 font-mono text-[10px] font-medium text-ink">
            -{pct}%
          </span>
        )}
        {product.soldOut && (
          <span className="absolute left-2 top-8 z-10 rounded-full bg-ink/80 px-2 py-0.5 font-mono text-[10px] font-medium text-steel">
            SOLD OUT
          </span>
        )}
        <div className="absolute right-2 top-2 z-10 flex gap-1.5">
          {product.kind === "phone" && (
            <button
              onClick={() => {
                const ok = toggleCompare(product.id);
                if (!ok) toast.error("You can compare up to 3 phones");
                else if (!inCompare) toast.success("Added to compare");
              }}
              className={`grid size-8 place-items-center rounded-full bg-ink/60 backdrop-blur transition-colors hover:text-foreground ${inCompare ? "text-electric" : "text-steel"}`}
              aria-label="Compare"
            >
              <GitCompareArrows className="size-4" />
            </button>
          )}
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`grid size-8 place-items-center rounded-full bg-ink/60 backdrop-blur transition-colors hover:text-foreground ${wished ? "text-deal" : "text-steel"}`}
            aria-label="Favourite"
          >
            <Heart className={`size-4 ${wished ? "fill-current" : ""}`} />
          </button>
        </div>
        <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
          <img
            src={product.images[0]}
            alt={product.name}
            width={1024}
            height={1024}
            loading="lazy"
            className="aspect-square w-full rounded-2xl bg-panel object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </Link>
      </div>
      <div className="flex flex-1 flex-col p-2 pt-3">
        <div className="label-mono">{product.brand}</div>
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="mt-0.5 font-display text-base font-semibold text-foreground"
        >
          {product.name}
          {product.kind === "phone" && <span className="text-steel"> · {product.storage}</span>}
        </Link>
        <div className="font-mono text-[11px] text-steel/70">{specLine}</div>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
          <span className="font-display text-lg font-bold text-foreground">{ksh(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="font-mono text-xs text-faint line-through">{ksh(product.originalPrice)}</span>
          )}
        </div>
        {showSaved && pct > 0 && product.originalPrice && (
          <div className="mt-1 font-mono text-[11px] text-electric">
            Save {ksh(product.originalPrice - product.price)}
          </div>
        )}
        <div className="mt-3 flex gap-2">
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            className="btn-ghost flex-1 py-2 text-xs"
          >
            View Details
          </Link>
          <a
            href={whatsappLink(productWhatsappMessage(product.name, product.storage === "—" ? "" : product.storage, product.price))}
            target="_blank"
            rel="noreferrer"
            className="btn-whats flex-1 py-2 text-xs"
          >
            <WhatsAppIcon className="size-3.5" /> Buy on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
