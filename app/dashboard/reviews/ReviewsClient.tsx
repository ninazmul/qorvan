"use client";

import { useState } from "react";
import { Star, Check, X, Trash2, Search, MessageSquare, Clock, CheckCircle2, XCircle, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { moderateReview, deleteReview } from "@/lib/actions/review.actions";
import { toast } from "react-hot-toast";

type ReviewStatus = "all" | "pending" | "approved" | "rejected";

export default function ReviewsClient({ initialReviews }: { initialReviews: any[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReviewStatus>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatus = async (id: string, status: "approved" | "rejected") => {
    setLoadingId(id);
    const res = await moderateReview(id, status);
    setLoadingId(null);
    if (res.success) {
      toast.success(`Review ${status}`);
      setReviews((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
    } else {
      toast.error(res.error || "Failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    setLoadingId(id);
    const res = await deleteReview(id);
    setLoadingId(null);
    if (res.success) {
      toast.success("Review deleted");
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } else {
      toast.error(res.error || "Failed to delete");
    }
  };

  const filtered = reviews.filter((r) => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesSearch =
      !search ||
      r.authorName?.toLowerCase().includes(search.toLowerCase()) ||
      r.authorEmail?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase()) ||
      r.product?.title?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Stats
  const pending = reviews.filter((r) => r.status === "pending").length;
  const approved = reviews.filter((r) => r.status === "approved").length;
  const rejected = reviews.filter((r) => r.status === "rejected").length;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-black" /> Product Reviews
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Moderate, approve, and manage customer product feedback
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Reviews</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{reviews.length}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Pending</p>
          <p className="text-2xl font-black text-amber-800 mt-1">{pending}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Approved</p>
          <p className="text-2xl font-black text-emerald-800 mt-1">{approved}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Avg. Rating</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            <p className="text-2xl font-black text-gray-900">{avgRating}</p>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email, product, or comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs outline-none bg-transparent"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as ReviewStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 text-xs font-bold rounded-lg border transition capitalize ${
                statusFilter === s
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-600 border-gray-200 hover:border-black hover:text-black"
              }`}
            >
              {s === "all" ? `All (${reviews.length})` : `${s} (${reviews.filter((r) => r.status === s).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-700">No reviews found</h3>
          <p className="text-xs text-gray-400 mt-1">
            {search ? "Try adjusting your search query." : "Customer reviews will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const isExpanded = expandedId === r._id;
            const isLoading = loadingId === r._id;
            return (
              <div
                key={r._id}
                className={`bg-white rounded-xl border shadow-sm transition ${
                  r.status === "pending"
                    ? "border-amber-200"
                    : r.status === "rejected"
                    ? "border-rose-200"
                    : "border-gray-200"
                }`}
              >
                {/* Summary row */}
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpandedId(isExpanded ? null : r._id)}
                >
                  {/* Product thumb */}
                  {r.product?.featuredImage ? (
                    <img
                      src={r.product.featuredImage}
                      alt={r.product.title || "Product"}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4 text-gray-400" />
                    </div>
                  )}

                  {/* Name + product */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{r.authorName}</p>
                    <p className="text-[10px] text-gray-500 truncate">
                      {r.product?.title || "Unknown Product"} • {r.authorEmail}
                    </p>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < r.rating ? "fill-amber-500 text-amber-500" : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Status */}
                  <div className="shrink-0 hidden sm:block">{statusBadge(r.status)}</div>

                  {/* Date */}
                  <span className="text-[10px] text-gray-400 font-mono shrink-0 hidden md:block">
                    {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>

                  {/* Expand icon */}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                    {/* Mobile status badge */}
                    <div className="sm:hidden">{statusBadge(r.status)}</div>

                    {/* Full comment */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{r.comment}</p>
                    </div>

                    {/* Review images */}
                    {r.images && r.images.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {r.images.map((img: string, i: number) => (
                          <img key={i} src={img} alt="Review image" className="w-20 h-20 rounded-lg object-cover border" />
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      {r.status !== "approved" && (
                        <button
                          onClick={() => handleStatus(r._id, "approved")}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}
                      {r.status !== "rejected" && (
                        <button
                          onClick={() => handleStatus(r._id, "rejected")}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r._id)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-600 text-xs font-bold rounded-lg transition disabled:opacity-50 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
