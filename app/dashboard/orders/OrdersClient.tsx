"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Eye, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import { updateOrderStatus } from "@/lib/actions/order.actions";
import { toast } from "react-hot-toast";

export default function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.shippingAddress?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.shippingAddress?.phone?.includes(searchTerm);
    const matchesStatus = selectedStatus === "all" ? true : ord.orderStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: any) => {
    try {
      const res = await updateOrderStatus(orderId, newStatus, `Status updated to ${newStatus} by Admin`);
      if (res.success) {
        toast.success(`Order status updated to ${newStatus}`);
        setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data : o)));
      } else {
        toast.error(res.error || "Failed to update order status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-xs text-gray-500">Track & fulfill QORVAN customer orders</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order #, customer name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-black"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:border-black"
        >
          <option value="all">All Order Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-700 font-bold uppercase border-b">
              <tr>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Customer & Phone</th>
                <th className="py-3.5 px-4">Delivery Zone</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Order Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No orders found matching parameters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-gray-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">
                      {new Date(ord.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">
                        {ord.shippingAddress?.fullName || ord.guestInfo?.name || "Customer"}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {ord.shippingAddress?.phone || ord.guestInfo?.phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-700">
                      {ord.shippingAddress?.zoneName || ord.shippingAddress?.city || "Dhaka"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      ৳{ord.totalAmount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-gray-100 text-gray-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                        {ord.paymentMethod} ({ord.paymentStatus})
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                        className={`text-[10px] font-bold px-2 py-1 rounded border bg-white focus:outline-none ${ord.orderStatus === "delivered"
                            ? "text-emerald-800 border-emerald-300"
                            : ord.orderStatus === "shipped"
                              ? "text-blue-800 border-blue-300"
                              : ord.orderStatus === "cancelled"
                                ? "text-rose-800 border-rose-300"
                                : "text-gray-900 border-gray-300"
                          }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/dashboard/orders/${ord._id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-900 hover:text-black"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Invoice
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
