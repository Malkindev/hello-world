import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SEED_PRODUCTS, type Product } from "./data/catalog";
import { BRANDS as SEED_BRANDS } from "./data/catalog";
import { ORDER_STATUSES, type OrderStatus } from "./config";
import { readPersistedStore, writePersistedStore } from "./persistence";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { isAdminUser } from "./access";

/* ---------- Types ---------- */
export interface CartItem {
  productId: string;
  qty: number;
  storage?: string;
  color?: string;
}

export interface Address {
  id: string;
  label: string;
  location: string;
  address: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  items: { productId: string; name: string; qty: number; price: number; storage?: string }[];
  subtotal: number;
  delivery: number;
  total: number;
  customer: { name: string; phone: string; email: string; location: string; address: string };
  paymentMethod: string;
  history: { status: OrderStatus; at: string }[];
}

export interface Enquiry {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  resolved: boolean;
}

export interface PhoneSubmission {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  brand: string;
  model: string;
  storage: string;
  condition: string;
  expectedPrice: number;
  location: string;
  description: string;
  photos: number;
  status: "New" | "Reviewed" | "Offer Sent" | "Closed";
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  signedIn: boolean;
}

interface StoreState {
  hydrated: boolean;
  products: Product[];
  brands: string[];
  cart: CartItem[];
  wishlist: string[];
  compare: string[];
  orders: Order[];
  enquiries: Enquiry[];
  submissions: PhoneSubmission[];
  user: UserProfile;
  addresses: Address[];
}

