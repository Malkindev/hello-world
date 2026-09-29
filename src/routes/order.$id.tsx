import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { ksh, whatsappLink } from "@/lib/format";
import { BUSINESS } from "@/lib/config";
import { Page, Empty } from "@/components/site/Page";
import { OrderTimeline } from "@/components/site/OrderTimeline";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";

export const Route = createFileRoute("/order/$id")({
  head: () => ({
    meta: [
      { title: "Order Confirmed | Market Rise Digital" },
      {
        name: "description",
        content:
          "Your Market Rise Digital order is confirmed. See your order number, items, delivery details and live order status.",
      },
      { property: "og:title", content: "Order Confirmed | Market Rise Digital" },
      {
        property: "og:description",
        content: "Order number, items, delivery details and status tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams() as { id: string };
  const { orders, hydrated } = useStore();
  const order = orders.find((o) => o.id === id);

  if (!hydrated) {
    return (
      <Page>
        <div className="glass h-64 rounded-3xl" />
      </Page>
    );
  }

  if (!order) {
    return (
      <Page>
        <Empty
          title="Order not found"
          hint={`We couldn't find order ${id} on this device.`}
          action={
            <Link to="/track" className="btn-electric px-5 py-2.5 text-sm">
              Track an order
            </Link>
          }
        />
      </Page>
    );
  }

  return (
    <Page>
      <div className="glass mb-6 rounded-3xl p-6 text-center animate-rise sm:p-10">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-whats/15">
          <CheckCircle2 className="size-7 text-whats" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          Thank you, {order.customer.name.split(" ")[0] || "friend"}!
        </h1>
        <p className="mt-2 text-sm text-steel">
          Your order is received. We'll call or WhatsApp you shortly to confirm.
        </p>
        <div className="label-mono mt-5">Order number</div>
        <div className="font-mono text-lg font-bold text-electric">{order.id}</div>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <a
            href={whatsappLink(
              `Hello ${BUSINESS.name}, I have just placed order ${order.id} for ${ksh(order.total)}.`,
            )}
            target="_blank"
            rel="noreferrer"
            className="btn-whats px-5 py-3 text-sm"
          >
            <WhatsAppIcon className="size-4" /> Confirm on WhatsApp
          </a>
          <Link to="/track" className="btn-ghost px-5 py-3 text-sm">
            Track this order
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="glass rounded-3xl p-6">
          <div className="label-mono mb-4">Items</div>
          <ul className="space-y-3 text-sm">
            {order.items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3">
                <span>
                  <span className="block text-foreground">{i.name}</span>
                  <span className="text-xs text-steel">
                    {[i.storage, `${i.qty} × ${ksh(i.price)}`].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className="shrink-0 text-foreground">{ksh(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-hair pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-steel">Subtotal</dt>
              <dd className="text-foreground">{ksh(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-steel">Delivery</dt>
              <dd className="text-foreground">
                {order.delivery === 0 ? "Free" : ksh(order.delivery)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-hair pt-3">
              <dt className="font-display font-semibold text-foreground">Total</dt>
              <dd className="font-display text-xl font-bold text-foreground">{ksh(order.total)}</dd>
            </div>
          </dl>

          <div className="label-mono mb-3 mt-8">Delivery to</div>
          <div className="text-sm text-steel">
            <div className="text-foreground">{order.customer.name}</div>
            <div>{order.customer.phone}</div>
            <div>{order.customer.address}</div>
            <div>{order.customer.location}</div>
            <div className="mt-2">Payment: {order.paymentMethod}</div>
          </div>
        </section>

        <aside className="glass h-fit rounded-3xl p-6">
          <div className="label-mono mb-4">Order status</div>
          <OrderTimeline current={order.status} history={order.history} />
        </aside>
      </div>
    </Page>
  );
}
