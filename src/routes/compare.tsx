import { createFileRoute, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";
import { Page, PageTitle, Empty } from "@/components/site/Page";
import { ksh } from "@/lib/format";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Phones Side by Side | Market Rise Digital" },
      {
        name: "description",
        content:
          "Compare up to 3 smartphones side by side — price, display, processor, RAM, storage, camera, battery, charging, network and warranty.",
      },
      { property: "og:title", content: "Compare Phones | Market Rise Digital" },
      {
        property: "og:description",
        content: "Compare up to 3 phones — price, display, processor, camera, battery and more.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Compare,
});

const ROWS: { label: string; get: (p: ReturnType<typeof useStore>["products"][number]) => string }[] = [
  { label: "Price", get: (p) => ksh(p.price) },
  { label: "Display", get: (p) => p.display },
  { label: "Processor", get: (p) => p.processor },
  { label: "RAM", get: (p) => p.ram },
  { label: "Storage", get: (p) => p.storageOptions.join(" · ") },
  { label: "Camera", get: (p) => p.camera },
  { label: "Battery", get: (p) => p.battery },
  { label: "Charging", get: (p) => p.charging },
  { label: "4G / 5G", get: (p) => p.network },
  { label: "OS", get: (p) => p.os },
  { label: "Dimensions", get: (p) => p.dimensions },
  { label: "Warranty", get: (p) => p.warranty },
];

function Compare() {
  const { compare, products, removeCompare, clearCompare } = useStore();
  const selected = compare
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <Page>
      <PageTitle
        eyebrow="Compare"
        title="Side-by-side, no guesswork"
        subtitle="Add up to 3 phones from any product card, then line up the full specs here."
        action={
          selected.length > 0 ? (
            <button onClick={clearCompare} className="btn-ghost px-4 py-2 text-xs">
              Clear all
            </button>
          ) : undefined
        }
      />

      {selected.length === 0 ? (
        <Empty
          title="Nothing to compare yet"
          hint="Tap the compare icon on any phone card to add it here (up to 3)."
          action={
            <Link to="/shop" className="btn-electric px-5 py-2.5 text-sm">
              Browse phones
            </Link>
          }
        />
      ) : (
        <div className="glass overflow-x-auto rounded-3xl">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-32 bg-panel p-4 align-bottom">
                  <span className="label-mono">Spec</span>
                </th>
                {selected.map((p) => (
                  <th key={p.id} className="min-w-[180px] p-4 align-bottom">
                    <div className="relative">
                      <button
                        onClick={() => removeCompare(p.id)}
                        className="absolute -right-1 -top-1 z-10 grid size-6 place-items-center rounded-full bg-ink/70 text-steel hover:text-deal"
                        aria-label={`Remove ${p.name}`}
                      >
                        <X className="size-3.5" />
                      </button>
                      <Link to="/product/$slug" params={{ slug: p.slug }}>
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="mx-auto aspect-square w-24 rounded-xl bg-panel object-cover"
                        />
                        <div className="label-mono mt-3">{p.brand}</div>
                        <div className="font-display text-sm font-bold text-foreground">{p.name}</div>
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? "bg-foreground/[0.02]" : ""}>
                  <td className="sticky left-0 z-10 bg-panel p-4 align-top">
                    <span className="label-mono">{row.label}</span>
                  </td>
                  {selected.map((p) => (
                    <td key={p.id} className="p-4 align-top text-sm text-foreground/90">
                      {row.get(p)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="sticky left-0 z-10 bg-panel p-4" />
                {selected.map((p) => (
                  <td key={p.id} className="p-4">
                    <Link to="/product/$slug" params={{ slug: p.slug }} className="btn-electric block py-2 text-center text-xs">
                      View details
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Page>
  );
}
