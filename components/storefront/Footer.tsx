import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Headphones, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white text-black border-t border-zinc-200 pt-16 pb-12 font-sans">
      {/* Guarantees Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-black text-white rounded-xl border border-black">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">Express Delivery</h4>
              <p className="text-[11px] text-zinc-500">All Districts in Bangladesh</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-black text-white rounded-xl border border-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">Cash on Delivery</h4>
              <p className="text-[11px] text-zinc-500">Pay upon parcel arrival</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-black text-white rounded-xl border border-black">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">Easy Returns</h4>
              <p className="text-[11px] text-zinc-500">Hassle-free exchange policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-black text-white rounded-xl border border-black">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">24/7 Concierge</h4>
              <p className="text-[11px] text-zinc-500">Dedicated customer care</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-zinc-200 pb-12">
        {/* Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-black text-white flex items-center justify-center border border-black">
              <span className="text-lg font-bold font-serif">Q</span>
            </div>
            <span className="text-xl font-extrabold tracking-[0.25em] text-black font-serif uppercase">
              QORVAN
            </span>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            QORVAN is a pinnacle luxury fashion and leather atelier dedicated to impeccable craftsmanship, timeless elegance, and executive style.
          </p>
          <div className="text-xs font-bold text-black tracking-wide">
            Dhaka • Chittagong • Sylhet • International
          </div>
        </div>

        {/* Collections Links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-4 border-b border-zinc-200 pb-2">
            Categories
          </h3>
          <ul className="space-y-2.5 text-xs text-zinc-600 font-medium">
            <li><Link href="/shop?category=tie-sets" className="hover:text-black transition">Premium Tie Sets</Link></li>
            <li><Link href="/shop?category=leather-wallets" className="hover:text-black transition">Leather Wallets</Link></li>
            <li><Link href="/shop?category=leather-belts" className="hover:text-black transition">Leather Belts</Link></li>
            <li><Link href="/shop?category=bags" className="hover:text-black transition">Executive Bags</Link></li>
            <li><Link href="/shop?category=formal-shirts" className="hover:text-black transition">Formal Shirts</Link></li>
            <li><Link href="/shop?category=burkas-abayas" className="hover:text-black transition">Burkas & Abayas</Link></li>
            <li><Link href="/shop?category=accessories" className="hover:text-black transition">Luxury Accessories</Link></li>
          </ul>
        </div>

        {/* Customer Care Links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-4 border-b border-zinc-200 pb-2">
            Customer Care
          </h3>
          <ul className="space-y-2.5 text-xs text-zinc-600 font-medium">
            <li><Link href="/account" className="hover:text-black transition">Track Your Order</Link></li>
            <li><Link href="/returns" className="hover:text-black transition">Returns & Exchange</Link></li>
            <li><Link href="/faq" className="hover:text-black transition">Frequently Asked Questions</Link></li>
            <li><Link href="/contact" className="hover:text-black transition">Contact Concierge</Link></li>
            <li><Link href="/about" className="hover:text-black transition">Our Craftsmanship Story</Link></li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-4 border-b border-zinc-200 pb-2">
            QORVAN Private Club
          </h3>
          <p className="text-xs text-zinc-600 mb-3">
            Subscribe to receive private invitations to new collection unveilings and exclusive offers.
          </p>
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 text-black placeholder-zinc-400 rounded focus:outline-none focus:border-black"
            />
            <button
              type="button"
              className="w-full py-2 bg-black text-white font-bold text-xs uppercase tracking-widest rounded hover:bg-zinc-800 transition"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 font-medium">
        <p>© {new Date().getFullYear()} QORVAN Luxury Brand. All Rights Reserved.</p>
        <div className="flex items-center space-x-4 mt-3 sm:mt-0">
          <span className="hover:text-black transition cursor-pointer">Terms of Service</span>
          <span className="hover:text-black transition cursor-pointer">Privacy Policy</span>
          <span className="hover:text-black transition cursor-pointer">Security</span>
        </div>
      </div>
    </footer>
  );
}
