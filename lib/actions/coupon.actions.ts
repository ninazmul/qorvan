"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import Coupon from "@/lib/database/models/coupon.model";
import { requirePermission } from "@/lib/auth/rbac";

export async function validateCoupon(code: string, subtotal: number) {
  try {
    await connectToDatabase();
    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    }).lean();

    if (!coupon) {
      return { success: false, error: "Invalid coupon code" };
    }

    if (coupon.startDate && new Date(coupon.startDate) > new Date()) {
      return { success: false, error: "Coupon is not active yet" };
    }

    if (coupon.endDate && new Date(coupon.endDate) < new Date()) {
      return { success: false, error: "Coupon has expired" };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { success: false, error: "Coupon usage limit reached" };
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return {
        success: false,
        error: `Minimum order amount for this coupon is ৳${coupon.minOrderAmount}`,
      };
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    return {
      success: true,
      data: {
        code: coupon.code,
        discountAmount: Math.min(discountAmount, subtotal),
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to validate coupon" };
  }
}

export async function getCoupons() {
  try {
    await connectToDatabase();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(coupons)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch coupons" };
  }
}

export async function createCoupon(params: any) {
  await requirePermission("coupons", "create");
  try {
    await connectToDatabase();
    params.code = params.code.trim().toUpperCase();
    const coupon = await Coupon.create(params);
    revalidatePath("/dashboard/coupons");
    return { success: true, data: JSON.parse(JSON.stringify(coupon)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create coupon" };
  }
}

export async function updateCoupon(id: string, params: any) {
  await requirePermission("coupons", "update");
  try {
    await connectToDatabase();
    if (params.code) params.code = params.code.trim().toUpperCase();
    const updated = await Coupon.findByIdAndUpdate(id, params, { new: true });
    revalidatePath("/dashboard/coupons");
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update coupon" };
  }
}

export async function deleteCoupon(id: string) {
  await requirePermission("coupons", "delete");
  try {
    await connectToDatabase();
    await Coupon.findByIdAndDelete(id);
    revalidatePath("/dashboard/coupons");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete coupon" };
  }
}
