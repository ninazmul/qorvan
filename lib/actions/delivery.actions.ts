"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import DeliveryZone from "@/lib/database/models/deliveryZone.model";
import { requirePermission } from "@/lib/auth/rbac";

export async function getDeliveryZones() {
  try {
    await connectToDatabase();
    let zones = await DeliveryZone.find({ isActive: true }).sort({ baseCharge: 1 }).lean();
    
    // Seed default Bangladesh delivery zones if empty
    if (zones.length === 0) {
      const defaults = [
        {
          name: "Dhaka City",
          locations: ["Dhaka", "Gulshan", "Banani", "Dhanmondi", "Uttara", "Mirpur", "Mohakhali", "Bhashani"],
          baseCharge: 80,
          freeDeliveryThreshold: 5000,
          estimatedDays: "1-2 Days",
          isActive: true,
        },
        {
          name: "Outside Dhaka",
          locations: ["Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh", "Comilla", "Gazipur", "Narayanganj"],
          baseCharge: 150,
          freeDeliveryThreshold: 8000,
          estimatedDays: "3-4 Days",
          isActive: true,
        },
        {
          name: "All Bangladesh Express",
          locations: ["All Other Districts in Bangladesh"],
          baseCharge: 180,
          freeDeliveryThreshold: 10000,
          estimatedDays: "2-3 Days",
          isActive: true,
        },
        {
          name: "International Express",
          locations: ["Worldwide / International"],
          baseCharge: 2500,
          freeDeliveryThreshold: 50000,
          estimatedDays: "5-7 Days",
          isActive: true,
        },
      ];

      zones = await DeliveryZone.insertMany(defaults);
      zones = JSON.parse(JSON.stringify(zones));
    }

    return { success: true, data: JSON.parse(JSON.stringify(zones)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch delivery zones" };
  }
}

export async function calculateDeliveryCharge(zoneId: string, subtotal: number) {
  try {
    await connectToDatabase();
    const zone = await DeliveryZone.findById(zoneId).lean();
    if (!zone) return { success: false, error: "Delivery zone not found" };

    let charge = zone.baseCharge;
    if (zone.freeDeliveryThreshold && subtotal >= zone.freeDeliveryThreshold) {
      charge = 0;
    }

    return {
      success: true,
      data: {
        charge,
        isFree: charge === 0,
        estimatedDays: zone.estimatedDays,
        zoneName: zone.name,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to calculate delivery charge" };
  }
}

export async function createDeliveryZone(params: {
  name: string;
  locations: string[];
  baseCharge: number;
  freeDeliveryThreshold?: number;
  estimatedDays: string;
  isActive?: boolean;
}) {
  await requirePermission("delivery-zones", "create");
  try {
    await connectToDatabase();
    const zone = await DeliveryZone.create(params);
    revalidatePath("/dashboard/delivery-zones");
    revalidatePath("/checkout");
    return { success: true, data: JSON.parse(JSON.stringify(zone)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create delivery zone" };
  }
}

export async function updateDeliveryZone(id: string, params: any) {
  await requirePermission("delivery-zones", "update");
  try {
    await connectToDatabase();
    const updated = await DeliveryZone.findByIdAndUpdate(id, params, { new: true });
    revalidatePath("/dashboard/delivery-zones");
    revalidatePath("/checkout");
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update delivery zone" };
  }
}

export async function deleteDeliveryZone(id: string) {
  await requirePermission("delivery-zones", "delete");
  try {
    await connectToDatabase();
    await DeliveryZone.findByIdAndDelete(id);
    revalidatePath("/dashboard/delivery-zones");
    revalidatePath("/checkout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete delivery zone" };
  }
}
