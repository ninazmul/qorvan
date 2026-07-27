"use client";

import { useState } from "react";
import { Star, Send, ChevronLeft, ChevronRight, Quote, MessageSquare } from "lucide-react";
import { createReview } from "@/lib/actions/review.actions";
import { toast } from "react-hot-toast";

interface ReviewFormProps {
  reviews: any[];
  products: any[];
}

export default function TestimonialsSection({ reviews, products }: ReviewFormProps) {
  // Review form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [productId, setProductId] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Carousel state for reviews
  const [page, setPage] = useState(0);
  const perPage = 3;
  const totalPages = Math.ceil(reviews.length / perPage);
  const visibleReviews = reviews.slice(page * perPage, page * perPage + perPage);

  // Static fallback testimonials when no approved reviews exist
  const fallbackTestimonials = [
    {
      _id: "fb-1",
      authorName: "Tariqul Islam",
      rating: 5,
      comment: "The silk tie set and briefcase leather quality surpassed my highest expectations. Arrived in Dhaka within 24 hours via Cash on Delivery.",
      product: { title: "Royal Italian Silk Tie Set" },
      createdAt: new Date().toISOString(),
    },
    {
      _id: "fb-2",
      authorName: "Rahim Chowdhury",
      rating: 5,
      comment: "QORVAN's leather wallet and belt craftsmanship match luxury European fashion houses. Impeccable attention to detail.",
      product: { title: "Full-Grain Leather Wallet" },
      createdAt: new Date().toISOString(),
    },
    {
      _id: "fb-3",
      authorName: "Nusrat Jahan",
      rating: 5,
      comment: "The royal abaya material and velvet finish are breathtaking. Fast delivery and extremely courteous concierge service.",
      product: { title: "Embellished Velvet Royal Abaya" },
      createdAt: new Date().toISOString(),
    },
  ];

  const displayReviews = reviews.length > 0 ? visibleReviews : fallbackTestimonials;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      toast.error("Please select a product");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createReview({
        product: productId,
        authorName: name,
        authorEmail: email,
        rating,
        comment,
      });
      if (res.success) {
        toast.success("Thank you! Your review has been submitted for approval.");
        setName("");
        setEmail("");
        setProductId("");
        setRating(5);
        setComment("");
        setShowForm(false);
      } else {
        toast.error(res.error || "Failed to submit review");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Section Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-zinc-500">
          Client Reflections
        </span>
        <h2 className="text-3xl font-bold font-serif text-black">
          Endorsed by Executives
        </h2>
        <p className="text-xs text-zinc-500">
          Hear from our valued customers about their QORVAN experience
        </p>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayReviews.map((r: any) => (
          <div
            key={r._id}
            className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4 hover:border-black transition group"
          >
            {/* Quote icon */}
            <Quote className="w-6 h-6 text-zinc-200 group-hover:text-black transition" />

            {/* Stars */}
            <div className="flex text-black gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < r.rating ? "fill-black text-black" : "fill-zinc-200 text-zinc-200"
                  }`}
                />
              ))}
            </div>

            {/* Comment */}
            <p className="text-xs text-zinc-700 italic leading-relaxed line-clamp-4">
              &ldquo;{r.comment}&rdquo;
            </p>

            {/* Author */}
            <div className="border-t border-zinc-200 pt-3">
              <h4 className="text-xs font-extrabold text-black">{r.authorName}</h4>
              {r.product?.title && (
                <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                  Reviewed: {r.product.title}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination (only when real reviews exceed one page) */}
      {reviews.length > perPage && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="p-2 rounded-lg border border-zinc-200 hover:border-black transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-zinc-600">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page === totalPages - 1}
            className="p-2 rounded-lg border border-zinc-200 hover:border-black transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Write Review CTA + Form */}
      <div className="text-center">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition shadow-lg"
          >
            <MessageSquare className="w-4 h-4" /> Share Your Experience
          </button>
        ) : (
          <div className="max-w-2xl mx-auto bg-zinc-50 rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-sm text-left space-y-5">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-900">Write a Review</h3>
              <p className="text-[10px] text-gray-500">
                Your review will be visible after approval by our team.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-4 py-2.5 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-black transition bg-white"
                />
                <input
                  type="email"
                  required
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-2.5 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-black transition bg-white"
                />
              </div>

              {/* Product Select */}
              <select
                required
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-4 py-2.5 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-black transition bg-white text-gray-700 appearance-none"
              >
                <option value="">Select a Product You Purchased</option>
                {products.map((p: any) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>

              {/* Star Rating */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Your Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(s)}
                      className="p-0.5 transition"
                    >
                      <Star
                        className={`w-6 h-6 transition ${
                          s <= (hoverRating || rating)
                            ? "fill-amber-500 text-amber-500"
                            : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-gray-600 self-center">
                    {hoverRating || rating}/5
                  </span>
                </div>
              </div>

              {/* Comment */}
              <textarea
                required
                rows={4}
                placeholder="Share your experience with this product..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-black transition bg-white resize-none"
              />

              {/* Submit + Cancel */}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-zinc-800 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:border-black hover:text-black transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
