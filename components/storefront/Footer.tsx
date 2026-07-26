import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Headphones, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-amber-950 text-amber-100 border-t border-amber-900/60 pt-16 pb-12 font-sans">
      {/* Guarantees Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-amber-900/30 p-6 rounded-2xl border border-amber-800/30">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-200">Express Delivery</h4>
              <p className="text-[11px] text-amber-400/80">All Districts in Bangladesh</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-200">Cash on Delivery</h4>
              <p className="text-[11px] text-amber-400/80">Pay upon parcel arrival</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-200">Easy Returns</h4>
              <p className="text-[11px] text-amber-400/80">Hassle-free exchange policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-200">24/7 Concierge</h4>
              <p className="text-[11px] text-amber-400/80">Dedicated customer care</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-amber-900/50 pb-12">
        {/* Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <span className="text-lg font-bold text-amber-400 font-serif">Q</span>
            </div>
            <span className="text-xl font-extrabold tracking-[0.25em] text-white font-serif uppercase">
              QORVAN
            </span>
          </div>
          <p className="text-xs text-amber-300/80 leading-relaxed">
            QORVAN is a pinnacle luxury fashion and leather atelier dedicated to impeccable craftsmanship, timeless elegance, and executive style.
          </p>
          <div className="text-xs font-semibold text-amber-400">
            Dhaka • Chittagong • Sylhet • International
          </div>
        </div>

        {/* Collections Links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300 mb-4 border-b border-amber-800/40 pb-2">
            Categories
          </h3>
          <ul className="space-y-2.5 text-xs text-amber-200/80 font-medium">
            <li><Link href="/shop?category=tie-sets" className="hover:text-amber-400 transition">Premium Tie Sets</Link></li>
            <li><Link href="/shop?category=leather-wallets" className="hover:text-amber-400 transition">Leather Wallets</Link></li>
            <li><Link href="/shop?category=leather-belts" className="hover:text-amber-400 transition">Leather Belts</Link></li>
            <li><Link href="/shop?category=bags" className="hover:text-amber-400 transition">Executive Bags</Link></li>
            <li><Link href="/shop?category=formal-shirts" className="hover:text-amber-400 transition">Formal Shirts</Link></li>
            <li><Link href="/shop?category=burkas-abayas" className="hover:text-amber-400 transition">Burkas & Abayas</Link></li>
            <li><Link href="/shop?category=accessories" className="hover:text-amber-400 transition">Luxury Accessories</Link></li>
          </ul>
        </div>

        {/* Customer Care Links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300 mb-4 border-b border-amber-800/40 pb-2">
            Customer Care
          </h3>
          <ul className="space-y-2.5 text-xs text-amber-200/80 font-medium">
            <li><Link href="/account" className="hover:text-amber-400 transition">Track Your Order</Link></li>
            <li><Link href="/returns" className="hover:text-amber-400 transition">Returns & Exchange</Link></li>
            <li><Link href="/faq" className="hover:text-amber-400 transition">Frequently Asked Questions</Link></li>
            <li><Link href="/contact" className="hover:text-amber-400 transition">Contact Concierge</Link></li>
            <li><Link href="/about" className="hover:text-amber-400 transition">Our Craftsmanship Story</Link></li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300 mb-4 border-b border-amber-800/40 pb-2">
            QORVAN Private Club
          </h3>
          <p className="text-xs text-amber-300/80 mb-3">
            Subscribe to receive private invitations to new collection unveilings and exclusive offers.
          </p>
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full px-3 py-2 text-xs bg-amber-900/40 border border-amber-800 text-white rounded focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              className="w-full py-2 bg-amber-500 text-amber-950 font-bold text-xs uppercase tracking-widest rounded hover:bg-amber-400 transition"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-amber-400/60 font-medium">
        <p>© {new Date().getFullYear()} QORVAN Luxury Brand. All Rights Reserved.</p>
        <div className="flex items-center space-x-4 mt-3 sm:mt-0">
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
          <span>Security</span>
        </div>
      </div>
    </footer>
  );
}
