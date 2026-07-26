"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "react-hot-toast";

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      id: `${product._id}-default`,
      product: product._id,
      title: product.title,
      price: product.price,
      image: product.featuredImage,
      sku: product.sku || "QRV-100",
      quantity: 1,
    });
    toast.success("Added to Shopping Bag!");
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
    toast.success(isWishlisted(product._id) ? "Removed from Wishlist" : "Saved to Wishlist");
  };

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  return (
    <div className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-black transition flex flex-col justify-between">
      <div>
        {/* Thumbnail Image Container */}
        <div className="relative aspect-square bg-zinc-100 overflow-hidden">
          <Link href={`/product/${product.slug}`}>
            <img
              src={product.featuredImage}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {discountPercent && (
              <span className="bg-black text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded shadow">
                {discountPercent}% OFF
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-zinc-800 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow">
                Luxury
              </span>
            )}
          </div>

          {/* Wishlist Heart Button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full border backdrop-blur-md transition ${
              isWishlisted(product._id)
                ? "bg-black text-white border-black"
                : "bg-white/80 text-zinc-700 hover:text-black border-zinc-200"
            }`}
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-4 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            {typeof product.category === "object" ? product.category?.name : "QORVAN Luxury"}
          </span>

          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="text-xs font-bold text-black group-hover:underline transition line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 text-[11px] text-zinc-800 font-medium">
            <Star className="w-3.5 h-3.5 fill-black text-black" />
            <span>{product.ratings?.average || 5.0}</span>
            <span className="text-zinc-400">({product.ratings?.count || 12})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-sm font-extrabold text-black">
              ৳{product.price?.toLocaleString()}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-zinc-400 line-through">
                ৳{product.compareAtPrice?.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Add to Bag Button */}
      <div className="p-4 pt-0">
        <button
          onClick={handleAddToCart}
          className="w-full py-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow"
        >
          <ShoppingBag className="w-4 h-4 text-white" /> Add to Bag
        </button>
      </div>
    </div>
  );
}
