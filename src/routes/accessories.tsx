import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ACCESSORY_TYPES, type AccessoryType } from "@/lib/data/catalog";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/site/ProductCard";
import { Page, PageTitle, Empty } from "@/components/site/Page";

export const Route = createFileRoute("/accessories")({
  head: () => ({
    meta: [
      { title: "Phone Accessories — Cases, Chargers, Power Banks | Market Rise Digital" },
      {
        name: "description",
        content:
          "Shop quality phone accessories in Kenya: cases, screen protectors, chargers, USB cables, power banks, earphones and smart watches.",
      },
      { property: "og:title", content: "Phone Accessories | Market Rise Digital" },
      {
        property: "og:description",
        content: "Cases, screen protectors, chargers, cables, power banks, earphones and smart watches.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Accessories,
});

function Accessories() {
  const { products } = useStore();
  const [type, setType] = useState<AccessoryType | "">("");

  const list = products.filter(
    (p) => p.kind === "accessory" && (!type || p.accessoryType === type),
  );

  return (
    <Page>
      <PageTitle
        eyebrow="Accessories"
        title="Protect it. Power it. Pair it."
        subtitle="Cases, screen protectors, chargers, USB cables, power banks, earphones and smart watches — tested with the phones we sell."
      />

      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {[{ label: "All accessories" }, ...ACCESSORY_TYPES.map((t) => ({ label: t }))].map((t) => {
          const value = t.label === "All accessories" ? "" : (t.label as AccessoryType);
          return (
            <button
              key={t.label}
              onClick={() => setType(value)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                type === value ? "bg-electric text-ink" : "glass text-steel hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <Empty title="Nothing here yet" hint="New accessories land every week." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </Page>
  );
}
