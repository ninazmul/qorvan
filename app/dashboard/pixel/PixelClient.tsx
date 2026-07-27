"use client";

import { useState } from "react";
import { Target, Save, Code, CheckCircle, HelpCircle, Shield, Activity, RefreshCw } from "lucide-react";
import { updatePixelConfig } from "@/lib/actions/pixel.actions";
import toast from "react-hot-toast";

export default function PixelClient({ initialConfig }: { initialConfig: any }) {
  const [config, setConfig] = useState(initialConfig || {});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"pixels" | "events" | "custom">("pixels");

  const handleChange = (field: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updatePixelConfig(config);
      if (res.success) {
        toast.success("Tracking Pixel settings saved successfully!");
        setConfig(res.data);
      } else {
        toast.error(res.error || "Failed to save settings");
      }
    } catch {
      toast.error("Server error while saving");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-black" /> Pixel & Analytics Manager
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure Meta Pixel, Google Ads / GA4 Tags, TikTok Pixel & custom tracking scripts
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition shadow-sm disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Configuration
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-4 rounded-xl border shadow-sm">
        <button
          onClick={() => setActiveTab("pixels")}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === "pixels" ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"
          }`}
        >
          Platform Pixels & IDs
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === "events" ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"
          }`}
        >
          Standard Events Tracking
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === "custom" ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"
          }`}
        >
          Custom Head/Body Scripts
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: Platform Pixels */}
        {activeTab === "pixels" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meta Pixel Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    f
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Meta Pixel (Facebook)</h2>
                    <p className="text-[11px] text-gray-500">Track page views, add to cart & purchases</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.metaPixelId ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"}`}>
                  {config.metaPixelId ? "Connected" : "Inactive"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Meta Pixel ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123456789012345"
                  value={config.metaPixelId || ""}
                  onChange={(e) => handleChange("metaPixelId", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Conversions API Access Token (Optional)
                </label>
                <input
                  type="password"
                  placeholder="EAA..."
                  value={config.metaAccessToken || ""}
                  onChange={(e) => handleChange("metaAccessToken", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Google Ads & GA4 Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                    G
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Google Tag & GA4</h2>
                    <p className="text-[11px] text-gray-500">Google Analytics 4 & Google Ads Conversion</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.googleTagId ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"}`}>
                  {config.googleTagId ? "Connected" : "Inactive"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Google Tag ID (GA4 / G-ID)
                </label>
                <input
                  type="text"
                  placeholder="e.g. G-XXXXXXXXXX or AW-XXXXXXXXX"
                  value={config.googleTagId || ""}
                  onChange={(e) => handleChange("googleTagId", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Ads Conversion ID
                  </label>
                  <input
                    type="text"
                    placeholder="AW-123456789"
                    value={config.googleAdsConversionId || ""}
                    onChange={(e) => handleChange("googleAdsConversionId", e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Conversion Label
                  </label>
                  <input
                    type="text"
                    placeholder="ab_cDEFG123456"
                    value={config.googleAdsConversionLabel || ""}
                    onChange={(e) => handleChange("googleAdsConversionLabel", e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* TikTok Pixel Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs">
                    TT
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">TikTok Pixel</h2>
                    <p className="text-[11px] text-gray-500">Track TikTok ad campaign conversions</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.tikTokPixelId ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"}`}>
                  {config.tikTokPixelId ? "Connected" : "Inactive"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  TikTok Pixel ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. CXXXXXXXXXXXXXXX"
                  value={config.tikTokPixelId || ""}
                  onChange={(e) => handleChange("tikTokPixelId", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Events Tracking */}
        {activeTab === "events" && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 border-b pb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" /> Standard E-Commerce Events Triggering
            </h2>
            <p className="text-xs text-gray-500">
              Toggle automatic dispatching of standard analytics events to active pixels on customer storefront interactions.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { key: "trackPageView", label: "Page View (PageView)", desc: "Triggers on every storefront page load" },
                { key: "trackAddToCart", label: "Add to Cart (AddToCart)", desc: "Triggers when customer adds an item to cart" },
                { key: "trackInitiateCheckout", label: "Initiate Checkout (InitiateCheckout)", desc: "Triggers when customer starts checkout" },
                { key: "trackPurchase", label: "Purchase (Purchase / Conversion)", desc: "Triggers when order is successfully placed" },
              ].map((ev) => (
                <label key={ev.key} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition">
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">{ev.label}</span>
                    <span className="text-[11px] text-gray-500">{ev.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!config[ev.key]}
                    onChange={(e) => handleChange(ev.key, e.target.checked)}
                    className="w-4 h-4 accent-black rounded cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Custom Scripts */}
        {activeTab === "custom" && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-blue-600" /> Custom Header Script (&lt;head&gt;)
              </label>
              <p className="text-[11px] text-gray-500 mb-2">
                Paste custom HTML/JS tracking codes (e.g. Hotjar, Microsoft Clarity, custom verification tags).
              </p>
              <textarea
                rows={5}
                placeholder="<!-- Custom <head> script -->"
                value={config.headerScript || ""}
                onChange={(e) => handleChange("headerScript", e.target.value)}
                className="w-full p-3 font-mono text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black bg-gray-950 text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-purple-600" /> Custom Body Script (&lt;body&gt;)
              </label>
              <p className="text-[11px] text-gray-500 mb-2">
                Paste fallback noscript tags or bottom-of-body widget scripts.
              </p>
              <textarea
                rows={5}
                placeholder="<!-- Custom <body> script -->"
                value={config.bodyScript || ""}
                onChange={(e) => handleChange("bodyScript", e.target.value)}
                className="w-full p-3 font-mono text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black bg-gray-950 text-amber-400"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
