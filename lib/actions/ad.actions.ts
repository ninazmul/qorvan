"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import AdCampaign from "@/lib/database/models/ad.model";
import { requirePermission } from "@/lib/auth/rbac";

export async function getAdCampaigns(params?: { platform?: string; status?: string }) {
  await requirePermission("settings", "read");
  try {
    await connectToDatabase();
    const filter: any = {};
    if (params?.platform && params.platform !== "all") filter.platform = params.platform;
    if (params?.status && params.status !== "all") filter.status = params.status;

    const campaigns = await AdCampaign.find(filter).sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(campaigns)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch ad campaigns" };
  }
}

export async function createAdCampaign(payload: any) {
  await requirePermission("settings", "update");
  try {
    await connectToDatabase();
    const campaign = await AdCampaign.create({
      ...payload,
      status: payload.status || "active",
      metrics: {
        impressions: Math.floor(Math.random() * 500) + 100,
        clicks: Math.floor(Math.random() * 40) + 10,
        spend: Math.floor(Math.random() * 500) + 50,
        conversions: Math.floor(Math.random() * 5) + 1,
      },
    });
    revalidatePath("/dashboard/ads");
    return { success: true, data: JSON.parse(JSON.stringify(campaign)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create ad campaign" };
  }
}

export async function updateAdCampaignStatus(id: string, status: "active" | "paused" | "completed") {
  await requirePermission("settings", "update");
  try {
    await connectToDatabase();
    const campaign = await AdCampaign.findByIdAndUpdate(id, { status }, { new: true });
    if (!campaign) return { success: false, error: "Campaign not found" };
    revalidatePath("/dashboard/ads");
    return { success: true, data: JSON.parse(JSON.stringify(campaign)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update campaign status" };
  }
}

export async function deleteAdCampaign(id: string) {
  await requirePermission("settings", "delete");
  try {
    await connectToDatabase();
    await AdCampaign.findByIdAndDelete(id);
    revalidatePath("/dashboard/ads");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete ad campaign" };
  }
}
