import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";

/**
 * Keeps the signed-in customer's wishlist in the database.
 * Guests keep using the local wishlist exactly as before.
 */
export function WishlistSync() {
  const { user } = useAuth();
  const { wishlist, setWishlist, hydrated } = useStore();
  const syncedFor = useRef<string | null>(null);
  const previous = useRef<string[]>([]);

  // Merge local + saved wishlist when a customer signs in.
  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      if (syncedFor.current) {
        syncedFor.current = null;
        previous.current = [];
        setWishlist([]);
      }
      return;
    }
    if (syncedFor.current === user.id) return;
    syncedFor.current = user.id;

    void (async () => {
      const { data } = await supabase.from("wishlist_items").select("product_id").eq("user_id", user.id);
      const remote = (data ?? []).map((row) => row.product_id);
      const merged = Array.from(new Set([...remote, ...wishlist]));
      const missing = merged.filter((id) => !remote.includes(id));
      if (missing.length > 0) {
        await supabase
          .from("wishlist_items")
          .upsert(missing.map((product_id) => ({ user_id: user.id, product_id })));
      }
      previous.current = merged;
      setWishlist(merged);
    })();
  }, [user, hydrated, wishlist, setWishlist]);

  // Mirror later changes to the database.
  useEffect(() => {
    if (!user || syncedFor.current !== user.id) return;
    const before = previous.current;
    const added = wishlist.filter((id) => !before.includes(id));
    const removed = before.filter((id) => !wishlist.includes(id));
    if (added.length === 0 && removed.length === 0) return;
    previous.current = wishlist;
    void (async () => {
      if (added.length > 0) {
        await supabase
          .from("wishlist_items")
          .upsert(added.map((product_id) => ({ user_id: user.id, product_id })));
      }
      if (removed.length > 0) {
        await supabase.from("wishlist_items").delete().eq("user_id", user.id).in("product_id", removed);
      }
    })();
  }, [wishlist, user]);

  return null;
}
