"use client";

import { useState } from "react";
import { Search, ShoppingBag, Truck, CheckCircle2, Package } from "lucide-react";
import { getCustomerOrders, getOrderByNumber } from "@/lib/actions/order.actions";
import { toast } from "react-hot-toast";

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
      {/* Header */}
      <div className="border-b border-zinc-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-gray-900">
          Order Tracking &amp; Account Portal
        </h1>
        <p className="text-xs text-zinc-500">Track real-time delivery status of your QORVAN purchases</p>
      </div>

      {/* Track Order Search Card */}
      <div className="bg-white text-black p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
        <h2 className="text-xs font-extrabold uppercase tracking-[0.2em] text-gray-900 flex items-center gap-2">
          <Search className="w-4 h-4 text-zinc-500" /> Look Up Your Order
        </h2>
        <form onSubmit={handleSearchOrder} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter Order # (e.g. QRV-948271) or Phone / Email..."
            className="flex-1 px-4 py-3 text-xs bg-zinc-50 border border-zinc-300 text-gray-900 rounded-xl focus:outline-none focus:border-black font-mono transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-black hover:bg-zinc-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition shadow-md disabled:opacity-50"
          >
            {loading ? "Searching..." : "Track Parcel"}
          </button>
        </form>
      </div>

      {/* Order Results */}
      {hasSearched && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-zinc-300 text-center space-y-2">
              <Package className="w-12 h-12 text-zinc-300 mx-auto" />
              <p className="text-sm font-bold text-gray-900">No matching orders found.</p>
              <p className="text-xs text-zinc-400">Please double check your order number or phone/email address.</p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord._id}
                className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-4 gap-2">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      Order #{ord.orderNumber}
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-black text-white uppercase tracking-wider">
                        {ord.orderStatus}
                      </span>
                    </h3>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Placed on {new Date(ord.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-zinc-500 block">Total Amount (COD):</span>
                    <span className="text-lg font-black text-gray-900">৳{ord.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-3 bg-zinc-50 p-5 rounded-2xl border border-zinc-200">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-zinc-700" /> Tracking Progress
                  </h4>
                  <div className="space-y-2">
                    {ord.trackingHistory?.map((th: any, idx: number) => (
                      <div key={idx} className="flex gap-2 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-gray-900 uppercase">{th.status}: </span>
                          <span className="text-gray-700">{th.note}</span>
                          <span className="text-[10px] text-zinc-400 block font-mono">
                            {new Date(th.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-zinc-100">
                  {ord.items?.map((item: any, i: number) => (
                    <div key={i} className="py-3 flex items-center gap-3">
                      <img src={item.image} alt={item.title} className="w-12 h-14 rounded-lg object-cover border border-zinc-200" />
                      <div className="flex-1 text-xs">
                        <div className="font-bold text-gray-900">{item.title}</div>
                        <div className="text-zinc-400 font-mono">Qty: {item.quantity} x ৳{item.price?.toLocaleString()}</div>
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
