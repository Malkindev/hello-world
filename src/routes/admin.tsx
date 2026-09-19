import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Boxes, ClipboardList, Inbox, PackageCheck, Plus, Trash2, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Page, PageTitle } from "@/components/site/Page";
import { ORDER_STATUSES } from "@/lib/config";
import { ksh, slugify } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { CategorySlug, Condition, Network, OS, Product, ProductKind } from "@/lib/data/catalog";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | Market Rise Digital" },
      { name: "description", content: "Manage the Market Rise Digital local product catalogue, orders, enquiries, submissions and brands." },
      { property: "og:title", content: "Market Rise Digital Admin" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AdminPage,
});

const TABS = [
  ["overview", "Overview"],
  ["products", "Products"],
  ["orders", "Orders"],
  ["enquiries", "Enquiries"],
  ["sell", "Sell submissions"],
  ["brands", "Brands"],
] as const;

type Tab = (typeof TABS)[number][0];

function AdminPage() {
  const {
    products, brands, orders, enquiries, submissions, upsertProduct, deleteProduct, updateOrderStatus,
    resolveEnquiry, updateSubmission, addBrand, removeBrand,
  } = useStore();

  const [tab, setTab] = useState<Tab>("overview");
  const [brand, setBrand] = useState("");
  const [newProduct, setNewProduct] = useState({
    kind: "phone" as ProductKind,
    brand: "Apple",
    model: "",
    price: "",
    originalPrice: "",
    stock: "1",
    category: "android" as CategorySlug,
    condition: "Brand New" as Condition,
    storage: "128GB",
    ram: "8GB",
    network: "5G" as Network,
    os: "Android" as OS,
    imageUrl: "",
  });

  const stats = useMemo(() => ({
    productCount: products.length,
    lowStock: products.filter((p) => !p.soldOut && p.stock > 0 && p.stock <= 2).length,
    openEnquiries: enquiries.filter((item) => !item.resolved).length,
    openSell: submissions.filter((item) => item.status !== "Closed").length,
    pendingOrders: orders.filter((order) => order.status !== "Delivered").length,
  }), [products, enquiries, submissions, orders]);

  const updateExisting = (product: Product, patch: Partial<Product>) => upsertProduct({ ...product, ...patch });
  const setNew = <K extends keyof typeof newProduct>(key: K, value: typeof newProduct[K]) => setNewProduct((current) => ({ ...current, [key]: value }));

  const createProduct = (event: React.FormEvent) => {
    event.preventDefault();
    const model = newProduct.model.trim();
    const price = Number(newProduct.price);
    if (!model || !newProduct.brand.trim() || price < 0 || !Number.isFinite(price)) {
      toast.error("Add a product brand, model and valid price.");
      return;
    }

    const baseSlug = slugify(newProduct.brand + " " + model);
    const id = products.some((product) => product.id === baseSlug) ? baseSlug + "-" + Date.now().toString(36) : baseSlug;
    const accessory = newProduct.kind === "accessory";
    const fallbackImage = products[0]?.images[0] ?? "";

    const product: Product = {
      id,
      slug: id,
      kind: newProduct.kind,
      brand: newProduct.brand.trim(),
      model,
      name: model,
      categories: [accessory ? "accessories" : newProduct.category],
      accessoryType: accessory ? "Phone cases" : undefined,
      storage: accessory ? "—" : newProduct.storage,
      storageOptions: accessory ? [] : [newProduct.storage],
      ram: accessory ? "—" : newProduct.ram,
      network: accessory ? "4G" : newProduct.network,
      os: accessory ? "—" : newProduct.os,
      condition: newProduct.condition,
      price,
      originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : undefined,
      images: [newProduct.imageUrl.trim() || fallbackImage],
      colors: [],
      display: accessory ? "—" : "Specification to be updated",
      camera: accessory ? "—" : "Specification to be updated",
      battery: accessory ? "—" : "Specification to be updated",
      charging: accessory ? "—" : "Specification to be updated",
      processor: accessory ? "—" : "Specification to be updated",
      dimensions: accessory ? "—" : "Specification to be updated",
      warranty: "12 months Market Rise warranty",
      inBox: accessory ? [] : ["Device", "Documentation"],
      description: "New catalogue item. Add full specifications before publishing.",
      stock: Math.max(0, Number(newProduct.stock) || 0),
      soldOut: Number(newProduct.stock) <= 0,
      popularity: 1,
      createdAt: new Date().toISOString(),
    };

    upsertProduct(product);
    setNewProduct((current) => ({ ...current, model: "", price: "", originalPrice: "", stock: "1", imageUrl: "" }));
    toast.success("Product added to the catalogue.");
  };

  const addNewBrand = (event: React.FormEvent) => {
    event.preventDefault();
    if (!brand.trim()) return;
    addBrand(brand.trim());
    setBrand("");
    toast.success("Brand added.");
  };

  return (
    <Page>
      <PageTitle
        eyebrow="Admin"
        title="Market Rise Digital dashboard"
        subtitle="Manage the browser-backed catalogue, orders, enquiries and sell-phone submissions from one place."
      />

      <div className="glass mb-6 rounded-3xl p-2">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {TABS.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={"shrink-0 rounded-2xl px-4 py-2.5 text-xs font-medium transition-colors " + (tab === id ? "bg-electric text-ink" : "text-steel hover:text-foreground")}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Products", stats.productCount, Boxes],
            ["Low stock", stats.lowStock, PackageCheck],
            ["Pending orders", stats.pendingOrders, ClipboardList],
            ["Open enquiries", stats.openEnquiries, Inbox],
            ["Sell leads", stats.openSell, Plus],
          ].map(([label, value, Icon]) => (
            <div key={label as string} className="glass rounded-3xl p-5">
              <Icon className="size-5 text-electric" />
              <div className="mt-4 font-display text-2xl font-bold text-foreground">{value}</div>
              <div className="mt-1 text-xs text-steel">{label}</div>
            </div>
          ))}
          <div className="glass rounded-3xl p-5 sm:col-span-2 lg:col-span-5">
            <div className="label-mono">Important</div>
            <p className="mt-2 text-sm text-steel">These admin actions currently persist in localStorage on the browser. They are useful for the working frontend, but they are not a secure multi-user production admin system until a database and authentication service are connected.</p>
          </div>
        </div>
      )}

      {tab === "products" && (
        <div className="space-y-6">
          <form onSubmit={createProduct} className="glass rounded-3xl p-6">
            <div className="label-mono mb-4">Add catalogue product</div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <select className="field" value={newProduct.kind} onChange={(e) => setNew("kind", e.target.value)}><option value="phone">Phone</option><option value="accessory">Accessory</option></select>
              <input className="field" placeholder="Brand" value={newProduct.brand} onChange={(e) => setNew("brand", e.target.value)} />
              <input className="field" placeholder="Model / product name" value={newProduct.model} onChange={(e) => setNew("model", e.target.value)} />
              <input className="field" placeholder="Price" inputMode="numeric" value={newProduct.price} onChange={(e) => setNew("price", e.target.value.replace(/\D/g, ""))} />
              <input className="field" placeholder="Original price (optional)" inputMode="numeric" value={newProduct.originalPrice} onChange={(e) => setNew("originalPrice", e.target.value.replace(/\D/g, ""))} />
              <input className="field" placeholder="Stock" inputMode="numeric" value={newProduct.stock} onChange={(e) => setNew("stock", e.target.value.replace(/\D/g, ""))} />
              <select className="field" value={newProduct.category} onChange={(e) => setNew("category", e.target.value)}><option value="android">Android</option><option value="iphone">iPhone</option><option value="flagship">Flagship</option><option value="budget">Budget</option><option value="gaming">Gaming</option><option value="5g">5G</option><option value="refurbished">Refurbished</option><option value="accessories">Accessories</option></select>
              <select className="field" value={newProduct.condition} onChange={(e) => setNew("condition", e.target.value)}><option value="Brand New">Brand New</option><option value="Refurbished">Refurbished</option><option value="Pre-owned">Pre-owned</option></select>
              <input className="field" placeholder="Storage" value={newProduct.storage} onChange={(e) => setNew("storage", e.target.value)} />
              <input className="field" placeholder="RAM" value={newProduct.ram} onChange={(e) => setNew("ram", e.target.value)} />
              <input className="field" placeholder="Image URL (optional)" value={newProduct.imageUrl} onChange={(e) => setNew("imageUrl", e.target.value)} />
              <button className="btn-electric px-4 py-3 text-sm" type="submit"><Plus className="size-4" /> Add product</button>
            </div>
          </form>

          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="glass rounded-3xl p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <img src={product.images[0]} alt={product.name} className="size-20 rounded-2xl bg-panel object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="label-mono">{product.brand}</div>
                    <div className="font-display font-semibold text-foreground">{product.name}</div>
                    <div className="text-xs text-steel">{product.condition} · {product.stock} in stock · {product.soldOut ? "Sold out" : "Live"}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:w-56">
                    <input className="field" aria-label={"Price for " + product.name} value={String(product.price)} inputMode="numeric" onChange={(e) => updateExisting(product, { price: Number(e.target.value.replace(/\D/g, "")) || 0 })} />
                    <input className="field" aria-label={"Stock for " + product.name} value={String(product.stock)} inputMode="numeric" onChange={(e) => { const stock = Number(e.target.value.replace(/\D/g, "")) || 0; updateExisting(product, { stock, soldOut: stock <= 0 }); }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateExisting(product, { soldOut: !product.soldOut })} className="btn-ghost px-3 py-2 text-[11px]">{product.soldOut ? "Mark available" : "Mark sold out"}</button>
                    <button onClick={() => { deleteProduct(product.id); toast.success("Product removed."); }} className="grid size-10 place-items-center rounded-full border border-hair text-steel hover:text-deal" aria-label={"Delete " + product.name}><Trash2 className="size-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-3">
          {orders.length === 0 ? <div className="glass rounded-3xl p-8 text-sm text-steel">No orders yet.</div> : orders.map((order) => (
            <div key={order.id} className="glass rounded-3xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-mono text-xs text-electric">{order.id}</div>
                  <div className="mt-1 font-display font-semibold text-foreground">{order.customer.name}</div>
                  <div className="text-xs text-steel">{order.customer.phone} · {order.customer.location}</div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-foreground">{ksh(order.total)}</div>
                  <select className="field mt-2 min-w-44 py-2 text-xs" value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value as (typeof ORDER_STATUSES)[number])}>
                    {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "enquiries" && (
        <div className="space-y-3">
          {enquiries.length === 0 ? <div className="glass rounded-3xl p-8 text-sm text-steel">No enquiries yet.</div> : enquiries.map((item) => (
            <div key={item.id} className="glass rounded-3xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-display font-semibold text-foreground">{item.name}</div>
                  <div className="text-xs text-steel">{[item.phone, item.email].filter(Boolean).join(" · ")}</div>
                  <p className="mt-3 text-sm text-foreground/90">{item.message}</p>
                </div>
                <button onClick={() => resolveEnquiry(item.id, !item.resolved)} className="btn-ghost px-3 py-2 text-xs">{item.resolved ? "Re-open" : "Mark resolved"}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "sell" && (
        <div className="space-y-3">
          {submissions.length === 0 ? <div className="glass rounded-3xl p-8 text-sm text-steel">No phone-sale submissions yet.</div> : submissions.map((item) => (
            <div key={item.id} className="glass rounded-3xl p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="font-display font-semibold text-foreground">{item.brand} {item.model}</div>
                  <div className="text-xs text-steel">{item.name} · {item.phone} · {item.location}</div>
                  <div className="mt-2 text-sm text-foreground/90">{item.storage} · {item.condition} · Expected {item.expectedPrice ? ksh(item.expectedPrice) : "not specified"} · {item.photos} photo{item.photos === 1 ? "" : "s"}</div>
                  {item.description && <p className="mt-2 text-sm text-steel">{item.description}</p>}
                </div>
                <select className="field w-auto min-w-36 py-2 text-xs" value={item.status} onChange={(e) => updateSubmission(item.id, e.target.value as typeof item.status)}>
                  {["New", "Reviewed", "Offer Sent", "Closed"].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "brands" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="glass rounded-3xl p-6">
            <div className="label-mono mb-4">Current brands</div>
            <div className="flex flex-wrap gap-2">
              {brands.map((item) => (
                <span key={item} className="glass inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs text-foreground">
                  {item}
                  <button onClick={() => removeBrand(item)} className="text-steel hover:text-deal" aria-label={"Remove " + item}><Trash2 className="size-3.5" /></button>
                </span>
              ))}
            </div>
          </div>
          <form onSubmit={addNewBrand} className="glass h-fit rounded-3xl p-6">
            <div className="label-mono mb-4">Add brand</div>
            <input className="field" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Nothing" />
            <button className="btn-electric mt-3 w-full px-4 py-2.5 text-sm" type="submit"><Plus className="size-4" /> Add brand</button>
          </form>
        </div>
      )}
    </Page>
  );
}
