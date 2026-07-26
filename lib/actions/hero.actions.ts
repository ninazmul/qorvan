"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import HeroSlide from "@/lib/database/models/heroSlide.model";
import { requirePermission } from "@/lib/auth/rbac";

export async function createHeroSlide(params: {
  title: string;
  subtitle?: string;
  backgroundImage: string;
  buttonText?: string;
  buttonUrl?: string;
  order?: number;
  enabled?: boolean;
}) {
  await requirePermission("homepage-cms", "create");
  try {
    await connectToDatabase();
    const newSlide = await HeroSlide.create(params);

    revalidatePath("/");
    revalidatePath("/dashboard/homepage-cms");

    return { success: true, data: JSON.parse(JSON.stringify(newSlide)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create hero slide" };
  }
}

export async function updateHeroSlide(
  id: string,
  params: {
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
    buttonText?: string;
    buttonUrl?: string;
    order?: number;
    enabled?: boolean;
  }
) {
  await requirePermission("homepage-cms", "update");
  try {
    await connectToDatabase();
    const updatedSlide = await HeroSlide.findByIdAndUpdate(id, params, {
      new: true,
    });

    revalidatePath("/");
    revalidatePath("/dashboard/homepage-cms");

    return { success: true, data: JSON.parse(JSON.stringify(updatedSlide)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update hero slide" };
  }
}

export async function deleteHeroSlide(id: string) {
  await requirePermission("homepage-cms", "delete");
  try {
    await connectToDatabase();
    await HeroSlide.findByIdAndDelete(id);

    revalidatePath("/");
    revalidatePath("/dashboard/homepage-cms");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete hero slide" };
  }
}

export async function getHeroSlides(query?: { enabled?: boolean }) {
  try {
    await connectToDatabase();
    const filter: any = {};
    if (query?.enabled !== undefined) filter.enabled = query.enabled;

    const slides = await HeroSlide.find(filter).sort({ order: 1, createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(slides)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch hero slides" };
  }
}
