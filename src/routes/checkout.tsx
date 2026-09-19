import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { ksh, orderNumber } from "@/lib/format";
import { Page, PageTitle, Empty } from "@/components/site/Page";
import { DELIVERY_ZONES, PAYMENT_METHODS } from "@/lib/config";
import { getZoneId, setZoneId, zoneById, type ZoneId } from "@/lib/delivery";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | Market Rise Digital" },
      {
        name: "description",
        content:
          "Complete your smartphone order with Market Rise Digital — enter delivery details, choose M-Pesa, cash on delivery or bank transfer, and confirm.",
      },
      { property: "og:title", content: "Checkout | Market Rise Digital" },
      {
        property: "og:description",
        content: "Delivery details, payment method and order confirmation in one simple step.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { cart, productById, placeOrder, user, addresses, hydrated } = useStore();
  const navigate = useNavigate();

  const [zone, setZone] = useState<ZoneId>(() => getZoneId());
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone,
    email: user.email,
    address: addresses[0]?.address ?? "",
    payment: PAYMENT_METHODS[0].label,
  });
  const [submitting, setSubmitting] = useState(false);

  const lines = useMemo(
    () =>
      cart
        .map((c) => ({ item: c, product: productById(c.productId) }))
        .filter((l) => Boolean(l.product)),
    [cart, productById],
  );

  const subtotal = lines.reduce((n, l) => n + (l.product?.price ?? 0) * l.item.qty, 0);
  const delivery = zoneById(zone).cost;
  const total = subtotal + delivery;

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      toast.error("Please fill in your name, phone number and delivery address.");
      return;
    }
    setSubmitting(true);
    const id = orderNumber();
    placeOrder(
      {
        items: lines.map((l) => ({
          productId: l.product!.id,
          name: l.product!.name,
          qty: l.item.qty,
          price: l.product!.price,
          ...(l.item.storage ? { storage: l.item.storage } : {}),
        })),
        subtotal,
        delivery,
        total,
        customer: {
          name: form.name,
          phone: form.phone,
          email: form.email,
          location: zoneById(zone).label,
          address: form.address,
        },
        paymentMethod: form.payment,
      },
      id,
    );
    toast.success("Order placed. We'll confirm on WhatsApp shortly.");
    navigate({ to: "/order/$id", params: { id } });
  };

  if (hydrated && lines.length === 0) {
    return (
      <Page>
        <PageTitle eyebrow="Checkout" title="Nothing to check out" />
        <Empty
          title="Your cart is empty"
          hint="Add a phone or accessory before checking out."
          action={
            <Link to="/shop" className="btn-electric px-5 py-2.5 text-sm">
              Shop phones
            </Link>
          }
        />
      </Page>
    );
  }

  return (
    <Page>
      <PageTitle
        eyebrow="Checkout"
        title="Delivery & payment"
        subtitle="We confirm every order by phone or WhatsApp before dispatch."
      />

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="glass rounded-3xl p-6">
            <div className="label-mono mb-4">Your details</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs text-steel">Full name</span>
                <input
                  className="field"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Jane Wanjiru"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-steel">Phone number</span>
                <input
                  className="field"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="07xx xxx xxx"
                  required
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs text-steel">Email (optional)</span>
                <input
                  className="field"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@example.com"
                />
              </label>
            </div>
          </section>

          <section className="glass rounded-3xl p-6">
            <div className="label-mono mb-4">Delivery</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs text-steel">Delivery location</span>
                <select
                  className="field"
                  value={zone}
                  onChange={(e) => {
                    const id = e.target.value as ZoneId;
                    setZone(id);
                    setZoneId(id);
                  }}
                >
                  {DELIVERY_ZONES.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-steel">Delivery address</span>
                <input
                  className="field"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="Estate, street, building"
                  required
                />
              </label>
            </div>
          </section>

          <section className="glass rounded-3xl p-6">
            <div className="label-mono mb-4">Payment method</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                    form.payment === m.label
                      ? "border-electric bg-electric/5"
                      : "border-hair hover:border-steel/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="mt-1 accent-electric"
                    checked={form.payment === m.label}
                    onChange={() => set("payment", m.label)}
                  />
                  <span>
                    <span className="block text-sm font-medium text-foreground">{m.label}</span>
                    <span className="block text-xs text-steel">{m.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="glass h-fit rounded-3xl p-6 lg:sticky lg:top-24">
          <div className="label-mono mb-4">Order summary</div>
          <ul className="space-y-3 text-sm">
            {lines.map((l) => (
              <li key={l.item.productId} className="flex justify-between gap-3">
                <span className="min-w-0 text-steel">
                  <span className="block truncate text-foreground">{l.product?.name}</span>
                  <span className="text-xs">
                    {l.item.qty} × {ksh(l.product?.price ?? 0)}
                  </span>
                </span>
                <span className="shrink-0 text-foreground">
                  {ksh((l.product?.price ?? 0) * l.item.qty)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-hair pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-steel">Subtotal</dt>
              <dd className="text-foreground">{ksh(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-steel">Delivery</dt>
              <dd className="text-foreground">{delivery === 0 ? "Free" : ksh(delivery)}</dd>
            </div>
            <div className="flex justify-between border-t border-hair pt-3">
              <dt className="font-display font-semibold text-foreground">Total</dt>
              <dd className="font-display text-xl font-bold text-foreground">{ksh(total)}</dd>
            </div>
          </dl>
          <button type="submit" disabled={submitting} className="btn-electric mt-5 w-full px-5 py-3 text-sm">
            Place order
          </button>
          <p className="mt-3 flex items-start gap-2 text-xs text-steel">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-electric" />
            No payment is taken online yet. We confirm stock and payment details with you first.
          </p>
        </aside>
      </form>
    </Page>
  );
}
