"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────
export interface CartItem {
  productId: string;
  variantId?: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  sku: string;
  size?: string;
  color?: string;
  material?: string;
  quantity: number;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  isInCart: (productId: string, variantId?: string) => boolean;
}

// ─── Storage Key ─────────────────────────────────────────────
const CART_KEY = "qorvan_cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

// ─── Context ─────────────────────────────────────────────────
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    if (hydrated) saveCart(items);
  }, [items, hydrated]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addItem = useCallback(
    (newItem: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const key = `${newItem.productId}__${newItem.variantId || "default"}`;
        const existingIdx = prev.findIndex(
          (i) => `${i.productId}__${i.variantId || "default"}` === key
        );

        if (existingIdx > -1) {
          const updated = [...prev];
          const existing = updated[existingIdx];
          const newQty = Math.min(existing.quantity + quantity, existing.stock);
          updated[existingIdx] = { ...existing, quantity: newQty };
          return updated;
        }

        return [...prev, { ...newItem, quantity: Math.min(quantity, newItem.stock) }];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string, variantId?: string) => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          !(i.productId === productId && (i.variantId || "default") === (variantId || "default"))
      )
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number, variantId?: string) => {
      if (quantity < 1) {
        removeItem(productId, variantId);
        return;
      }
      setItems((prev) =>
        prev.map((i) => {
          if (
            i.productId === productId &&
            (i.variantId || "default") === (variantId || "default")
          ) {
            return { ...i, quantity: Math.min(quantity, i.stock) };
          }
          return i;
        })
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const isInCart = useCallback(
    (productId: string, variantId?: string) =>
      items.some(
        (i) =>
          i.productId === productId && (i.variantId || "default") === (variantId || "default")
      ),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart, isInCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
