"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateSetting } from "@/lib/actions/setting.actions";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { DashboardAccess } from "@/lib/auth/rbac-rules";
import toast from "react-hot-toast";
import Link from "next/link";
import { Target, Search, ArrowRight, Save, Building } from "lucide-react";

type Props = {
  initialSettings: any;
  access: DashboardAccess;
};

export default function SettingsClient({ initialSettings, access }: Props) {
  const { hasPermission } = usePermissions(access);
  const canUpdate = hasPermission("settings", "update");

  const [formData, setFormData] = useState<any>({
    contactEmail: initialSettings.contactEmail || "",
    phoneNumber: initialSettings.phoneNumber || "",
    address: initialSettings.address || "",
    officeHours: initialSettings.officeHours || "Mon - Fri: 9:00 AM - 5:00 PM",
    googleMapEmbedUrl: initialSettings.googleMapEmbedUrl || "",
    maintenanceMode: initialSettings.maintenanceMode || false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, val: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdate) return;
    setLoading(true);

    const res = await updateSetting(formData);
    setLoading(false);

    if (res.success) {
      toast.success("Site settings updated successfully!");
    } else {
      toast.error(res.error || "Failed to update settings");
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building className="w-6 h-6 text-black" /> Site &amp; Storefront Settings
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage organization contact information, office hours, and store location
          </p>
        </div>
        {canUpdate && (
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-black text-white hover:bg-neutral-800 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Settings"}
          </Button>
        )}
      </div>

      {/* Quick Navigation Cards to Dedicated Managers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white p-5 rounded-xl shadow-sm space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Target className="w-4 h-4" /> Tracking &amp; Analytics
            </div>
            <h3 className="text-base font-bold">Pixel &amp; Script Tracking</h3>
            <p className="text-xs text-neutral-300 line-clamp-2 mt-1">
              Configure Meta Pixel, Google Tags (GA4 / Ads), TikTok Pixel, and custom header/body code snippets in one centralized tool.
            </p>
          </div>
          <Link
            href="/dashboard/pixel"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-emerald-400 transition pt-2"
          >
            Manage Pixels &amp; Scripts <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white p-5 rounded-xl shadow-sm space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Search className="w-4 h-4" /> Search &amp; Social
            </div>
            <h3 className="text-base font-bold">SEO &amp; Open Graph Manager</h3>
            <p className="text-xs text-neutral-300 line-clamp-2 mt-1">
              Manage page titles, descriptions, keywords, Open Graph share cards, and live Google SERP previews for all major routes.
            </p>
          </div>
          <Link
            href="/dashboard/seo"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-purple-400 transition pt-2"
          >
            Manage SEO &amp; Meta Tags <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
        <h2 className="text-sm font-bold text-gray-900 border-b pb-3 uppercase tracking-wider text-xs">
          Contact &amp; Physical Address Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-xs font-semibold text-gray-700">Contact Email</Label>
            <Input
              value={formData.contactEmail}
              onChange={(e) => handleChange("contactEmail", e.target.value)}
              disabled={!canUpdate}
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-700">Phone Number</Label>
            <Input
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              disabled={!canUpdate}
              className="mt-1 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-xs font-semibold text-gray-700">Physical Office Address</Label>
            <Textarea
              rows={3}
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              disabled={!canUpdate}
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-700">Office Hours</Label>
            <Input
              value={formData.officeHours}
              onChange={(e) => handleChange("officeHours", e.target.value)}
              disabled={!canUpdate}
              className="mt-1 text-xs"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold text-gray-700">Google Map Embed iframe URL / Embed Code</Label>
          <Input
            placeholder="https://www.google.com/maps/embed?pb=..."
            value={formData.googleMapEmbedUrl}
            onChange={(e) => handleChange("googleMapEmbedUrl", e.target.value)}
            disabled={!canUpdate}
            className="mt-1 text-xs"
          />
        </div>
      </form>
    </div>
  );
}
