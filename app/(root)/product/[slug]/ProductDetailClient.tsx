"use client";

import { useState } from "react";
import { ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw, Star, Check } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { createReview } from "@/lib/actions/review.actions";
import ProductCard from "@/components/storefront/ProductCard";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ProductDetailClient({
  product,
  relatedProducts,
  reviews,
}: {
  product: any;
  relatedProducts: any[];
  reviews: any[];
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const allImages = product.images && product.images.length > 0 ? product.images : [product.featuredImage];
  const [activeImage, setActiveImage] = useState(allImages[0] || product.featuredImage);

  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || "");
  const [quantity, setQuantity] = useState(1);

  // Review Form
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      id: `${product._id}-${selectedSize}-${selectedColor}`,
      product: product._id,
      title: product.title,
      price: product.price,
      image: activeImage,
      sku: product.sku,
      quantity,
      size: selectedSize,
      color: selectedColor,
    });
    toast.success("Added to Shopping Bag!");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await createReview({
        product: product._id,
        authorName: reviewName,
        authorEmail: reviewEmail,
        rating: reviewRating,
        comment: reviewComment,
      });

      if (res.success) {
        toast.success("Thank you! Your review has been submitted for moderation.");
        setReviewName("");
        setReviewEmail("");
        setReviewComment("");
      } else {
        toast.error(res.error || "Failed to submit review");
      }
    } catch (err: any) {
      toast.error(err.message || "Error submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Top Product Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden border border-gray-200 shadow-md">
            <img src={activeImage} alt={product.title} className="w-full h-full object-cover" />
          </div>

          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${activeImage === img ? "border-amber-800 shadow" : "border-gray-200 opacity-70"
                    }`}
                >
                  <img src={img} alt="Gallery thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info Details */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-900">
              {product.category?.name || "QORVAN Luxury"}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif text-gray-900 mt-1">
              {product.title}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-700">{product.ratings?.average || 5.0}</span>
              <span className="text-xs text-gray-400">({product.ratings?.count || 12} customer reviews)</span>
              <span className="text-xs font-mono font-bold text-gray-900 border-l pl-2 ml-2">SKU: {product.sku}</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3 border-y py-4">
            <span className="text-3xl font-black text-amber-950">৳{product.price?.toLocaleString()}</span>
            {product.compareAtPrice && (
              <span className="text-base text-gray-400 line-through">
                ৳{product.compareAtPrice?.toLocaleString()}
              </span>
            )}
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full ml-auto">
              In Stock (Cash on Delivery)
            </span>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">{product.description}</p>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">Select Size:</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg border transition ${selectedSize === s
                        ? "bg-black text-amber-300 border-amber-950"
                        : "bg-white text-gray-700 border-gray-200 hover:border-amber-800"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">Select Color:</label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c: any) => {
                  const colorName = c.name || c;
                  return (
                    <button
                      key={colorName}
                      onClick={() => setSelectedColor(colorName)}
                      className={`px-4 py-2 text-xs font-bold rounded-lg border transition ${selectedColor === colorName
                          ? "bg-black text-amber-300 border-amber-950"
                          : "bg-white text-gray-700 border-gray-200 hover:border-amber-800"
                        }`}
                    >
                      {colorName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-sm font-bold text-gray-700"
                >
                  -
                </button>
                <span className="px-3 text-sm font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 text-sm font-bold text-gray-700"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 py-3.5 bg-black hover:bg-black text-amber-300 font-bold text-xs uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Shopping Bag
              </button>

              <button
                onClick={() => {
                  toggleWishlist(product._id);
                  toast.success(isWishlisted(product._id) ? "Removed from Wishlist" : "Saved to Wishlist");
                }}
                className={`p-3.5 rounded-xl border transition ${isWishlisted(product._id) ? "bg-black text-white border-amber-800" : "bg-white border-gray-300 text-gray-700"
                  }`}
              >
                <Heart className="w-5 h-5 fill-current" />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-md"
            >
              Instant Buy Now (Cash on Delivery)
            </button>
          </div>

          {/* Guarantee Icons */}
          <div className="grid grid-cols-3 gap-3 border-t pt-4 text-[11px] font-semibold text-gray-600">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-gray-800" />
              <span>Dhaka & BD Express</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-gray-800" />
              <span>Cash on Delivery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-gray-800" />
              <span>100% Authentic Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Care */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-950 border-b pb-2">
            Specifications & Details
          </h3>
          <ul className="space-y-2 text-xs text-gray-700">
            {product.specifications?.map((sp: any, i: number) => (
              <li key={i} className="flex justify-between border-b pb-1">
                <span className="font-bold text-gray-900">{sp.key}:</span>
                <span>{sp.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-950 border-b pb-2">
            Care & Maintenance Instructions
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            {product.careInstructions ||
              "Store in original QORVAN velvet pouch. Avoid exposure to high moisture and direct sunlight. Professional leather dry-cleaning only for garments and accessories."}
          </p>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="space-y-8 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold font-serif text-gray-900 border-b pb-4">Customer Reviews</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Review List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No reviews yet for this product. Be the first to leave a review!</p>
            ) : (
              reviews.map((r: any) => (
                <div key={r._id} className="p-4 bg-gray-50 rounded-xl border space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-900">
                    <span>{r.authorName}</span>
                    <div className="flex text-amber-500">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{r.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Review Form */}
          <form onSubmit={handleReviewSubmit} className="space-y-3 bg-black/5 p-5 rounded-2xl border border-amber-900/10 text-xs">
            <h4 className="font-bold text-gray-900">Write a Review</h4>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Your Name"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                className="p-2 border rounded-md"
              />
              <input
                type="email"
                required
                placeholder="Your Email"
                value={reviewEmail}
                onChange={(e) => setReviewEmail(e.target.value)}
                className="p-2 border rounded-md"
              />
            </div>
            <textarea
              required
              rows={3}
              placeholder="Your product feedback..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="px-5 py-2 bg-black text-amber-300 font-bold rounded-md hover:bg-black transition"
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
