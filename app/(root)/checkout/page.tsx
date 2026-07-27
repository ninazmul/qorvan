"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { getDeliveryZones } from "@/lib/actions/delivery.actions";
import { createOrder } from "@/lib/actions/order.actions";
import { ShieldCheck, Truck, ArrowRight, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
  }, []);

  const deliveryCharge = selectedZone
    ? selectedZone.freeDeliveryThreshold && subtotal >= selectedZone.freeDeliveryThreshold
      ? 0
      : selectedZone.baseCharge
    : 80;

  const totalPayable = subtotal + deliveryCharge;

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
        subtotal,
        totalAmount: totalPayable,
        notes,
      };

      const res = await createOrder(orderPayload);

      if (res.success && res.data) {
        toast.success("Order Placed Successfully!");
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
      <div className="max-w-4xl mx-auto py-24 text-center">
        <h1 className="text-xl font-bold font-serif text-amber-950">Your Cart is Empty</h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-amber-900/10 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-gray-900">
          Checkout (Cash on Delivery)
        </h1>
        <p className="text-xs text-gray-500">Provide delivery details for instant dispatch</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Shipping Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-950 border-b pb-3">
            1. Shipping & Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Tariqul Islam"
                className="w-full p-3 border rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01700000000"
                className="w-full p-3 border rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full p-3 border rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">District / City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setDistrict(e.target.value);
                }}
                placeholder="Dhaka"
                className="w-full p-3 border rounded-xl"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="font-bold text-gray-700 block mb-1">Full Delivery Address *</label>
            <textarea
              required
              rows={2}
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="House #, Road #, Area details..."
              className="w-full p-3 border rounded-xl"
            />
          </div>

          {/* Delivery Zone Selector */}
          <div className="space-y-3 pt-4 border-t">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-950">
              2. Select Delivery Zone Rate
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {deliveryZones.map((zone) => {
                const isSelected = selectedZone?._id === zone._id;
                const isFree = zone.freeDeliveryThreshold && subtotal >= zone.freeDeliveryThreshold;

                return (
                  <div
                    key={zone._id}
                    onClick={() => setSelectedZone(zone)}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? "bg-black text-amber-300 border-amber-950 shadow-md"
                        : "bg-white text-gray-700 border-gray-200 hover:border-amber-700"
                    }`}
                  >
                    <div>
                      <div className="font-bold">{zone.name}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">{zone.estimatedDays}</div>
                    </div>
                    <div className="font-black text-sm">
                      {isFree ? "FREE" : `৳${zone.baseCharge}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary & Payment Button */}
        <div className="bg-black text-amber-50 p-6 sm:p-8 rounded-3xl border border-amber-900/50 shadow-xl space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-300 border-b border-amber-900 pb-3">
            3. Payment & Order Summary
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-amber-300">Bag Subtotal:</span>
              <span className="font-bold text-amber-100">৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-300">Delivery Charge:</span>
              <span className="font-bold text-amber-100">
                {deliveryCharge === 0 ? "FREE" : `৳${deliveryCharge}`}
              </span>
            </div>
            <div className="border-t border-amber-900/60 pt-3 flex justify-between text-base font-extrabold">
              <span className="text-amber-200">Total Payable (COD):</span>
              <span className="text-white">৳{totalPayable.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-black/40 p-4 rounded-2xl border border-amber-800/40 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold uppercase">
              <ShieldCheck className="w-4 h-4 text-white" /> Cash on Delivery (COD)
            </div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              Pay in cash to the delivery rider upon examining your parcel.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-extrabold text-xs uppercase tracking-widest rounded-xl transition shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? "Placing Order..." : "Confirm & Place Order (COD)"}
          </button>
        </div>
      </form>
    </div>
  );
}
