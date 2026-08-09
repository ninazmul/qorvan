"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { validateCoupon } from "@/lib/actions/coupon.actions";
import { ShoppingBag, Trash2, ArrowRight, Ticket, Truck, X } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("qorvan_applied_coupon");
      if (saved) {
        setAppliedCoupon(JSON.parse(saved));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    setCouponLoading(true);

    try {
      const res = await validateCoupon(couponCode, subtotal);
      if (res.success && res.data) {
        setAppliedCoupon(res.data);
        localStorage.setItem("qorvan_applied_coupon", JSON.stringify(res.data));
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

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    localStorage.removeItem("qorvan_applied_coupon");
    toast.success("Coupon removed");
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-zinc-400 mx-auto opacity-50" />
        <h1 className="text-2xl font-bold font-serif text-gray-900">Your Shopping Bag is Empty</h1>
        <p className="text-xs text-gray-500">Discover QORVAN's luxury fashion and leather creations.</p>
        <Link
          href="/shop"
          className="inline-block py-3 px-6 bg-black text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-zinc-200 pb-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-gray-900">
          Shopping Bag
          <span className="ml-2 text-base font-medium text-zinc-400">({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
        </h1>
        <Link href="/shop" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black underline-offset-2 hover:underline transition">
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4">
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
                  <div className="text-sm font-black text-gray-900">৳{item.price.toLocaleString()}</div>
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded-xl bg-gray-50 p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 text-xs font-bold text-gray-700 hover:bg-zinc-200 rounded"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-xs font-bold text-gray-700 hover:bg-zinc-200 rounded"
                      >
                        +
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-400 hover:text-rose-600 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-black text-white rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-5 border-b border-zinc-800">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-zinc-400" />
              Order Summary
            </h2>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Price Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
                <span className="font-bold text-white">৳{subtotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" /> Delivery
                </span>
                <span className="font-bold text-emerald-400 text-xs">Calculated at checkout</span>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                    <Ticket className="w-3.5 h-3.5" /> {appliedCoupon.code}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400">-৳{discountAmount.toLocaleString()}</span>
                    <button onClick={handleRemoveCoupon} className="text-zinc-400 hover:text-rose-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="border-t border-zinc-800 pt-4 flex items-center justify-between">
              <span className="text-base font-extrabold text-white uppercase tracking-wider">Total</span>
              <span className="text-2xl font-black text-white">৳{finalTotal.toLocaleString()}</span>
            </div>

            {/* COD Badge */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Payment Method</p>
              <p className="text-sm font-extrabold text-white mt-0.5">Cash on Delivery (COD)</p>
            </div>

            {/* Coupon Input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Have a Coupon Code?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  className="flex-1 px-3 py-2.5 text-xs bg-zinc-900 border border-zinc-700 focus:border-white text-white placeholder-zinc-600 rounded-lg uppercase font-mono outline-none transition"
                />
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="px-4 py-2.5 bg-white text-black font-extrabold text-xs uppercase tracking-wider rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
                >
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>
            </form>

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full py-4 bg-white hover:bg-zinc-100 text-black font-extrabold text-xs uppercase tracking-[0.2em] rounded-xl transition shadow-lg"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-center text-[10px] text-zinc-600 uppercase tracking-wider">
              Secure · COD · Free Returns
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
