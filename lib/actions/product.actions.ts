"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import Product from "@/lib/database/models/product.model";
import Category from "@/lib/database/models/category.model";
import Collection from "@/lib/database/models/collection.model";
import Brand from "@/lib/database/models/brand.model";
import { requirePermission } from "@/lib/auth/rbac";
import { sendSystemNotificationEmail } from "@/lib/mailer/sendSystemNotificationEmail";

export async function getProducts(params?: {
  query?: string;
  category?: string;
  subcategory?: string;
  collection?: string;
  brand?: string;
  status?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "rating" | "popular";
  page?: number;
  limit?: number;
}) {
  try {
    await connectToDatabase();
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (params?.status && params.status !== "all") {
      filter.status = params.status;
    } else if (!params?.status || params.status === undefined) {
      filter.status = "active";
    }

    if (params?.isFeatured !== undefined) filter.isFeatured = params.isFeatured;
    if (params?.isTrending !== undefined) filter.isTrending = params.isTrending;
    if (params?.isNewArrival !== undefined)
      filter.isNewArrival = params.isNewArrival;
    if (params?.isBestSeller !== undefined)
      filter.isBestSeller = params.isBestSeller;

    if (params?.minPrice !== undefined || params?.maxPrice !== undefined) {
      filter.price = {};
      if (params?.minPrice !== undefined) filter.price.$gte = params.minPrice;
      if (params?.maxPrice !== undefined) filter.price.$lte = params.maxPrice;
    }

    if (params?.category) {
      const catObj = await Category.findOne({ slug: params.category })
        .select("_id")
        .lean();
      if (catObj) filter.category = catObj._id;
    }

    if (params?.subcategory) {
      const subCatObj = await Category.findOne({ slug: params.subcategory })
        .select("_id")
        .lean();
      if (subCatObj) filter.subcategory = subCatObj._id;
    }

    if (params?.collection) {
      const colObj = await Collection.findOne({ slug: params.collection })
        .select("_id")
        .lean();
      if (colObj) filter.collectionId = colObj._id;
    }

    if (params?.brand) {
      const brandObj = await Brand.findOne({ slug: params.brand })
        .select("_id")
        .lean();
      if (brandObj) filter.brandId = brandObj._id;
    }

    if (params?.query) {
      const regex = new RegExp(params.query, "i");
      filter.$or = [
        { title: regex },
        { description: regex },
        { sku: regex },
        { tags: regex },
      ];
    }

    let sortOptions: any = { createdAt: -1 };
    if (params?.sort === "price-asc") sortOptions = { price: 1 };
    if (params?.sort === "price-desc") sortOptions = { price: -1 };
    if (params?.sort === "rating") sortOptions = { "ratings.average": -1 };
    if (params?.sort === "popular")
      sortOptions = { isBestSeller: -1, isTrending: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate("category", "name slug")
        .populate("collectionId", "name slug")
        .populate("brandId", "name slug")
        .lean(),
      Product.countDocuments(filter),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(products)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to fetch products",
    };
  }
}

export async function getProductBySlug(slug: string) {
  try {
    await connectToDatabase();
    const product = await Product.findOne({ slug })
      .populate("category", "name slug")
      .populate("subcategory", "name slug")
      .populate("collectionId", "name slug")
      .populate("brandId", "name slug")
      .lean();

    if (!product) return { success: false, error: "Product not found" };

    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to fetch product",
    };
  }
}

export async function getRelatedProducts(
  categoryId: string,
  currentProductId: string,
  limit = 4,
) {
  try {
    await connectToDatabase();
    const products = await Product.find({
      category: categoryId,
      _id: { $ne: currentProductId },
      status: "active",
    })
      .limit(limit)
      .populate("category", "name slug")
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(products)) };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to fetch related products",
    };
  }
}

export async function createProduct(params: any) {
  await requirePermission("products", "create");
  try {
    await connectToDatabase();

    const normalizedParams = { ...params };
    if (normalizedParams.images !== undefined) {
      if (Array.isArray(normalizedParams.images)) {
        normalizedParams.images = normalizedParams.images.filter(
          (url: any) => typeof url === "string" && url.trim().length > 0,
        );
      } else if (typeof normalizedParams.images === "string") {
        normalizedParams.images = normalizedParams.images
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      } else {
        normalizedParams.images = [];
      }
    }

    const newProduct = await Product.create(normalizedParams);

    const populatedProduct = await Product.findById(newProduct._id)
      .populate("category", "name slug")
      .populate("collectionId", "name slug")
      .populate("brandId", "name slug")
      .lean();

    revalidatePath("/shop");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/inventory");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(populatedProduct)),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to create product",
    };
  }
}

export async function updateProduct(id: string, params: any) {
  await requirePermission("products", "update");
  try {
    await connectToDatabase();

    const normalizedParams = { ...params };
    if (normalizedParams.images !== undefined) {
      if (Array.isArray(normalizedParams.images)) {
        normalizedParams.images = normalizedParams.images.filter(
          (url: any) => typeof url === "string" && url.trim().length > 0,
        );
      } else if (typeof normalizedParams.images === "string") {
        normalizedParams.images = normalizedParams.images
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      } else {
        normalizedParams.images = [];
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      normalizedParams,
      {
        new: true,
      },
    );

    if (!updatedProduct) return { success: false, error: "Product not found" };

    const populatedUpdated = await Product.findById(updatedProduct._id)
      .populate("category", "name slug")
      .populate("collectionId", "name slug")
      .populate("brandId", "name slug")
      .lean();

    revalidatePath("/shop");
    revalidatePath(`/product/${updatedProduct.slug}`);
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/inventory");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(populatedUpdated)),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to update product",
    };
  }
}

export async function deleteProduct(id: string) {
  await requirePermission("products", "delete");
  try {
    await connectToDatabase();
    await Product.findByIdAndDelete(id);

    revalidatePath("/shop");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/inventory");

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to delete product",
    };
  }
}

export async function updateInventoryStock(id: string, stock: number) {
  await requirePermission("inventory", "update");
  try {
    await connectToDatabase();

    const normalizedStock = Math.max(0, Math.trunc(Number(stock) || 0));
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { stock: normalizedStock },
      { new: true },
    );

    if (!updatedProduct) return { success: false, error: "Product not found" };

    revalidatePath("/shop");
    revalidatePath(`/product/${updatedProduct.slug}`);
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/products");

    return { success: true, data: JSON.parse(JSON.stringify(updatedProduct)) };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to update inventory stock",
    };
  }
}
