import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";

/** Keeps wishlist data local to the browser after Supabase removal. */
export function WishlistSync() {
  const { user } = useAuth();
  const { wishlist, setWishlist, hydrated } = useStore();
  const previousUser = useRef<string | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      if (previousUser.current !== null) { previousUser.current = null; setWishlist([]); }
      return;
    }
    previousUser.current = user.id;
  }, [user, hydrated, setWishlist]);
  void wishlist;
  return null;
}
