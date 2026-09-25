import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  ClipboardList,
  Eye,
  EyeOff,
  Inbox,
  ImagePlus,
  LogOut,
  PackageCheck,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Page, PageTitle } from "@/components/site/Page";
import { ORDER_STATUSES } from "@/lib/config";
import { discountPct, ksh, slugify } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import type { CategorySlug, Condition, Network, OS, Product, ProductKind } from "@/lib/data/catalog";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Login | Market Rise Digital" },
      { name: "description", content: "Private Market Rise Digital administration." },
      { name: "robots", content: "noindex, nofollow" },
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

const SPEC_FALLBACK = "Specification to be updated";

const parseBoxList = (value: string) =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const splitStorageOptions = (value: string) =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const {
    products, brands, orders, enquiries, submissions, upsertProduct, deleteProduct, updateOrderStatus,
    resolveEnquiry, updateSubmission, addBrand, removeBrand,
  } = useStore();

  const [tab, setTab] = useState<Tab>("overview");
  const [brand, setBrand] = useState("");
  const [newProductImages, setNewProductImages] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editForm, setEditForm] = useState({
    brand: "",
    model: "",
    price: "",
    discountPercent: "",
    stock: "",
    category: "android" as CategorySlug,
    condition: "Brand New" as Condition,
    storage: "",
    ram: "",
    network: "5G" as Network,
    os: "Android" as OS,
    display: "",
    processor: "",
    camera: "",
    battery: "",
    charging: "",
    dimensions: "",
    warranty: "",
    inBox: "",
    description: "",
  });
  const [newProduct, setNewProduct] = useState({
    kind: "phone" as ProductKind,
    brand: "Apple",
    model: "",
    price: "",
    discountPercent: "",
    stock: "1",
    category: "android" as CategorySlug,
    condition: "Brand New" as Condition,
    storage: "128GB",
    ram: "8GB",
    network: "5G" as Network,
    os: "Android" as OS,
    display: "",
    processor: "",
    camera: "",
    battery: "",
    charging: "",
    dimensions: "",
    warranty: "",
    inBox: "",
    description: "",
  });

  const stats = useMemo(() => ({
    productCount: products.length,
    lowStock: products.filter((p) => !p.soldOut && p.stock > 0 && p.stock <= 2).length,
    openEnquiries: enquiries.filter((item) => !item.resolved).length,
    openSell: submissions.filter((item) => item.status !== "Closed").length,
    pendingOrders: orders.filter((order) => order.status !== "Delivered").length,
  }), [products, enquiries, submissions, orders]);

  const updateExisting = (product: Product, patch: Partial<Product>) => upsertProduct({ ...product, ...patch });
  const setNew = (key: keyof typeof newProduct, value: string) => {
    setNewProduct((current) => {
      if (key === "kind") return { ...current, kind: value as ProductKind };
      if (key === "category") return { ...current, category: value as CategorySlug };
      if (key === "condition") return { ...current, condition: value as Condition };
      if (key === "network") return { ...current, network: value as Network };
      if (key === "os") return { ...current, os: value as OS };
      return { ...current, [key]: value };
    });
  };

  const readImage = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read image"));
      reader.readAsDataURL(file);
    });

  const handleImages = async (files: FileList | null) => {
    const selected = Array.from(files ?? [])
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 6);

    if (!selected.length) {
      setNewProductImages([]);
      return;
    }

    try {
      setNewProductImages(await Promise.all(selected.map(readImage)));
    } catch {
      setNewProductImages([]);
      toast.error("Could not read the selected images.");
    }
  };

  const createProduct = (event: React.FormEvent) => {
    event.preventDefault();
    const model = newProduct.model.trim();
    const price = Number(newProduct.price);
    const discount = Math.min(99, Math.max(0, Number(newProduct.discountPercent) || 0));
    if (!model || !newProduct.brand.trim() || price < 0 || !Number.isFinite(price)) {
      toast.error("Add a product brand, model and valid price.");
      return;
    }

    const baseSlug = slugify(newProduct.brand + " " + model);
    const id = products.some((product) => product.id === baseSlug) ? baseSlug + "-" + Date.now().toString(36) : baseSlug;
    const accessory = newProduct.kind === "accessory";
    const fallbackImage = products[0]?.images[0] ?? "";
    const originalPrice = discount > 0 ? Math.round(price / (1 - discount / 100)) : undefined;
    const storageOptions = splitStorageOptions(newProduct.storage);
    const display = newProduct.display.trim() || (accessory ? "—" : SPEC_FALLBACK);
    const processor = newProduct.processor.trim() || (accessory ? "—" : SPEC_FALLBACK);
    const camera = newProduct.camera.trim() || (accessory ? "—" : SPEC_FALLBACK);
    const battery = newProduct.battery.trim() || (accessory ? "—" : SPEC_FALLBACK);
    const charging = newProduct.charging.trim() || (accessory ? "—" : SPEC_FALLBACK);
    const dimensions = newProduct.dimensions.trim() || (accessory ? "—" : SPEC_FALLBACK);
    const warranty = newProduct.warranty.trim() || SPEC_FALLBACK;
    const description = newProduct.description.trim() || SPEC_FALLBACK;

    const product: Product = {
      id,
      slug: id,
      kind: newProduct.kind,
      brand: newProduct.brand.trim(),
      model,
      name: model,
      categories: [accessory ? "accessories" : newProduct.category],
      accessoryType: accessory ? "Phone cases" : undefined,
      storage: accessory ? "—" : (storageOptions[0] ?? SPEC_FALLBACK),
      storageOptions: accessory ? [] : (storageOptions.length ? storageOptions : [SPEC_FALLBACK]),
      ram: accessory ? "—" : (newProduct.ram.trim() || SPEC_FALLBACK),
      network: accessory ? "4G" : newProduct.network,
      os: accessory ? "—" : newProduct.os,
      condition: newProduct.condition,
      price,
      originalPrice,
      images: newProductImages.length ? newProductImages : [fallbackImage],
      colors: [],
      display,
      camera,
      battery,
      charging,
      processor,
      dimensions,
      warranty,
      inBox: accessory ? [] : parseBoxList(newProduct.inBox),
      description,
      stock: Math.max(0, Number(newProduct.stock) || 0),
      soldOut: Number(newProduct.stock) <= 0,
      popularity: 1,
      createdAt: new Date().toISOString(),
    };

    upsertProduct(product);
    setNewProduct((current) => ({
      ...current,
      model: "",
      price: "",
      discountPercent: "",
      stock: "1",
      display: "",
      processor: "",
      camera: "",
      battery: "",
      charging: "",
      dimensions: "",
      warranty: "",
      inBox: "",
      description: "",
    }));
    setNewProductImages([]);
    toast.success(discount > 0 ? "Product added with a " + discount + "% discount." : "Product added.");
  };

  const beginEdit = (product: Product) => {
    setEditingProduct(product);
    setEditImages(product.images);
    setEditForm({
      brand: product.brand,
      model: product.model,
      price: String(product.price),
      discountPercent: String(discountPct(product.price, product.originalPrice) || ""),
      stock: String(product.stock),
      category: product.categories[0] ?? "android",
      condition: product.condition,
      storage:
        product.storageOptions.length > 0
          ? product.storageOptions.join(", ")
          : product.storage === "—"
            ? ""
            : product.storage,
      ram: product.ram === "—" ? "" : product.ram,
      network: product.network,
      os: product.os,
      display: product.display === "—" || product.display === SPEC_FALLBACK ? "" : product.display,
      processor: product.processor === "—" || product.processor === SPEC_FALLBACK ? "" : product.processor,
      camera: product.camera === "—" || product.camera === SPEC_FALLBACK ? "" : product.camera,
      battery: product.battery === "—" || product.battery === SPEC_FALLBACK ? "" : product.battery,
      charging: product.charging === "—" || product.charging === SPEC_FALLBACK ? "" : product.charging,
      dimensions: product.dimensions === "—" || product.dimensions === SPEC_FALLBACK ? "" : product.dimensions,
      warranty: product.warranty === SPEC_FALLBACK ? "" : product.warranty,
      inBox: product.inBox.join("\n"),
      description: product.description === SPEC_FALLBACK ? "" : product.description,
    });
  };

  const setEdit = (key: keyof typeof editForm, value: string) => {
    setEditForm((current) => {
      if (key === "category") return { ...current, category: value as CategorySlug };
      if (key === "condition") return { ...current, condition: value as Condition };
      if (key === "network") return { ...current, network: value as Network };
      if (key === "os") return { ...current, os: value as OS };
      return { ...current, [key]: value };
    });
  };

  const saveEdit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingProduct) return;

    const model = editForm.model.trim();
    const brandName = editForm.brand.trim();
    const price = Number(editForm.price);
    const discount = Math.min(99, Math.max(0, Number(editForm.discountPercent) || 0));

    if (!brandName || !model || !Number.isFinite(price) || price < 0) {
      toast.error("Add a valid brand, model and price.");
      return;
    }

    const accessory = editingProduct.kind === "accessory";
    const originalPrice =
      discount > 0 ? Math.round(price / (1 - discount / 100)) : undefined;
    const storageOptions = splitStorageOptions(editForm.storage);
    const display = editForm.display.trim() || (accessory ? "—" : SPEC_FALLBACK);
    const processor = editForm.processor.trim() || (accessory ? "—" : SPEC_FALLBACK);
    const camera = editForm.camera.trim() || (accessory ? "—" : SPEC_FALLBACK);
    const battery = editForm.battery.trim() || (accessory ? "—" : SPEC_FALLBACK);
    const charging = editForm.charging.trim() || (accessory ? "—" : SPEC_FALLBACK);
    const dimensions = editForm.dimensions.trim() || (accessory ? "—" : SPEC_FALLBACK);
    const warranty = editForm.warranty.trim() || SPEC_FALLBACK;
    const description = editForm.description.trim() || SPEC_FALLBACK;
    const updated: Product = {
      ...editingProduct,
      brand: brandName,
      model,
      name: model,
      slug: slugify(brandName + " " + model),
      categories: [accessory ? "accessories" : editForm.category],
      condition: editForm.condition,
      price,
      originalPrice,
      storage: accessory ? "—" : (storageOptions[0] ?? SPEC_FALLBACK),
      storageOptions: accessory ? [] : (storageOptions.length ? storageOptions : [SPEC_FALLBACK]),
      ram: accessory ? "—" : (editForm.ram.trim() || SPEC_FALLBACK),
      network: accessory ? "4G" : editForm.network,
      os: accessory ? "—" : editForm.os,
      display,
      processor,
      camera,
      battery,
      charging,
      dimensions,
      warranty,
      inBox: accessory ? [] : parseBoxList(editForm.inBox),
      description,
      images: editImages.length ? editImages : editingProduct.images,
      stock: Math.max(0, Number(editForm.stock) || 0),
      soldOut: Number(editForm.stock) <= 0 ? true : editingProduct.soldOut,
    };

    upsertProduct(updated);
    setEditingProduct(null);
    setEditImages([]);
    toast.success("Product updated.");
  };

  const readImages = async (files: FileList | null) => {
    const selected = Array.from(files ?? [])
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 6);
    if (!selected.length) return [];
    return Promise.all(selected.map(readImage));
  };

  const handleEditImages = async (files: FileList | null) => {
    try {
      const images = await readImages(files);
      if (images.length) setEditImages(images);
    } catch {
      toast.error("Could not read the selected images.");
    }
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
        action={
          <button type="button" onClick={onLogout} className="btn-ghost px-4 py-2 text-xs">
            <LogOut className="size-4" /> Log out
          </button>
        }
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
            { label: "Products", value: stats.productCount, Icon: Boxes },
            { label: "Low stock", value: stats.lowStock, Icon: PackageCheck },
            { label: "Pending orders", value: stats.pendingOrders, Icon: ClipboardList },
            { label: "Open enquiries", value: stats.openEnquiries, Icon: Inbox },
            { label: "Sell leads", value: stats.openSell, Icon: Plus },
          ].map(({ label, value, Icon }) => (
            <div key={label} className="glass rounded-3xl p-5">
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
              <input className="field" placeholder="Discount % (optional)" inputMode="numeric" min="0" max="99" value={newProduct.discountPercent} onChange={(e) => setNew("discountPercent", e.target.value.replace(/\D/g, "").slice(0, 2))} />
              <input className="field" placeholder="Stock" inputMode="numeric" value={newProduct.stock} onChange={(e) => setNew("stock", e.target.value.replace(/\D/g, ""))} />
              <select className="field" value={newProduct.category} onChange={(e) => setNew("category", e.target.value)}><option value="android">Android</option><option value="iphone">iPhone</option><option value="flagship">Flagship</option><option value="budget">Budget</option><option value="gaming">Gaming</option><option value="5g">5G</option><option value="refurbished">Refurbished</option><option value="accessories">Accessories</option></select>
              <select className="field" value={newProduct.condition} onChange={(e) => setNew("condition", e.target.value)}><option value="Brand New">Brand New</option><option value="Refurbished">Refurbished</option><option value="Pre-owned">Pre-owned</option></select>
              <input className="field" placeholder="Storage" value={newProduct.storage} onChange={(e) => setNew("storage", e.target.value)} />
              <input className="field" placeholder="RAM" value={newProduct.ram} onChange={(e) => setNew("ram", e.target.value)} />
              <select className="field" value={newProduct.os} onChange={(e) => setNew("os", e.target.value)}>
                <option value="Android">Android</option>
                <option value="iOS">iOS</option>
                <option value="—">—</option>
              </select>
              <select className="field" value={newProduct.network} onChange={(e) => setNew("network", e.target.value)}>
                <option value="4G">4G</option>
                <option value="5G">5G</option>
              </select>
              <input className="field" placeholder="Display" value={newProduct.display} onChange={(e) => setNew("display", e.target.value)} />
              <input className="field" placeholder="Processor" value={newProduct.processor} onChange={(e) => setNew("processor", e.target.value)} />
              <input className="field" placeholder="Camera" value={newProduct.camera} onChange={(e) => setNew("camera", e.target.value)} />
              <input className="field" placeholder="Battery" value={newProduct.battery} onChange={(e) => setNew("battery", e.target.value)} />
              <input className="field" placeholder="Charging" value={newProduct.charging} onChange={(e) => setNew("charging", e.target.value)} />
              <input className="field" placeholder="Dimensions" value={newProduct.dimensions} onChange={(e) => setNew("dimensions", e.target.value)} />
              <input className="field" placeholder="Warranty" value={newProduct.warranty} onChange={(e) => setNew("warranty", e.target.value)} />
              <label className="field cursor-pointer">
                <span className="text-sm text-foreground">
                  {newProductImages.length
                    ? newProductImages.length + " image" + (newProductImages.length === 1 ? "" : "s") + " selected"
                    : "Upload product images"}
                </span>
                <input
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => void handleImages(e.target.files)}
                />
              </label>
              <button className="btn-electric px-4 py-3 text-sm" type="submit"><Plus className="size-4" /> Add product</button>
              <textarea
                className="field min-h-24 sm:col-span-2"
                placeholder={"What's in the box (one item per line)"}
                value={newProduct.inBox}
                onChange={(e) => setNew("inBox", e.target.value)}
              />
              <textarea
                className="field min-h-28 sm:col-span-2"
                placeholder="About this phone"
                value={newProduct.description}
                onChange={(e) => setNew("description", e.target.value)}
              />
            </div>

            {newProductImages.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-xs font-mono uppercase tracking-widest text-steel">
                  Image preview · {newProductImages.length}/6
                </div>
                <div className="flex flex-wrap gap-3">
                  {newProductImages.map((src, index) => (
                    <div key={src} className="relative size-24 overflow-hidden rounded-2xl bg-panel">
                      <img src={src} alt={"Product preview " + (index + 1)} className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewProductImages((images) => images.filter((_, i) => i !== index))}
                        className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-ink/80 text-sm text-foreground"
                        aria-label={"Remove image " + (index + 1)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                  <div className="grid grid-cols-3 gap-2 lg:w-[22rem]">
                    <input
                      className="field"
                      aria-label={"Price for " + product.name}
                      value={String(product.price)}
                      inputMode="numeric"
                      onChange={(e) => {
                        const price = Number(e.target.value.replace(/\D/g, "")) || 0;
                        const currentDiscount = discountPct(product.price, product.originalPrice);
                        updateExisting(product, {
                          price,
                          originalPrice:
                            currentDiscount > 0
                              ? Math.round(price / (1 - currentDiscount / 100))
                              : undefined,
                        });
                      }}
                    />
                    <input
                      className="field"
                      aria-label={"Discount percentage for " + product.name}
                      value={String(discountPct(product.price, product.originalPrice) || "")}
                      placeholder="Discount %"
                      inputMode="numeric"
                      min="0"
                      max="99"
                      onChange={(e) => {
                        const discount = Math.min(99, Math.max(0, Number(e.target.value.replace(/\D/g, "")) || 0));
                        updateExisting(product, {
                          originalPrice:
                            discount > 0
                              ? Math.round(product.price / (1 - discount / 100))
                              : undefined,
                        });
                      }}
                    />
                    <input
                      className="field"
                      aria-label={"Stock for " + product.name}
                      value={String(product.stock)}
                      inputMode="numeric"
                      onChange={(e) => {
                        const stock = Number(e.target.value.replace(/\D/g, "")) || 0;
                        updateExisting(product, { stock, soldOut: stock <= 0 });
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => beginEdit(product)} className="btn-ghost px-3 py-2 text-[11px]">
                      <Pencil className="size-3.5" /> Edit
                    </button>
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

      {editingProduct && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-ink/80 p-4 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl py-8">
            <form onSubmit={saveEdit} className="glass rounded-3xl p-6 shadow-2xl">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="label-mono">Edit product</div>
                  <h2 className="mt-1 font-display text-2xl font-bold text-foreground">{editingProduct.name}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="grid size-10 place-items-center rounded-full border border-hair text-steel hover:text-foreground"
                  aria-label="Close editor"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input className="field" placeholder="Brand" value={editForm.brand} onChange={(e) => setEdit("brand", e.target.value)} />
                <input className="field" placeholder="Model / product name" value={editForm.model} onChange={(e) => setEdit("model", e.target.value)} />
                <input className="field" placeholder="Price" inputMode="numeric" value={editForm.price} onChange={(e) => setEdit("price", e.target.value.replace(/\D/g, ""))} />
                <input className="field" placeholder="Discount % (optional)" inputMode="numeric" min="0" max="99" value={editForm.discountPercent} onChange={(e) => setEdit("discountPercent", e.target.value.replace(/\D/g, "").slice(0, 2))} />
                <input className="field" placeholder="Stock" inputMode="numeric" value={editForm.stock} onChange={(e) => setEdit("stock", e.target.value.replace(/\D/g, ""))} />
                <select className="field" value={editForm.category} onChange={(e) => setEdit("category", e.target.value)}>
                  <option value="android">Android</option>
                  <option value="iphone">iPhone</option>
                  <option value="flagship">Flagship</option>
                  <option value="budget">Budget</option>
                  <option value="gaming">Gaming</option>
                  <option value="5g">5G</option>
                  <option value="refurbished">Refurbished</option>
                </select>
                <select className="field" value={editForm.condition} onChange={(e) => setEdit("condition", e.target.value)}>
                  <option value="Brand New">Brand New</option>
                  <option value="Refurbished">Refurbished</option>
                  <option value="Pre-owned">Pre-owned</option>
                </select>
                <input className="field" placeholder="Storage" value={editForm.storage} onChange={(e) => setEdit("storage", e.target.value)} />
                <input className="field" placeholder="RAM" value={editForm.ram} onChange={(e) => setEdit("ram", e.target.value)} />
                <input className="field" placeholder="Display" value={editForm.display} onChange={(e) => setEdit("display", e.target.value)} />
                <input className="field" placeholder="Processor" value={editForm.processor} onChange={(e) => setEdit("processor", e.target.value)} />
                <input className="field" placeholder="Camera" value={editForm.camera} onChange={(e) => setEdit("camera", e.target.value)} />
                <input className="field" placeholder="Battery" value={editForm.battery} onChange={(e) => setEdit("battery", e.target.value)} />
                <input className="field" placeholder="Charging" value={editForm.charging} onChange={(e) => setEdit("charging", e.target.value)} />
                <input className="field" placeholder="Dimensions" value={editForm.dimensions} onChange={(e) => setEdit("dimensions", e.target.value)} />
                <input className="field" placeholder="Warranty" value={editForm.warranty} onChange={(e) => setEdit("warranty", e.target.value)} />
                <select className="field" value={editForm.network} onChange={(e) => setEdit("network", e.target.value)}>
                  <option value="4G">4G</option>
                  <option value="5G">5G</option>
                </select>
                <select className="field" value={editForm.os} onChange={(e) => setEdit("os", e.target.value)}>
                  <option value="Android">Android</option>
                  <option value="iOS">iOS</option>
                  <option value="—">—</option>
                </select>
                <textarea
                  className="field min-h-24 sm:col-span-2"
                  placeholder={"What's in the box (one item per line)"}
                  value={editForm.inBox}
                  onChange={(e) => setEdit("inBox", e.target.value)}
                />
                <textarea
                  className="field min-h-28 sm:col-span-2"
                  placeholder="About this phone"
                  value={editForm.description}
                  onChange={(e) => setEdit("description", e.target.value)}
                />
              </div>

              <label className="mt-4 flex cursor-pointer items-center gap-2 rounded-2xl border border-hair bg-panel/40 p-3">
                <ImagePlus className="size-4 text-electric" />
                <span className="text-sm text-foreground">Replace product images (up to 6)</span>
                <input className="sr-only" type="file" accept="image/*" multiple onChange={(e) => void handleEditImages(e.target.files)} />
              </label>

              <div className="mt-4 flex flex-wrap gap-3">
                {editImages.map((src, index) => (
                  <div key={src} className="relative size-24 overflow-hidden rounded-2xl bg-panel">
                    <img src={src} alt={"Edit preview " + (index + 1)} className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setEditImages((images) => images.filter((_, i) => i !== index))}
                      className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-ink/80 text-foreground"
                      aria-label={"Remove image " + (index + 1)}
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => setEditingProduct(null)} className="btn-ghost px-5 py-2.5 text-sm">Cancel</button>
                <button type="submit" className="btn-electric px-5 py-2.5 text-sm"><Save className="size-4" /> Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Page>
  );
}

function AdminPage() {
  const { user, loading, signOut } = useAuth();
  const [authenticated, setAuthenticated] = useState(false);

  const adminEmail = String(import.meta.env.VITE_ADMIN_EMAIL ?? "").trim().toLowerCase();

  useEffect(() => {
    if (loading) return;
    const signedInEmail = user?.email?.trim().toLowerCase() ?? "";
    setAuthenticated(Boolean(adminEmail && signedInEmail && signedInEmail === adminEmail));
  }, [adminEmail, loading, user?.email]);

  if (loading) {
    return (
      <Page className="flex min-h-[70vh] items-center justify-center">
        <div className="glass h-56 w-full max-w-md rounded-3xl" />
      </Page>
    );
  }

  if (authenticated) {
    return (
      <AdminDashboard
        onLogout={async () => {
          await signOut();
          setAuthenticated(false);
        }}
      />
    );
  }

  return (
    <AdminLogin
      adminEmailConfigured={Boolean(adminEmail)}
      onAuthenticated={() => setAuthenticated(true)}
    />
  );
}

function AdminLogin({
  adminEmailConfigured,
  onAuthenticated,
}: {
  adminEmailConfigured: boolean;
  onAuthenticated: () => void;
}) {
  const { signIn, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!adminEmailConfigured) {
      toast.error("Admin access is not configured.");
      return;
    }

    setLoggingIn(true);
    try {
      const result = await signIn({ email: email.trim(), password });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      const configuredAdminEmail = String(import.meta.env.VITE_ADMIN_EMAIL ?? "")
        .trim()
        .toLowerCase();
      const signedInEmail = email.trim().toLowerCase();

      if (!configuredAdminEmail || signedInEmail !== configuredAdminEmail) {
        await signOut();
        toast.error("This account does not have admin access.");
        return;
      }

      onAuthenticated();
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <Page className="flex min-h-[70vh] items-center justify-center">
      <div className="glass w-full max-w-md rounded-3xl p-7">
        <div className="mb-6 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-electric font-display text-2xl font-bold text-ink">M</div>
          <div className="label-mono mt-5">Private area</div>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Admin login</h1>
          <p className="mt-2 text-sm text-steel">Sign in with your authorized Market Rise Digital account to manage products, orders, enquiries and phone-sale submissions.</p>
        </div>

        {!adminEmailConfigured && (
          <div role="alert" className="mb-5 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            Admin access is not configured for this deployment. Set <span className="font-mono">VITE_ADMIN_EMAIL</span> in the deployment environment and rebuild.
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs text-steel">Email</span>
            <input className="field" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs text-steel">Password</span>
            <div className="relative">
              <input
                className="field pr-12"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-steel hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </label>

          <button className="btn-electric w-full px-5 py-3 text-sm" type="submit" disabled={loggingIn || !adminEmailConfigured}>
            {loggingIn ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-steel">
          Admin is hidden from the public navigation. Open <span className="font-mono text-electric">/admin</span> directly to sign in.
        </p>
      </div>
    </Page>
  );
}
