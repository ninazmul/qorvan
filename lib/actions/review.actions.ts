"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import ProductReview from "@/lib/database/models/productReview.model";
import Product from "@/lib/database/models/product.model";
import { requirePermission } from "@/lib/auth/rbac";

export async function createReview(params: {
  product: string;
  authorName: string;
  authorEmail: string;
  rating: number;
  comment: string;
  images?: string[];
  user?: string;
}) {
  try {
    await connectToDatabase();
    const review = await ProductReview.create(params);
    return { success: true, data: JSON.parse(JSON.stringify(review)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to submit review" };
  }
}

export async function getReviewsByProduct(productId: string) {
  try {
    await connectToDatabase();
    const reviews = await ProductReview.find({ product: productId, status: "approved" })
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(reviews)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch reviews" };
  }
}

export async function getAllReviews() {
  await requirePermission("reviews", "read");
  try {
    await connectToDatabase();
    const reviews = await ProductReview.find()
      .populate("product", "title featuredImage slug")
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(reviews)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch reviews" };
  }
}

export async function moderateReview(id: string, status: "approved" | "rejected") {
  await requirePermission("reviews", "update");
  try {
    await connectToDatabase();
    const review = await ProductReview.findByIdAndUpdate(id, { status }, { new: true });
    if (!review) return { success: false, error: "Review not found" };

    // Recalculate Product average rating if approved
    if (status === "approved") {
      const approvedReviews = await ProductReview.find({
        product: review.product,
        status: "approved",
      }).lean();

      const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
      const average = approvedReviews.length > 0 ? totalRating / approvedReviews.length : 5;

      await Product.findByIdAndUpdate(review.product, {
        "ratings.average": Math.round(average * 10) / 10,
        "ratings.count": approvedReviews.length,
      });
    }

    revalidatePath("/dashboard/reviews");
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(review)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update review status" };
  }
}

export async function deleteReview(id: string) {
  await requirePermission("reviews", "delete");
  try {
    await connectToDatabase();
    const review = await ProductReview.findByIdAndDelete(id);
    if (!review) return { success: false, error: "Review not found" };

    // Recalculate Product average rating
    const approvedReviews = await ProductReview.find({
      product: review.product,
      status: "approved",
    }).lean();

    const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
    const average = approvedReviews.length > 0 ? totalRating / approvedReviews.length : 5;

    await Product.findByIdAndUpdate(review.product, {
      "ratings.average": Math.round(average * 10) / 10,
      "ratings.count": approvedReviews.length,
    });

    revalidatePath("/dashboard/reviews");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete review" };
  }
}

export async function getApprovedReviews(limit: number = 6) {
  try {
    await connectToDatabase();
    const reviews = await ProductReview.find({ status: "approved" })
      .populate("product", "title slug featuredImage")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(reviews)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch approved reviews" };
  }
}

export async function getProductsForReview() {
  try {
    await connectToDatabase();
    const products = await Product.find({ status: "active" })
      .select("_id title slug")
      .sort({ title: 1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(products)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch products" };
  }
}
