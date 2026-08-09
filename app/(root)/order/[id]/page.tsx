import { getOrderById } from "@/lib/actions/order.actions";
import Link from "next/link";
import { CheckCircle, Truck, Package, MapPin, ShoppingBag, Ticket } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerOrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getOrderById(id);

  if (!res.success || !res.data) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-4">
        <Package className="w-16 h-16 text-zinc-300 mx-auto" />
        <h1 className="text-2xl font-bold font-serif text-gray-900">Order Confirmation Not Found</h1>
        <p className="text-xs text-gray-500">We couldn't find an order matching this reference.</p>
        <Link
          href="/shop"
          className="inline-block py-3 px-6 bg-black text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const order = res.data;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-zinc-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center mx-auto shadow-md">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-zinc-400">
            Order Placed Successfully
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-gray-900">
            Thank You For Choosing QORVAN
          </h1>
          <p className="text-xs font-mono font-bold text-gray-600 bg-zinc-100 inline-block px-3 py-1 rounded-full border border-zinc-200">
            Order Ref: #{order.orderNumber}
          </p>
        </div>

        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          We have received your order and are preparing it for delivery. A confirmation has been sent for processing.
        </p>

        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <Link
            href="/account"
            className="px-6 py-3 bg-black text-white font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition shadow flex items-center gap-2"
          >
            <Truck className="w-4 h-4" /> Track Order Status
          </Link>
          <Link
            href="/shop"
            className="px-6 py-3 border border-zinc-300 text-gray-900 font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-100 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Main Order Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Purchased Items & Shipping Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Purchased Items List */}
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.15em] text-gray-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-zinc-500" />
              Order Items ({order.items?.length || 0})
            </h2>
            <div className="divide-y divide-zinc-100">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="py-4 flex gap-4 items-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-20 object-cover rounded-xl border border-zinc-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-xs font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                    {item.sku && <div className="text-[10px] text-zinc-400 font-mono">SKU: {item.sku}</div>}
                    {item.size && <div className="text-[10px] text-zinc-600 font-medium">Size: {item.size}</div>}
                    {item.color && <div className="text-[10px] text-zinc-600 font-medium">Color: {item.color}</div>}
                    <div className="text-xs font-mono text-zinc-500">
                      Qty: {item.quantity} x ৳{item.price?.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-black text-gray-900">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.15em] text-gray-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-zinc-500" />
              Shipping Destination
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-zinc-400 font-medium block">Recipient Name</span>
                <span className="font-bold text-gray-900">{order.shippingAddress?.fullName || order.guestInfo?.name}</span>
              </div>
              <div>
                <span className="text-zinc-400 font-medium block">Phone Contact</span>
                <span className="font-bold text-gray-900 font-mono">{order.shippingAddress?.phone || order.guestInfo?.phone}</span>
              </div>
              <div>
                <span className="text-zinc-400 font-medium block">Email Address</span>
                <span className="font-bold text-gray-900">{order.shippingAddress?.email || order.guestInfo?.email}</span>
              </div>
              <div>
                <span className="text-zinc-400 font-medium block">Delivery Zone</span>
                <span className="font-bold text-gray-900">{order.shippingAddress?.zoneName || "Standard Delivery"}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-zinc-400 font-medium block">Full Address</span>
                <span className="font-bold text-gray-900">{order.shippingAddress?.addressLine}, {order.shippingAddress?.city}</span>
              </div>
              {order.notes && (
                <div className="sm:col-span-2 bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-zinc-600 italic">
                  Note: {order.notes}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Black Order Summary Card */}
        <div className="bg-black text-white rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-800">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-zinc-400" />
              Payment Summary
            </h2>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Items Subtotal:</span>
                <span className="font-bold text-white">৳{order.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Delivery Fee:</span>
                <span className="font-bold text-white">
                  {order.deliveryCharge === 0 ? "FREE" : `৳${order.deliveryCharge}`}
                </span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Ticket className="w-3.5 h-3.5" /> Discount ({order.couponCode || "Promo"}):
                  </span>
                  <span>-৳{order.discountAmount.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="border-t border-zinc-800 pt-4 flex items-center justify-between">
              <span className="text-base font-extrabold text-white uppercase tracking-wider">Total Amount</span>
              <span className="text-2xl font-black text-white">৳{order.totalAmount?.toLocaleString()}</span>
            </div>

            <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-center space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Payment Status</p>
              <p className="text-sm font-extrabold text-white">Cash on Delivery (COD)</p>
              <p className="text-[10px] text-zinc-500">Pay ৳{order.totalAmount?.toLocaleString()} upon delivery</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Order Status</p>
              <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-white text-black font-extrabold text-xs uppercase tracking-wider">
                {order.orderStatus || "Pending"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
