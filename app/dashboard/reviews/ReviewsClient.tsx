"use client";

import { useState } from "react";
import { Star, Check, X, Trash2 } from "lucide-react";
import { moderateReview } from "@/lib/actions/review.actions";
import { toast } from "react-hot-toast";

export default function ReviewsClient({ initialReviews }: { initialReviews: any[] }) {
  const [reviews, setReviews] = useState(initialReviews);

  const handleStatus = async (id: string, status: "approved" | "rejected") => {
    const res = await moderateReview(id, status);
    if (res.success) {
      toast.success(`Review ${status}`);
      setReviews((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
    } else {
      toast.error(res.error || "Failed");
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Product Reviews Moderation</h1>
        <p className="text-xs text-gray-500">Approve or reject customer product feedback</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 uppercase font-bold border-b text-gray-700">
            <tr>
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-4">Author</th>
              <th className="py-3.5 px-4">Rating & Comment</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reviews.map((r) => (
              <tr key={r._id} className="hover:bg-gray-50 transition">
                <td className="py-3.5 px-4 font-bold text-gray-900">{r.product?.title || "Product"}</td>
                <td className="py-3.5 px-4">
                  <div className="font-bold text-gray-900">{r.authorName}</div>
                  <div className="text-[10px] text-gray-400 font-mono">{r.authorEmail}</div>
                </td>
                <td className="py-3.5 px-4 max-w-xs">
                  <div className="flex text-amber-500 gap-0.5 mb-1">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic truncate">{r.comment}</p>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      r.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : r.status === "rejected"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  {r.status !== "approved" && (
                    <button
                      onClick={() => handleStatus(r._id, "approved")}
                      className="px-2 py-1 bg-emerald-700 text-white rounded text-[10px] font-bold"
                    >
                      Approve
                    </button>
                  )}
                  {r.status !== "rejected" && (
                    <button
                      onClick={() => handleStatus(r._id, "rejected")}
                      className="px-2 py-1 bg-rose-700 text-white rounded text-[10px] font-bold"
                    >
                      Reject
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
