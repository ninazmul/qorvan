"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateSetting } from "@/lib/actions/setting.actions";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { DashboardAccess } from "@/lib/auth/rbac-rules";
import toast from "react-hot-toast";

type Props = {
  initialSettings: any;
  access: DashboardAccess;
};

export default function SettingsClient({ initialSettings, access }: Props) {
  const { hasPermission } = usePermissions(access);
  const canUpdate = hasPermission("settings", "update");

  const [formData, setFormData] = useState<any>({
    siteName: initialSettings.siteName || "Hormuzan Foundation",
    primaryColor: initialSettings.primaryColor || "#226B3A",
    primaryForegroundColor: initialSettings.primaryForegroundColor || "#FFFFFF",
    contactEmail: initialSettings.contactEmail || "",
    phoneNumber: initialSettings.phoneNumber || "",
    address: initialSettings.address || "",
    officeHours: initialSettings.officeHours || "Mon - Fri: 9:00 AM - 5:00 PM",
    googleMapEmbedUrl: initialSettings.googleMapEmbedUrl || "",
    maintenanceMode: initialSettings.maintenanceMode || false,
    headerScript: initialSettings.headerScript || "",
    footerScript: initialSettings.footerScript || "",
    seo: {
      siteTitle: initialSettings.seo?.siteTitle || "",
      siteMetaDescription: initialSettings.seo?.siteMetaDescription || "",
      siteKeywords: initialSettings.seo?.siteKeywords?.join(", ") || "",
    },
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, val: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: val }));
  };

  const handleSeoChange = (field: string, val: any) => {
    setFormData((prev: any) => ({
      ...prev,
      seo: { ...prev.seo, [field]: val },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdate) return;
    setLoading(true);

    const payload = {
      ...formData,
      seo: {
        ...formData.seo,
        siteKeywords: formData.seo.siteKeywords
          ? formData.seo.siteKeywords
              .split(",")
              .map((k: string) => k.trim())
              .filter(Boolean)
          : [],
      },
    };

    const res = await updateSetting(payload);
    setLoading(false);

    if (res.success) {
      toast.success("Settings updated successfully!");
    } else {
      toast.error(res.error || "Failed to update settings");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-sm text-gray-500">
            Manage organization details, contact info, office hours, map embed,
            SEO, and analytics
          </p>
        </div>
        {canUpdate && (
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary text-white"
          >
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        )}
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-4 w-full bg-white border">
          <TabsTrigger value="general">General & Branding</TabsTrigger>
          <TabsTrigger value="contact">Contact & Map</TabsTrigger>
          <TabsTrigger value="seo">SEO & Analytics</TabsTrigger>
          <TabsTrigger value="advanced">Advanced & Scripts</TabsTrigger>
        </TabsList>

        {/* General & Branding */}
        <TabsContent
          value="general"
          className="bg-white p-6 rounded-lg shadow-sm border mt-4 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Organization Site Name</Label>
              <Input
                value={formData.siteName}
                onChange={(e) => handleChange("siteName", e.target.value)}
                disabled={!canUpdate}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Primary Brand Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  className="w-12 h-10 p-1 cursor-pointer"
                  value={formData.primaryColor}
                  onChange={(e) => handleChange("primaryColor", e.target.value)}
                  disabled={!canUpdate}
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => handleChange("primaryColor", e.target.value)}
                  disabled={!canUpdate}
                />
              </div>
            </div>
            <div>
              <Label>Primary Text/Contrast Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  className="w-12 h-10 p-1 cursor-pointer"
                  value={formData.primaryForegroundColor}
                  onChange={(e) =>
                    handleChange("primaryForegroundColor", e.target.value)
                  }
                  disabled={!canUpdate}
                />
                <Input
                  value={formData.primaryForegroundColor}
                  onChange={(e) =>
                    handleChange("primaryForegroundColor", e.target.value)
                  }
                  disabled={!canUpdate}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <Label className="font-semibold text-gray-900">
                Maintenance Mode
              </Label>
              <p className="text-xs text-gray-500">
                Temporarily redirect visitors to maintenance page
              </p>
            </div>
            <Switch
              checked={formData.maintenanceMode}
              onCheckedChange={(checked) =>
                handleChange("maintenanceMode", checked)
              }
              disabled={!canUpdate}
            />
          </div>
        </TabsContent>

        {/* Contact & Map */}
        <TabsContent
          value="contact"
          className="bg-white p-6 rounded-lg shadow-sm border mt-4 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Contact Email</Label>
              <Input
                value={formData.contactEmail}
                onChange={(e) => handleChange("contactEmail", e.target.value)}
                disabled={!canUpdate}
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                disabled={!canUpdate}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Physical Office Address</Label>
              <Textarea
                rows={3}
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                disabled={!canUpdate}
              />
            </div>
            <div>
              <Label>Office Hours</Label>
              <Input
                value={formData.officeHours}
                onChange={(e) => handleChange("officeHours", e.target.value)}
                disabled={!canUpdate}
              />
            </div>
          </div>

          <div>
            <Label>Google Map Embed iframe URL / Embed Code</Label>
            <Input
              placeholder="https://www.google.com/maps/embed?pb=..."
              value={formData.googleMapEmbedUrl}
              onChange={(e) =>
                handleChange("googleMapEmbedUrl", e.target.value)
              }
              disabled={!canUpdate}
            />
          </div>
        </TabsContent>

        {/* SEO & Analytics */}
        <TabsContent
          value="seo"
          className="bg-white p-6 rounded-lg shadow-sm border mt-4 space-y-6"
        >
          <div>
            <Label>Global Meta Title</Label>
            <Input
              value={formData.seo.siteTitle}
              onChange={(e) => handleSeoChange("siteTitle", e.target.value)}
              disabled={!canUpdate}
            />
          </div>
          <div>
            <Label>Global Meta Description</Label>
            <Textarea
              rows={3}
              value={formData.seo.siteMetaDescription}
              onChange={(e) =>
                handleSeoChange("siteMetaDescription", e.target.value)
              }
              disabled={!canUpdate}
            />
          </div>
          <div>
            <Label>Default Meta Keywords (comma separated)</Label>
            <Input
              value={formData.seo.siteKeywords}
              onChange={(e) => handleSeoChange("siteKeywords", e.target.value)}
              disabled={!canUpdate}
            />
          </div>
        </TabsContent>

        {/* Advanced & Scripts */}
        <TabsContent
          value="advanced"
          className="bg-white p-6 rounded-lg shadow-sm border mt-4 space-y-6"
        >
          <div>
            <Label>Header Custom Code / Scripts (&lt;head&gt;)</Label>
            <Textarea
              rows={4}
              placeholder="Google Analytics, Pixel script..."
              value={formData.headerScript}
              onChange={(e) => handleChange("headerScript", e.target.value)}
              disabled={!canUpdate}
            />
          </div>
          <div>
            <Label>Footer Custom Code / Scripts (&lt;body&gt;)</Label>
            <Textarea
              rows={4}
              placeholder="Live chat scripts, custom widgets..."
              value={formData.footerScript}
              onChange={(e) => handleChange("footerScript", e.target.value)}
              disabled={!canUpdate}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
