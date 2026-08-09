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
  ShieldCheck,
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
    <div className="space-y-6 pb-12 max-w-5xl mx-auto text-gray-900">
      {/* ── Screen Header Bar (Hidden on Print) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="p-2 border border-zinc-200 rounded-xl hover:bg-zinc-100 transition text-gray-700"
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

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintInvoice}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-xl border border-zinc-300 bg-black text-white hover:bg-zinc-800 transition shadow-md"
          >
            <Printer className="w-4 h-4" /> Print Official Invoice
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-extrabold rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
              title="Delete Order (Super Admin Only)"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}
        </div>
      </div>

      {/* ── Admin Status Action Panel (Hidden on Print) ── */}
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

      {/* ── Screen Dashboard View Cards (Hidden on Print) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
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

      {/* Screen Ordered Items Table (Hidden on Print) */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm print:hidden">
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

      {/* ── Official Printable Luxury Invoice Sheet (Designed for A4 Print & Screen Display) ── */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-8 sm:p-12 shadow-xl space-y-8 print:p-0 print:border-none print:shadow-none print:rounded-none">
        
        {/* Invoice Top Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-6 gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-[0.2em] text-black uppercase font-serif">
              QORVAN
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-zinc-500">
              Luxury Menswear &amp; Fine Accessories
            </p>
            <p className="text-[11px] text-zinc-600 leading-tight pt-1">
              Dhaka, Bangladesh · Support: support@qorvan.com<br />
              Official E-Commerce Storefront: www.qorvan.com
            </p>
          </div>

          <div className="text-right space-y-1">
            <span className="inline-block bg-black text-white text-xs font-black px-3 py-1 uppercase tracking-widest rounded-sm mb-1">
              OFFICIAL INVOICE
            </span>
            <div className="text-sm font-mono font-extrabold text-black">
              #{order.orderNumber}
            </div>
            <div className="text-[11px] text-zinc-500">
              Date: {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Invoice Address & Meta Section */}
        <div className="grid grid-cols-2 gap-8 text-xs">
          <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-400 block">
              BILLED &amp; SHIPPED TO:
            </span>
            <div className="font-extrabold text-sm text-black">
              {order.shippingAddress?.fullName || order.guestInfo?.name}
            </div>
            <div className="text-zinc-600 font-mono">
              Phone: {order.shippingAddress?.phone || order.guestInfo?.phone}
            </div>
            <div className="text-zinc-600">
              Email: {order.shippingAddress?.email || order.guestInfo?.email}
            </div>
            <div className="text-zinc-700 leading-snug pt-1">
              {order.shippingAddress?.addressLine}, {order.shippingAddress?.city},{" "}
              {order.shippingAddress?.district}
            </div>
            <div className="text-[10px] font-bold text-zinc-500 pt-0.5">
              Zone: {order.shippingAddress?.zoneName || "Standard Delivery"}
            </div>
          </div>

          <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-400 block">
              PAYMENT &amp; ORDER INFO:
            </span>
            <div className="flex justify-between py-1 border-b border-zinc-200">
              <span className="text-zinc-500">Payment Terms:</span>
              <span className="font-bold text-black">Cash on Delivery (COD)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-200">
              <span className="text-zinc-500">Payment Status:</span>
              <span className="font-extrabold text-black uppercase">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-200">
              <span className="text-zinc-500">Order Status:</span>
              <span className="font-extrabold text-black uppercase">{order.orderStatus}</span>
            </div>
            {order.notes && (
              <div className="pt-1 text-[11px] text-zinc-600 italic">
                Note: {order.notes}
              </div>
            )}
          </div>
        </div>

        {/* Printable Items Table */}
        <div className="border border-black rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-black text-white uppercase text-[10px] font-extrabold tracking-wider border-b border-black">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Item Description</th>
                <th className="py-3 px-4 font-mono">SKU</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-black font-medium">
              {order.items?.map((item: any, idx: number) => (
                <tr key={idx} className="even:bg-zinc-50">
                  <td className="py-3 px-4 font-mono text-zinc-400">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="font-extrabold text-black">{item.title}</div>
                    <div className="text-[10px] text-zinc-500">
                      {item.size ? `Size: ${item.size}` : ""} {item.color ? `· Color: ${item.color}` : ""}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-zinc-700">{item.sku}</td>
                  <td className="py-3 px-4 text-center font-bold">{item.quantity}</td>
                  <td className="py-3 px-4 text-right">৳{item.price?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-black">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Printable Totals & Terms */}
        <div className="grid grid-cols-2 gap-8 items-start pt-2">
          {/* Terms & Conditions */}
          <div className="space-y-3 text-[11px] text-zinc-600">
            <div className="flex items-center gap-1.5 font-bold text-black uppercase tracking-wider text-xs">
              <ShieldCheck className="w-4 h-4 text-black" /> Terms &amp; Conditions
            </div>
            <ul className="space-y-1 list-disc list-inside leading-relaxed text-zinc-500">
              <li>Inspect your package thoroughly upon Cash on Delivery arrival.</li>
              <li>Returns &amp; exchanges accepted within 7 days in original condition.</li>
              <li>For support or queries, contact us at support@qorvan.com.</li>
            </ul>
          </div>

          {/* Totals Summary */}
          <div className="bg-zinc-50 p-5 rounded-2xl border border-black space-y-3 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Items Subtotal:</span>
              <span className="font-bold text-black">৳{order.subtotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Delivery Charge:</span>
              <span className="font-bold text-black">
                {order.deliveryCharge === 0 ? "FREE" : `৳${order.deliveryCharge?.toLocaleString()}`}
              </span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-black font-bold border-t border-zinc-200 pt-2">
                <span>Discount ({order.couponCode || "Promo"}):</span>
                <span>-৳{order.discountAmount?.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t-2 border-black pt-3 flex justify-between text-base font-black text-black">
              <span>TOTAL PAYABLE (COD):</span>
              <span>৳{order.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Signatures & Footer */}
        <div className="pt-8 border-t border-zinc-200 flex justify-between items-end text-xs">
          <div className="text-center space-y-1">
            <div className="w-40 border-b border-black pb-1 text-center font-serif text-zinc-400 italic">
              QORVAN Audit
            </div>
            <p className="text-[10px] uppercase font-bold text-zinc-400">Authorized Signature</p>
          </div>

          <div className="text-right text-[10px] text-zinc-400 uppercase tracking-widest space-y-0.5">
            <p>QORVAN Executive Fashion &amp; Accessories</p>
            <p>Thank You For Your Purchase!</p>
          </div>
        </div>
      </div>

      {/* Super Admin Delete Order Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
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
