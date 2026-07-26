"use client";

import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { ShoppingBag, X, Trash2, ArrowRight } from "lucide-react";

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cart, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="bg-amber-950 text-amber-50 w-full max-w-md h-full flex flex-col shadow-2xl border-l border-amber-800/40">
        {/* Top Header */}
        <div className="p-5 border-b border-amber-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold tracking-wider uppercase text-amber-200">
              Shopping Bag ({totalItems})
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-amber-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-12 h-12 text-amber-700 mx-auto opacity-50" />
              <p className="text-sm text-amber-300 font-medium">Your shopping bag is empty.</p>
              <button
                onClick={onClose}
                className="inline-block text-xs font-bold uppercase tracking-widest text-amber-400 border border-amber-700 px-4 py-2 rounded hover:bg-amber-900 transition"
              >
                Explore Luxury Catalog
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 bg-amber-900/30 p-3 rounded-lg border border-amber-800/30"
              >
                <img src={item.image} alt={item.title} className="w-16 h-20 object-cover rounded border border-amber-800" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-amber-100 line-clamp-1">{item.title}</h3>
                    {item.size && <p className="text-[10px] text-amber-400 mt-0.5">Size: {item.size}</p>}
                    <p className="text-xs font-bold text-amber-300 mt-1">৳{item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-amber-800 rounded bg-amber-950">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-xs text-amber-400 hover:bg-amber-900"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-bold text-amber-100">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-xs text-amber-400 hover:bg-amber-900"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-amber-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-amber-900/50 bg-amber-950/90 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-amber-400 font-medium">Subtotal:</span>
              <span className="font-bold text-amber-100">৳{subtotal.toLocaleString()}</span>
            </div>
            <p className="text-[11px] text-amber-400/80 italic">
              Shipping delivery charges calculated at checkout.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                onClick={onClose}
                className="py-3 text-center text-xs font-bold uppercase tracking-widest border border-amber-700 text-amber-300 rounded hover:bg-amber-900 transition"
              >
                View Bag
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="py-3 text-center text-xs font-bold uppercase tracking-widest bg-amber-500 text-amber-950 rounded hover:bg-amber-400 transition flex items-center justify-center gap-1 shadow-lg"
              >
                Checkout <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