interface StoreApi extends StoreState {
  productById: (id: string) => Product | undefined;
  productBySlug: (slug: string) => Product | undefined;
  addToCart: (item: CartItem) => void;
  updateQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  toggleWishlist: (id: string) => void;
  setWishlist: (ids: string[]) => void;
  isWished: (id: string) => boolean;
  toggleCompare: (id: string) => boolean;
  removeCompare: (id: string) => void;
  clearCompare: () => void;
  placeOrder: (o: Omit<Order, "id" | "createdAt" | "status" | "history">, id: string) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  addEnquiry: (e: Omit<Enquiry, "id" | "createdAt" | "resolved">) => void;
  resolveEnquiry: (id: string, resolved: boolean) => void;
  addSubmission: (s: Omit<PhoneSubmission, "id" | "createdAt" | "status">) => void;
  updateSubmission: (id: string, status: PhoneSubmission["status"]) => void;
  signIn: (u: Omit<UserProfile, "signedIn">) => void;
  signOut: () => void;
  updateProfile: (u: Partial<UserProfile>) => void;
  addAddress: (a: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;
  setAddresses: (addresses: Address[]) => void;
  setOrders: (orders: Order[]) => void;
  refreshOrders: () => Promise<{ error: string | null }>;
  upsertProduct: (p: Product) => Promise<{ error: string | null }>;
  deleteProduct: (id: string) => Promise<{ error: string | null }>;
  refreshProducts: () => Promise<{ error: string | null }>;
  syncSeedProducts: () => Promise<{ error: string | null }>;
  addBrand: (b: string) => void;
  removeBrand: (b: string) => void;
}

const STORAGE_KEY = "mrd-store-v1";

const uid = () => Math.random().toString(36).slice(2, 10);

const demoOrder = (): Order => ({
  id: "MRD-2609-4821",
  createdAt: "2026-09-16T09:30:00.000Z",
  status: "Dispatched",
  items: [{ productId: "tecno-camon-30", name: "Camon 30", qty: 1, price: 28500, storage: "256GB" }],
  subtotal: 28500,
  delivery: 300,
  total: 28800,
  customer: {
    name: "Demo Customer",
    phone: "+254 700 000 000",
    email: "demo@example.com",
    location: "Nairobi & environs",
    address: "Westlands, Nairobi",
  },
  paymentMethod: "M-Pesa (Lipa na M-Pesa)",
  history: [
    { status: "Order Received", at: "2026-09-16T09:30:00.000Z" },
    { status: "Confirmed", at: "2026-09-16T10:05:00.000Z" },
    { status: "Processing", at: "2026-09-16T14:00:00.000Z" },
    { status: "Dispatched", at: "2026-09-17T08:20:00.000Z" },
  ],
});

const initialState: StoreState = {
  hydrated: false,
  products: SEED_PRODUCTS,
  brands: SEED_BRANDS,
  cart: [],
  wishlist: [],
  compare: [],
  orders: [demoOrder()],
  enquiries: [],
  submissions: [],
  user: { name: "", email: "", phone: "", signedIn: false },
  addresses: [],
};


type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const rowToProduct = (row: ProductRow): Product => ({
  id: row.id,
  slug: row.slug,
  kind: row.kind as Product["kind"],
  brand: row.brand,
  model: row.model,
  name: row.name,
  categories: asStringArray(row.categories) as Product["categories"],
  accessoryType: (row.accessory_type as Product["accessoryType"] | null) ?? undefined,
  storage: row.storage,
  storageOptions: asStringArray(row.storage_options),
  ram: row.ram,
  network: row.network as Product["network"],
  os: row.os as Product["os"],
  condition: row.condition as Product["condition"],
  price: row.price,
  originalPrice: row.original_price ?? undefined,
  lipaMdogoStartAmount: row.lipa_mdogo_start_amount ?? undefined,
  lipaMdogoStartFrequency:
    row.lipa_mdogo_start_frequency === "daily" || row.lipa_mdogo_start_frequency === "weekly" || row.lipa_mdogo_start_frequency === "monthly"
      ? row.lipa_mdogo_start_frequency
      : undefined,
  images: asStringArray(row.images),
  colors: asStringArray(row.colors),
  display: row.display,
  camera: row.camera,
  battery: row.battery,
  charging: row.charging,
  processor: row.processor,
  dimensions: row.dimensions,
  warranty: row.warranty,
  inBox: asStringArray(row.in_box),
  description: row.description,
  stock: row.stock,
  soldOut: row.sold_out,
  popularity: row.popularity,
  createdAt: row.created_at,
  featured: row.featured,
});

const productToRow = (product: Product): ProductInsert => ({
  id: product.id,
  slug: product.slug,
  kind: product.kind,
  brand: product.brand,
  model: product.model,
  name: product.name,
  categories: product.categories,
  accessory_type: product.accessoryType ?? null,
  storage: product.storage,
  storage_options: product.storageOptions,
  ram: product.ram,
  network: product.network,
  os: product.os,
  condition: product.condition,
  price: product.price,
  original_price: product.originalPrice ?? null,
  lipa_mdogo_start_amount: product.kind === "phone" ? product.lipaMdogoStartAmount ?? null : null,
  lipa_mdogo_start_frequency: product.kind === "phone" ? product.lipaMdogoStartFrequency ?? null : null,
  images: product.images,
  colors: product.colors,
  display: product.display,
  camera: product.camera,
  battery: product.battery,
  charging: product.charging,
  processor: product.processor,
  dimensions: product.dimensions,
  warranty: product.warranty,
  in_box: product.inBox,
  description: product.description,
  stock: product.stock,
  sold_out: product.soldOut ?? product.stock <= 0,
  popularity: product.popularity,
  featured: product.featured ?? false,
  created_at: product.createdAt,
  is_published: true,
});

const asOrderItems = (value: unknown): Order["items"] =>
  Array.isArray(value)
    ? value
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Record<string, unknown>;
          if (
            typeof row.productId !== "string" ||
            typeof row.name !== "string" ||
            typeof row.qty !== "number" ||
            typeof row.price !== "number"
          ) return null;
          return {
            productId: row.productId,
            name: row.name,
            qty: row.qty,
            price: row.price,
            ...(typeof row.storage === "string" ? { storage: row.storage } : {}),
          };
        })
        .filter((item): item is Order["items"][number] => Boolean(item))
    : [];

const asOrderHistory = (value: unknown): Order["history"] =>
  Array.isArray(value)
    ? value
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Record<string, unknown>;
          if (
            typeof row.status !== "string" ||
            !ORDER_STATUSES.includes(row.status as OrderStatus) ||
            typeof row.at !== "string"
          ) return null;
          return { status: row.status as OrderStatus, at: row.at };
        })
        .filter((item): item is Order["history"][number] => Boolean(item))
    : [];

