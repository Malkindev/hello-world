import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { useStore, type Order } from "@/lib/store";
import { ksh, formatDate } from "@/lib/format";
import { Page, PageTitle } from "@/components/site/Page";
import { OrderTimeline } from "@/components/site/OrderTimeline";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Your Order | Market Rise Digital" },
      {
        name: "description",
        content:
          "Enter your Market Rise Digital order number to see live status — received, confirmed, processing, dispatched and delivered.",
      },
      { property: "og:title", content: "Track Your Order | Market Rise Digital" },
      {
        property: "og:description",
        content: "Live order status from received to delivered.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { orders } = useStore();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Order | null | undefined>(undefined);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toUpperCase();
    setResult(orders.find((o) => o.id.toUpperCase() === q) ?? null);
  };

  return (
    <Page>
      <PageTitle
        eyebrow="Order tracking"
        title="Where is my phone?"
        subtitle="Enter the order number we sent you, for example MRD-2609-4821."
      />

      <form onSubmit={search} className="glass mb-6 flex flex-col gap-3 rounded-3xl p-5 sm:flex-row">
        <input
          className="field flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="MRD-2609-4821"
          aria-label="Order number"
        />
        <button type="submit" className="btn-electric px-6 py-3 text-sm">
          <Search className="size-4" /> Track order
        </button>
      </form>

      {result === null && (
        <div className="glass rounded-3xl p-6 text-sm text-steel">
          No order found with that number on this device. Double-check the number, or contact us on{" "}
          <Link to="/contact" className="text-electric hover:underline">
            the contact page
          </Link>
          .
        </div>
      )}

      {result && (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="glass rounded-3xl p-6">
            <div className="label-mono mb-1">Order {result.id}</div>
            <div className="font-display text-xl font-bold text-foreground">{result.status}</div>
            <div className="mt-1 text-xs text-steel">Placed {formatDate(result.createdAt)}</div>

            <ul className="mt-6 space-y-3 border-t border-hair pt-4 text-sm">
              {result.items.map((i) => (
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
            <div className="mt-4 flex justify-between border-t border-hair pt-4">
              <span className="font-display font-semibold text-foreground">Total</span>
              <span className="font-display text-lg font-bold text-foreground">
                {ksh(result.total)}
              </span>
            </div>
            <div className="mt-4 text-sm text-steel">
              Delivering to {result.customer.address}, {result.customer.location}
            </div>
          </section>

          <aside className="glass h-fit rounded-3xl p-6">
            <div className="label-mono mb-4">Progress</div>
            <OrderTimeline current={result.status} history={result.history} />
          </aside>
        </div>
      )}
    </Page>
  );
}
