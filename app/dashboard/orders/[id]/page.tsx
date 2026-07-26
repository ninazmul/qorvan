import { requireDashboardAccess } from "@/lib/auth/rbac";
import { getOrderById } from "@/lib/actions/order.actions";
import Link from "next/link";
import { ArrowLeft, Printer, Truck, CheckCircle2, Clock, MapPin, User, Phone, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireDashboardAccess("/");
  const { id } = await params;
  const res = await getOrderById(id);

  if (!res.success || !res.data) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl font-bold text-rose-600">Order Not Found</h1>
        <Link href="/dashboard/orders" className="text-xs text-amber-800 underline mt-2 block">
          Back to Orders
        </Link>
      </div>
    );
  }

  const order = res.data;

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="p-2 border rounded-lg hover:bg-gray-50 transition text-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
              Order #{order.orderNumber}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                {order.orderStatus}
              </span>
            </h1>
            <p className="text-xs text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (typeof window !== "undefined") window.print();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 shadow-sm print:hidden"
        >
          <Printer className="w-4 h-4" /> Print Luxury Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer & Address Details */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900 border-b pb-2 flex items-center gap-1.5">
            <User className="w-4 h-4" /> Customer & Shipping Info
          </h2>
          <div className="text-xs space-y-2 text-gray-700">
            <div>
              <span className="font-bold text-gray-900 block">{order.shippingAddress?.fullName}</span>
              <div className="flex items-center gap-1 text-gray-500 mt-1">
                <Phone className="w-3 h-3" /> {order.shippingAddress?.phone}
              </div>
              <div className="flex items-center gap-1 text-gray-500 mt-0.5">
                <Mail className="w-3 h-3" /> {order.shippingAddress?.email}
              </div>
            </div>
            <div className="border-t pt-2 mt-2">
              <span className="font-bold text-gray-900 block mb-0.5">Delivery Address:</span>
              <p className="text-gray-600 leading-relaxed">
                {order.shippingAddress?.addressLine}, {order.shippingAddress?.city},{" "}
                {order.shippingAddress?.district}
              </p>
              <div className="mt-1 inline-block text-[10px] font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                Zone: {order.shippingAddress?.zoneName || "Dhaka City"}
              </div>
            </div>
          </div>
        </div>

        {/* Payment & Summary */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900 border-b pb-2">
            Payment & Order Summary
          </h2>
          <div className="text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Method:</span>
              <span className="font-bold text-gray-900">{order.paymentMethod} (COD)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Status:</span>
              <span className="font-bold text-emerald-700 uppercase">{order.paymentStatus}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium text-gray-900">৳{order.subtotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Charge:</span>
              <span className="font-medium text-gray-900">৳{order.deliveryCharge?.toLocaleString()}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount ({order.couponCode || "Promo"}):</span>
                <span>-৳{order.discountAmount?.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-black text-sm text-amber-950">
              <span>Total Payable (COD):</span>
              <span>৳{order.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Order Tracking History */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900 border-b pb-2 flex items-center gap-1.5">
            <Truck className="w-4 h-4" /> Tracking Timeline
          </h2>
          <div className="space-y-3">
            {order.trackingHistory?.map((ev: any, idx: number) => (
              <div key={idx} className="flex gap-2.5 text-xs">
                <div className="mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 uppercase text-[10px]">{ev.status}</div>
                  <div className="text-gray-600 text-[11px]">{ev.note}</div>
                  <div className="text-[10px] text-gray-400">
                    {new Date(ev.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b font-bold text-sm text-gray-900">Ordered Items</div>
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 uppercase text-gray-700 font-bold border-b">
            <tr>
              <th className="py-3 px-4">Item</th>
              <th className="py-3 px-4">SKU</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Qty</th>
              <th className="py-3 px-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items?.map((item: any, idx: number) => (
              <tr key={idx}>
                <td className="py-3 px-4 flex items-center gap-3">
                  <img src={item.image} alt={item.title} className="w-9 h-9 rounded object-cover border" />
                  <div>
                    <div className="font-bold text-gray-900">{item.title}</div>
                    {item.size && <div className="text-[10px] text-gray-400">Size: {item.size}</div>}
                  </div>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-amber-900">{item.sku}</td>
                <td className="py-3 px-4 font-medium text-gray-900">৳{item.price?.toLocaleString()}</td>
                <td className="py-3 px-4 font-bold text-gray-800">{item.quantity}</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">
                  ৳{(item.price * item.quantity).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