const rowToOrder = (row: OrderRow): Order => ({
  id: row.id,
  createdAt: row.created_at,
  status: ORDER_STATUSES.includes(row.status as OrderStatus) ? (row.status as OrderStatus) : "Order Received",
  items: asOrderItems(row.items),
  subtotal: Number(row.subtotal),
  delivery: Number(row.delivery),
  total: Number(row.total),
  customer: {
    name: row.customer_name,
    phone: row.customer_phone,
    email: row.customer_email,
    location: row.customer_location,
    address: row.customer_address,
  },
  paymentMethod: row.payment_method,
  history: asOrderHistory(row.history),
});

const orderToRow = (order: Order, customerUserId: string | null): OrderInsert => ({
  id: order.id,
  created_at: order.createdAt,
  status: order.status,
  items: order.items,
  subtotal: order.subtotal,
  delivery: order.delivery,
  total: order.total,
  customer_user_id: customerUserId,
  customer_name: order.customer.name,
  customer_phone: order.customer.phone,
  customer_email: order.customer.email,
  customer_location: order.customer.location,
  customer_address: order.customer.address,
  payment_method: order.paymentMethod,
  history: order.history,
});


const loadRemoteOrders = async (): Promise<{ data: OrderRow[]; error: string | null }> => {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) return { data: [], error: authError.message };

  const currentUser = authData.user ?? null;
  let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

  if (!currentUser) {
    query = query.eq("customer_user_id", "__no_authenticated_user__");
  } else if (!isAdminUser(currentUser)) {
    query = query.eq("customer_user_id", currentUser.id);
  }

  const { data, error } = await query;
  return { data: data ?? [], error: error?.message ?? null };
};

const StoreContext = createContext<StoreApi | null>(null);

