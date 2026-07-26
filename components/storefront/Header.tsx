"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Heart, Search, User, Menu, X, ShieldCheck } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import CartDrawer from "./CartDrawer";

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
    <header className="sticky top-0 z-40 bg-amber-950/95 backdrop-blur-md text-amber-50 border-b border-amber-800/40 shadow-lg">
      {/* Top Announcement Bar */}
      <div className="bg-amber-900/60 text-amber-200 py-1.5 px-4 text-center text-[11px] font-semibold tracking-wider flex items-center justify-center gap-2 border-b border-amber-800/30">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
        <span>COMPLIMENTARY EXPRESS DELIVERY ACROSS BANGLADESH ON ORDERS OVER ৳5,000 | CASH ON DELIVERY ONLY</span>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden text-amber-300 p-2 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <span className="text-2xl font-extrabold text-amber-400 font-serif">Q</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-extrabold text-white tracking-[0.25em] font-serif uppercase">
              QORVAN
            </span>
            <span className="text-[9px] text-amber-400 font-semibold tracking-[0.3em] uppercase -mt-1">
              LUXURY FASHION
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Menu */}
        <nav className="hidden lg:flex items-center space-x-6 text-xs font-semibold uppercase tracking-wider text-amber-200">
          <Link href="/shop" className="hover:text-amber-400 transition">Shop</Link>
          <Link href="/shop?category=tie-sets" className="hover:text-amber-400 transition">Tie Sets</Link>
          <Link href="/shop?category=leather-wallets" className="hover:text-amber-400 transition">Leather Wallets</Link>
          <Link href="/shop?category=bags" className="hover:text-amber-400 transition">Bags</Link>
          <Link href="/shop?category=formal-shirts" className="hover:text-amber-400 transition">Shirts</Link>
          <Link href="/shop?category=burkas-abayas" className="hover:text-amber-400 transition">Abayas</Link>
          <Link href="/about" className="hover:text-amber-400 transition">Our Story</Link>
        </nav>

        {/* Right Icons */}
        <div className="flex items-center space-x-4">
          <Link href="/shop" className="p-2 text-amber-300 hover:text-amber-100 transition hidden sm:block">
            <Search className="w-5 h-5" />
          </Link>

          <Link href="/account" className="p-2 text-amber-300 hover:text-amber-100 transition relative">
            <Heart className="w-5 h-5" />
            {totalWishlist > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-amber-950 text-[9px] font-black flex items-center justify-center">
                {totalWishlist}
              </span>
            )}
          </Link>

          <Link href="/account" className="p-2 text-amber-300 hover:text-amber-100 transition">
            <User className="w-5 h-5" />
          </Link>

          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2 text-amber-300 hover:text-amber-100 transition relative flex items-center gap-1 bg-amber-900/40 px-3 py-1.5 rounded-full border border-amber-700/50"
          >
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold text-amber-100">{totalItems}</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-amber-950 border-t border-amber-900 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-bold uppercase tracking-wider text-amber-200 hover:text-amber-400 hover:bg-amber-900/40 rounded transition"
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
