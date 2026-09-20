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
  placeOrder: (o: Omit<Order, "id" | "createdAt" | "status" | "history">, id: string) => Order;
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
  upsertProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
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

const StoreContext = createContext<StoreApi | null>(null);

/** Persist user-generated data, including admin-uploaded product image data URLs. */
type Persisted = Omit<StoreState, "hydrated" | "products"> & {
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

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Persisted;
        overridesRef.current = {
          productOverrides: p.productOverrides ?? {},
          deletedProducts: p.deletedProducts ?? [],
          customProducts: p.customProducts ?? [],
        };
        const products = [
          ...SEED_PRODUCTS.filter((s) => !overridesRef.current.deletedProducts.includes(s.id)).map(
            (s) => ({ ...s, ...(overridesRef.current.productOverrides[s.id] ?? {}) }),
          ),
          ...overridesRef.current.customProducts,
        ];
        setState({
          ...initialState,
          ...p,
          products,
          hydrated: true,
        });
        return;
      }
    } catch {
      /* ignore corrupt storage */
    }
    setState((s) => ({ ...s, hydrated: true }));
  }, []);

  // Persist
  useEffect(() => {
    if (!state.hydrated) return;
    const { hydrated: _h, products: _p, ...rest } = state;
    const data: Persisted = { ...rest, ...overridesRef.current };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* quota */
    }
  }, [state]);

  const productById = useCallback(
    (id: string) => state.products.find((p) => p.id === id),
    [state.products],
  );
  const productBySlug = useCallback(
    (slug: string) => state.products.find((p) => p.slug === slug),
    [state.products],
  );

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

      placeOrder: (o, id) => {
        const now = new Date().toISOString();
        const order: Order = {
          ...o,
          id,
          createdAt: now,
          status: "Order Received",
          history: [{ status: "Order Received", at: now }],
        };
        set((s) => ({ orders: [order, ...s.orders], cart: [] }));
        return order;
      },
      updateOrderStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status,
                  history: [...o.history, { status, at: new Date().toISOString() }],
                }
              : o,
          ),
        })),

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

      upsertProduct: (p) => {
        const isSeed = SEED_PRODUCTS.some((s) => s.id === p.id);
        if (isSeed) {
          overridesRef.current.productOverrides[p.id] = { ...p };
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
      },
      deleteProduct: (id) => {
        if (SEED_PRODUCTS.some((s) => s.id === id)) {
          overridesRef.current.deletedProducts.push(id);
        } else {
          overridesRef.current.customProducts = overridesRef.current.customProducts.filter(
            (c) => c.id !== id,
          );
        }
        set((s) => ({
          products: s.products.filter((p) => p.id !== id),
          cart: s.cart.filter((c) => c.productId !== id),
        }));
      },
      addBrand: (b) =>
        set((s) => ({ brands: s.brands.includes(b) ? s.brands : [...s.brands, b] })),
      removeBrand: (b) => set((s) => ({ brands: s.brands.filter((x) => x !== b) })),
    };
  }, [state, productById, productBySlug]);

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
