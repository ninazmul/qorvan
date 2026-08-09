"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Truck,
  CheckCircle2,
  User,
  Phone,
  Mail,
  MapPin,
  Ticket,
  Trash2,
  AlertTriangle,
  Send,
} from "lucide-react";
import { updateOrderStatus, deleteOrder } from "@/lib/actions/order.actions";
import { toast } from "react-hot-toast";

export default function DashboardOrderDetailClient({
  initialOrder,
  isSuperAdmin = false,
}: {
  initialOrder: any;
  isSuperAdmin?: boolean;
}) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [selectedStatus, setSelectedStatus] = useState(initialOrder.orderStatus || "pending");
  const [statusNote, setStatusNote] = useState("");
  const [updating, setUpdating] = useState(false);

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const defaultNote =
        statusNote.trim() || `Order status updated to ${selectedStatus}`;
      const res = await updateOrderStatus(order._id, selectedStatus, defaultNote);

      if (res.success && res.data) {
        setOrder(res.data);
        setStatusNote("");
        toast.success(`Order status updated to ${selectedStatus} & customer notified!`);
      } else {
        toast.error(res.error || "Failed to update order status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = async () => {
    setDeleting(true);
    try {
      const res = await deleteOrder(order._id);
      if (res.success) {
        toast.success(`Order #${order.orderNumber} deleted permanently`);
        router.push("/dashboard/orders");
      } else {
        toast.error(res.error || "Failed to delete order");
      }
    } catch (err: any) {
      toast.error(err.message || "Error deleting order");
    } finally {
      setDeleting(false);
    }
  };

  const handlePrintInvoice = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="p-2 border border-zinc-200 rounded-xl hover:bg-zinc-100 transition text-gray-700 print:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
              Order #{order.orderNumber}
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-black text-white uppercase tracking-wider">
                {order.orderStatus}
              </span>
            </h1>
            <p className="text-xs text-zinc-500">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handlePrintInvoice}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-zinc-300 bg-white text-gray-800 hover:bg-zinc-100 shadow-sm"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
              title="Delete Order (Super Admin Only)"
            >
              <Trash2 className="w-4 h-4" /> Delete Order
            </button>
          )}
        </div>
      </div>

      {/* Admin Quick Action Panel: Status Update with Note */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4 print:hidden">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
          <Send className="w-4 h-4 text-zinc-500" /> Update Order Status &amp; Notify Customer
        </h2>

        <form onSubmit={handleStatusChange} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Select New Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-3 font-bold border border-zinc-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-black"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="font-bold text-gray-700 block mb-1">
              Custom Note / Reason (included in customer notification email)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder={
                  selectedStatus === "cancelled"
                    ? "e.g. Order cancelled due to stock unavailability or customer request"
                    : "e.g. Parcel handed over to courier. Tracking code: #12345"
                }
                className="flex-1 p-3 border border-zinc-300 rounded-xl bg-zinc-50 text-gray-900 focus:outline-none focus:border-black"
              />
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-3 bg-black hover:bg-zinc-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow flex-shrink-0 disabled:opacity-50"
              >
                {updating ? "Saving..." : "Update Status"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer & Address Details */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-zinc-100 pb-2 flex items-center gap-1.5">
            <User className="w-4 h-4 text-zinc-500" /> Customer &amp; Shipping
          </h2>
          <div className="text-xs space-y-2 text-gray-700">
            <div>
              <span className="font-bold text-gray-900 block text-sm">
                {order.shippingAddress?.fullName || order.guestInfo?.name}
              </span>
              <div className="flex items-center gap-1.5 text-zinc-500 mt-1 font-mono">
                <Phone className="w-3.5 h-3.5" />
                {order.shippingAddress?.phone || order.guestInfo?.phone}
              </div>
              <div className="flex items-center gap-1.5 text-zinc-500 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {order.shippingAddress?.email || order.guestInfo?.email}
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-2 mt-2 space-y-1">
              <span className="font-bold text-gray-900 block">Delivery Address:</span>
              <p className="text-zinc-600 leading-relaxed">
                {order.shippingAddress?.addressLine}, {order.shippingAddress?.city},{" "}
                {order.shippingAddress?.district}
              </p>
              <div className="mt-1.5 inline-block text-[10px] font-bold bg-zinc-100 text-gray-900 px-2.5 py-0.5 rounded-full border border-zinc-200">
                Zone: {order.shippingAddress?.zoneName || "Standard Delivery"}
              </div>
            </div>

            {order.notes && (
              <div className="border-t border-zinc-100 pt-2 mt-2">
                <span className="font-bold text-gray-900 block">Customer Notes:</span>
                <p className="text-zinc-600 bg-zinc-50 p-2 rounded-lg border border-zinc-200 italic mt-0.5">
                  "{order.notes}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment & Order Summary */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-zinc-100 pb-2">
            Payment &amp; Order Summary
          </h2>
          <div className="text-xs space-y-2.5">
            <div className="flex justify-between">
              <span className="text-zinc-500">Payment Method:</span>
              <span className="font-bold text-gray-900">
                {order.paymentMethod || "COD"} (Cash on Delivery)
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-500">Payment Status:</span>
              <span className="font-bold text-emerald-700 uppercase">
                {order.paymentStatus}
              </span>
            </div>

            <div className="border-t border-zinc-100 pt-2 flex justify-between">
              <span className="text-zinc-500">Items Subtotal:</span>
              <span className="font-medium text-gray-900">
                ৳{order.subtotal?.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-500">Delivery Charge:</span>
              <span className="font-medium text-gray-900">
                {order.deliveryCharge === 0 ? "FREE" : `৳${order.deliveryCharge?.toLocaleString()}`}
              </span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span className="flex items-center gap-1">
                  <Ticket className="w-3.5 h-3.5" /> Discount ({order.couponCode || "Promo"}):
                </span>
                <span>-৳{order.discountAmount?.toLocaleString()}</span>
              </div>
            )}

            <div className="border-t border-zinc-200 pt-2.5 flex justify-between font-black text-sm text-gray-900">
              <span>Total Amount (COD):</span>
              <span>৳{order.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Order Tracking History */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b border-zinc-100 pb-2 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-zinc-500" /> Tracking Timeline
          </h2>
          <div className="space-y-3 max-h-56 overflow-y-auto">
            {order.trackingHistory?.map((ev: any, idx: number) => (
              <div key={idx} className="flex gap-2.5 text-xs border-b border-zinc-50 pb-2 last:border-0">
                <div className="mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 uppercase text-[10px]">
                    {ev.status}
                  </div>
                  <div className="text-zinc-600 text-[11px]">{ev.note}</div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {new Date(ev.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 font-extrabold text-xs uppercase tracking-wider text-gray-900">
          Ordered Items ({order.items?.length || 0})
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 uppercase text-zinc-600 font-bold border-b border-zinc-200">
            <tr>
              <th className="py-3 px-4">Item Details</th>
              <th className="py-3 px-4">SKU</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Qty</th>
              <th className="py-3 px-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {order.items?.map((item: any, idx: number) => (
              <tr key={idx} className="hover:bg-zinc-50 transition">
                <td className="py-3.5 px-4 flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-10 h-12 rounded-lg object-cover border border-zinc-200 flex-shrink-0"
                  />
                  <div>
                    <div className="font-bold text-gray-900">{item.title}</div>
                    {item.size && <div className="text-[10px] text-zinc-500">Size: {item.size}</div>}
                    {item.color && <div className="text-[10px] text-zinc-500">Color: {item.color}</div>}
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{item.sku}</td>
                <td className="py-3.5 px-4 font-medium text-gray-900">৳{item.price?.toLocaleString()}</td>
                <td className="py-3.5 px-4 font-bold text-gray-800">{item.quantity}</td>
                <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                  ৳{(item.price * item.quantity).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Super Admin Delete Order Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-zinc-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-gray-900">
                Delete Order #{order.orderNumber}?
              </h3>
              <p className="text-xs text-zinc-500">
                This action is restricted to Super Admins and cannot be undone. Are you sure you want to permanently delete this order record?
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModal(false)}
                className="px-4 py-2 text-xs font-bold border border-zinc-300 rounded-xl text-gray-700 hover:bg-zinc-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOrder}
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