/** Persist non-product frontend state locally. Products are synchronized through Supabase. */
type Persisted = Omit<StoreState, "hydrated" | "products" | "orders"> & {
  productOverrides: Record<string, Partial<Product>>;
  deletedProducts: string[];
  customProducts: Product[];
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(initialState);
  const overridesRef = useRef<{
    productOverrides: Record<string, Partial<Product>>;
    deletedProducts: string[];
    customProducts: Product[];
  }>({ productOverrides: {}, deletedProducts: [], customProducts: [] });

  // Restore other local frontend state first, then use Supabase as the shared
  // source of truth for catalogue products. When the remote catalogue is empty
  // or unavailable, the bundled catalogue/local snapshot remains visible.
  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      let localState: Persisted | null = null;

      try {
        localState = await readPersistedStore<Persisted>(STORAGE_KEY);
        if (!active) return;

        if (localState) {
          overridesRef.current = {
            productOverrides: localState.productOverrides ?? {},
            deletedProducts: localState.deletedProducts ?? [],
            customProducts: localState.customProducts ?? [],
          };

          const products = [
            ...SEED_PRODUCTS.filter((s) => !overridesRef.current.deletedProducts.includes(s.id)).map(
              (s) => ({ ...s, ...(overridesRef.current.productOverrides[s.id] ?? {}) }),
            ),
            ...overridesRef.current.customProducts,
          ];

          setState({
            ...initialState,
            ...localState,
            user: initialState.user,
            orders: initialState.orders,
            products,
            hydrated: false,
          });
        }
      } catch (error) {
        console.warn("[Store] Failed to restore local state.", error);
      }

      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          console.warn("[Store] Failed to load shared products:", error.message);
        } else if (data?.length) {
          if (active) setState((s) => ({ ...s, products: data.map(rowToProduct) }));
        }
      } catch (error) {
        console.warn("[Store] Shared product catalogue unavailable.", error);
      }

      try {
        const { data, error } = await loadRemoteOrders();
        if (error) {
          console.warn("[Store] Failed to load shared orders:", error);
        } else if (active) {
          setState((s) => ({
            ...s,
            orders: [...data.map(rowToOrder), ...s.orders.filter((local) => !data.some((remote) => remote.id === local.id))],
          }));
        }
      } catch (error) {
        console.warn("[Store] Shared orders unavailable.", error);
      }

      if (active) setState((s) => ({ ...s, hydrated: true }));
    };

    void hydrate();
    return () => {
      active = false;
    };
  }, []);

  // Persist outside localStorage so large admin-uploaded images survive reloads
  // without hitting the browser's small localStorage quota.
  useEffect(() => {
    if (!state.hydrated) return;
    const { hydrated: _h, products: _p, orders: _orders, user: _user, ...rest } = state;
    const data: Persisted = { ...rest, user: initialState.user, ...overridesRef.current };
    void writePersistedStore(STORAGE_KEY, data).catch((error) => {
      console.warn("[Store] Failed to persist data.", error);
    });
  }, [state]);

  const productById = useCallback(
    (id: string) => state.products.find((p) => p.id === id),
    [state.products],
  );
  const productBySlug = useCallback(
    (slug: string) => state.products.find((p) => p.slug === slug),
    [state.products],
  );

  const refreshOrders = useCallback(async (): Promise<{ error: string | null }> => {
    const { data, error } = await loadRemoteOrders();
    if (error) return { error };
    setState((s) => ({
      ...s,
      orders: [
        ...data.map(rowToOrder),
        ...s.orders.filter((local) => !data.some((remote) => remote.id === local.id)),
      ],
    }));
    return { error: null };
  }, []);

  const api = useMemo<StoreApi>(() => {
    const set = (fn: (s: StoreState) => Partial<StoreState>) =>
      setState((s) => ({ ...s, ...fn(s) }));

    return {
      ...state,
      productById,
      productBySlug,
      cartCount: state.cart.reduce((n, i) => n + i.qty, 0),

      addToCart: (item) =>
        set((s) => {
          const existing = s.cart.find((c) => c.productId === item.productId);
          if (existing) {
            return {
              cart: s.cart.map((c) =>
                c.productId === item.productId ? { ...c, qty: c.qty + item.qty } : c,
              ),
            };
          }
          return { cart: [...s.cart, item] };
        }),
      updateQty: (productId, qty) =>
        set((s) => ({
          cart:
            qty <= 0
              ? s.cart.filter((c) => c.productId !== productId)
              : s.cart.map((c) => (c.productId === productId ? { ...c, qty } : c)),
        })),
      removeFromCart: (productId) =>
        set((s) => ({ cart: s.cart.filter((c) => c.productId !== productId) })),
      clearCart: () => set(() => ({ cart: [] })),

      toggleWishlist: (id) =>
        set((s) => ({
          wishlist: s.wishlist.includes(id)
            ? s.wishlist.filter((w) => w !== id)
            : [...s.wishlist, id],
        })),
      setWishlist: (ids) => set(() => ({ wishlist: [...new Set(ids)] })),
      isWished: (id) => state.wishlist.includes(id),

      toggleCompare: (id) => {
        if (state.compare.includes(id)) {
          set((s) => ({ compare: s.compare.filter((c) => c !== id) }));
          return true;
        }
        if (state.compare.length >= 3) return false;
        set((s) => ({ compare: [...s.compare, id] }));
        return true;
      },
      removeCompare: (id) => set((s) => ({ compare: s.compare.filter((c) => c !== id) })),
      clearCompare: () => set(() => ({ compare: [] })),

      placeOrder: async (o, id) => {
        const now = new Date().toISOString();
        const order: Order = {
          ...o,
          id,
          createdAt: now,
          status: "Order Received",
          history: [{ status: "Order Received", at: now }],
        };
        const { data: authData } = await supabase.auth.getUser();
        const { error } = await supabase.from("orders").insert(orderToRow(order, authData.user?.id ?? null));
        if (error) throw new Error(error.message);
        set((s) => ({ orders: [order, ...s.orders], cart: [] }));
        return order;
      },
      updateOrderStatus: async (id, status) => {
        const current = state.orders.find((order) => order.id === id);
        const history = [...(current?.history ?? []), { status, at: new Date().toISOString() }];
        const { error } = await supabase
          .from("orders")
          .update({ status, history })
          .eq("id", id);
        if (error) {
          console.warn("[Store] Failed to update shared order:", error.message);
          return;
        }
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? { ...o, status, history }
              : o,
          ),
        }));
      },

      addEnquiry: (e) =>
        set((s) => ({
          enquiries: [
            { ...e, id: uid(), createdAt: new Date().toISOString(), resolved: false },
            ...s.enquiries,
          ],
        })),
      resolveEnquiry: (id, resolved) =>
        set((s) => ({
          enquiries: s.enquiries.map((e) => (e.id === id ? { ...e, resolved } : e)),
        })),

      addSubmission: (sub) =>
        set((s) => ({
          submissions: [
            { ...sub, id: uid(), createdAt: new Date().toISOString(), status: "New" },
            ...s.submissions,
          ],
        })),
      updateSubmission: (id, status) =>
        set((s) => ({
          submissions: s.submissions.map((x) => (x.id === id ? { ...x, status } : x)),
        })),

      signIn: (u) => set(() => ({ user: { ...u, signedIn: true } })),
      signOut: () => set(() => ({ user: { name: "", email: "", phone: "", signedIn: false } })),
      updateProfile: (u) => set((s) => ({ user: { ...s.user, ...u } })),
      addAddress: (a) => set((s) => ({ addresses: [...s.addresses, { ...a, id: uid() }] })),
      removeAddress: (id) =>
        set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) })),
      setAddresses: (addresses) => set(() => ({ addresses })),
      setOrders: (orders) => set(() => ({ orders })),
      refreshOrders,

      upsertProduct: async (p) => {
        const { error } = await supabase
          .from("products")
          .upsert(productToRow(p), { onConflict: "id" });

        if (error) {
          return { error: error.message };
        }

        // Keep the existing local snapshot as an offline fallback, but Supabase
        // is the shared source used by every client on the next hydration.
        const isSeed = SEED_PRODUCTS.some((s) => s.id === p.id);
        if (isSeed) {
          overridesRef.current.productOverrides[p.id] = { ...p };
          overridesRef.current.deletedProducts = overridesRef.current.deletedProducts.filter((id) => id !== p.id);
        } else {
          const idx = overridesRef.current.customProducts.findIndex((c) => c.id === p.id);
          if (idx >= 0) overridesRef.current.customProducts[idx] = p;
          else overridesRef.current.customProducts.push(p);
        }

        set((s) => ({
          products: s.products.some((x) => x.id === p.id)
            ? s.products.map((x) => (x.id === p.id ? p : x))
            : [...s.products, p],
        }));

        return { error: null };
      },

      deleteProduct: async (id) => {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) {
          return { error: error.message };
        }

        if (SEED_PRODUCTS.some((s) => s.id === id)) {
          overridesRef.current.deletedProducts = [
            ...new Set([...overridesRef.current.deletedProducts, id]),
          ];
          delete overridesRef.current.productOverrides[id];
        } else {
          overridesRef.current.customProducts = overridesRef.current.customProducts.filter(
            (c) => c.id !== id,
          );
        }

        set((s) => ({
          products: s.products.filter((p) => p.id !== id),
          cart: s.cart.filter((c) => c.productId !== id),
        }));

        return { error: null };
      },

      refreshProducts: async () => {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) return { error: error.message };

        if (data) {
          set(() => ({ products: data.map(rowToProduct) }));
        }

        return { error: null };
      },

      syncSeedProducts: async () => {
        const { data, error } = await supabase.from("products").select("id").limit(1);
        if (error) return { error: error.message };
        if (data && data.length > 0) return { error: null };

        const { error: insertError } = await supabase
          .from("products")
          .upsert(SEED_PRODUCTS.map(productToRow), { onConflict: "id" });

        if (insertError) return { error: insertError.message };

        const refreshed = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: true });

        if (refreshed.error) return { error: refreshed.error.message };

        set(() => ({ products: (refreshed.data ?? []).map(rowToProduct) }));
        return { error: null };
      },

      addBrand: (b) =>
        set((s) => ({ brands: s.brands.includes(b) ? s.brands : [...s.brands, b] })),
      removeBrand: (b) => set((s) => ({ brands: s.brands.filter((x) => x !== b) })),
    };
  }, [state, productById, productBySlug, refreshOrders]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export const nextStatus = (s: OrderStatus): OrderStatus | null => {
  const i = ORDER_STATUSES.indexOf(s);
  const next = ORDER_STATUSES[i + 1];
  return next ?? null;
};
