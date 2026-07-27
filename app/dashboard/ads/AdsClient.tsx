"use client";

import { useState } from "react";
import { Radio, Plus, Play, Pause, Trash2, Eye, TrendingUp, DollarSign, MousePointer, Layers, X, Sparkles, Send } from "lucide-react";
import { createAdCampaign, updateAdCampaignStatus, deleteAdCampaign } from "@/lib/actions/ad.actions";
import toast from "react-hot-toast";

export default function AdsClient({ initialCampaigns }: { initialCampaigns: any[] }) {
  const [campaigns, setCampaigns] = useState(initialCampaigns || []);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // New Campaign Form State
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    platform: "meta",
    objective: "conversions",
    budgetType: "daily",
    budgetAmount: 500,
    currency: "BDT",
    targeting: {
      location: "Bangladesh",
      ageMin: 18,
      ageMax: 65,
      gender: "all",
    },
    creative: {
      headline: "",
      description: "",
      destinationUrl: "/",
      ctaText: "Shop Now",
    },
  });

  const filteredCampaigns = campaigns.filter((c) =>
    selectedPlatform === "all" ? true : c.platform === selectedPlatform
  );

  // Totals calculations
  const totalSpend = campaigns.reduce((acc, c) => acc + (c.metrics?.spend || 0), 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + (c.metrics?.clicks || 0), 0);
  const totalImpressions = campaigns.reduce((acc, c) => acc + (c.metrics?.impressions || 0), 0);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "paused" : "active";
    try {
      const res = await updateAdCampaignStatus(id, nextStatus);
      if (res.success) {
        toast.success(`Campaign ${nextStatus === "active" ? "activated" : "paused"}`);
        setCampaigns((prev) => prev.map((c) => (c._id === id ? res.data : c)));
      } else {
        toast.error(res.error || "Failed to update status");
      }
    } catch {
      toast.error("Status update error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad campaign?")) return;
    try {
      const res = await deleteAdCampaign(id);
      if (res.success) {
        toast.success("Campaign deleted");
        setCampaigns((prev) => prev.filter((c) => c._id !== id));
      } else {
        toast.error(res.error || "Failed to delete");
      }
    } catch {
      toast.error("Delete error");
    }
  };

  const handleCreateSubmit = async () => {
    if (!newCampaign.name.trim() || !newCampaign.creative.headline.trim()) {
      toast.error("Please fill in campaign name and headline");
      return;
    }
    setLoading(true);
    try {
      const res = await createAdCampaign({
        ...newCampaign,
        targeting: {
          ...newCampaign.targeting,
          location: [newCampaign.targeting.location],
        },
      });
      if (res.success) {
        toast.success("Ad campaign launched successfully!");
        setCampaigns([res.data, ...campaigns]);
        setShowWizard(false);
        setWizardStep(1);
        setNewCampaign({
          name: "",
          platform: "meta",
          objective: "conversions",
          budgetType: "daily",
          budgetAmount: 500,
          currency: "BDT",
          targeting: { location: "Bangladesh", ageMin: 18, ageMax: 65, gender: "all" },
          creative: { headline: "", description: "", destinationUrl: "/", ctaText: "Shop Now" },
        });
      } else {
        toast.error(res.error || "Failed to launch campaign");
      }
    } catch {
      toast.error("Failed to submit campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Radio className="w-6 h-6 text-black" /> Digital Ad Campaigns
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create, preview, and monitor Meta Ads, Google Ads &amp; TikTok campaigns
          </p>
        </div>
        <button
          onClick={() => {
            setShowWizard(true);
            setWizardStep(1);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Ad Campaign
        </button>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Total Spend</p>
            <p className="text-2xl font-bold text-gray-900">৳{totalSpend.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <MousePointer className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Total Clicks</p>
            <p className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Total Impressions</p>
            <p className="text-2xl font-bold text-gray-900">{totalImpressions.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar & List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {["all", "meta", "google", "tiktok"].map((plat) => (
              <button
                key={plat}
                onClick={() => setSelectedPlatform(plat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  selectedPlatform === plat ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {plat === "all" ? "All Platforms" : plat}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Showing {filteredCampaigns.length} campaign(s)
          </span>
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            <Radio className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            No campaigns found. Click &quot;Create Ad Campaign&quot; to launch your first ad.
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 uppercase text-[10px] font-bold text-gray-500">
              <tr>
                <th className="py-3 px-4 text-left">Campaign &amp; Platform</th>
                <th className="py-3 px-4 text-left">Objective</th>
                <th className="py-3 px-4 text-left">Budget</th>
                <th className="py-3 px-4 text-left">Metrics</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCampaigns.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gray-900 text-sm">{c.name}</div>
                    <div className="flex items-center gap-1.5 text-gray-500 mt-0.5">
                      <span className="uppercase font-semibold text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                        {c.platform}
                      </span>
                      <span className="truncate max-w-[200px] text-[11px]">&quot;{c.creative?.headline}&quot;</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-gray-700 capitalize">
                    {c.objective?.replace("_", " ")}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">
                    ৳{c.budgetAmount?.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal">/{c.budgetType}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-gray-900 font-semibold">{c.metrics?.clicks || 0} clicks</div>
                    <div className="text-gray-400 text-[10px]">{c.metrics?.impressions || 0} impr.</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        c.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : c.status === "paused"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1">
                    <button
                      onClick={() => handleToggleStatus(c._id, c.status)}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 transition"
                      title={c.status === "active" ? "Pause Campaign" : "Activate Campaign"}
                    >
                      {c.status === "active" ? <Pause className="w-3.5 h-3.5 text-amber-600" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── Campaign Wizard Modal ───────────────────────── */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowWizard(false)} />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-gray-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl z-10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Create New Ad Campaign</h2>
                <p className="text-xs text-gray-500">Step {wizardStep} of 3</p>
              </div>
              <button onClick={() => setShowWizard(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* STEP 1: Campaign Details */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Campaign Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Eid Leather Collection Promo 2026"
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Ad Platform</label>
                      <select
                        value={newCampaign.platform}
                        onChange={(e) => setNewCampaign({ ...newCampaign, platform: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black bg-white"
                      >
                        <option value="meta">Meta Ads (FB/IG)</option>
                        <option value="google">Google Ads</option>
                        <option value="tiktok">TikTok Ads</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Objective</label>
                      <select
                        value={newCampaign.objective}
                        onChange={(e) => setNewCampaign({ ...newCampaign, objective: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black bg-white"
                      >
                        <option value="conversions">Sales / Conversions</option>
                        <option value="traffic">Website Traffic</option>
                        <option value="awareness">Brand Awareness</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!newCampaign.name.trim()) return toast.error("Enter campaign name");
                      setWizardStep(2);
                    }}
                    className="w-full py-2.5 rounded-lg bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition"
                  >
                    Next: Target &amp; Budget →
                  </button>
                </div>
              )}

              {/* STEP 2: Target Audience & Budget */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Budget Type</label>
                      <select
                        value={newCampaign.budgetType}
                        onChange={(e) => setNewCampaign({ ...newCampaign, budgetType: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black bg-white"
                      >
                        <option value="daily">Daily Budget</option>
                        <option value="total">Lifetime Budget</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (BDT ৳)</label>
                      <input
                        type="number"
                        value={newCampaign.budgetAmount}
                        onChange={(e) => setNewCampaign({ ...newCampaign, budgetAmount: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Target Location</label>
                    <input
                      type="text"
                      value={newCampaign.targeting.location}
                      onChange={(e) => setNewCampaign({ ...newCampaign, targeting: { ...newCampaign.targeting, location: e.target.value } })}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setWizardStep(1)}
                      className="w-1/3 py-2.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setWizardStep(3)}
                      className="w-2/3 py-2.5 rounded-lg bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition"
                    >
                      Next: Creative Copy →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Ad Creative & Copy */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Ad Headline</label>
                    <input
                      type="text"
                      placeholder="e.g. Handcrafted Premium Leather Wallets 20% Off"
                      value={newCampaign.creative.headline}
                      onChange={(e) =>
                        setNewCampaign({
                          ...newCampaign,
                          creative: { ...newCampaign.creative, headline: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Text / Description</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Elevate your everyday style with QORVAN executive accessories. Order now for free delivery across Dhaka."
                      value={newCampaign.creative.description}
                      onChange={(e) =>
                        setNewCampaign({
                          ...newCampaign,
                          creative: { ...newCampaign.creative, description: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>

                  {/* Ad Live Preview */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Ad Preview Card</span>
                    <div className="bg-white p-3 rounded-lg border shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">Q</div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-900">QORVAN Luxury</p>
                          <p className="text-[9px] text-gray-400">Sponsored</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-800 mb-2">{newCampaign.creative.description || "Ad text preview..."}</p>
                      <div className="bg-gray-100 p-2 rounded flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-900 truncate">{newCampaign.creative.headline || "Ad Headline Preview"}</span>
                        <span className="text-[10px] font-bold bg-black text-white px-2 py-1 rounded">Shop Now</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setWizardStep(2)}
                      className="w-1/3 py-2.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleCreateSubmit}
                      disabled={loading}
                      className="w-2/3 py-2.5 rounded-lg bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" /> Launch Ad Campaign
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
