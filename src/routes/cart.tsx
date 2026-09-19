import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useStore } from "@/lib/store";
import { ksh } from "@/lib/format";
import { Page, PageTitle, Empty } from "@/components/site/Page";
import { DELIVERY_ZONES } from "@/lib/config";
import { getZoneId, setZoneId, zoneById, type ZoneId } from "@/lib/delivery";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart | Market Rise Digital" },
      {
        name: "description",
        content:
          "Review the phones and accessories in your Market Rise Digital cart, adjust quantities and see your delivery cost before checkout.",
      },
      { property: "og:title", content: "Your Cart | Market Rise Digital" },
      {
        property: "og:description",
        content: "Adjust quantities, pick a delivery zone and see your total in KSh.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, productById, updateQty, removeFromCart, hydrated } = useStore();
  const [zone, setZone] = useState<ZoneId>(() => getZoneId());

  const lines = useMemo(
    () =>
      cart
        .map((c) => ({ item: c, product: productById(c.productId) }))
        .filter((l): l is { item: (typeof cart)[number]; product: NonNullable<ReturnType<typeof productById>> } =>
          Boolean(l.product),
        ),
    [cart, productById],
  );

  const subtotal = lines.reduce((n, l) => n + l.product.price * l.item.qty, 0);
  const delivery = lines.length ? zoneById(zone).cost : 0;

  const changeZone = (id: ZoneId) => {
    setZone(id);
    setZoneId(id);
  };

  if (!hydrated) {
    return (
      <Page>
        <PageTitle eyebrow="Cart" title="Your cart" />
        <div className="glass h-48 rounded-3xl" />
      </Page>
    );
  }

  return (
    <Page>
      <PageTitle
        eyebrow="Cart"
        title="Your cart"
        subtitle="Check your items, choose where we deliver, then head to checkout."
      />

      {lines.length === 0 ? (
        <Empty
          title="Your cart is empty"
          hint="Browse the catalogue and add a phone or accessory to get started."
          action={
            <Link to="/shop" className="btn-electric px-5 py-2.5 text-sm">
              Shop phones
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-3">
            {lines.map(({ item, product }) => (
              <div key={item.productId} className="glass flex gap-4 rounded-3xl p-4">
                <Link
                  to="/product/$slug"
                  params={{ slug: product.slug }}
                  className="size-24 shrink-0 overflow-hidden rounded-2xl bg-panel"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="label-mono">{product.brand}</div>
                  <Link
                    to="/product/$slug"
                    params={{ slug: product.slug }}
                    className="block truncate font-display font-semibold text-foreground hover:text-electric"
                  >
                    {product.name}
                  </Link>
                  <div className="mt-0.5 text-xs text-steel">
                    {[item.storage ?? product.storage, item.color].filter(Boolean).join(" · ")}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1 rounded-full border border-hair p-1">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateQty(item.productId, item.qty - 1)}
                        className="grid size-7 place-items-center rounded-full text-steel hover:bg-panel hover:text-foreground"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center font-mono text-sm text-foreground">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                        className="grid size-7 place-items-center rounded-full text-steel hover:bg-panel hover:text-foreground"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-foreground">
                        {ksh(product.price * item.qty)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="mt-1 inline-flex items-center gap-1 text-xs text-steel hover:text-destructive"
                      >
                        <Trash2 className="size-3" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="glass h-fit rounded-3xl p-6 lg:sticky lg:top-24">
            <div className="label-mono mb-4">Order summary</div>

            <label className="mb-4 block">
              <span className="mb-1.5 block text-xs text-steel">Delivery location</span>
              <select
                className="field"
                value={zone}
                onChange={(e) => changeZone(e.target.value as ZoneId)}
              >
                {DELIVERY_ZONES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.label}
                  </option>
                ))}
              </select>
            </label>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-steel">Subtotal</dt>
                <dd className="text-foreground">{ksh(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="flex items-center gap-1.5 text-steel">
                  <Truck className="size-3.5" /> Delivery
                </dt>
                <dd className="text-foreground">{delivery === 0 ? "Free" : ksh(delivery)}</dd>
              </div>
              <div className="mt-3 flex justify-between border-t border-hair pt-3">
                <dt className="font-display font-semibold text-foreground">Total</dt>
                <dd className="font-display text-xl font-bold text-foreground">
                  {ksh(subtotal + delivery)}
                </dd>
              </div>
            </dl>

            <Link to="/checkout" className="btn-electric mt-5 w-full px-5 py-3 text-sm">
              <ShoppingBag className="size-4" /> Proceed to checkout
            </Link>
            <Link to="/shop" className="btn-ghost mt-2 w-full px-5 py-3 text-sm">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </Page>
  );
}
