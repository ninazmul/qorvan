"use client";

import { useState, useEffect } from "react";

export interface CartItem {
  id: string;
  product: string; // Product ID
  title: string;
  price: number;
  image: string;
  sku: string;
  quantity: number;
  size?: string;
  color?: string;
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const loadCart = () => {
      try {
        const saved = localStorage.getItem("qorvan_cart");
        if (saved) setCart(JSON.parse(saved));
      } catch (err) {
        console.error(err);
      }
    };

    loadCart();
    window.addEventListener("qorvan_cart_updated", loadCart);
    return () => window.removeEventListener("qorvan_cart_updated", loadCart);
  }, []);

  const saveCart = (items: CartItem[]) => {
    setCart(items);
    localStorage.setItem("qorvan_cart", JSON.stringify(items));
    window.dispatchEvent(new Event("qorvan_cart_updated"));
  };

  const addToCart = (item: CartItem) => {
    const existingIndex = cart.findIndex(
      (c) => c.product === item.product && c.size === item.size && c.color === item.color
    );

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...cart];
      updated[existingIndex].quantity += item.quantity;
    } else {
      updated = [...cart, item];
    }
    saveCart(updated);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    const updated = cart.map((item) => (item.id === id ? { ...item, quantity } : item));
    saveCart(updated);
  };

  const removeFromCart = (id: string) => {
    const updated = cart.filter((item) => item.id !== id);
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    totalItems,
  };
}
