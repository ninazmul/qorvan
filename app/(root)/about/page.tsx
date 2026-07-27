import Link from "next/link";
import { Crown, ShieldCheck, Award, Sparkles, CheckCircle2 } from "lucide-react";
import { getCustomPage } from "@/lib/actions/page.actions";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const res = await getCustomPage("about");
  const page = res.data || {
    title: "Executive Elegance, Handcrafted Without Compromise",
    subtitle: "The Craft of QORVAN",
    content: "Founded on the pursuit of perfection, QORVAN represents the peak of luxury fashion.",
    sections: [],
  };

  const icons = [Crown, Award, ShieldCheck, Sparkles];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Brand Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-800">
          {page.subtitle || "The Craft of QORVAN"}
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold font-serif text-gray-900 leading-tight">
          {page.title}
        </h1>
        {page.content && (
          <p className="text-sm text-gray-600 leading-relaxed">
            {page.content}
          </p>
        )}
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
            &quot;True luxury lives in the unyielding precision of details.&quot;
          </p>
        </div>
      </div>

      {/* Dynamic CMS Sections */}
      {page.sections && page.sections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {page.sections.map((sec: any, idx: number) => {
            const IconComp = icons[idx % icons.length];
            return (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-3">
                <IconComp className="w-8 h-8 text-gray-700" />
                <h3 className="text-lg font-bold font-serif text-gray-900">{sec.heading}</h3>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                  {sec.body}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
