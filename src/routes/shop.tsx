import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/site/ProductCard";
import { Page, PageTitle, Empty } from "@/components/site/Page";
import { discountPct } from "@/lib/format";

type SortKey = "popular" | "newest" | "price-asc" | "price-desc" | "deals";

type ShopSearch = {
  q?: string | undefined;
  brand?: string | undefined;
  category?: string | undefined;
  sort?: SortKey | undefined;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    brand: typeof search["brand"] === "string" ? search["brand"] : undefined,
    category: typeof search["category"] === "string" ? search["category"] : undefined,
    sort: typeof search["sort"] === "string" ? (search["sort"] as SortKey) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop Phones & Accessories | Market Rise Digital" },
      {
        name: "description",
        content:
          "Browse genuine smartphones and accessories in Kenya. Filter by brand, price, RAM, storage, condition and network — iPhone, Samsung, Tecno, Infinix and more.",
      },
      { property: "og:title", content: "Shop Phones & Accessories | Market Rise Digital" },
      {
        property: "og:description",
        content: "Filter by brand, price, RAM, storage, condition and network. Genuine phones, fair prices.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
});

const RAM_OPTIONS = ["4GB", "6GB", "8GB", "12GB", "16GB"];
const STORAGE_OPTIONS = ["64GB", "128GB", "256GB", "512GB", "1TB"];
const CONDITIONS = ["Brand New", "Refurbished", "Pre-owned"];
const OS_OPTIONS = ["iOS", "Android"];
const SORTS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Most popular" },
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "deals", label: "Best deals" },
];

