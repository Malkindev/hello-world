import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useStore, type Address, type Order } from "@/lib/store";

function isOrder(value: unknown): value is Order {
  return Boolean(value && typeof value === "object");
}

/**
 * Bridges Supabase customer-owned data into the existing storefront store.
 * Guests continue to use the browser store; signed-in customers use their
 * account-scoped profile, orders and addresses from Supabase.
 */
export function CustomerAccountSync() {
  const { user, profile, loading: authLoading } = useAuth();
  const {
    hydrated,
    signIn,
    signOut,
    orders,
    addresses,
    setOrders,
    setAddresses,
  } = useStore();

  const loadedFor = useRef<string | null>(null);
  const readyFor = useRef<string | null>(null);
  const previousAddresses = useRef<Address[]>([]);
  const remoteOrderIds = useRef<Set<string>>(new Set());
  const lastProfileKey = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated || authLoading) return;

    if (!user) {
      if (loadedFor.current !== "guest") {
        loadedFor.current = "guest";
        readyFor.current = null;
        previousAddresses.current = [];
        remoteOrderIds.current = new Set();
        lastProfileKey.current = null;
        setAddresses([]);
        setOrders([]);
        signOut();
      }
      return;
    }

    if (loadedFor.current === user.id) return;
    loadedFor.current = user.id;
    readyFor.current = null;

    void (async () => {
      const [addressesResult, ordersResult] = await Promise.all([
        supabase
          .from("customer_addresses")
          .select("id, label, location, address, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("customer_orders")
          .select("id, order_number, created_at, status, items, subtotal, delivery, total, customer, payment_method, history")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (addressesResult.error) {
        console.error("[CustomerAccountSync] addresses", addressesResult.error);
      }
      if (ordersResult.error) {
        console.error("[CustomerAccountSync] orders", ordersResult.error);
      }

      const nextAddresses: Address[] = (addressesResult.data ?? []).map((row) => ({
        id: row.id,
        label: row.label,
        location: row.location,
        address: row.address,
      }));

      const nextOrders: Order[] = (ordersResult.data ?? [])
        .filter(isOrder)
        .map((row) => ({
          id: row.id,
          createdAt: row.created_at,
          status: row.status as Order["status"],
          items: Array.isArray(row.items) ? row.items : [],
          subtotal: Number(row.subtotal),
          delivery: Number(row.delivery),
          total: Number(row.total),
          customer: (row.customer ?? {}) as Order["customer"],
          paymentMethod: row.payment_method,
          history: Array.isArray(row.history) ? row.history : [],
        }));

      previousAddresses.current = nextAddresses;
      remoteOrderIds.current = new Set(nextOrders.map((order) => order.id));
      setAddresses(nextAddresses);
      setOrders(nextOrders);
      readyFor.current = user.id;
    })();
  }, [hydrated, authLoading, user, setAddresses, setOrders, signOut]);

  useEffect(() => {
    if (!user || authLoading) return;

    const name =
      profile?.full_name ||
      user.user_metadata?.full_name ||
      "";
    const phone =
      profile?.phone ||
      user.user_metadata?.phone ||
      "";
    const email = profile?.email || user.email || "";
    const key = user.id + "|" + name + "|" + email + "|" + phone;
    if (lastProfileKey.current === key) return;
    lastProfileKey.current = key;
    signIn({ name, email, phone });
  }, [user, profile, authLoading, signIn]);

  useEffect(() => {
    if (!user || readyFor.current !== user.id) return;

    const previous = previousAddresses.current;
    const removed = previous.filter(
      (oldAddress) => !addresses.some((nextAddress) => nextAddress.id === oldAddress.id),
    );

    previousAddresses.current = addresses;

    void (async () => {
      if (addresses.length > 0) {
        const { error } = await supabase.from("customer_addresses").upsert(
          addresses.map((address) => ({
            id: address.id,
            user_id: user.id,
            label: address.label,
            location: address.location,
            address: address.address,
          })),
        );
        if (error) console.error("[CustomerAccountSync] save address", error);
      }

      if (removed.length > 0) {
        const { error } = await supabase
          .from("customer_addresses")
          .delete()
          .eq("user_id", user.id)
          .in("id", removed.map((address) => address.id));
        if (error) console.error("[CustomerAccountSync] delete address", error);
      }
    })();
  }, [addresses, user]);

  useEffect(() => {
    if (!user || readyFor.current !== user.id) return;

    const pending = orders.filter((order) => !remoteOrderIds.current.has(order.id));
    if (pending.length === 0) return;

    remoteOrderIds.current = new Set([
      ...remoteOrderIds.current,
      ...pending.map((order) => order.id),
    ]);

    void (async () => {
      const { error } = await supabase.from("customer_orders").insert(
        pending.map((order) => ({
          id: order.id,
          order_number: order.id,
          user_id: user.id,
          created_at: order.createdAt,
          status: order.status,
          items: order.items,
          subtotal: order.subtotal,
          delivery: order.delivery,
          total: order.total,
          customer: order.customer,
          payment_method: order.paymentMethod,
          history: order.history,
        })),
      );

      if (error) {
        for (const order of pending) remoteOrderIds.current.delete(order.id);
        console.error("[CustomerAccountSync] save order", error);
      }
    })();
  }, [orders, user]);

  return null;
}
