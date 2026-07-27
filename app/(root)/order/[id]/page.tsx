import { getOrderById } from "@/lib/actions/order.actions";
import Link from "next/link";
import { CheckCircle, Truck, Package, FileText, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerOrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await getOrderById(id);

  if (!res.success || !res.data) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h1 className="text-xl font-bold font-serif text-amber-950">Order Confirmation Not Found</h1>
        <Link href="/shop" className="text-xs font-bold text-gray-900 underline">
          Return to Storefront
        </Link>
      </div>
    );
  }

  const order = res.data;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-900">
            Order Placed Successfully
          </span>
          <h1 className="text-3xl font-extrabold font-serif text-gray-900">
            Thank You For Choice QORVAN
          </h1>
          <p className="text-xs text-gray-500 font-mono">Order Reference Number: #{order.orderNumber}</p>
        </div>

        <div className="bg-black text-amber-50 p-6 rounded-2xl border border-amber-900/50 max-w-lg mx-auto text-xs space-y-3 text-left">
          <div className="flex justify-between border-b border-amber-900 pb-2">
            <span className="text-amber-300">Recipient Name:</span>
            <span className="font-bold text-amber-100">{order.shippingAddress?.fullName}</span>
          </div>
          <div className="flex justify-between border-b border-amber-900 pb-2">
            <span className="text-amber-300">Phone Contact:</span>
            <span className="font-bold text-amber-100 font-mono">{order.shippingAddress?.phone}</span>
          </div>
          <div className="flex justify-between border-b border-amber-900 pb-2">
            <span className="text-amber-300">Payment Method:</span>
            <span className="font-bold text-white">Cash on Delivery (COD)</span>
          </div>
          <div className="flex justify-between text-sm font-extrabold pt-1">
            <span className="text-amber-200">Total Payable:</span>
            <span className="text-white">৳{order.totalAmount?.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Link
            href="/account"
            className="px-6 py-3 bg-black text-amber-300 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-black transition shadow"
          >
            Track Order Status
          </Link>
          <Link
            href="/shop"
            className="px-6 py-3 border border-gray-300 text-gray-800 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gray-50 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