function Shop() {
  const { products, brands } = useStore();
  const { q = "", brand = "", category = "", sort = "popular" } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [model, setModel] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [ram, setRam] = useState("");
  const [storage, setStorage] = useState("");
  const [condition, setCondition] = useState("");
  const [network, setNetwork] = useState("");
  const [os, setOs] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const setParam = (patch: Partial<ShopSearch>) =>
    navigate({ search: (prev: ShopSearch) => ({ ...prev, ...patch }) });

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = products.filter((p) => {
      if (query) {
        const hay = `${p.brand} ${p.model} ${p.name} ${p.storage}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      if (brand && p.brand !== brand) return false;
      if (category && !p.categories.includes(category as never)) return false;
      if (model && !p.model.toLowerCase().includes(model.toLowerCase())) return false;
      if (minPrice && p.price < Number(minPrice)) return false;
      if (maxPrice && p.price > Number(maxPrice)) return false;
      if (ram && p.ram !== ram) return false;
      if (storage && !p.storageOptions.includes(storage)) return false;
      if (condition && p.condition !== condition) return false;
      if (network && p.network !== network) return false;
      if (os && p.os !== os) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest":
          return b.createdAt.localeCompare(a.createdAt);
        case "deals":
          return (
            discountPct(b.price, b.originalPrice) - discountPct(a.price, a.originalPrice)
          );
        default:
          return b.popularity - a.popularity;
      }
    });
    return list;
  }, [products, q, brand, category, model, minPrice, maxPrice, ram, storage, condition, network, os, sort]);

  const hasFilters = Boolean(
    q || brand || category || model || minPrice || maxPrice || ram || storage || condition || network || os,
  );

  const clearAll = () => {
    setModel("");
    setMinPrice("");
    setMaxPrice("");
    setRam("");
    setStorage("");
    setCondition("");
    setNetwork("");
    setOs("");
    navigate({ search: {} });
  };

  const activeCat = category || "";

  const filterPanel = (
    <div className="space-y-5">
      <div>
        <div className="label-mono mb-2">Brand</div>
        <select value={brand} onChange={(e) => setParam({ brand: e.target.value })} className="field">
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>
      <div>
        <div className="label-mono mb-2">Model</div>
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="e.g. iPhone 15"
          className="field"
        />
      </div>
      <div>
        <div className="label-mono mb-2">Price (KSh)</div>
        <div className="flex gap-2">
          <input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ""))}
            placeholder="Min"
            inputMode="numeric"
            className="field"
          />
          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
            placeholder="Max"
            inputMode="numeric"
            className="field"
          />
        </div>
      </div>
      <div>
        <div className="label-mono mb-2">RAM</div>
        <select value={ram} onChange={(e) => setRam(e.target.value)} className="field">
          <option value="">Any RAM</option>
          {RAM_OPTIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <div>
        <div className="label-mono mb-2">Storage</div>
        <select value={storage} onChange={(e) => setStorage(e.target.value)} className="field">
          <option value="">Any storage</option>
          {STORAGE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <div className="label-mono mb-2">Condition</div>
        <select value={condition} onChange={(e) => setCondition(e.target.value)} className="field">
          <option value="">Any condition</option>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <div className="label-mono mb-2">Network</div>
        <div className="flex gap-2">
          {["", "4G", "5G"].map((n) => (
            <button
              key={n || "any"}
              onClick={() => setNetwork(n)}
              className={`flex-1 rounded-xl px-3 py-2 font-mono text-xs transition-colors ${
                network === n ? "bg-electric text-ink" : "glass text-steel hover:text-foreground"
              }`}
            >
              {n || "Any"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="label-mono mb-2">Operating system</div>
        <div className="flex gap-2">
          {["", ...OS_OPTIONS].map((o) => (
            <button
              key={o || "any"}
              onClick={() => setOs(o)}
              className={`flex-1 rounded-xl px-3 py-2 text-xs transition-colors ${
                os === o ? "bg-electric text-ink" : "glass text-steel hover:text-foreground"
              }`}
            >
              {o || "Any"}
            </button>
          ))}
        </div>
      </div>
      {hasFilters && (
        <button onClick={clearAll} className="btn-ghost w-full py-2.5 text-xs">
          <X className="size-3.5" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <Page>
      <PageTitle
        eyebrow="Shop"
        title="All phones & accessories"
        subtitle="Every device is genuine, warrantied and priced to move."
      />

      {/* Category chips */}
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {[{ slug: "", label: "All" }, ...CATEGORY_CHIPS].map((c) => (
          <button
            key={c.slug || "all"}
            onClick={() => setParam({ category: c.slug || undefined })}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
              activeCat === c.slug ? "bg-electric text-ink" : "glass text-steel hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="font-mono text-xs text-steel">
          {results.length} {results.length === 1 ? "result" : "results"}
          {q ? ` for "${q}"` : ""}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="btn-ghost gap-1.5 py-2 text-xs lg:hidden"
          >
            <SlidersHorizontal className="size-3.5" /> Filters
          </button>
          <select
            value={sort}
            onChange={(e) => setParam({ sort: e.target.value as SortKey })}
            className="field w-auto py-2 text-xs"
            aria-label="Sort"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {filtersOpen && (
        <div className="glass mt-4 rounded-3xl p-5 lg:hidden animate-rise">{filterPanel}</div>
      )}

      <div className="mt-6 flex gap-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="glass sticky top-24 rounded-3xl p-5">{filterPanel}</div>
        </aside>
        <div className="min-w-0 flex-1">
          {results.length === 0 ? (
            <Empty
              title="No phones match those filters"
              hint="Try widening your price range or clearing a filter."
              action={
                <button onClick={clearAll} className="btn-electric px-5 py-2.5 text-sm">
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link to="/sell" className="text-sm text-steel hover:text-foreground">
          Have a phone to trade in? <span className="text-electric">Sell it to us →</span>
        </Link>
      </div>
    </Page>
  );
}

const CATEGORY_CHIPS: { slug: string; label: string }[] = [
  { slug: "iphone", label: "iPhone" },
  { slug: "android", label: "Android" },
  { slug: "flagship", label: "Flagship" },
  { slug: "budget", label: "Budget" },
  { slug: "gaming", label: "Gaming" },
  { slug: "5g", label: "5G" },
  { slug: "refurbished", label: "Refurbished" },
  { slug: "accessories", label: "Accessories" },
];
