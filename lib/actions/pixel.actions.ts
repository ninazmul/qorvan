"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import PixelConfig from "@/lib/database/models/pixel.model";
import { requirePermission } from "@/lib/auth/rbac";

export async function getPixelConfig() {
  try {
    await connectToDatabase();
    let config = await PixelConfig.findOne().lean();
    if (!config) {
      const created = await PixelConfig.create({
        metaPixelId: "",
        googleTagId: "",
        googleAdsConversionId: "",
        tikTokPixelId: "",
        headerScript: "",
        bodyScript: "",
        trackPageView: true,
        trackAddToCart: true,
        trackInitiateCheckout: true,
        trackPurchase: true,
      });
      config = created.toObject();
    }
    return { success: true, data: JSON.parse(JSON.stringify(config)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch pixel config" };
  }
}

export async function updatePixelConfig(payload: any) {
  await requirePermission("settings", "update");
  try {
    await connectToDatabase();
    let config = await PixelConfig.findOne();
    if (!config) {
      config = new PixelConfig(payload);
    } else {
      Object.assign(config, payload);
    }
    await config.save();
    revalidatePath("/dashboard/pixel");
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(config)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update pixel config" };
  }
}
