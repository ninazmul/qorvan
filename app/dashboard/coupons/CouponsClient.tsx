"use client";

import { useState } from "react";
import { Ticket, Plus, Trash2, Edit2, CheckCircle } from "lucide-react";
import { createCoupon, updateCoupon, deleteCoupon } from "@/lib/actions/coupon.actions";
import { toast } from "react-hot-toast";

export default function CouponsClient({ initialCoupons }: { initialCoupons: any[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("10");
  const [minOrder, setMinOrder] = useState("2000");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code,
      discountType,
      discountValue: parseFloat(discountValue) || 0,
      minOrderAmount: parseFloat(minOrder) || 0,
      isActive: true,
    };

    const res = await createCoupon(payload);
    if (res.success) {
      toast.success("Coupon created!");
      setCoupons((prev) => [res.data, ...prev]);
      setCode("");
      setDiscountValue("10");
    } else {
      toast.error(res.error || "Failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete coupon?")) return;
    const res = await deleteCoupon(id);
    if (res.success) {
      toast.success("Coupon deleted");
      setCoupons((prev) => prev.filter((c) => c._id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Discount Coupons Management</h1>
        <p className="text-xs text-gray-500">Create & manage promo codes for QORVAN shoppers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">Create Coupon Code</h2>
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-bold block mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. QORVAN10"
                className="w-full p-2 border rounded-md uppercase font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Discount Type *</label>
              <select
                value={discountType}
                onChange={(e: any) => setDiscountType(e.target.value)}
                className="w-full p-2 border rounded-md bg-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (৳ BDT)</option>
              </select>
            </div>
            <div>
              <label className="font-bold block mb-1">Discount Value *</label>
              <input
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="10"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Minimum Spend (৳ BDT)</label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                placeholder="2000"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-black text-white font-bold rounded-md hover:bg-gray-800 transition"
            >
              Generate Coupon
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 uppercase font-bold border-b text-gray-700">
              <tr>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Min Spend</th>
                <th className="py-3.5 px-4">Usage</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900 flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-gray-800" />
                    {c.code}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">
                    {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `৳${c.discountValue} OFF`}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">৳{c.minOrderAmount || 0}</td>
                  <td className="py-3.5 px-4 text-gray-500">{c.usedCount || 0} times</td>
                  <td className="py-3.5 px-4 text-right">
                    <button onClick={() => handleDelete(c._id)} className="text-gray-600 hover:text-rose-600">
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
