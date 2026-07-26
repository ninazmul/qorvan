"use client";

import { useState } from "react";
import { Search, ShoppingBag, Truck, CheckCircle2, Clock, MapPin, User, Package } from "lucide-react";
import { getCustomerOrders, getOrderByNumber } from "@/lib/actions/order.actions";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function AccountClient() {
  const [searchInput, setSearchInput] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearchOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setLoading(true);
    setHasSearched(true);

    try {
      if (searchInput.trim().toUpperCase().startsWith("QRV-")) {
        const res = await getOrderByNumber(searchInput.trim().toUpperCase());
        if (res.success && res.data) {
          setOrders([res.data]);
        } else {
          setOrders([]);
          toast.error("Order not found with this reference number.");
        }
      } else {
        const res = await getCustomerOrders(searchInput.trim());
        if (res.success && res.data) {
          setOrders(res.data);
        } else {
          setOrders([]);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to search order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-amber-900/10 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-gray-900">
          Order Tracking & Customer Portal
        </h1>
        <p className="text-xs text-gray-500">Track real-time delivery status of your QORVAN purchases</p>
      </div>

      {/* Track Order Search Card */}
      <div className="bg-amber-950 text-amber-50 p-6 sm:p-8 rounded-3xl border border-amber-900/50 shadow-xl space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-amber-300">
          Look Up Your Order
        </h2>
        <form onSubmit={handleSearchOrder} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter Order # (e.g. QRV-948271) or Phone / Email..."
            className="flex-1 px-4 py-3 text-xs bg-amber-900/40 border border-amber-800 text-white rounded-xl focus:outline-none focus:border-amber-400 font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-extrabold text-xs uppercase tracking-widest rounded-xl transition shadow"
          >
            {loading ? "Searching..." : "Track Parcel"}
          </button>
        </form>
      </div>

      {/* Order Results */}
      {hasSearched && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-300 text-center space-y-2">
              <Package className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-700">No matching orders found.</p>
              <p className="text-xs text-gray-400">Please double check your order number or contact customer care.</p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord._id}
                className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
                  <div>
                    <h3 className="text-lg font-black text-amber-950 flex items-center gap-2">
                      Order #{ord.orderNumber}
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                        {ord.orderStatus}
                      </span>
                    </h3>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Placed on {new Date(ord.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Total Amount (COD):</span>
                    <span className="text-lg font-black text-gray-900">৳{ord.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-3 bg-amber-950/5 p-4 rounded-2xl border border-amber-900/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-amber-800" /> Tracking Progress
                  </h4>
                  <div className="space-y-2">
                    {ord.trackingHistory?.map((th: any, idx: number) => (
                      <div key={idx} className="flex gap-2 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-gray-900 uppercase">{th.status}: </span>
                          <span className="text-gray-700">{th.note}</span>
                          <span className="text-[10px] text-gray-400 block font-mono">
                            {new Date(th.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-100">
                  {ord.items?.map((item: any, i: number) => (
                    <div key={i} className="py-3 flex items-center gap-3">
                      <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover border" />
                      <div className="flex-1 text-xs">
                        <div className="font-bold text-gray-900">{item.title}</div>
                        <div className="text-gray-400 font-mono">Qty: {item.quantity} x ৳{item.price?.toLocaleString()}</div>
                      </div>
                      <div className="text-xs font-bold text-gray-900">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
