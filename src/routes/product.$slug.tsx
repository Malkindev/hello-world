import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Heart, Minus, Package, Plus, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { SEED_PRODUCTS, type Product } from "@/lib/data/catalog";
import { useStore } from "@/lib/store";
import { discountPct, ksh, productWhatsappMessage, whatsappLink, formatDate } from "@/lib/format";
import { ProductCard } from "@/components/site/ProductCard";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { Page, Empty } from "@/components/site/Page";

export const Route = createFileRoute("/product/$slug")({
  head: ({ match }) => {
    const slug = (match.params as { slug: string }).slug;
    const p = SEED_PRODUCTS.find((x) => x.slug === slug);
    const title = p
      ? `${p.brand} ${p.model} ${p.storage === "—" ? "" : p.storage} — ${ksh(p.price)} | Market Rise Digital`
      : "Product | Market Rise Digital";
    const description = p
      ? `Buy the ${p.brand} ${p.model} in Kenya at ${ksh(p.price)}. ${p.condition}, ${p.warranty}. Buy on WhatsApp or order online with countrywide delivery.`
      : "Genuine smartphones and accessories in Kenya.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams() as { slug: string };
  const { productBySlug, products, addToCart, toggleWishlist, hydrated, isWished } = useStore();
  const navigate = useNavigate();

  const product = productBySlug(slug);
  const [color, setColor] = useState<string | undefined>(undefined);
  const [storage, setStorage] = useState<string | undefined>(undefined);
  const [imgIdx, setImgIdx] = useState(0);

  const activeColor = color ?? product?.colors[0];
  const activeStorage = storage ?? product?.storage;

  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.id !== product.id && (p.brand === product.brand || p.categories.some((c) => product.categories.includes(c))))
      .slice(0, 4);
  }, [product, products]);

  if (!product) {
    return (
      <Page>
        <Empty
          title="Product not found"
          hint="It may have been sold or removed from the catalogue."
          action={
            <Link to="/shop" className="btn-electric px-5 py-2.5 text-sm">
              Back to shop
            </Link>
          }
        />
      </Page>
    );
  }

  const pct = discountPct(product.price, product.originalPrice);
  const wished = hydrated && isWished(product.id);
  const isPhone = product.kind === "phone";

  const buyNow = () => {
    addToCart({ productId: product.id, qty: 1, storage: activeStorage, color: activeColor });
    navigate({ to: "/checkout" });
  };

  const specRows: [string, string][] = isPhone
    ? [
        ["Display", product.display],
        ["Processor", product.processor],
        ["Camera", product.camera],
        ["Battery", product.battery],
        ["Charging", product.charging],
        ["RAM", product.ram],
        ["Storage", product.storageOptions.join(" · ")],
        ["Operating system", product.os],
        ["Network", product.network],
        ["Dimensions", product.dimensions],
      ]
    : [["Category", product.accessoryType ?? "Accessory"], ["Compatibility", "Universal"]];

  return (
    <Page>
      <nav className="label-mono mb-5 flex items-center gap-2">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-foreground">Shop</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <div className="animate-rise">
          <div className="glass relative overflow-hidden rounded-3xl">
            {pct > 0 && (
              <span className="absolute left-3 top-3 z-10 rounded-full bg-deal px-2.5 py-1 font-mono text-xs font-bold text-ink">
                -{pct}%
              </span>
            )}
            <img
              src={product.images[imgIdx] ?? product.images[0]}
              alt={product.name}
              className="aspect-square w-full bg-panel object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`size-16 overflow-hidden rounded-xl ring-2 transition-all ${i === imgIdx ? "ring-electric" : "ring-transparent opacity-60 hover:opacity-100"}`}
                >
                  <img src={img} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="animate-rise-2">
          <div className="label-mono">{product.brand}</div>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {product.name}
            {isPhone && <span className="text-steel"> · {activeStorage}</span>}
          </h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-display text-3xl font-bold text-foreground">{ksh(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="font-mono text-sm text-faint line-through">{ksh(product.originalPrice)}</span>
                <span className="font-mono text-xs text-deal">Save {ksh(product.originalPrice - product.price)}</span>
              </>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="glass rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-steel">
              {product.condition}
            </span>
            {isPhone && (
              <span className="glass rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-steel">
                {product.network}
              </span>
            )}
            <span className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${product.soldOut ? "bg-deal/10 text-deal" : product.stock > 0 ? "bg-electric/10 text-electric" : "text-faint"}`}>
              {product.soldOut ? "Sold out" : product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          {/* Colour */}
          {product.colors.length > 0 && (
            <div className="mt-6">
              <div className="label-mono mb-2">Colour — <span className="text-foreground">{activeColor}</span></div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`rounded-xl px-3.5 py-2 text-xs transition-colors ${c === activeColor ? "bg-electric text-ink" : "glass text-steel hover:text-foreground"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Storage */}
          {isPhone && product.storageOptions.length > 1 && (
            <div className="mt-4">
              <div className="label-mono mb-2">Storage</div>
              <div className="flex flex-wrap gap-2">
                {product.storageOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStorage(s)}
                    className={`rounded-xl px-3.5 py-2 font-mono text-xs transition-colors ${s === activeStorage ? "bg-electric text-ink" : "glass text-steel hover:text-foreground"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
            <button
              onClick={buyNow}
              disabled={product.soldOut}
              className="btn-electric flex-1 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Buy Now
            </button>
            <a
              href={whatsappLink(productWhatsappMessage(product.name, activeStorage === "—" ? "" : activeStorage ?? "", product.price))}
              target="_blank"
              rel="noreferrer"
              className="btn-whats flex-1 py-3.5 text-sm"
            >
              <WhatsAppIcon className="size-4" /> WhatsApp Us
            </a>
            <button
              onClick={() => {
                toggleWishlist(product.id);
                toast.success(wished ? "Removed from wishlist" : "Added to wishlist");
              }}
              className={`btn-ghost px-5 py-3.5 text-sm ${wished ? "text-deal" : ""}`}
              aria-label="Add to wishlist"
            >
              <Heart className={`size-4 ${wished ? "fill-current" : ""}`} />
              {wished ? "Wishlisted" : "Wishlist"}
            </button>
          </div>

          {/* Trust row */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              { icon: ShieldCheck, label: product.warranty },
              { icon: Truck, label: "Countrywide delivery" },
              { icon: Package, label: "Genuine, sealed stock" },
            ].map((t) => (
              <div key={t.label} className="glass rounded-2xl p-3 text-center">
                <t.icon className="mx-auto size-4 text-electric" />
                <div className="mt-1.5 font-mono text-[9px] uppercase leading-relaxed tracking-wider text-steel">
                  {t.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specs */}
      <div className="mt-14 grid gap-8 lg:grid-cols-3">
        <div className="glass rounded-3xl p-6 lg:col-span-2">
          <h2 className="font-display text-xl font-bold text-foreground">Specifications</h2>
          <dl className="mt-4 divide-y divide-hair">
            {specRows.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[130px_1fr] gap-4 py-3 text-sm sm:grid-cols-[180px_1fr]">
                <dt className="label-mono pt-0.5">{label}</dt>
                <dd className="text-foreground/90">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="space-y-4">
          <div className="glass rounded-3xl p-6">
            <h3 className="font-display text-base font-bold text-foreground">What's in the box</h3>
            <ul className="mt-3 space-y-2">
              {product.inBox.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-steel">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-electric" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-3xl p-6">
            <h3 className="font-display text-base font-bold text-foreground">About this phone</h3>
            <p className="mt-3 text-sm leading-relaxed text-steel">{product.description}</p>
            <div className="mt-3 font-mono text-[10px] text-steel/60">
              Listed {formatDate(product.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-2xl font-bold text-foreground">You may also like</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {related.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </Page>
  );
}
