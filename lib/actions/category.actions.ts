"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import Category from "@/lib/database/models/category.model";
import { requirePermission } from "@/lib/auth/rbac";

export async function getCategories() {
  try {
    await connectToDatabase();
    const categories = await Category.find().sort({ order: 1, name: 1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(categories)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch categories" };
  }
}

export async function createCategory(params: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isFeatured?: boolean;
  order?: number;
}) {
  await requirePermission("categories", "create");
  try {
    await connectToDatabase();
    const category = await Category.create(params);
    revalidatePath("/shop");
    revalidatePath("/dashboard/categories");
    return { success: true, data: JSON.parse(JSON.stringify(category)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create category" };
  }
}

export async function updateCategory(id: string, params: any) {
  await requirePermission("categories", "update");
  try {
    await connectToDatabase();
    const updated = await Category.findByIdAndUpdate(id, params, { new: true });
    revalidatePath("/shop");
    revalidatePath("/dashboard/categories");
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  await requirePermission("categories", "delete");
  try {
    await connectToDatabase();
    await Category.findByIdAndDelete(id);
    revalidatePath("/shop");
    revalidatePath("/dashboard/categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete category" };
  }
}
