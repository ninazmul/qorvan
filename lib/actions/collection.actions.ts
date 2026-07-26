"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import Collection from "@/lib/database/models/collection.model";
import { requirePermission } from "@/lib/auth/rbac";

export async function getCollections() {
  try {
    await connectToDatabase();
    const collections = await Collection.find({ status: "active" }).sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(collections)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch collections" };
  }
}

export async function createCollection(params: {
  name: string;
  slug: string;
  description?: string;
  bannerImage?: string;
  isFeatured?: boolean;
}) {
  await requirePermission("collections", "create");
  try {
    await connectToDatabase();
    const collection = await Collection.create(params);
    revalidatePath("/dashboard/collections");
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(collection)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create collection" };
  }
}

export async function updateCollection(id: string, params: any) {
  await requirePermission("collections", "update");
  try {
    await connectToDatabase();
    const updated = await Collection.findByIdAndUpdate(id, params, { new: true });
    revalidatePath("/dashboard/collections");
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update collection" };
  }
}

export async function deleteCollection(id: string) {
  await requirePermission("collections", "delete");
  try {
    await connectToDatabase();
    await Collection.findByIdAndDelete(id);
    revalidatePath("/dashboard/collections");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete collection" };
  }
}
