"use client";

import { useState } from "react";
import { Search, Save, Globe, Share2, Shield, RefreshCw, Eye, Image as ImageIcon } from "lucide-react";
import { updateSeoPage } from "@/lib/actions/seo.actions";
import toast from "react-hot-toast";

export default function SeoClient({ initialPages }: { initialPages: any[] }) {
  const [pages, setPages] = useState<any[]>(initialPages || []);
  const [selectedRoute, setSelectedRoute] = useState<string>(initialPages[0]?.route || "/");
  const [loading, setLoading] = useState(false);

  const currentPage = pages.find((p) => p.route === selectedRoute) || {
    route: selectedRoute,
    pageName: "Page",
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    robotsIndex: true,
    robotsFollow: true,
  };

  const handleChange = (field: string, value: any) => {
    setPages((prev) =>
      prev.map((p) => (p.route === selectedRoute ? { ...p, [field]: value } : p))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateSeoPage(selectedRoute, currentPage);
      if (res.success) {
        toast.success(`SEO settings saved for ${currentPage.pageName}!`);
        setPages((prev) =>
          prev.map((p) => (p.route === selectedRoute ? res.data : p))
        );
      } else {
        toast.error(res.error || "Failed to save SEO");
      }
    } catch {
      toast.error("Failed to save SEO settings");
    } finally {
      setLoading(false);
    }
  };

  const domain = process.env.NEXT_PUBLIC_SERVER_URL || "https://qorvan.com";

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Search className="w-6 h-6 text-black" /> SEO &amp; Meta Tags Manager
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Optimize page metadata, Google search snippet, and Open Graph social cards
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition shadow-sm disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save SEO Settings
        </button>
      </div>

      {/* Route Selector Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-4 rounded-xl border shadow-sm overflow-x-auto">
        {pages.map((p) => (
          <button
            key={p.route}
            onClick={() => setSelectedRoute(p.route)}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              selectedRoute === p.route ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            {p.pageName} <span className="text-[10px] text-gray-400 font-mono font-normal">({p.route})</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-gray-900 border-b pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" /> Search Engine Optimization
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Meta Title <span className="text-[10px] text-gray-400 font-normal">({currentPage.metaTitle?.length || 0}/60 chars)</span>
              </label>
              <input
                type="text"
                value={currentPage.metaTitle || ""}
                onChange={(e) => handleChange("metaTitle", e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Meta Description <span className="text-[10px] text-gray-400 font-normal">({currentPage.metaDescription?.length || 0}/160 chars)</span>
              </label>
              <textarea
                rows={3}
                value={currentPage.metaDescription || ""}
                onChange={(e) => handleChange("metaDescription", e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Keywords (comma separated)
              </label>
              <input
                type="text"
                value={Array.isArray(currentPage.keywords) ? currentPage.keywords.join(", ") : currentPage.keywords || ""}
                onChange={(e) => handleChange("keywords", e.target.value.split(",").map((k: string) => k.trim()))}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black"
              />
            </div>

            <div className="pt-4 border-t space-y-4">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-600" /> Open Graph &amp; Social Sharing
              </h2>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">OG Title</label>
                <input
                  type="text"
                  placeholder="Defaults to Meta Title if blank"
                  value={currentPage.ogTitle || ""}
                  onChange={(e) => handleChange("ogTitle", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">OG Description</label>
                <textarea
                  rows={2}
                  placeholder="Defaults to Meta Description if blank"
                  value={currentPage.ogDescription || ""}
                  onChange={(e) => handleChange("ogDescription", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">OG Share Image URL</label>
                <input
                  type="text"
                  placeholder="/assets/images/logo.png"
                  value={currentPage.ogImage || ""}
                  onChange={(e) => handleChange("ogImage", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Indexing Controls */}
            <div className="pt-4 border-t flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentPage.robotsIndex ?? true}
                  onChange={(e) => handleChange("robotsIndex", e.target.checked)}
                  className="w-4 h-4 accent-black rounded"
                />
                <span className="text-xs font-semibold text-gray-700">Allow Indexing (index)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentPage.robotsFollow ?? true}
                  onChange={(e) => handleChange("robotsFollow", e.target.checked)}
                  className="w-4 h-4 accent-black rounded"
                />
                <span className="text-xs font-semibold text-gray-700">Follow Links (follow)</span>
              </label>
            </div>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Google SERP Live Snippet */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-600" /> Google Search Preview
            </span>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 font-sans space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-700 truncate">
                <div className="w-4 h-4 rounded bg-black text-white text-[9px] font-bold flex items-center justify-center">Q</div>
                <span className="truncate text-gray-800">{domain}{selectedRoute}</span>
              </div>
              <h3 className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer leading-tight truncate">
                {currentPage.metaTitle || "Meta Title Placeholder"}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {currentPage.metaDescription || "Meta description snippet will appear here in search engine results."}
              </p>
            </div>
          </div>

          {/* Social Share Card Preview */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-purple-600" /> Open Graph Social Card
            </span>
            <div className="bg-white rounded-xl border border-gray-300 overflow-hidden shadow-sm">
              <div className="h-36 bg-gray-900 flex items-center justify-center text-gray-500 relative overflow-hidden">
                {currentPage.ogImage ? (
                  <img src={currentPage.ogImage} alt="OG" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center">
                    <ImageIcon className="w-8 h-8 mb-1 text-gray-600" />
                    <span className="text-[11px] text-gray-400">Social Image Preview</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-gray-50 border-t space-y-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block truncate">
                  {domain.replace("https://", "")}
                </span>
                <p className="text-xs font-bold text-gray-900 truncate">
                  {currentPage.ogTitle || currentPage.metaTitle || "Social Card Title"}
                </p>
                <p className="text-[11px] text-gray-500 line-clamp-2">
                  {currentPage.ogDescription || currentPage.metaDescription || "Social card description preview."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
