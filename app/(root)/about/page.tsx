import Link from "next/link";
import { Crown, ShieldCheck, Award, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Brand Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-800">
          The Craft of QORVAN
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold font-serif text-gray-900 leading-tight">
          Executive Elegance, Handcrafted Without Compromise
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          Founded on the pursuit of perfection, QORVAN represents the peak of luxury fashion, full-grain leather heritage, and haute couture tailoring.
        </p>
      </div>

      {/* Hero Image */}
      <div className="aspect-[21/9] rounded-3xl overflow-hidden border border-gray-200 shadow-2xl relative">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600"
          alt="QORVAN Atelier Craftsmanship"
          className="w-full h-full object-cover filter contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 text-white font-serif">
          <p className="text-xl sm:text-2xl font-bold italic">
            "True luxury lives in the unyielding precision of details."
          </p>
        </div>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-3">
          <Crown className="w-8 h-8 text-gray-700" />
          <h3 className="text-lg font-bold font-serif text-gray-900">Italian Pure Silk</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Our ties are woven in silk mills with high thread count density, providing superior drape and rich metallic lustre.
          </p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-3">
          <Award className="w-8 h-8 text-gray-700" />
          <h3 className="text-lg font-bold font-serif text-gray-900">Full-Grain Leather</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Only hand-selected hides are tanned using organic vegetable extracts to form wallets, belts, and briefcases that age gracefully.
          </p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-3">
          <ShieldCheck className="w-8 h-8 text-gray-700" />
          <h3 className="text-lg font-bold font-serif text-gray-900">Executive Service</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Express nationwide Cash on Delivery service ensured across all 64 districts in Bangladesh with 100% authenticity guarantees.
          </p>
        </div>
      </div>
    </div>
  );
}
