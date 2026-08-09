"use client";

import { useState, useEffect } from "react";

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  slug: string;
}

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const load = () => {
      try {
        const saved = localStorage.getItem("qorvan_wishlist");
        if (saved) {
          const parsed = JSON.parse(saved);
          // Support both old format (string[]) and new format (WishlistItem[])
          if (Array.isArray(parsed)) {
            if (parsed.length === 0) {
              setWishlistItems([]);
            } else if (typeof parsed[0] === "string") {
              // Old format: array of IDs — can't show product info, clear it
              setWishlistItems([]);
              localStorage.removeItem("qorvan_wishlist");
            } else {
              setWishlistItems(parsed as WishlistItem[]);
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    load();
    window.addEventListener("qorvan_wishlist_updated", load);
    return () => window.removeEventListener("qorvan_wishlist_updated", load);
  }, []);

  const saveWishlist = (items: WishlistItem[]) => {
    setWishlistItems(items);
    localStorage.setItem("qorvan_wishlist", JSON.stringify(items));
    window.dispatchEvent(new Event("qorvan_wishlist_updated"));
  };

  const toggleWishlist = (product: WishlistItem | string) => {
    // Support both old API (string id) and new API (WishlistItem object)
    if (typeof product === "string") {
      // Legacy: just remove if present
      const updated = wishlistItems.filter((item) => item.id !== product);
      if (updated.length !== wishlistItems.length) {
        saveWishlist(updated);
      }
      return;
    }

    const exists = wishlistItems.some((item) => item.id === product.id);
    if (exists) {
      saveWishlist(wishlistItems.filter((item) => item.id !== product.id));
    } else {
      saveWishlist([...wishlistItems, product]);
    }
  };

  const addToWishlist = (product: WishlistItem) => {
    if (!wishlistItems.some((item) => item.id === product.id)) {
      saveWishlist([...wishlistItems, product]);
    }
  };

  const removeFromWishlist = (productId: string) => {
    saveWishlist(wishlistItems.filter((item) => item.id !== productId));
  };

  const isWishlisted = (id: string) =>
    wishlistItems.some((item) => item.id === id);

  return {
    wishlist: wishlistItems.map((i) => i.id), // backward compat
    wishlistItems,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    isWishlisted,
    totalWishlist: wishlistItems.length,
  };
}
