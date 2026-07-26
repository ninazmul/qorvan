"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import Brand from "@/lib/database/models/brand.model";
import { requirePermission } from "@/lib/auth/rbac";

export async function getBrands() {
  try {
    await connectToDatabase();
    const brands = await Brand.find({ status: "active" }).sort({ name: 1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(brands)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch brands" };
  }
}

export async function createBrand(params: { name: string; slug: string; logo?: string; description?: string }) {
  await requirePermission("brands", "create");
  try {
    await connectToDatabase();
    const brand = await Brand.create(params);
    revalidatePath("/dashboard/brands");
    return { success: true, data: JSON.parse(JSON.stringify(brand)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create brand" };
  }
}

export async function updateBrand(id: string, params: any) {
  await requirePermission("brands", "update");
  try {
    await connectToDatabase();
    const updated = await Brand.findByIdAndUpdate(id, params, { new: true });
    revalidatePath("/dashboard/brands");
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update brand" };
  }
}

export async function deleteBrand(id: string) {
  await requirePermission("brands", "delete");
  try {
    await connectToDatabase();
    await Brand.findByIdAndDelete(id);
    revalidatePath("/dashboard/brands");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete brand" };
  }
}
