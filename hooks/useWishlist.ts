"use client";

import { useState, useEffect } from "react";

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    const load = () => {
      try {
        const saved = localStorage.getItem("qorvan_wishlist");
        if (saved) setWishlist(JSON.parse(saved));
      } catch (err) {
        console.error(err);
      }
    };

    load();
    window.addEventListener("qorvan_wishlist_updated", load);
    return () => window.removeEventListener("qorvan_wishlist_updated", load);
  }, []);

  const toggleWishlist = (productId: string) => {
    let updated: string[];
    if (wishlist.includes(productId)) {
      updated = wishlist.filter((id) => id !== productId);
    } else {
      updated = [...wishlist, productId];
    }
    setWishlist(updated);
    localStorage.setItem("qorvan_wishlist", JSON.stringify(updated));
    window.dispatchEvent(new Event("qorvan_wishlist_updated"));
  };

  return {
    wishlist,
    toggleWishlist,
    isWishlisted: (id: string) => wishlist.includes(id),
    totalWishlist: wishlist.length,
  };
}
