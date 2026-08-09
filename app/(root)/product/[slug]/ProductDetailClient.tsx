"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Check,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

  const allImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.featuredImage];
  const [activeImage, setActiveImage] = useState(
    allImages[0] || product.featuredImage,
  );

  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0]?.name || "",
  );
  const [quantity, setQuantity] = useState(1);

  // Review Form
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Image Zoom / Lightbox
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);

  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomOpen(false);
      else if (e.key === "ArrowLeft")
        setZoomIndex((i) => (i - 1 + allImages.length) % allImages.length);
      else if (e.key === "ArrowRight")
        setZoomIndex((i) => (i + 1) % allImages.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [zoomOpen, allImages.length]);

  const openZoom = (src?: string) => {
    const idx = src ? allImages.indexOf(src) : allImages.indexOf(activeImage);
    setZoomIndex(idx >= 0 ? idx : 0);
    setZoomOpen(true);
  };
  const closeZoom = () => setZoomOpen(false);
  const goPrev = () =>
    setZoomIndex((i) => (i - 1 + allImages.length) % allImages.length);
  const goNext = () => setZoomIndex((i) => (i + 1) % allImages.length);

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
        toast.success(
          "Thank you! Your review has been submitted for moderation.",
        );
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
          <div className="group relative aspect-square bg-gray-100 rounded-3xl overflow-hidden border border-gray-200 shadow-md">
            <img
              src={activeImage}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => openZoom(activeImage)}
              aria-label="Zoom product image"
              className="absolute inset-0 w-full h-full cursor-zoom-in"
            />
            <button
              type="button"
              onClick={() => openZoom(activeImage)}
              className="pointer-events-auto absolute top-3 right-3 bg-white/95 hover:bg-white text-gray-800 border border-gray-200 backdrop-blur shadow-sm p-2 rounded-full transition translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 flex items-center gap-1.5 text-[11px] font-bold"
            >
              <ZoomIn className="w-4 h-4" />
              <span>Zoom</span>
            </button>
          </div>

          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveImage(img);
                  }}
                  onDoubleClick={() => openZoom(img)}
                  className={`group/thumb relative w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    activeImage === img
                      ? "border-amber-800 shadow"
                      : "border-gray-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.title} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openZoom(img);
                    }}
                    aria-label={`Zoom view ${idx + 1}`}
                    className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/30 flex items-center justify-center transition"
                  >
                    <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover/thumb:opacity-100 drop-shadow" />
                  </button>
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
              <span className="text-xs font-bold text-gray-700">
                {product.ratings?.average || 5.0}
              </span>
              <span className="text-xs text-gray-400">
                ({product.ratings?.count || 12} customer reviews)
              </span>
              <span className="text-xs font-mono font-bold text-gray-900 border-l pl-2 ml-2">
                SKU: {product.sku}
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-3 border-y py-4">
            <span className="text-3xl font-black text-amber-950">
              ৳{product.price?.toLocaleString()}
            </span>
            {product.compareAtPrice && (
              <span className="text-base text-gray-400 line-through">
                ৳{product.compareAtPrice?.toLocaleString()}
              </span>
            )}
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full ml-auto">
              In Stock (Cash on Delivery)
            </span>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                Select Size:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg border transition ${
                      selectedSize === s
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
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                Select Color:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c: any) => {
                  const colorName = c.name || c;
                  return (
                    <button
                      key={colorName}
                      onClick={() => setSelectedColor(colorName)}
                      className={`px-4 py-2 text-xs font-bold rounded-lg border transition ${
                        selectedColor === colorName
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
                <span className="px-3 text-sm font-bold text-gray-900">
                  {quantity}
                </span>
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
                  toast.success(
                    isWishlisted(product._id)
                      ? "Removed from Wishlist"
                      : "Saved to Wishlist",
                  );
                }}
                className={`p-3.5 rounded-xl border transition ${
                  isWishlisted(product._id)
                    ? "bg-black text-white border-amber-800"
                    : "bg-white border-gray-300 text-gray-700"
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
        <h3 className="text-lg font-bold font-serif text-gray-900 border-b pb-4">
          Customer Reviews
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Review List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-xs text-gray-500 italic">
                No reviews yet for this product. Be the first to leave a review!
              </p>
            ) : (
              reviews.map((r: any) => (
                <div
                  key={r._id}
                  className="p-4 bg-gray-50 rounded-xl border space-y-1"
                >
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
          <form
            onSubmit={handleReviewSubmit}
            className="space-y-3 bg-black/5 p-5 rounded-2xl border border-amber-900/10 text-xs"
          >
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

      {/* Image Zoom Lightbox */}
      {zoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed product image"
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={closeZoom}
        >
          <button
            type="button"
            onClick={closeZoom}
            aria-label="Close zoom view"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-full p-2.5 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous image"
            disabled={allImages.length <= 1}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-full p-2.5 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next image"
            disabled={allImages.length <= 1}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-full p-2.5 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-6xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full flex-1 flex items-center justify-center">
              <img
                src={allImages[zoomIndex] || activeImage}
                alt={`${product.title} - detail view ${zoomIndex + 1}`}
                className="max-w-full max-h-[78vh] object-contain rounded-xl select-none"
                draggable={false}
              />
            </div>

            {allImages.length > 1 && (
              <div className="mt-4 flex flex-col items-center gap-3 w-full max-w-4xl">
                <div className="text-xs font-semibold text-white/80 tracking-wider uppercase">
                  {zoomIndex + 1} / {allImages.length}
                </div>
                <div className="flex gap-2 overflow-x-auto w-full justify-center pb-1 px-2">
                  {allImages.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setZoomIndex(idx)}
                      aria-label={`View image ${idx + 1}`}
                      className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-lg overflow-hidden border-2 transition ${
                        idx === zoomIndex
                          ? "border-amber-400 scale-105"
                          : "border-white/20 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="sr-only">
              Press Escape to close. Use Left and Right arrow keys to navigate.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
