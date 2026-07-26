"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Heart, Search, User, Menu, X, ShieldCheck } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import CartDrawer from "./CartDrawer";
import Image from "next/image";

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { totalWishlist } = useWishlist();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop All", href: "/shop" },
    { label: "Tie Sets", href: "/shop?category=tie-sets" },
    { label: "Leather Wallets", href: "/shop?category=leather-wallets" },
    { label: "Leather Belts", href: "/shop?category=leather-belts" },
    { label: "Bags", href: "/shop?category=bags" },
    { label: "Formal Shirts", href: "/shop?category=formal-shirts" },
    { label: "Abayas", href: "/shop?category=burkas-abayas" },
    { label: "Accessories", href: "/shop?category=accessories" },
    { label: "Brand Story", href: "/about" },
    { label: "Blog", href: "/blog" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-black border-b border-zinc-200 shadow-sm">
      {/* Top Announcement Bar */}
      <div className="bg-black text-zinc-300 py-1.5 px-4 text-center text-[11px] font-semibold tracking-wider flex items-center justify-center gap-2 border-b border-zinc-800">
        <ShieldCheck className="w-3.5 h-3.5 text-white" />
        <span>Free express delivery on orders over ৳5,000 | COD</span>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden text-black p-2 hover:text-zinc-600 transition"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image src="/assets/images/logo.png" alt="Logo" width={100} height={100} className="w-full h-full object-contain" />
        </Link>

        {/* Desktop Navigation Menu */}
        <nav className="hidden lg:flex items-center space-x-6 text-xs font-bold uppercase tracking-wider text-black">
          <Link href="/shop" className="hover:text-zinc-500 transition">Shop</Link>
          <Link href="/shop?category=tie-sets" className="hover:text-zinc-500 transition">Tie Sets</Link>
          <Link href="/shop?category=leather-wallets" className="hover:text-zinc-500 transition">Leather Wallets</Link>
          <Link href="/shop?category=bags" className="hover:text-zinc-500 transition">Bags</Link>
          <Link href="/shop?category=formal-shirts" className="hover:text-zinc-500 transition">Shirts</Link>
          <Link href="/shop?category=burkas-abayas" className="hover:text-zinc-500 transition">Abayas</Link>
          <Link href="/about" className="hover:text-zinc-500 transition">Our Story</Link>
        </nav>

        {/* Right Icons */}
        <div className="flex items-center space-x-3">
          <Link href="/shop" className="p-2 text-black hover:text-zinc-500 transition hidden sm:block">
            <Search className="w-5 h-5" />
          </Link>

          <Link href="/account" className="p-2 text-black hover:text-zinc-500 transition relative">
            <Heart className="w-5 h-5" />
            {totalWishlist > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center">
                {totalWishlist}
              </span>
            )}
          </Link>

          <Link href="/account" className="p-2 text-black hover:text-zinc-500 transition">
            <User className="w-5 h-5" />
          </Link>

          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2 text-white transition relative flex items-center gap-1.5 bg-black px-3.5 py-1.5 rounded-full border border-black hover:bg-zinc-800"
          >
            <ShoppingBag className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white">{totalItems}</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-zinc-200 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-zinc-100 rounded transition"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
