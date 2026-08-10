"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { ShoppingBag, X, Trash2, ArrowRight } from "lucide-react";

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cart, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Mount portal target on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Drive the CSS transition: open → slide in, close → slide out then unmount
  useEffect(() => {
    if (isOpen) {
      // Allow a frame for the DOM to render before starting transition
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Don't render portal at all until mounted on client
  if (!mounted) return null;

  // Keep the portal in the DOM while animating out (visible=false but isOpen just turned false)
  // We unmount after the CSS transition (300ms) finishes via onTransitionEnd on the overlay.
  const handleOverlayTransitionEnd = () => {
    // When the overlay has fully faded out, we can stop rendering — but we rely on
    // the parent controlling isOpen, so nothing extra is needed here.
  };

  const drawer = (
    <div
      aria-modal="true"
      role="dialog"
      aria-label="Shopping bag"
      className={`fixed inset-0 z-[9999] flex justify-end transition-all duration-300 ease-in-out ${
        visible ? "bg-black/60 backdrop-blur-sm" : "bg-transparent backdrop-blur-none pointer-events-none"
      }`}
      onClick={onClose}
      onTransitionEnd={handleOverlayTransitionEnd}
      style={{ visibility: isOpen || visible ? "visible" : "hidden" }}
    >
      <div
        className={`bg-white text-black w-full max-w-md flex flex-col shadow-2xl border-l border-zinc-200 transition-transform duration-300 ease-in-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ height: "100dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-black" />
            <h2 className="text-base font-bold tracking-wider uppercase text-black">
              Shopping Bag ({totalItems})
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-black hover:text-zinc-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items — scrollable middle */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-12 h-12 text-zinc-400 mx-auto opacity-50" />
              <p className="text-sm text-zinc-600 font-medium">Your shopping bag is empty.</p>
              <button
                onClick={onClose}
                className="inline-block text-xs font-bold uppercase tracking-widest text-black border border-black px-4 py-2 rounded hover:bg-zinc-100 transition"
              >
                Explore Luxury Catalog
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 bg-zinc-50 p-3 rounded-lg border border-zinc-200"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-20 object-cover rounded border border-zinc-200 flex-shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="text-xs font-bold text-black line-clamp-2">{item.title}</h3>
                    {item.size && <p className="text-[10px] text-zinc-500 mt-0.5">Size: {item.size}</p>}
                    {item.color && <p className="text-[10px] text-zinc-500">Color: {item.color}</p>}
                    <p className="text-xs font-bold text-black mt-1">৳{item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-zinc-300 rounded bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-xs text-black hover:bg-zinc-100"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-bold text-black">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-xs text-black hover:bg-zinc-100"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-zinc-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer — always pinned to bottom */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-zinc-200 bg-white space-y-4 flex-shrink-0">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 font-medium">Subtotal:</span>
              <span className="font-extrabold text-black">৳{subtotal.toLocaleString()}</span>
            </div>
            <p className="text-[11px] text-zinc-500 italic">
              Shipping delivery charges calculated at checkout.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                onClick={onClose}
                className="py-3 text-center text-xs font-bold uppercase tracking-widest border border-black text-black rounded hover:bg-zinc-100 transition"
              >
                View Bag
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="py-3 text-center text-xs font-bold uppercase tracking-widest bg-black text-white rounded hover:bg-zinc-800 transition flex items-center justify-center gap-1 shadow-md"
              >
                Checkout <ArrowRight className="w-3.5 h-3.5 text-white" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(drawer, document.body);
}
