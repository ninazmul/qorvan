"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { getDeliveryZones } from "@/lib/actions/delivery.actions";
import { createOrder } from "@/lib/actions/order.actions";
import { validateCoupon } from "@/lib/actions/coupon.actions";
import { ShieldCheck, Truck, ShoppingBag, Check, Ticket, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, totalItems, clearCart } = useCart();
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Coupon State
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [district, setDistrict] = useState("Dhaka");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadZones() {
      const res = await getDeliveryZones();
      if (res.success && res.data) {
        setDeliveryZones(res.data);
        if (res.data.length > 0) setSelectedZone(res.data[0]);
      }
    }
    loadZones();

    // Check for saved coupon from Cart
    try {
      const savedCoupon = localStorage.getItem("qorvan_applied_coupon");
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);

    try {
      const res = await validateCoupon(couponInput.trim(), subtotal);
      if (res.success && res.data) {
        setAppliedCoupon(res.data);
        localStorage.setItem("qorvan_applied_coupon", JSON.stringify(res.data));
        toast.success(`Coupon ${res.data.code} applied!`);
        setCouponInput("");
      } else {
        toast.error(res.error || "Invalid coupon");
      }
    } catch (err: any) {
      toast.error(err.message || "Error validating coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem("qorvan_applied_coupon");
    toast.success("Coupon removed");
  };

  const deliveryCharge = selectedZone
    ? selectedZone.freeDeliveryThreshold && subtotal >= selectedZone.freeDeliveryThreshold
      ? 0
      : selectedZone.baseCharge
    : 80;

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount || 0 : 0;
  const totalPayable = Math.max(0, subtotal + deliveryCharge - discountAmount);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const orderPayload = {
        guestInfo: { name: fullName, email, phone },
        items: cart.map((item) => ({
          product: item.product,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          sku: item.sku,
          size: item.size,
          color: item.color,
        })),
        shippingAddress: {
          fullName,
          phone,
          email,
          addressLine,
          city,
          district,
          deliveryZoneId: selectedZone?._id,
          zoneName: selectedZone?.name || "Dhaka City",
        },
        deliveryCharge,
        discountAmount,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        subtotal,
        totalAmount: totalPayable,
        notes,
      };

      const res = await createOrder(orderPayload);

      if (res.success && res.data) {
        toast.success("Order Placed Successfully!");
        localStorage.removeItem("qorvan_applied_coupon");
        clearCart();
        router.push(`/order/${res.data._id}`);
      } else {
        toast.error(res.error || "Failed to place order");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred placing order");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-zinc-400 mx-auto opacity-40" />
        <h1 className="text-2xl font-bold font-serif text-gray-900">Your Cart is Empty</h1>
        <p className="text-xs text-gray-500">Add items to your bag before checking out.</p>
        <Link
          href="/shop"
          className="inline-block py-3 px-6 bg-black text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full p-3 text-xs border border-zinc-300 rounded-xl bg-white text-gray-900 placeholder-zinc-400 focus:outline-none focus:border-black transition";
  const labelClass = "font-bold text-gray-700 block mb-1 text-xs";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Page Header */}
      <div className="border-b border-zinc-200 pb-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-gray-900">
          Checkout
          <span className="ml-2 text-base font-medium text-zinc-400">
            ({totalItems} item{totalItems !== 1 ? "s" : ""})
          </span>
        </h1>
        <Link
          href="/cart"
          className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black underline-offset-2 hover:underline transition"
        >
          ← Back to Bag
        </Link>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ── Left: Shipping Form ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section 1: Contact & Shipping */}
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.15em] text-gray-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">1</span>
              Shipping &amp; Contact
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tariqul Islam"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01700000000"
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>District / City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setDistrict(e.target.value);
                  }}
                  placeholder="Dhaka"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Full Delivery Address *</label>
              <textarea
                required
                rows={2}
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="House #, Road #, Area details..."
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Order Notes (optional)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions for delivery..."
                className={inputClass}
              />
            </div>
          </div>

          {/* Section 2: Delivery Zone */}
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.15em] text-gray-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">2</span>
              Select Delivery Zone
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {deliveryZones.map((zone) => {
                const isSelected = selectedZone?._id === zone._id;
                const isFree =
                  zone.freeDeliveryThreshold && subtotal >= zone.freeDeliveryThreshold;

                return (
                  <div
                    key={zone._id}
                    onClick={() => setSelectedZone(zone)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-black text-white border-black shadow-md"
                        : "bg-white text-gray-700 border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? "border-white bg-white" : "border-zinc-300"
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 text-black" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate">{zone.name}</div>
                        <div className={`text-[10px] mt-0.5 ${isSelected ? "text-zinc-300" : "text-zinc-400"}`}>
                          {zone.estimatedDays}
                        </div>
                      </div>
                    </div>
                    <div className={`font-black text-sm flex-shrink-0 ${isFree ? "text-emerald-400" : ""}`}>
                      {isFree ? "FREE" : `৳${zone.baseCharge}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Review Items */}
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.15em] text-gray-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">3</span>
              Review Your Items
            </h2>
            <div className="divide-y divide-zinc-100">
              {cart.map((item) => (
                <div key={item.id} className="py-3 flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-14 h-16 object-cover rounded-xl border border-zinc-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">SKU: {item.sku}</div>
                    {item.size && <div className="text-[10px] text-zinc-500">Size: {item.size}</div>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-black text-gray-900">৳{(item.price * item.quantity).toLocaleString()}</div>
                    <div className="text-[10px] text-zinc-400">Qty: {item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Order Summary ── */}
        <div className="bg-black text-white rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden sticky top-28">
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
                <span className="text-zinc-400">
                  Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})
                </span>
                <span className="font-bold text-white">৳{subtotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" /> Delivery
                </span>
                <span className={`font-bold text-sm ${deliveryCharge === 0 ? "text-emerald-400" : "text-white"}`}>
                  {deliveryCharge === 0 ? "FREE" : `৳${deliveryCharge}`}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                    <Ticket className="w-3.5 h-3.5" /> {appliedCoupon.code}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400">-৳{discountAmount.toLocaleString()}</span>
                    <button type="button" onClick={handleRemoveCoupon} className="text-zinc-400 hover:text-rose-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="border-t border-zinc-800 pt-4 flex items-center justify-between">
              <span className="text-base font-extrabold text-white uppercase tracking-wider">Total</span>
              <span className="text-2xl font-black text-white">৳{totalPayable.toLocaleString()}</span>
            </div>

            {/* Coupon Code Input */}
            {!appliedCoupon && (
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Have a Coupon Code?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    className="flex-1 px-3 py-2.5 text-xs bg-zinc-900 border border-zinc-700 focus:border-white text-white placeholder-zinc-600 rounded-lg uppercase font-mono outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="px-4 py-2.5 bg-white text-black font-extrabold text-xs uppercase tracking-wider rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              </div>
            )}

            {/* COD Badge */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 space-y-1">
              <div className="flex items-center gap-2 text-white font-extrabold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-zinc-400" />
                Cash on Delivery
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Pay in cash to the delivery rider upon receiving your parcel.
              </p>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-4 bg-white hover:bg-zinc-100 text-black font-extrabold text-xs uppercase tracking-[0.2em] rounded-xl transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Placing Order...
                </>
              ) : (
                "Confirm & Place Order"
              )}
            </button>

            <p className="text-center text-[10px] text-zinc-600 uppercase tracking-wider">
              Secure · COD · Free Returns
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
