import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/site/ProductCard";
import { Page, PageTitle, Empty } from "@/components/site/Page";
import { discountPct } from "@/lib/format";
import { Percent } from "lucide-react";

export const Route = createFileRoute("/deals")({
  head: () => ({
    meta: [
      { title: "Today's Deals — Phone Discounts in Kenya | Market Rise Digital" },
      {
        name: "description",
        content:
          "Live discounts on genuine smartphones in Kenya. See the original price, current price, what you save and the percentage off — updated daily.",
      },
      { property: "og:title", content: "Today's Deals | Market Rise Digital" },
      {
        property: "og:description",
        content: "Original price, current price, savings and % off on genuine smartphones.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Deals,
});

function Deals() {
  const { products } = useStore();

  const deals = useMemo(
    () =>
      products
        .filter((p) => p.originalPrice && p.originalPrice > p.price && !p.soldOut)
        .sort((a, b) => discountPct(b.price, b.originalPrice) - discountPct(a.price, a.originalPrice)),
    [products],
  );

  const biggest = deals[0];

  return (
    <Page>
      <PageTitle
        eyebrow="Today's Deals"
        title="Deals worth rising for"
        subtitle="Every deal shows the original price, the current price, exactly how much you save and the percentage off."
      />

      {deals.length === 0 ? (
        <Empty
          title="No active deals right now"
          hint="Check back soon — prices move fast around here."
        />
      ) : (
        <>
          {biggest && (
            <div className="glass mb-8 flex items-center gap-4 rounded-3xl p-6 animate-rise">
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-deal/15">
                <Percent className="size-6 text-deal" />
              </div>
              <div>
                <div className="label-mono">Biggest save today</div>
                <div className="font-display text-lg font-bold text-foreground">
                  {biggest.brand} {biggest.name} — save{" "}
                  {ksh((biggest.originalPrice ?? 0) - biggest.price)}
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {deals.map((p) => (
              <ProductCard key={p.id} product={p} showSaved />
            ))}
          </div>
        </>
      )}
    </Page>
  );
}

import { ksh } from "@/lib/format";
