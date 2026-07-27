"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { validateCoupon } from "@/lib/actions/coupon.actions";
import { ShoppingBag, Trash2, ArrowRight, Ticket, Truck } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    setCouponLoading(true);

    try {
      const res = await validateCoupon(couponCode, subtotal);
      if (res.success && res.data) {
        setAppliedCoupon(res.data);
        toast.success(`Coupon ${res.data.code} applied successfully!`);
      } else {
        toast.error(res.error || "Invalid coupon");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-gray-800 mx-auto opacity-50" />
        <h1 className="text-2xl font-bold font-serif text-amber-950">Your Shopping Bag is Empty</h1>
        <p className="text-xs text-gray-500">Discover QORVAN's luxury fashion and leather creations.</p>
        <Link
          href="/shop"
          className="inline-block py-3 px-6 bg-black text-amber-300 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-black transition"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-amber-900/10 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-gray-900">
          Shopping Bag ({totalItems})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="divide-y divide-gray-100">
            {cart.map((item) => (
              <div key={item.id} className="py-4 flex gap-4 items-center">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-24 object-cover rounded-xl border border-gray-200 flex-shrink-0"
                />
                <div className="flex-1 space-y-1">
                  <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                  <div className="text-xs text-gray-500 font-mono">SKU: {item.sku}</div>
                  {item.size && <div className="text-xs text-gray-900 font-medium">Size: {item.size}</div>}
                  <div className="text-sm font-black text-amber-950">৳{item.price.toLocaleString()}</div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center border rounded-xl bg-gray-50 p-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2 py-1 text-xs font-bold text-gray-700"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold text-gray-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2 py-1 text-xs font-bold text-gray-700"
                  >
                    +
                  </button>
                </div>

                <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-400 hover:text-rose-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-black text-amber-50 p-6 rounded-3xl border border-amber-900/50 shadow-xl space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-300 border-b border-amber-900 pb-3">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-amber-300">Bag Subtotal:</span>
              <span className="font-bold text-amber-100">৳{subtotal.toLocaleString()}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Discount ({appliedCoupon.code}):</span>
                <span>-৳{discountAmount.toLocaleString()}</span>
              </div>
            )}

            <div className="border-t border-amber-900/60 pt-3 flex justify-between text-sm font-extrabold">
              <span className="text-amber-200">Total:</span>
              <span className="text-white">৳{finalTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Coupon Input */}
          <form onSubmit={handleApplyCoupon} className="space-y-2 pt-2 border-t border-amber-900/60">
            <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
              Have a Coupon Code?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="PROMO CODE"
                className="flex-1 px-3 py-2 text-xs bg-black/50 border border-amber-800 text-white rounded-lg uppercase font-mono"
              />
              <button
                type="submit"
                disabled={couponLoading}
                className="px-4 py-2 bg-gray-2000 text-amber-950 font-bold text-xs uppercase rounded-lg hover:bg-gray-400 transition"
              >
                Apply
              </button>
            </div>
          </form>

          <Link
            href="/checkout"
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-extrabold text-xs uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
