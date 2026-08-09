"use client";

import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { Heart, X, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface WishlistItem {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  slug: string;
}

export default function WishlistDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { wishlistItems, removeFromWishlist, totalWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (item: WishlistItem) => {
    addToCart({
      id: `${item.id}-default`,
      product: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      sku: "QRV",
      quantity: 1,
    });
    removeFromWishlist(item.id);
    toast.success("Moved to Shopping Bag!");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <div
        className="bg-white text-black w-full max-w-md h-full flex flex-col shadow-2xl border-l border-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-black fill-black" />
            <h2 className="text-base font-bold tracking-wider uppercase text-black">
              Wishlist ({totalWishlist})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-black hover:text-zinc-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
          {wishlistItems.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Heart className="w-12 h-12 text-zinc-300 mx-auto" />
              <p className="text-sm text-zinc-600 font-medium">
                Your wishlist is empty.
              </p>
              <p className="text-xs text-zinc-400">
                Save items you love by clicking the heart icon on any product.
              </p>
              <button
                onClick={onClose}
                className="inline-block text-xs font-bold uppercase tracking-widest text-black border border-black px-4 py-2 rounded hover:bg-zinc-100 transition"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            wishlistItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 bg-zinc-50 p-3 rounded-lg border border-zinc-200"
              >
                <Link href={`/product/${item.slug}`} onClick={onClose}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-20 object-cover rounded border border-zinc-200 hover:opacity-90 transition"
                  />
                </Link>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <Link href={`/product/${item.slug}`} onClick={onClose}>
                      <h3 className="text-xs font-bold text-black line-clamp-2 hover:underline">
                        {item.title}
                      </h3>
                    </Link>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-xs font-bold text-black">
                        ৳{item.price.toLocaleString()}
                      </p>
                      {item.compareAtPrice && item.compareAtPrice > item.price && (
                        <p className="text-[10px] text-zinc-400 line-through">
                          ৳{item.compareAtPrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-black text-white px-3 py-1.5 rounded hover:bg-zinc-800 transition"
                    >
                      <ShoppingBag className="w-3 h-3" /> Add to Bag
                    </button>
                    <button
                      onClick={() => {
                        removeFromWishlist(item.id);
                        toast.success("Removed from Wishlist");
                      }}
                      className="text-zinc-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {wishlistItems.length > 0 && (
          <div className="p-5 border-t border-zinc-200 bg-white flex-shrink-0">
            <Link
              href="/shop"
              onClick={onClose}
              className="block w-full py-3 text-center text-xs font-bold uppercase tracking-widest bg-black text-white rounded hover:bg-zinc-800 transition"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
