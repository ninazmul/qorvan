"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Eye, Trash2, AlertTriangle, X } from "lucide-react";
import { updateOrderStatus, deleteOrder } from "@/lib/actions/order.actions";
import { toast } from "react-hot-toast";

export default function OrdersClient({
  initialOrders,
  isSuperAdmin = false,
}: {
  initialOrders: any[];
  isSuperAdmin?: boolean;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Status Change Modal State
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    orderId: string;
    orderNumber: string;
    newStatus: string;
    note: string;
  }>({ open: false, orderId: "", orderNumber: "", newStatus: "", note: "" });
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    orderId: string;
    orderNumber: string;
  }>({ open: false, orderId: "", orderNumber: "" });
  const [deleting, setDeleting] = useState(false);

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.shippingAddress?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.shippingAddress?.phone?.includes(searchTerm);
    const matchesStatus = selectedStatus === "all" ? true : ord.orderStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const triggerStatusChange = (order: any, newStatus: string) => {
    if (newStatus === order.orderStatus) return;

    let defaultNote = `Order status updated to ${newStatus}`;
    if (newStatus === "cancelled") {
      defaultNote = "Order cancelled due to stock unavailability or customer request.";
    }

    setStatusModal({
      open: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      newStatus,
      note: defaultNote,
    });
  };

  const confirmStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModal.orderId) return;
    setStatusUpdating(true);

    try {
      const res = await updateOrderStatus(
        statusModal.orderId,
        statusModal.newStatus as any,
        statusModal.note
      );

      if (res.success) {
        toast.success(
          `Order #${statusModal.orderNumber} status changed to ${statusModal.newStatus}. Customer email sent!`
        );
        setOrders((prev) =>
          prev.map((o) => (o._id === statusModal.orderId ? res.data : o))
        );
        setStatusModal({ open: false, orderId: "", orderNumber: "", newStatus: "", note: "" });
      } else {
        toast.error(res.error || "Failed to update order status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const triggerDeleteOrder = (order: any) => {
    setDeleteModal({
      open: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  };

  const confirmDeleteOrder = async () => {
    if (!deleteModal.orderId) return;
    setDeleting(true);

    try {
      const res = await deleteOrder(deleteModal.orderId);
      if (res.success) {
        toast.success(`Order #${deleteModal.orderNumber} deleted permanently`);
        setOrders((prev) => prev.filter((o) => o._id !== deleteModal.orderId));
        setDeleteModal({ open: false, orderId: "", orderNumber: "" });
      } else {
        toast.error(res.error || "Failed to delete order");
      }
    } catch (err: any) {
      toast.error(err.message || "Error deleting order");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="border-b border-zinc-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Orders Management</h1>
          <p className="text-xs text-zinc-500">Track &amp; fulfill QORVAN customer orders</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by order #, customer name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-zinc-200 rounded-xl focus:outline-none focus:border-black font-medium transition"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-white focus:outline-none focus:border-black font-bold text-gray-900"
        >
          <option value="all">All Order Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-700 font-bold uppercase border-b border-zinc-200">
              <tr>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Customer &amp; Phone</th>
                <th className="py-3.5 px-4">Delivery Zone</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Order Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    No orders found matching parameters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-zinc-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500">
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
                      <div className="text-[10px] text-zinc-500 font-mono">
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
                      <span className="bg-zinc-100 text-gray-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-zinc-200">
                        {ord.paymentMethod} ({ord.paymentStatus})
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => triggerStatusChange(ord, e.target.value)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border bg-white focus:outline-none cursor-pointer ${
                          ord.orderStatus === "delivered"
                            ? "text-emerald-800 border-emerald-300"
                            : ord.orderStatus === "shipped"
                            ? "text-blue-800 border-blue-300"
                            : ord.orderStatus === "cancelled"
                            ? "text-rose-800 border-rose-300"
                            : "text-gray-900 border-zinc-300"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="returned">Returned</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        href={`/dashboard/orders/${ord._id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-gray-900 hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>

                      {isSuperAdmin && (
                        <button
                          onClick={() => triggerDeleteOrder(ord)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 transition"
                          title="Delete Order (Super Admin)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Note Modal */}
      {statusModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-900">
                Update Order #{statusModal.orderNumber} Status
              </h3>
              <button
                onClick={() =>
                  setStatusModal({ open: false, orderId: "", orderNumber: "", newStatus: "", note: "" })
                }
                className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={confirmStatusChange} className="space-y-4">
              <div>
                <span className="text-xs font-bold text-zinc-500 block mb-1">
                  New Order Status:
                </span>
                <span className="inline-block px-3 py-1 bg-black text-white text-xs font-extrabold uppercase rounded-full tracking-wider">
                  {statusModal.newStatus}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-900 block mb-1">
                  Note / Reason for Customer Email *
                </label>
                <textarea
                  required
                  rows={3}
                  value={statusModal.note}
                  onChange={(e) =>
                    setStatusModal({ ...statusModal, note: e.target.value })
                  }
                  placeholder="Enter reason or note to be sent in the notification email..."
                  className="w-full p-3 text-xs bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:border-black text-gray-900 font-medium"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  This note will be logged in tracking history and included in the customer email.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() =>
                    setStatusModal({ open: false, orderId: "", orderNumber: "", newStatus: "", note: "" })
                  }
                  className="px-4 py-2 text-xs font-bold border border-zinc-300 rounded-xl text-gray-700 hover:bg-zinc-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusUpdating}
                  className="px-5 py-2 text-xs font-bold bg-black text-white rounded-xl hover:bg-zinc-800 transition shadow disabled:opacity-50"
                >
                  {statusUpdating ? "Saving..." : "Update Status & Send Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Super Admin Delete Order Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-zinc-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-gray-900">
                Delete Order #{deleteModal.orderNumber}?
              </h3>
              <p className="text-xs text-zinc-500">
                This action is restricted to Super Admins and cannot be undone. Are you sure you want to permanently delete this order record?
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModal({ open: false, orderId: "", orderNumber: "" })}
                className="px-4 py-2 text-xs font-bold border border-zinc-300 rounded-xl text-gray-700 hover:bg-zinc-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteOrder}
                disabled={deleting}
                className="px-5 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition shadow disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
