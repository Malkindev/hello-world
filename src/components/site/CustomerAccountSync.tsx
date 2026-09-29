import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useStore, type Address, type Order } from "@/lib/store";

/** Keeps customer data in the browser store after Supabase removal. */
export function CustomerAccountSync() {
  const { user, profile, loading } = useAuth();
  const { hydrated, signIn, signOut, setOrders, setAddresses } = useStore();
  const previousUser = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated || loading) return;
    if (!user) {
      if (previousUser.current !== null) {
        previousUser.current = null;
        setOrders([]);
        setAddresses([]);
        signOut();
      }
      return;
    }
    if (previousUser.current === user.id) return;
    previousUser.current = user.id;
    signIn({
      name: profile?.full_name || user.user_metadata.full_name || "",
      email: profile?.email || user.email,
      phone: profile?.phone || user.user_metadata.phone || "",
    });
  }, [hydrated, loading, user, profile, signIn, signOut, setOrders, setAddresses]);

  return null;
}
